/**
 * Hero variant: FULL-BLEED IMAGE.
 *
 * Imagem AI ocupa 100% da largura como background, texto CENTRAL enorme
 * com overlay sutil, glassmorphism nos elementos. Estilo Vercel/Linear/Apple.
 *
 * Usa quando design.mood é 'bold'/'energetico' ou hash cai nele.
 */

import { trackAttrs } from './slots'

export const heroFullTemplate = `<style>
  /* Container wrapper — position relative pra absolute nav */
  .lp-hero-full-wrap { position: relative; }

  /* NAV transparente sobre a imagem */
  .lp-nav-full {
    position: absolute; top: 0; left: 0; right: 0; z-index: 20;
    background: transparent;
  }
  .lp-nav-full-inner {
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: auto 1fr auto;
    gap: 32px; align-items: center;
    padding: 24px 32px;
  }
  .lp-nav-full-brand {
    display: flex; align-items: center; gap: 10px;
    font-weight: 700; font-size: 18px; letter-spacing: -0.01em;
    color: white; text-decoration: none;
  }
  .lp-nav-full-brand img {
    max-height: 32px;
    filter: brightness(0) invert(1);
  }
  .lp-nav-full-links {
    display: flex; align-items: center; gap: 4px;
    justify-content: center;
  }
  .lp-nav-full-links a {
    padding: 8px 16px; font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.85);
    border-radius: 999px;
    transition: color .15s ease, background-color .15s ease;
  }
  .lp-nav-full-links a:hover { color: white; background: rgba(255,255,255,0.1); }
  .lp-nav-full-cta {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 10px 20px;
    font-size: 14px; font-weight: 600;
    background: white; color: var(--lp-ink);
    border-radius: 999px;
    white-space: nowrap;
    transition: transform .15s ease;
  }
  .lp-nav-full-cta:hover { transform: translateY(-1px); }
  @media (max-width: 900px) {
    .lp-nav-full-links { display: none; }
    .lp-nav-full-inner { grid-template-columns: 1fr auto; padding: 20px 24px; }
  }

  /* HERO FULL-BLEED */
  .lp-hero-full {
    position: relative;
    min-height: 780px;
    padding: 160px 32px 120px;
    overflow: hidden;
    color: white;
    display: flex; align-items: center;
  }
  @media (max-width: 720px) {
    .lp-hero-full { min-height: 620px; padding: 130px 24px 80px; }
  }
  .lp-hero-full-bg {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    background-color: var(--lp-ink);
  }
  .lp-hero-full-bg-empty {
    background:
      radial-gradient(circle at 30% 30%, {{ACCENT_COLOR}} 0%, transparent 60%),
      radial-gradient(circle at 70% 70%, {{PRIMARY_COLOR}} 0%, transparent 60%),
      var(--lp-ink);
  }
  /* Overlay — gradient sutil pra texto ler, imagem aparece */
  .lp-hero-full-overlay {
    position: absolute; inset: 0;
    background:
      linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%);
  }
  .lp-hero-full-inner {
    position: relative; z-index: 2;
    max-width: 980px; margin: 0 auto;
    width: 100%;
    display: flex; flex-direction: column; align-items: center; gap: 28px;
    text-align: center;
  }

  /* Eyebrow glassmorphism */
  .lp-hero-full-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 18px;
    font-size: 13px; font-weight: 500;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 999px;
    color: white;
    letter-spacing: 0.01em;
  }
  .lp-hero-full-eyebrow-dot {
    display: inline-block; width: 7px; height: 7px; border-radius: 999px;
    background: var(--lp-accent);
    box-shadow: 0 0 12px {{ACCENT_COLOR}}, 0 0 0 3px {{ACCENT_COLOR}}33;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* HEADLINE — impacto dramático */
  .lp-hero-full-headline {
    font-size: clamp(44px, 7vw, 88px);
    line-height: 1.02;
    letter-spacing: -0.04em;
    font-weight: 700;
    max-width: 900px;
    text-shadow: 0 4px 40px rgba(0,0,0,0.5);
    margin: 0;
  }
  .lp-hero-full-headline em {
    font-style: normal;
    background: linear-gradient(135deg, {{ACCENT_COLOR}} 0%, #ffffff 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    padding: 0 0.02em;
  }

  /* SUB — respiração generosa */
  .lp-hero-full-subheadline {
    font-size: clamp(17px, 1.5vw, 21px);
    line-height: 1.55;
    color: rgba(255,255,255,0.9);
    max-width: 620px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
    font-weight: 400;
    margin: 0;
  }

  /* CTAs */
  .lp-hero-full-cta-group {
    display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
    margin-top: 12px;
  }
  .lp-hero-full-cta-primary {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 17px 32px;
    font-size: 16px; font-weight: 600;
    color: var(--lp-ink); background: white;
    border-radius: 999px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    transition: transform .18s ease, box-shadow .25s ease;
  }
  .lp-hero-full-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  }
  .lp-hero-full-cta-primary::after {
    content: '→'; transition: transform .2s ease;
    font-size: 18px;
  }
  .lp-hero-full-cta-primary:hover::after { transform: translateX(4px); }
  .lp-hero-full-cta-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 17px 26px;
    font-size: 15px; font-weight: 500;
    color: white;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.25);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 999px;
    transition: background-color .18s ease, border-color .18s ease;
  }
  .lp-hero-full-cta-secondary:hover {
    background: rgba(255,255,255,0.18);
    border-color: rgba(255,255,255,0.4);
  }

  /* Trust stats — pills glassmorphism */
  .lp-hero-full-trust {
    display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
    margin-top: 20px;
  }
  .lp-hero-full-trust > span {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    font-size: 13px; font-weight: 500;
    color: rgba(255,255,255,0.9);
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 999px;
  }
  .lp-hero-full-trust svg {
    width: 14px; height: 14px;
    color: var(--lp-accent);
  }
</style>

<div class="lp-hero-full-wrap">
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
        {{#IF_TRUST_STAT_1}}<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_1}}</span>{{/IF_TRUST_STAT_1}}
        {{#IF_TRUST_STAT_2}}<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_2}}</span>{{/IF_TRUST_STAT_2}}
        {{#IF_TRUST_STAT_3}}<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_3}}</span>{{/IF_TRUST_STAT_3}}
      </div>
    </div>
  </section>
</div>
`
