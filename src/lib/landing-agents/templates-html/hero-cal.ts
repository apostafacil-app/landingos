/**
 * Hero template — estilo Cal.com / Stripe.
 *
 * Light mode premium, tipografia forte, muito respiro, imagem/mockup à
 * direita. Layout responsivo REAL via flexbox + media queries.
 *
 * Slots esperados:
 * - BUSINESS_NAME: nome da marca (nav + copy)
 * - LOGO_URL: opcional. Se ausente, renderiza nome
 * - EYEBROW: texto do badge acima do headline (ex "✨ Novo pra revendas gráficas")
 * - HEADLINE: título principal
 * - SUBHEADLINE: parágrafo abaixo do título
 * - CTA_PRIMARY: texto do botão principal
 * - CTA_PRIMARY_HREF: destino do botão principal (default #cta)
 * - CTA_SECONDARY: opcional — botão secundário (ghost)
 * - CTA_SECONDARY_HREF: destino
 * - HERO_IMAGE_URL: opcional — URL da imagem AI já externalizada
 * - TRUST_STAT_1/2/3: 3 pontos de confiança abaixo dos CTAs
 * - PRIMARY_COLOR: hex do brand primary
 * - ACCENT_COLOR: hex do brand accent
 * - NAV_LINKS_HTML: HTML pronto pros links do nav
 */

import { trackAttrs } from './slots'

export const heroCalTemplate = `<style>
  :root {
    --lp-primary: {{PRIMARY_COLOR}};
    --lp-accent: {{ACCENT_COLOR}};
    --lp-ink: #0a0a0a;
    --lp-ink-soft: #4a4a4a;
    --lp-ink-fade: #6b6b6b;
    --lp-bg: #ffffff;
    --lp-bg-soft: #fafafa;
    --lp-border: #e5e5e5;
    --lp-shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --lp-shadow-md: 0 4px 20px rgba(0,0,0,0.06);
    --lp-shadow-lg: 0 24px 48px rgba(0,0,0,0.08);
    --lp-shadow-xl: 0 32px 64px rgba(0,0,0,0.12);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--lp-bg);
    color: var(--lp-ink);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }

  /* NAV */
  .lp-nav {
    position: sticky; top: 0; z-index: 40;
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--lp-border);
  }
  .lp-nav-inner {
    max-width: 1200px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
  }
  .lp-brand {
    display: flex; align-items: center; gap: 10px;
    font-weight: 700; font-size: 18px; letter-spacing: -0.01em;
  }
  .lp-brand img { max-height: 32px; }
  .lp-nav-links {
    display: flex; align-items: center; gap: 8px;
  }
  .lp-nav-links a {
    padding: 8px 14px; font-size: 14px; font-weight: 500;
    color: var(--lp-ink-soft);
    border-radius: 8px;
    transition: color .15s ease, background-color .15s ease;
  }
  .lp-nav-links a:hover { color: var(--lp-ink); background: var(--lp-bg-soft); }
  .lp-nav-cta {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; font-size: 14px; font-weight: 600;
    background: var(--lp-ink); color: white;
    border-radius: 10px;
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .lp-nav-cta:hover { transform: translateY(-1px); box-shadow: var(--lp-shadow-md); }
  @media (max-width: 720px) {
    .lp-nav-links { display: none; }
  }

  /* HERO */
  .lp-hero {
    position: relative;
    overflow: hidden;
    padding: 96px 32px 128px;
    background: radial-gradient(ellipse at top, rgba(0,0,0,0.02), transparent 60%), var(--lp-bg);
  }
  .lp-hero::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 15% 30%, {{ACCENT_COLOR}}12 0%, transparent 40%),
      radial-gradient(circle at 85% 70%, {{PRIMARY_COLOR}}10 0%, transparent 40%);
    pointer-events: none;
  }
  .lp-hero-inner {
    position: relative;
    max-width: 1200px; margin: 0 auto;
    display: grid; grid-template-columns: 1.05fr 1fr; gap: 64px;
    align-items: center;
  }
  @media (max-width: 900px) {
    .lp-hero { padding: 64px 24px 96px; }
    .lp-hero-inner { grid-template-columns: 1fr; gap: 48px; }
  }

  .lp-hero-copy { max-width: 560px; }
  .lp-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    font-size: 13px; font-weight: 500;
    color: var(--lp-ink-soft);
    background: var(--lp-bg-soft);
    border: 1px solid var(--lp-border);
    border-radius: 999px;
    margin-bottom: 24px;
  }
  .lp-eyebrow-dot {
    display: inline-block; width: 6px; height: 6px; border-radius: 999px;
    background: var(--lp-accent);
    box-shadow: 0 0 0 3px {{ACCENT_COLOR}}22;
  }
  .lp-headline {
    font-size: clamp(38px, 5vw, 60px);
    line-height: 1.05;
    letter-spacing: -0.03em;
    font-weight: 700;
    color: var(--lp-ink);
    margin-bottom: 20px;
  }
  .lp-headline em {
    font-style: normal;
    background: linear-gradient(135deg, var(--lp-primary), var(--lp-accent));
    -webkit-background-clip: text; background-clip: text;
    color: transparent;
  }
  .lp-subheadline {
    font-size: 19px; line-height: 1.55;
    color: var(--lp-ink-soft);
    margin-bottom: 32px;
  }
  .lp-cta-group {
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-bottom: 32px;
  }
  .lp-cta-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 24px;
    font-size: 15px; font-weight: 600;
    color: white;
    background: var(--lp-ink);
    border-radius: 12px;
    box-shadow: var(--lp-shadow-sm);
    transition: transform .15s ease, box-shadow .2s ease, background .15s ease;
  }
  .lp-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--lp-shadow-lg);
  }
  .lp-cta-primary::after { content: '→'; transition: transform .2s ease; }
  .lp-cta-primary:hover::after { transform: translateX(4px); }
  .lp-cta-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 20px;
    font-size: 15px; font-weight: 500;
    color: var(--lp-ink);
    background: transparent;
    border: 1px solid var(--lp-border);
    border-radius: 12px;
    transition: border-color .15s ease, background-color .15s ease;
  }
  .lp-cta-secondary:hover { border-color: var(--lp-ink); background: var(--lp-bg-soft); }

  .lp-trust {
    display: flex; flex-wrap: wrap; gap: 20px;
    font-size: 13px; color: var(--lp-ink-fade);
  }
  .lp-trust > span {
    display: inline-flex; align-items: center; gap: 6px;
  }
  .lp-trust-check {
    display: inline-block; width: 14px; height: 14px;
    color: var(--lp-accent);
  }

  /* HERO VISUAL */
  .lp-hero-visual {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(135deg, var(--lp-bg-soft), white);
    box-shadow: var(--lp-shadow-xl);
    border: 1px solid var(--lp-border);
  }
  .lp-hero-visual::before {
    content: ''; position: absolute; inset: -1px;
    padding: 1px;
    background: linear-gradient(135deg, {{PRIMARY_COLOR}}30, {{ACCENT_COLOR}}30);
    border-radius: 24px;
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: xor;
    pointer-events: none;
  }
  .lp-hero-visual img {
    width: 100%; height: auto; display: block;
    aspect-ratio: 16 / 11; object-fit: cover;
  }
  .lp-hero-visual-empty {
    aspect-ratio: 16 / 11;
    display: flex; align-items: center; justify-content: center;
    background:
      radial-gradient(circle at 30% 30%, {{ACCENT_COLOR}}15 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, {{PRIMARY_COLOR}}15 0%, transparent 50%),
      var(--lp-bg-soft);
    font-size: 64px;
    color: var(--lp-ink-fade);
    opacity: 0.4;
  }
</style>

<nav class="lp-nav" id="top">
  <div class="lp-nav-inner">
    <a href="#top" class="lp-brand">
      {{#IF_LOGO_URL}}<img src="{{LOGO_URL}}" alt="{{BUSINESS_NAME}}" />{{/IF_LOGO_URL}}
      {{#IF_NO_LOGO_URL}}{{BUSINESS_NAME}}{{/IF_NO_LOGO_URL}}
    </a>
    <div class="lp-nav-links">
      {{NAV_LINKS_HTML}}
    </div>
    <a href="{{CTA_PRIMARY_HREF}}" class="lp-nav-cta" ${trackAttrs('nav_cta', 'InitiateCheckout')}>{{CTA_PRIMARY}}</a>
  </div>
</nav>

<section class="lp-hero">
  <div class="lp-hero-inner">
    <div class="lp-hero-copy">
      {{#IF_EYEBROW}}
      <span class="lp-eyebrow">
        <span class="lp-eyebrow-dot"></span>{{EYEBROW}}
      </span>
      {{/IF_EYEBROW}}
      <h1 class="lp-headline">{{HEADLINE_HTML}}</h1>
      <p class="lp-subheadline">{{SUBHEADLINE}}</p>
      <div class="lp-cta-group">
        <a href="{{CTA_PRIMARY_HREF}}" class="lp-cta-primary" ${trackAttrs('hero_cta_primary', 'Lead')}>{{CTA_PRIMARY}}</a>
        {{#IF_CTA_SECONDARY}}
        <a href="{{CTA_SECONDARY_HREF}}" class="lp-cta-secondary" ${trackAttrs('hero_cta_secondary', 'ViewContent')}>{{CTA_SECONDARY}}</a>
        {{/IF_CTA_SECONDARY}}
      </div>
      <div class="lp-trust">
        {{#IF_TRUST_STAT_1}}<span><svg class="lp-trust-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_1}}</span>{{/IF_TRUST_STAT_1}}
        {{#IF_TRUST_STAT_2}}<span><svg class="lp-trust-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_2}}</span>{{/IF_TRUST_STAT_2}}
        {{#IF_TRUST_STAT_3}}<span><svg class="lp-trust-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{{TRUST_STAT_3}}</span>{{/IF_TRUST_STAT_3}}
      </div>
    </div>
    <div class="lp-hero-visual">
      {{#IF_HERO_IMAGE_URL}}<img src="{{HERO_IMAGE_URL}}" alt="{{HEADLINE_ALT}}" loading="eager" />{{/IF_HERO_IMAGE_URL}}
      {{#IF_NO_HERO_IMAGE_URL}}<div class="lp-hero-visual-empty">✦</div>{{/IF_NO_HERO_IMAGE_URL}}
    </div>
  </div>
</section>
`
