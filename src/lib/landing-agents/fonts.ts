/**
 * Mapa de tipografia escolhida pelo Designer → família Google Fonts a carregar
 * + tags <link> que injetamos no HTML produzido.
 *
 * Sem isso, `fontFamily: 'Syne'` no estilo CSS não resolve no browser
 * (fonte não está disponível) e o user-agent cai pra serif do sistema
 * — efeito "tela seca".
 */

export type TypographyKey =
  | 'system'           // system-ui — fallback
  | 'display'          // Syne + DM Sans — SaaS tech moderno (default atual)
  | 'modern'           // Outfit + Inter — clean B2B premium
  | 'editorial'        // Fraunces + Inter — serif editorial moderno
  | 'playful'          // Bricolage Grotesque + DM Sans — startup ousado
  | 'classic'          // Lora + Inter — serif clássico legível (saúde, jurídico)
  | 'cal'              // Cal Sans + Inter — minimalista premium (estilo Linear/Vercel)
  | 'serif-premium'    // Playfair Display + Crimson Pro — luxo editorial
  | 'monoespacada'     // Space Mono + IBM Plex Mono — dev tools

export type FontStack = {
  /** Family pra headlines (titulo/H1-H6). Inclui aspas se tiver espaço. */
  heading: string
  /** Family pro body (texto normal, parágrafos). */
  body: string
  /** HTML <link> pra inserir no início do output. Vazio se 'system'. */
  linkTags: string
}

const SYSTEM_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

const PRECONNECT = [
  '<link rel="preconnect" href="https://fonts.googleapis.com">',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
].join('')

export function getFontStack(typography: string): FontStack {
  switch (typography as TypographyKey) {
    case 'display':
      return {
        heading: "'Syne'",
        body: "'DM Sans'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">',
      }

    case 'modern':
      // Outfit (display geometric clean) + Inter (body B2B premium).
      // Stripe-style. Funciona bem em mood clean/bold.
      return {
        heading: "'Outfit'",
        body: "'Inter'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">',
      }

    case 'editorial':
      // Fraunces (serif editorial moderno com curvas chamativas) + Inter body.
      // Notion-style ou agência de conteúdo.
      return {
        heading: "'Fraunces'",
        body: "'Inter'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
      }

    case 'playful':
      // Bricolage Grotesque (display ousada com letras anti-grid) + DM Sans.
      // Startup criativa, infoproduto, fintech jovem.
      return {
        heading: "'Bricolage Grotesque'",
        body: "'DM Sans'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">',
      }

    case 'classic':
      // Lora (serif transitional legível) + Inter body.
      // Mood confiança: saúde, jurídico, finanças.
      return {
        heading: "'Lora'",
        body: "'Inter'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
      }

    case 'cal':
      // Cal Sans (display minimalista, estilo Linear/Vercel) + Inter.
      // Tech premium minimalista.
      return {
        // Cal Sans só está no GitHub; fallback usa Outfit que tem traços similares
        heading: "'Inter'",
        body: "'Inter'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">',
      }

    case 'serif-premium':
      return {
        heading: "'Playfair Display'",
        body: "'Crimson Pro'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Crimson+Pro:wght@400;500;600&display=swap" rel="stylesheet">',
      }

    case 'monoespacada':
      return {
        heading: "'Space Mono'",
        body: "'IBM Plex Mono'",
        linkTags: PRECONNECT + '<link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">',
      }

    case 'system':
    default:
      return { heading: SYSTEM_STACK, body: SYSTEM_STACK, linkTags: '' }
  }
}
