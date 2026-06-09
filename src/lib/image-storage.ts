/**
 * Utility pra converter imagens AI base64 inline (`data:image/...;base64,...`)
 * em URLs do Supabase Storage. Roda no save do editor.
 *
 * Por quê: imagens AI geradas por Gemini Nano Banana são JPEG/PNG ~2-3MB
 * cada, codificadas em base64 inline no HTML. Quando user duplica blocos
 * com a mesma imagem, o HTML cresce exponencialmente (vimos 20MB+ com 8
 * cópias da mesma imagem). Browser demora pra baixar, página fica lenta,
 * sensação de "não salvou".
 *
 * Fix: cada vez que uma imagem data:image: é detectada, calculamos hash
 * SHA-256 → tentamos achar no Storage → se não existe, upload → trocamos
 * todas ocorrências no HTML pela URL pública.
 *
 * Deduplicação automática: mesmo conteúdo = mesmo hash = mesmo path no
 * Storage = upload pula. HTML referencia uma única URL pra todas as N
 * cópias visuais.
 */

import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

const BUCKET = 'page-images'

/**
 * Decoda data URL (`data:image/jpeg;base64,XXX`) em buffer + mime.
 */
function decodeDataUrl(dataUrl: string): { buffer: Buffer; mime: string; ext: string } | null {
  const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/i)
  if (!match) return null
  const mime = match[1].toLowerCase()
  const ext = mime === 'image/svg+xml' ? 'svg'
            : mime === 'image/jpeg'    ? 'jpg'
            : mime === 'image/png'     ? 'png'
            : mime === 'image/webp'    ? 'webp'
            : mime === 'image/gif'     ? 'gif'
            : 'bin'
  try {
    const buffer = Buffer.from(match[2], 'base64')
    return { buffer, mime, ext }
  } catch {
    return null
  }
}

/**
 * Extrai todas as data: URLs únicas do HTML (em src="..." ou bgImage atribs).
 * Retorna lista de strings únicas (dedupe automático).
 */
function extractDataUrls(html: string): string[] {
  const re = /data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]+/gi
  const matches = html.match(re) ?? []
  return Array.from(new Set(matches))
}

/**
 * Sobe uma imagem base64 pro Storage. Idempotente: se já existe (mesmo
 * hash), retorna URL existente sem retransmitir. Path:
 * `{workspaceId}/{sha8}.{ext}`.
 */
async function uploadOnce(
  dataUrl: string,
  workspaceId: string,
): Promise<string | null> {
  const decoded = decodeDataUrl(dataUrl)
  if (!decoded) return null

  // SVG inline (decorações) é leve — manter como base64 não vale o overhead.
  // Só converte raster pesado (jpg/png/webp/gif).
  if (decoded.mime === 'image/svg+xml' && decoded.buffer.byteLength < 50_000) {
    return null
  }

  const hash = createHash('sha256').update(decoded.buffer).digest('hex').slice(0, 16)
  const path = `${workspaceId}/${hash}.${decoded.ext}`

  // Tentamos uma "tentativa de upload" — se já existe, ignora erro.
  // Mais barato que fazer GET antes pra ver se existe.
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, decoded.buffer, {
      contentType: decoded.mime,
      upsert: false,
      cacheControl: 'public, max-age=31536000, immutable',
    })

  // 23505 (duplicate) = arquivo já existe, OK. Outros erros = real falha.
  if (error && !/duplicate|already exists|409/i.test(error.message)) {
    console.error('[image-storage] upload falhou:', path, error.message)
    return null
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(path)
  return publicUrl
}

/**
 * Processa HTML: encontra todas data:image:, sobe pro Storage, substitui
 * por URL pública. Retorna HTML transformado + estatísticas.
 *
 * Idempotente: roda quantas vezes quiser, sempre converge pro mesmo
 * estado (URLs). Imagens já externas ficam intactas.
 */
export async function externalizeBase64Images(
  html: string,
  workspaceId: string,
): Promise<{ html: string; uploaded: number; skipped: number; bytesSaved: number }> {
  const dataUrls = extractDataUrls(html)
  let uploaded = 0
  let skipped = 0
  let bytesSaved = 0
  let result = html

  for (const dataUrl of dataUrls) {
    const url = await uploadOnce(dataUrl, workspaceId)
    if (!url) {
      skipped += 1
      continue
    }
    // Substitui TODAS ocorrências dessa data URL exata pela URL pública.
    // String.replaceAll precisa do char literal — split/join é mais rápido
    // pra strings grandes.
    const occurrences = result.split(dataUrl).length - 1
    if (occurrences > 0) {
      bytesSaved += occurrences * (dataUrl.length - url.length)
      result = result.split(dataUrl).join(url)
      uploaded += 1
    }
  }

  return { html: result, uploaded, skipped, bytesSaved }
}
