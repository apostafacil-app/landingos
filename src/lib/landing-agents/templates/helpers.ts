/**
 * Helpers compartilhados pelos templates.
 *
 * Movidos de render-v3.ts pra serem reusáveis em qualquer template novo
 * sem ciclo de import.
 */

/** Remove [PLACEHOLDER], placeholders "X" textuais e whitespace duplicado. */
export function cleanText(s: string): string {
  return (s ?? '')
    .replace(/\[PLACEHOLDER\]/gi, '')
    .replace(/\b(mais de|cerca de|aproximadamente)\s+[XYN]\b/gi, 'centenas de')
    .replace(/\b[XYN]\s+(horas|minutos|clientes|usuários|empresas|negócios|revendas)\b/gi, 'muitas $1')
    .replace(/\b###+\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** True se o trust stat virou lixo depois do cleanup (não vale mostrar). */
export function isStatTooWeak(s: string): boolean {
  const clean = cleanText(s).replace(/^[^\w]+/, '').trim()
  return clean.length < 10
}

/**
 * Estima a altura necessária pra um texto caber numa largura dada.
 *
 * charRatio varia por fonte:
 *  - 0.52: system-ui regular/medium
 *  - 0.60: display heavy (Syne 800, Playfair 700+)
 *  - 0.45: monoespaçada
 *
 * Aplica safety multiplier 1.15 — heurística sempre subestima.
 */
export function estimateTextHeight(text: string, opts: {
  width: number
  fontSize: number
  lineHeight?: number
  minLines?: number
  maxLines?: number
  isDisplay?: boolean
  isMono?: boolean
}): number {
  const lh = opts.lineHeight ?? 1.5
  const charRatio = opts.isMono ? 0.45 : (opts.isDisplay ? 0.60 : 0.52)
  const charsPerLine = Math.max(6, Math.floor(opts.width / (opts.fontSize * charRatio)))
  const cleanedLen = (text ?? '').replace(/<[^>]+>/g, '').length
  let lines = Math.max(1, Math.ceil(cleanedLen / charsPerLine))
  if (opts.minLines && lines < opts.minLines) lines = opts.minLines
  if (opts.maxLines && lines > opts.maxLines) lines = opts.maxLines
  return Math.ceil(lines * opts.fontSize * lh * 1.15) + 4
}

/** Trunca texto preservando palavras inteiras. Adiciona '…' se cortou. */
export function truncate(text: string, maxChars: number): string {
  const s = cleanText(text)
  if (s.length <= maxChars) return s
  const cut = s.slice(0, maxChars).replace(/\s+\S*$/, '')
  return `${cut}…`
}
