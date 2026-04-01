// Proteção contra SSRF (Server-Side Request Forgery)
// security-checklist.md — seção A01/A06

const BLOCKED_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,   // link-local / AWS metadata
  /^::1$/,
  /^0\.0\.0\.0/,
  /^fd[0-9a-f]{2}:/i, // IPv6 privado
]

const FETCH_TIMEOUT_MS = 5_000
const MAX_RESPONSE_BYTES = 500 * 1024 // 500KB

export class SsrfError extends Error {}

export async function safeFetch(rawUrl: string): Promise<string> {
  // Apenas HTTPS
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new SsrfError('URL inválida')
  }

  if (url.protocol !== 'https:') {
    throw new SsrfError('Apenas URLs HTTPS são permitidas')
  }

  // Bloquear hostnames internos conhecidos
  const hostname = url.hostname.toLowerCase()
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new SsrfError('URL bloqueada')
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'LandingOS/1.0' },
    })
  } catch {
    throw new SsrfError('Não foi possível acessar a URL')
  } finally {
    clearTimeout(timeout)
  }

  // Verificar destino final após redirects (evitar redirect para interno)
  const finalUrl = new URL(response.url)
  if (finalUrl.protocol !== 'https:') {
    throw new SsrfError('Redirect para protocolo não permitido')
  }
  const finalHost = finalUrl.hostname.toLowerCase()
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(finalHost)) {
      throw new SsrfError('Redirect para URL bloqueada')
    }
  }

  // Limitar tamanho da resposta
  const reader = response.body?.getReader()
  if (!reader) throw new SsrfError('Resposta vazia')

  let bytes = 0
  const chunks: Uint8Array[] = []
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    bytes += value.length
    if (bytes > MAX_RESPONSE_BYTES) {
      reader.cancel()
      throw new SsrfError('Resposta muito grande')
    }
    chunks.push(value)
  }

  return new TextDecoder().decode(
    chunks.reduce((acc, chunk) => {
      const merged = new Uint8Array(acc.length + chunk.length)
      merged.set(acc)
      merged.set(chunk, acc.length)
      return merged
    }, new Uint8Array(0))
  )
}
