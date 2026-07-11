/**
 * Benefits — grid 3 colunas com ícones, título forte, descrição.
 * Estilo Cal.com/Linear: cards suaves, hover levantando, ícone em círculo colorido.
 *
 * Slots:
 * - EYEBROW, HEADLINE, SUBTITLE
 * - ITEMS_HTML: HTML pronto dos cards (gerado por buildItemsHtml no renderer)
 */

export const benefitsGridTemplate = `<style>
  .lp-benefits { background: white; }
  .lp-benefits-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 900px) {
    .lp-benefits-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .lp-benefits-grid { grid-template-columns: 1fr; }
  }
  .lp-benefit {
    padding: 32px;
    background: var(--lp-bg-soft);
    border: 1px solid var(--lp-border-soft);
    border-radius: 20px;
    transition: transform .2s ease, box-shadow .3s ease, border-color .2s ease;
  }
  .lp-benefit:hover {
    transform: translateY(-4px);
    box-shadow: var(--lp-shadow-lg);
    border-color: var(--lp-border);
  }
  .lp-benefit-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 48px; height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--lp-primary), var(--lp-accent));
    color: white;
    margin-bottom: 20px;
    font-size: 22px;
  }
  .lp-benefit-icon svg { width: 24px; height: 24px; stroke: currentColor; fill: none; stroke-width: 2; }
  .lp-benefit-title {
    font-size: 19px; font-weight: 600;
    letter-spacing: -0.01em;
    margin-bottom: 8px;
    color: var(--lp-ink);
  }
  .lp-benefit-desc {
    font-size: 15px; line-height: 1.6;
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
    <div class="lp-benefits-grid">
      {{ITEMS_HTML}}
    </div>
  </div>
</section>
`

/**
 * Renderiza 1 item de benefit. `iconSvg` já vem pronto (via icons.ts).
 */
export function renderBenefitItem(icon: string, title: string, description: string): string {
  return `<div class="lp-benefit">
        <div class="lp-benefit-icon">${icon}</div>
        <h3 class="lp-benefit-title">${title}</h3>
        <p class="lp-benefit-desc">${description}</p>
      </div>`
}
