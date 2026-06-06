/**
 * Decorações SVG inline pra dar profundidade visual sem depender de imagem AI.
 *
 * Cada função devolve uma data URL `data:image/svg+xml;base64,...` que pode
 * ser usada como `bgImage` em CaixaElement. Funciona offline, em qualquer
 * tema, sem custo de IA, sem cache miss.
 */

function svgToDataUrl(svg: string): string {
  // Usa base64 (compatível com background-image: url())
  const base64 = Buffer.from(svg, 'utf-8').toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

/**
 * Padrão de blobs orgânicos coloridos — fica MUITO melhor em hero e offer.
 * Usa cores claras semitransparentes que sobressaem sobre gradiente sólido.
 */
export function blobPattern(colorA: string, colorB: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="640" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="g1" cx="20%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${colorA}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${colorA}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="80%" cy="70%" r="50%">
      <stop offset="0%" stop-color="${colorB}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${colorB}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="60%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="640" fill="url(#g1)"/>
  <rect width="1200" height="640" fill="url(#g2)"/>
  <rect width="1200" height="640" fill="url(#g3)"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Padrão de grid sutil pra backgrounds de seções (cinza claríssimo).
 * Dá textura subliminar sem distrair.
 */
export function gridPattern(strokeColor = '#e8edf5'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <path d="M40 0 L0 0 0 40" fill="none" stroke="${strokeColor}" stroke-width="1" opacity="0.4"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Padrão de pontos (dots) — bom em seções alt (cor primary).
 */
export function dotsPattern(color = '#ffffff'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <circle cx="2" cy="2" r="1.4" fill="${color}" opacity="0.18"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Wave decorativa — pra usar como separador no topo de seções.
 * Devolve um SVG com fundo transparente que ondula.
 */
export function topWave(fillColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
  <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill="${fillColor}"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Mockup decorativo de "tela" pra usar como placeholder do produto no hero
 * quando NÃO há imagem AI. Browser frame estilizado com sparkles.
 */
export function browserMockup(primaryColor: string, accentColor: string): string {
  // Frame de browser + linhas representando UI
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
  </defs>
  <!-- shadow -->
  <rect x="20" y="24" width="440" height="280" rx="14" fill="rgba(0,0,0,0.18)"/>
  <!-- frame -->
  <rect x="16" y="20" width="440" height="280" rx="14" fill="url(#bg)"/>
  <!-- title bar -->
  <rect x="16" y="20" width="440" height="36" rx="14" fill="#f8fafc"/>
  <rect x="16" y="42" width="440" height="14" fill="#f8fafc"/>
  <circle cx="36" cy="38" r="5" fill="#ef4444"/>
  <circle cx="54" cy="38" r="5" fill="#f59e0b"/>
  <circle cx="72" cy="38" r="5" fill="#22c55e"/>
  <rect x="120" y="32" width="240" height="12" rx="6" fill="#e2e8f0"/>
  <!-- sidebar -->
  <rect x="16" y="60" width="120" height="240" fill="#f8fafc"/>
  <rect x="32" y="80" width="88" height="10" rx="5" fill="${primaryColor}" opacity="0.85"/>
  <rect x="32" y="104" width="68" height="8" rx="4" fill="#cbd5e1"/>
  <rect x="32" y="124" width="80" height="8" rx="4" fill="#cbd5e1"/>
  <rect x="32" y="144" width="60" height="8" rx="4" fill="#cbd5e1"/>
  <rect x="32" y="164" width="76" height="8" rx="4" fill="#cbd5e1"/>
  <rect x="32" y="184" width="64" height="8" rx="4" fill="#cbd5e1"/>
  <!-- content header -->
  <rect x="156" y="80" width="200" height="14" rx="4" fill="#1e293b"/>
  <rect x="156" y="104" width="280" height="8" rx="4" fill="#cbd5e1"/>
  <!-- big cards -->
  <rect x="156" y="132" width="140" height="78" rx="10" fill="${primaryColor}" opacity="0.12"/>
  <rect x="172" y="148" width="64" height="10" rx="4" fill="${primaryColor}" opacity="0.6"/>
  <rect x="172" y="170" width="40" height="20" rx="4" fill="${primaryColor}"/>
  <rect x="308" y="132" width="140" height="78" rx="10" fill="${accentColor}" opacity="0.12"/>
  <rect x="324" y="148" width="64" height="10" rx="4" fill="${accentColor}" opacity="0.8"/>
  <rect x="324" y="170" width="40" height="20" rx="4" fill="${accentColor}"/>
  <!-- row -->
  <rect x="156" y="226" width="292" height="48" rx="8" fill="#f1f5f9"/>
  <circle cx="180" cy="250" r="12" fill="${primaryColor}" opacity="0.3"/>
  <rect x="204" y="240" width="120" height="8" rx="4" fill="#94a3b8"/>
  <rect x="204" y="254" width="80" height="6" rx="3" fill="#cbd5e1"/>
  <rect x="408" y="244" width="28" height="12" rx="4" fill="#22c55e"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Selo / badge circular — pra usar próximo a CTAs ou no offer final.
 * Texto no centro, círculo com cor accent.
 */
export function badge(text: string, color: string): string {
  const safeText = text.replace(/[<>&]/g, '')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="b" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="60" cy="60" r="56" fill="${color}"/>
  <circle cx="60" cy="60" r="56" fill="url(#b)"/>
  <circle cx="60" cy="60" r="52" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.7"/>
  <text x="60" y="58" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="13">${safeText.split(' ')[0] ?? ''}</text>
  <text x="60" y="76" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="11">${safeText.split(' ').slice(1).join(' ')}</text>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Avatar circular com letra inicial — substitui foto faltante de depoimento.
 * Cor de fundo derivada do nome (deterministic) pra ficar variado.
 */
export function avatarInitial(name: string, primaryColor: string): string {
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase()
  // Hash simples pra escolher hue
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  const hue = Math.abs(hash) % 360
  // Mistura cor primária com hue derivada — saturação alta, luminosidade média
  const bg = `hsl(${hue}, 65%, 55%)`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${primaryColor}"/>
    </linearGradient>
  </defs>
  <circle cx="32" cy="32" r="32" fill="url(#a)"/>
  <text x="32" y="42" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="26">${initial}</text>
</svg>`
  return svgToDataUrl(svg)
}
