/**
 * Transições visuais entre seções — SVG waves/diagonais que "sangram" a cor
 * de uma seção pra próxima.
 *
 * Uso: injetar entre <section> tags no renderer pra quebrar a sensação de
 * "blocos retangulares empilhados". Cor do SVG = cor da seção próxima.
 *
 * Cada transição é auto-contida: só o SVG. Cabe sozinho entre 2 seções.
 */

/**
 * Estilos das transições (injetar UMA vez no head).
 */
export const transitionStyles = `<style>
  .lp-transition {
    display: block; width: 100%;
    line-height: 0; /* remove gap invisível abaixo do svg */
  }
  .lp-transition svg { display: block; width: 100%; height: auto; }
</style>`

/**
 * Ondas suaves — estilo Cal.com/Vercel. Fluxo tranquilo, orgânico.
 */
export function waveTransition(fillColor: string): string {
  return `<div class="lp-transition" aria-hidden="true"><svg viewBox="0 0 1200 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <path d="M0,20 C300,60 600,-10 900,30 C1050,50 1150,10 1200,25 L1200,80 L0,80 Z" fill="${fillColor}"/>
</svg></div>`
}

/**
 * Diagonal sutil — estilo Stripe. Mais moderno, geométrico.
 */
export function diagonalTransition(fillColor: string): string {
  return `<div class="lp-transition" aria-hidden="true"><svg viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <path d="M0,0 L1200,40 L1200,60 L0,60 Z" fill="${fillColor}"/>
</svg></div>`
}

/**
 * Curva íngreme — estilo Notion. Mais dramática.
 */
export function curvedTransition(fillColor: string): string {
  return `<div class="lp-transition" aria-hidden="true"><svg viewBox="0 0 1200 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
  <path d="M0,100 Q600,0 1200,100 L1200,100 L0,100 Z" fill="${fillColor}"/>
</svg></div>`
}

/**
 * Escolhe o tipo de transição baseado em um "estilo geral" do design.
 * - 'soft' → waves (default)
 * - 'geometric' → diagonais
 * - 'bold' → curvas dramáticas
 */
export function pickTransition(style: 'soft' | 'geometric' | 'bold' | undefined, fillColor: string): string {
  switch (style) {
    case 'geometric': return diagonalTransition(fillColor)
    case 'bold':      return curvedTransition(fillColor)
    case 'soft':
    default:          return waveTransition(fillColor)
  }
}
