/**
 * Pricing — 3 planos lado a lado, destaque no central com badge.
 * Estilo Cal.com/Vercel: cards limpos, plano popular com borda accent.
 */

import { trackAttrs } from './slots'

export const pricingTemplate = `<style>
  .lp-pricing { background: white; }
  .lp-pricing-grid {
    display: grid; gap: 20px;
    grid-template-columns: repeat(3, 1fr);
    max-width: 1100px; margin: 0 auto;
  }
  @media (max-width: 900px) {
    .lp-pricing-grid { grid-template-columns: 1fr; max-width: 480px; }
  }
  .lp-plan {
    position: relative;
    padding: 36px 28px;
    background: var(--lp-bg-soft);
    border: 1px solid var(--lp-border-soft);
    border-radius: 20px;
    display: flex; flex-direction: column;
    transition: transform .2s ease, box-shadow .3s ease;
  }
  .lp-plan:hover { transform: translateY(-3px); box-shadow: var(--lp-shadow-md); }
  .lp-plan-featured {
    background: var(--lp-ink); color: white;
    border-color: var(--lp-ink);
    transform: scale(1.02);
    box-shadow: var(--lp-shadow-xl);
  }
  .lp-plan-featured:hover { transform: scale(1.02) translateY(-3px); }
  .lp-plan-badge {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    padding: 4px 12px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    text-transform: uppercase;
    background: var(--lp-accent); color: white;
    border-radius: 999px;
    box-shadow: var(--lp-shadow-sm);
  }
  .lp-plan-name {
    font-size: 14px; font-weight: 600;
    color: var(--lp-ink-soft);
    margin-bottom: 8px;
  }
  .lp-plan-featured .lp-plan-name { color: rgba(255,255,255,0.7); }
  .lp-plan-price {
    font-size: 40px; font-weight: 700;
    letter-spacing: -0.03em; line-height: 1;
    margin-bottom: 8px;
  }
  .lp-plan-price-suffix {
    font-size: 14px; font-weight: 500;
    color: var(--lp-ink-soft);
    margin-left: 4px;
  }
  .lp-plan-featured .lp-plan-price-suffix { color: rgba(255,255,255,0.6); }
  .lp-plan-tagline {
    font-size: 14px; line-height: 1.5;
    color: var(--lp-ink-fade);
    margin-bottom: 24px;
  }
  .lp-plan-featured .lp-plan-tagline { color: rgba(255,255,255,0.6); }
  .lp-plan-features {
    list-style: none; padding: 0; margin: 0 0 28px;
    display: flex; flex-direction: column; gap: 12px;
    flex: 1;
  }
  .lp-plan-features li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; line-height: 1.5;
  }
  .lp-plan-features svg {
    width: 18px; height: 18px; flex-shrink: 0;
    color: var(--lp-accent);
    margin-top: 1px;
  }
  .lp-plan-featured .lp-plan-features svg { color: var(--lp-accent); }
  .lp-plan-cta {
    display: block; text-align: center;
    padding: 12px 20px;
    font-size: 14px; font-weight: 600;
    border-radius: 10px;
    transition: transform .15s ease, opacity .15s ease;
  }
  .lp-plan .lp-plan-cta {
    background: var(--lp-ink); color: white;
  }
  .lp-plan-featured .lp-plan-cta {
    background: white; color: var(--lp-ink);
  }
  .lp-plan-cta:hover { transform: translateY(-1px); opacity: 0.9; }
</style>

<section class="lp-section lp-pricing" id="precos">
  <div class="lp-container">
    <div class="lp-section-header">
      {{#IF_EYEBROW}}<span class="lp-section-eyebrow">{{EYEBROW}}</span>{{/IF_EYEBROW}}
      <h2 class="lp-section-title">{{HEADLINE}}</h2>
      {{#IF_SUBTITLE}}<p class="lp-section-subtitle">{{SUBTITLE}}</p>{{/IF_SUBTITLE}}
    </div>
    <div class="lp-pricing-grid">
      {{ITEMS_HTML}}
    </div>
  </div>
</section>
`

export function renderPlan(name: string, price: string, tagline: string, features: string[], cta: string, featured: boolean): string {
  const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
  const featuresHtml = features.map(f => `<li>${checkSvg}<span>${f}</span></li>`).join('\n          ')
  const trackKind = featured ? 'pricing_featured' : 'pricing_plan'
  return `<div class="lp-plan ${featured ? 'lp-plan-featured' : ''}">
        ${featured ? '<span class="lp-plan-badge">Mais popular</span>' : ''}
        <div class="lp-plan-name">${name}</div>
        <div class="lp-plan-price">${price}<span class="lp-plan-price-suffix">/mês</span></div>
        <div class="lp-plan-tagline">${tagline}</div>
        <ul class="lp-plan-features">
          ${featuresHtml}
        </ul>
        <a href="#cta" class="lp-plan-cta" ${trackAttrs(trackKind, 'InitiateCheckout')}>${cta}</a>
      </div>`
}
