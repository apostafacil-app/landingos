/**
 * Benefits variant: ALTERNATING (zigzag).
 *
 * Cada benefício ocupa uma linha inteira, alternando imagem/ícone à esquerda
 * e direita. Estilo Notion/Stripe: narrativo, respira mais, cada benefit
 * ganha destaque próprio.
 *
 * Usa quando design.mood é 'editorial'/'elegante' OU quando benefits são
 * poucos (3-4) e cada um merece narrativa.
 */

export const benefitsAlternatingTemplate = `<style>
  .lp-benefits-alt-list {
    display: flex; flex-direction: column;
    gap: 96px;
  }
  @media (max-width: 700px) {
    .lp-benefits-alt-list { gap: 64px; }
  }
  .lp-benefit-alt {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .lp-benefit-alt:nth-child(even) {
    grid-template-columns: 1fr 1fr;
    direction: rtl;
  }
  .lp-benefit-alt:nth-child(even) > * { direction: ltr; }
  @media (max-width: 700px) {
    .lp-benefit-alt, .lp-benefit-alt:nth-child(even) {
      grid-template-columns: 1fr; gap: 24px;
      direction: ltr;
    }
  }
  .lp-benefit-alt-visual {
    aspect-ratio: 4 / 3;
    background: linear-gradient(135deg, var(--lp-bg-soft), white);
    border: 1px solid var(--lp-border-soft);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .lp-benefit-alt-visual::before {
    content: '';
    position: absolute; inset: -1px;
    background: linear-gradient(135deg, {{PRIMARY_COLOR}}22, {{ACCENT_COLOR}}22);
    border-radius: 20px;
    z-index: 0;
  }
  .lp-benefit-alt-icon {
    position: relative; z-index: 1;
    width: 96px; height: 96px;
    border-radius: 24px;
    background: white;
    border: 1px solid var(--lp-border);
    box-shadow: var(--lp-shadow-md);
    display: flex; align-items: center; justify-content: center;
    color: var(--lp-primary);
  }
  .lp-benefit-alt-icon svg { width: 48px; height: 48px; }
  .lp-benefit-alt-copy {
    max-width: 460px;
  }
  .lp-benefit-alt-index {
    display: inline-block;
    padding: 4px 12px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
    background: var(--lp-accent); color: white;
    border-radius: 999px; text-transform: uppercase;
    margin-bottom: 16px;
  }
  .lp-benefit-alt-title {
    font-size: clamp(24px, 3vw, 32px);
    line-height: 1.15;
    letter-spacing: -0.02em;
    font-weight: 700;
    margin-bottom: 12px;
    color: var(--lp-ink);
  }
  .lp-benefit-alt-desc {
    font-size: 17px; line-height: 1.65;
    color: var(--lp-ink-soft);
  }
</style>

<section class="lp-section" id="funcionalidades">
  <div class="lp-container">
    <div class="lp-section-header">
      {{#IF_EYEBROW}}<span class="lp-section-eyebrow">{{EYEBROW}}</span>{{/IF_EYEBROW}}
      <h2 class="lp-section-title">{{HEADLINE}}</h2>
      {{#IF_SUBTITLE}}<p class="lp-section-subtitle">{{SUBTITLE}}</p>{{/IF_SUBTITLE}}
    </div>
    <div class="lp-benefits-alt-list">
      {{ITEMS_HTML}}
    </div>
  </div>
</section>
`

export function renderBenefitAltItem(icon: string, title: string, description: string, index: number): string {
  const label = String(index + 1).padStart(2, '0')
  return `<div class="lp-benefit-alt">
        <div class="lp-benefit-alt-visual">
          <div class="lp-benefit-alt-icon">${icon}</div>
        </div>
        <div class="lp-benefit-alt-copy">
          <span class="lp-benefit-alt-index">${label} · Feature</span>
          <h3 class="lp-benefit-alt-title">${title}</h3>
          <p class="lp-benefit-alt-desc">${description}</p>
        </div>
      </div>`
}
