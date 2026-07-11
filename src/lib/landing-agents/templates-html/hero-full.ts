/**
 * Hero variant: FULL-BLEED IMAGE.
 *
 * Imagem AI ocupa 100% da largura como background, texto centralizado por
 * cima com overlay escuro sutil. Estilo Apple/Manus/Vercel — mood premium
 * com forte identidade visual.
 *
 * Usa quando design.mood é 'bold' ou nicho é criativo/imagem-forte.
 */

import { trackAttrs } from './slots'

export const heroFullTemplate = `<style>
  /* Nav em cima da imagem — transparente */
  .lp-nav-full {
    position: absolute; top: 0; left: 0; right: 0; z-index: 20;
    background: transparent;
  }
  .lp-nav-full-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 32px;
  }
  .lp-nav-full-brand {
    display: flex; align-items: center; gap: 10px;
    font-weight: 700; font-size: 18px; letter-spacing: -0.01em;
    color: white;
  }
  .lp-nav-full-brand img { max-height: 32px; filter: brightness(0) invert(1); }
  .lp-nav-full-links { display: flex; align-items: center; gap: 6px; }
  .lp-nav-full-links a {
    padding: 8px 14px; font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.85);
    border-radius: 8px;
    transition: color .15s ease, background-color .15s ease;
  }
  .lp-nav-full-links a:hover { color: white; background: rgba(255,255,255,0.1); }
  .lp-nav-full-cta {
    display: inline-flex; align-items: center;
    padding: 9px 18px; font-size: 14px; font-weight: 600;
    background: white; color: var(--lp-ink);
    border-radius: 10px;
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .lp-nav-full-cta:hover { transform: translateY(-1px); box-shadow: var(--lp-shadow-md); }
  @media (max-width: 720px) {
    .lp-nav-full-links { display: none; }
  }

  /* Hero full-bleed */
  .lp-hero-full {
    position: relative;
    min-height: 640px;
    padding: 140px 32px 96px;
    overflow: hidden;
    color: white;
    text-align: center;
  }
  .lp-hero-full-bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    background-color: var(--lp-ink);
  }
  .lp-hero-full-bg-empty {
    background: linear-gradient(135deg, var(--lp-primary), var(--lp-accent));
  }
  .lp-hero-full-overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.7) 100%);
  }
  .lp-hero-full-inner {
    position: relative;
    max-width: 900px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: center; gap: 24px;
  }
  .lp-hero-full-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 7px 16px;
    font-size: 13px; font-weight: 500;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 999px;
    color: white;
  }
  .lp-hero-full-eyebrow-dot {
    display: inline-block; width: 6px; height: 6px; border-radius: 999px;
    background: var(--lp-accent);
    box-shadow: 0 0 0 3px {{ACCENT_COLOR}}44;
  }
  .lp-hero-full-headline {
    font-size: clamp(42px, 6vw, 72px);
    line-height: 1.02; letter-spacing: -0.035em;
    font-weight: 700;
    max-width: 800px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }
  .lp-hero-full-headline em {
    font-style: normal;
    background: linear-gradient(135deg, {{ACCENT_COLOR}}, white);
    -webkit-background-clip: text; background-clip: text;
    color: transparent;
  }
  .lp-hero-full-subheadline {
    font-size: 20px; line-height: 1.55;
    color: rgba(255,255,255,0.88);
    max-width: 640px;
    text-shadow: 0 1px 10px rgba(0,0,0,0.3);
  }
  .lp-hero-full-cta-group {
    display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
    margin-top: 8px;
  }
  .lp-hero-full-cta-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 15px 28px;
    font-size: 15px; font-weight: 600;
    color: var(--lp-ink); background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .lp-hero-full-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  .lp-hero-full-cta-primary::after { content: '→'; transition: transform .2s ease; }
  .lp-hero-full-cta-primary:hover::after { transform: translateX(4px); }
  .lp-hero-full-cta-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 15px 22px;
    font-size: 15px; font-weight: 500;
    color: white;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 12px;
    transition: background-color .15s ease, border-color .15s ease;
  }
  .lp-hero-full-cta-secondary:hover {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.4);
  }
  .lp-hero-full-trust {
    display: flex; flex-wrap: wrap; gap: 24px; justify-content: center;
    margin-top: 8px;
    font-size: 13px; color: rgba(255,255,255,0.75);
  }
  .lp-hero-full-trust > span {
    display: inline-flex; align-items: center; gap: 6px;
  }
</style>

<div style="position: relative;">
  <nav class="lp-nav-full" id="top">
    <div class="lp-nav-full-inner">
      <a href="#top" class="lp-nav-full-brand">
        {{#IF_LOGO_URL}}<img src="{{LOGO_URL}}" alt="{{BUSINESS_NAME}}" />{{/IF_LOGO_URL}}
        {{#IF_NO_LOGO_URL}}{{BUSINESS_NAME}}{{/IF_NO_LOGO_URL}}
      </a>
      <div class="lp-nav-full-links">
        {{NAV_LINKS_HTML}}
      </div>
      <a href="{{CTA_PRIMARY_HREF}}" class="lp-nav-full-cta" ${trackAttrs('nav_cta', 'InitiateCheckout')}>{{CTA_PRIMARY}}</a>
    </div>
  </nav>

  <section class="lp-hero-full">
    <div class="lp-hero-full-bg {{#IF_NO_HERO_IMAGE_URL}}lp-hero-full-bg-empty{{/IF_NO_HERO_IMAGE_URL}}" style="{{#IF_HERO_IMAGE_URL}}background-image: url('{{HERO_IMAGE_URL}}');{{/IF_HERO_IMAGE_URL}}"></div>
    <div class="lp-hero-full-overlay"></div>
    <div class="lp-hero-full-inner">
      {{#IF_EYEBROW}}
      <span class="lp-hero-full-eyebrow">
        <span class="lp-hero-full-eyebrow-dot"></span>{{EYEBROW}}
      </span>
      {{/IF_EYEBROW}}
      <h1 class="lp-hero-full-headline">{{HEADLINE_HTML}}</h1>
      <p class="lp-hero-full-subheadline">{{SUBHEADLINE}}</p>
      <div class="lp-hero-full-cta-group">
        <a href="{{CTA_PRIMARY_HREF}}" class="lp-hero-full-cta-primary" ${trackAttrs('hero_cta_primary', 'Lead')}>{{CTA_PRIMARY}}</a>
        {{#IF_CTA_SECONDARY}}
        <a href="{{CTA_SECONDARY_HREF}}" class="lp-hero-full-cta-secondary" ${trackAttrs('hero_cta_secondary', 'ViewContent')}>{{CTA_SECONDARY}}</a>
        {{/IF_CTA_SECONDARY}}
      </div>
      <div class="lp-hero-full-trust">
        {{#IF_TRUST_STAT_1}}<span>✓ {{TRUST_STAT_1}}</span>{{/IF_TRUST_STAT_1}}
        {{#IF_TRUST_STAT_2}}<span>✓ {{TRUST_STAT_2}}</span>{{/IF_TRUST_STAT_2}}
        {{#IF_TRUST_STAT_3}}<span>✓ {{TRUST_STAT_3}}</span>{{/IF_TRUST_STAT_3}}
      </div>
    </div>
  </section>
</div>
`
