/**
 * Mapa de tipografia escolhida pelo Designer → família Google Fonts a carregar
 * + tags <link> que injetamos no HTML produzido.
 *
 * Sem isso, `fontFamily: 'Syne'` no estilo CSS não resolve no browser
 * (fonte não está disponível) e o user-agent cai pra serif do sistema
 * — efeito "tela seca".
 */

export type TypographyKey = 'system' | 'serif-premium' | 'display' | 'monoespacada'

export type FontStack = {
  /** Family pra headlines (titulo/H1-H6). Inclui aspas se tiver espaço. */
  heading: string
  /** Family pro body (texto normal, parágrafos). */
  body: string
  /** HTML <link> pra inserir no início do output. Vazio se 'system'. */
  linkTags: string
}

const SYSTEM_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export function getFontStack(typography: string): FontStack {
  switch (typography as TypographyKey) {
    case 'display':
      // Combo "tech/SaaS premium" — Syne (display geometric) + DM Sans (limpo, alta legibilidade).
      // Mesmo combo do Manus.
      return {
        heading: "'Syne'",
        body: "'DM Sans'",
        linkTags: [
          '<link rel="preconnect" href="https://fonts.googleapis.com">',
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
          '<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">',
        ].join(''),
      }

    case 'serif-premium':
      // Combo editorial/luxo — Playfair Display (serif) + Crimson Pro (body).
      return {
        heading: "'Playfair Display'",
        body: "'Crimson Pro'",
        linkTags: [
          '<link rel="preconnect" href="https://fonts.googleapis.com">',
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
          '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:wght@400;500;600&display=swap" rel="stylesheet">',
        ].join(''),
      }

    case 'monoespacada':
      return {
        heading: "'Space Mono'",
        body: "'IBM Plex Mono'",
        linkTags: [
          '<link rel="preconnect" href="https://fonts.googleapis.com">',
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
          '<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">',
        ].join(''),
      }

    case 'system':
    default:
      return { heading: SYSTEM_STACK, body: SYSTEM_STACK, linkTags: '' }
  }
}
