/**
 * Offer / CTA final — full-bleed com gradiente, headline dramático, 1 CTA.
 * Estilo Stripe/Cal: seção escura com radial gradient, hover no botão.
 */

import { trackAttrs } from './slots'

export const offerTemplate = `<style>
  .lp-offer {
    padding: 96px 32px;
    background: var(--lp-ink); color: white;
    position: relative; overflow: hidden;
    text-align: center;
  }
  .lp-offer::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 20% 30%, {{ACCENT_COLOR}}25 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, {{PRIMARY_COLOR}}30 0%, transparent 50%);
    pointer-events: none;
  }
  .lp-offer-inner {
    position: relative;
    max-width: 720px; margin: 0 auto;
  }
  .lp-offer-eyebrow {
    display: inline-block;
    padding: 6px 14px;
    font-size: 13px; font-weight: 500;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 999px;
    color: rgba(255,255,255,0.8);
    margin-bottom: 24px;
  }
  .lp-offer-title {
    font-size: clamp(32px, 5vw, 52px);
    line-height: 1.05; letter-spacing: -0.03em;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .lp-offer-desc {
    font-size: 19px; line-height: 1.55;
    color: rgba(255,255,255,0.7);
    max-width: 560px; margin: 0 auto 36px;
  }
  .lp-offer-cta {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 16px 32px;
    font-size: 16px; font-weight: 600;
    color: var(--lp-ink); background: white;
    border-radius: 14px;
    box-shadow: var(--lp-shadow-lg);
    transition: transform .15s ease, box-shadow .25s ease;
  }
  .lp-offer-cta:hover {
    transform: translateY(-2px);
    box-shadow: var(--lp-shadow-xl);
  }
  .lp-offer-cta::after { content: '→'; transition: transform .2s ease; }
  .lp-offer-cta:hover::after { transform: translateX(4px); }
  .lp-offer-note {
    font-size: 13px; color: rgba(255,255,255,0.5);
    margin-top: 20px;
  }
</style>

<section class="lp-offer" id="cta">
  <div class="lp-offer-inner">
    {{#IF_EYEBROW}}<span class="lp-offer-eyebrow">{{EYEBROW}}</span>{{/IF_EYEBROW}}
    <h2 class="lp-offer-title">{{HEADLINE}}</h2>
    <p class="lp-offer-desc">{{SUBTITLE}}</p>
    <a href="#cta" class="lp-offer-cta" ${trackAttrs('offer_cta', 'Lead')}>{{CTA_TEXT}}</a>
    {{#IF_NOTE}}<div class="lp-offer-note">{{NOTE}}</div>{{/IF_NOTE}}
  </div>
</section>
`
