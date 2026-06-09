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
 * Wave decorativa — separador suave no TOPO de seções.
 * Fica embaixo da seção anterior (cor do fill = bg da seção atual).
 * Estilo "ondulação suave" tipo Cal.com/Stripe.
 */
export function topWave(fillColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
  <path d="M0,30 C150,60 350,0 600,30 C850,60 1050,0 1200,30 L1200,60 L0,60 Z" fill="${fillColor}"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Wave invertida — separador no FUNDO de seções (transição de bloco escuro
 * pra claro abaixo). Fica acima da seção próxima.
 */
export function bottomWave(fillColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="80" viewBox="0 0 1200 80" preserveAspectRatio="none">
  <path d="M0,0 L1200,0 L1200,30 C1050,70 850,10 600,40 C350,70 150,10 0,30 Z" fill="${fillColor}"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Slash diagonal — separador angular agressivo (estilo "moderno bold").
 * Vai de uma cor pra outra com inclinação suave.
 */
export function diagonalSlash(fillColor: string, angle: 'left' | 'right' = 'right'): string {
  const path = angle === 'right'
    ? 'M0,0 L1200,0 L1200,60 L0,40 Z'   // sobe da esquerda pra direita
    : 'M0,0 L1200,0 L1200,40 L0,60 Z'   // sobe da direita pra esquerda
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
  <path d="${path}" fill="${fillColor}"/>
</svg>`
  return svgToDataUrl(svg)
}

/**
 * Mockup decorativo de "tela" — dashboard SaaS estilizado pra hero quando
 * não há imagem AI. Sidebar com nav, header com avatar, 2 cards estatística
 * com mini-chart, e tabela com badges de status colorido.
 *
 * Inspirado no padrão Manus/Linear/Notion — densidade visual alta, sem
 * texto real (evita parecer fake).
 */
export function browserMockup(primaryColor: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <linearGradient id="chart" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="chart2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <rect x="22" y="26" width="440" height="320" rx="16" fill="rgba(0,0,0,0.22)"/>
  <!-- Frame -->
  <rect x="16" y="20" width="440" height="320" rx="16" fill="url(#bg)"/>

  <!-- Title bar -->
  <rect x="16" y="20" width="440" height="32" rx="16" fill="#f1f5f9"/>
  <rect x="16" y="40" width="440" height="12" fill="#f1f5f9"/>
  <circle cx="34" cy="36" r="5" fill="#ef4444"/>
  <circle cx="52" cy="36" r="5" fill="#f59e0b"/>
  <circle cx="70" cy="36" r="5" fill="#22c55e"/>
  <rect x="180" y="30" width="160" height="12" rx="6" fill="#e2e8f0"/>

  <!-- Sidebar -->
  <rect x="16" y="56" width="120" height="284" fill="${primaryColor}" opacity="0.06"/>
  <!-- Logo -->
  <rect x="32" y="72" width="22" height="22" rx="6" fill="${primaryColor}"/>
  <rect x="62" y="78" width="54" height="10" rx="3" fill="${primaryColor}" opacity="0.6"/>
  <!-- Nav items (5 itens) — primeiro destacado -->
  <rect x="28" y="116" width="96" height="28" rx="7" fill="${primaryColor}" opacity="0.16"/>
  <circle cx="42" cy="130" r="5" fill="${primaryColor}"/>
  <rect x="56" y="125" width="60" height="10" rx="3" fill="${primaryColor}" opacity="0.85"/>
  <!-- Outros nav -->
  <circle cx="42" cy="160" r="5" fill="#94a3b8" opacity="0.7"/>
  <rect x="56" y="155" width="48" height="10" rx="3" fill="#94a3b8" opacity="0.7"/>
  <circle cx="42" cy="186" r="5" fill="#94a3b8" opacity="0.7"/>
  <rect x="56" y="181" width="56" height="10" rx="3" fill="#94a3b8" opacity="0.7"/>
  <circle cx="42" cy="212" r="5" fill="#94a3b8" opacity="0.7"/>
  <rect x="56" y="207" width="40" height="10" rx="3" fill="#94a3b8" opacity="0.7"/>
  <circle cx="42" cy="238" r="5" fill="#94a3b8" opacity="0.7"/>
  <rect x="56" y="233" width="64" height="10" rx="3" fill="#94a3b8" opacity="0.7"/>
  <!-- Card user no rodapé sidebar -->
  <rect x="28" y="296" width="96" height="32" rx="8" fill="${primaryColor}" opacity="0.1"/>
  <circle cx="42" cy="312" r="8" fill="${accentColor}"/>
  <rect x="56" y="306" width="48" height="6" rx="2" fill="${primaryColor}" opacity="0.7"/>
  <rect x="56" y="316" width="32" height="5" rx="2" fill="#94a3b8"/>

  <!-- Header da página -->
  <rect x="152" y="72" width="120" height="14" rx="3" fill="#0f172a"/>
  <rect x="152" y="92" width="180" height="8" rx="3" fill="#94a3b8"/>
  <!-- Avatar + ações no header -->
  <circle cx="446" cy="80" r="11" fill="${accentColor}"/>
  <circle cx="420" cy="80" r="10" fill="#e2e8f0"/>
  <circle cx="420" cy="80" r="2.5" fill="${accentColor}"/>
  <rect x="378" y="74" width="28" height="12" rx="6" fill="#fef3c7"/>
  <rect x="382" y="77" width="6" height="6" rx="3" fill="#f59e0b"/>

  <!-- Card stat 1 -->
  <rect x="152" y="116" width="146" height="78" rx="10" fill="#ffffff"/>
  <rect x="152" y="116" width="146" height="78" rx="10" fill="none" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="164" y="128" width="40" height="8" rx="3" fill="#94a3b8"/>
  <rect x="164" y="146" width="64" height="14" rx="3" fill="${primaryColor}"/>
  <!-- mini chart -->
  <path d="M164 184 L176 178 L188 174 L200 168 L212 172 L224 162 L236 156 L248 150 L260 158 L272 152 L284 146 L296 142 L296 188 L164 188 Z" fill="url(#chart)"/>
  <path d="M164 184 L176 178 L188 174 L200 168 L212 172 L224 162 L236 156 L248 150 L260 158 L272 152 L284 146 L296 142" fill="none" stroke="${primaryColor}" stroke-width="1.5"/>
  <!-- badge percent -->
  <rect x="260" y="128" width="32" height="14" rx="7" fill="#dcfce7"/>
  <text x="276" y="139" font-family="system-ui" font-size="9" font-weight="700" fill="#16a34a" text-anchor="middle">+18%</text>

  <!-- Card stat 2 -->
  <rect x="310" y="116" width="146" height="78" rx="10" fill="#ffffff"/>
  <rect x="310" y="116" width="146" height="78" rx="10" fill="none" stroke="#e2e8f0" stroke-width="1"/>
  <rect x="322" y="128" width="44" height="8" rx="3" fill="#94a3b8"/>
  <rect x="322" y="146" width="56" height="14" rx="3" fill="${accentColor}"/>
  <!-- bars -->
  <rect x="322" y="178" width="8" height="10" rx="2" fill="${accentColor}" opacity="0.4"/>
  <rect x="334" y="172" width="8" height="16" rx="2" fill="${accentColor}" opacity="0.6"/>
  <rect x="346" y="178" width="8" height="10" rx="2" fill="${accentColor}" opacity="0.4"/>
  <rect x="358" y="166" width="8" height="22" rx="2" fill="${accentColor}" opacity="0.8"/>
  <rect x="370" y="174" width="8" height="14" rx="2" fill="${accentColor}" opacity="0.6"/>
  <rect x="382" y="162" width="8" height="26" rx="2" fill="${accentColor}"/>
  <rect x="394" y="170" width="8" height="18" rx="2" fill="${accentColor}" opacity="0.7"/>
  <rect x="406" y="174" width="8" height="14" rx="2" fill="${accentColor}" opacity="0.6"/>
  <rect x="418" y="166" width="8" height="22" rx="2" fill="${accentColor}" opacity="0.85"/>
  <rect x="430" y="172" width="8" height="16" rx="2" fill="${accentColor}" opacity="0.7"/>
  <rect x="442" y="178" width="8" height="10" rx="2" fill="${accentColor}" opacity="0.5"/>
  <!-- badge percent -->
  <rect x="418" y="128" width="32" height="14" rx="7" fill="#dcfce7"/>
  <text x="434" y="139" font-family="system-ui" font-size="9" font-weight="700" fill="#16a34a" text-anchor="middle">+42%</text>

  <!-- Tabela header -->
  <rect x="152" y="208" width="304" height="20" rx="6" fill="#f1f5f9"/>
  <rect x="160" y="214" width="40" height="8" rx="2" fill="#64748b"/>
  <rect x="222" y="214" width="32" height="8" rx="2" fill="#64748b"/>
  <rect x="290" y="214" width="36" height="8" rx="2" fill="#64748b"/>
  <rect x="412" y="214" width="36" height="8" rx="2" fill="#64748b"/>

  <!-- Tabela linha 1 -->
  <rect x="152" y="232" width="304" height="28" fill="#ffffff"/>
  <rect x="152" y="259" width="304" height="1" fill="#f1f5f9"/>
  <circle cx="166" cy="246" r="6" fill="${primaryColor}" opacity="0.3"/>
  <rect x="178" y="242" width="58" height="8" rx="2" fill="#1e293b"/>
  <rect x="222" y="242" width="48" height="8" rx="2" fill="#94a3b8"/>
  <rect x="290" y="242" width="50" height="8" rx="2" fill="#475569"/>
  <rect x="406" y="240" width="42" height="14" rx="7" fill="#dcfce7"/>
  <circle cx="416" cy="247" r="2.5" fill="#16a34a"/>
  <text x="442" y="251" font-family="system-ui" font-size="8" font-weight="600" fill="#16a34a" text-anchor="end">Emitida</text>

  <!-- Tabela linha 2 -->
  <rect x="152" y="260" width="304" height="28" fill="#ffffff"/>
  <rect x="152" y="287" width="304" height="1" fill="#f1f5f9"/>
  <circle cx="166" cy="274" r="6" fill="${accentColor}" opacity="0.3"/>
  <rect x="178" y="270" width="64" height="8" rx="2" fill="#1e293b"/>
  <rect x="222" y="270" width="42" height="8" rx="2" fill="#94a3b8"/>
  <rect x="290" y="270" width="44" height="8" rx="2" fill="#475569"/>
  <rect x="406" y="268" width="42" height="14" rx="7" fill="#fef3c7"/>
  <circle cx="416" cy="275" r="2.5" fill="#f59e0b"/>
  <text x="442" y="279" font-family="system-ui" font-size="8" font-weight="600" fill="#d97706" text-anchor="end">Pendente</text>

  <!-- Tabela linha 3 -->
  <rect x="152" y="288" width="304" height="28" fill="#ffffff"/>
  <circle cx="166" cy="302" r="6" fill="${primaryColor}" opacity="0.3"/>
  <rect x="178" y="298" width="52" height="8" rx="2" fill="#1e293b"/>
  <rect x="222" y="298" width="54" height="8" rx="2" fill="#94a3b8"/>
  <rect x="290" y="298" width="46" height="8" rx="2" fill="#475569"/>
  <rect x="406" y="296" width="42" height="14" rx="7" fill="#dcfce7"/>
  <circle cx="416" cy="303" r="2.5" fill="#16a34a"/>
  <text x="442" y="307" font-family="system-ui" font-size="8" font-weight="600" fill="#16a34a" text-anchor="end">Emitida</text>

  <!-- FAB -->
  <circle cx="436" cy="312" r="14" fill="${accentColor}"/>
  <path d="M430 312 L442 312 M436 306 L436 318" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
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
