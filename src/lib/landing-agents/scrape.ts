/**
 * Utilitários de scrape para o Agente Pesquisador.
 * Portado de src/app/api/ai/generate/route.ts (rota legada).
 */

/** Tenta extrair URL da logo do site. Só retorna URLs http(s). */
export function extractLogoUrl(html: string, baseUrl: string): string | null {
  const resolve = (url: string): string => { try { return new URL(url, baseUrl).href } catch { return url } }
  const safe    = (url: string): string | null => /^https?:\/\//i.test(url) ? url : null

  // 1. <img> com class/alt/id contendo "logo" (mais específico)
  const logoAttr = html.match(/<img[^>]+(?:class|alt|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i)
                ?? html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:class|alt|id)=["'][^"']*logo[^"']*["']/i)
  if (logoAttr?.[1]) return safe(resolve(logoAttr[1]))

  // 2. src cujo caminho contém "logo" (ex: /images/logo.png, /logo.svg)
  const logoSrc = html.match(/<img[^>]+src=["']([^"']*\/logo[^"']+)["']/i)
  if (logoSrc?.[1]) return safe(resolve(logoSrc[1]))

  // 3. Apple touch icon — ícone quadrado de alta qualidade, geralmente a marca
  const apple = html.match(/<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i)
  if (apple?.[1]) return safe(resolve(apple[1]))

  // 4. og:image apenas como último recurso (frequentemente é banner, não logo) — ignorado
  return null
}

/** Limpa HTML para texto puro, com limite de chars. */
export function htmlToText(html: string, maxChars = 3000): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars)
}
