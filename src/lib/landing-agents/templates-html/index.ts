/**
 * Renderer HTML mestre (v3-html).
 *
 * Consome o mesmo ctx da pipeline multi-agente v2 (strategy, hero, sections,
 * design, visual, seo) e monta HTML premium usando templates HTML/CSS
 * pré-desenhados com slots preenchidos.
 *
 * Vantagens vs renderer atual (coordenadas absolutas):
 * - Responsivo REAL (flexbox/grid + media queries)
 * - Zero heurística de tamanho de texto
 * - Meta Pixel + GA4 events prontos em CTAs
 * - Hover/animações nativas
 * - HTML semântico (nav/section/main/footer)
 *
 * Trade-off: HTML gerado NÃO abre no editor V3 (que exige data-lp-model="v3").
 * Modo interno, aceitável.
 */

import type { PipelineContext } from '../types'
import { fillSlots, escapeHtml } from './slots'
import { heroCalTemplate } from './hero-cal'
import { trackingRuntime } from './tracking-runtime'

const GOOGLE_FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
`.trim()

/**
 * Highlight seletivo — envolve a última palavra "chave" do headline em <em>.
 * <em> no template Cal renderiza com gradient primary→accent.
 *
 * Heurística: pega a última palavra "significativa" (>3 chars) do headline.
 * Ex: "Do pedido à NF-e em 1 clique" → "Do pedido à NF-e em 1 <em>clique</em>"
 */
function highlightHeadline(headline: string): string {
  const safe = escapeHtml(headline)
  const words = safe.split(/\s+/)
  // Encontra a última palavra > 3 chars pra destacar
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].length > 3) {
      words[i] = `<em>${words[i]}</em>`
      break
    }
  }
  return words.join(' ')
}

/**
 * Monta HTML dos links do nav baseado nas seções presentes.
 */
function buildNavLinksHtml(ctx: PipelineContext): string {
  const sections = ctx.sections ?? []
  const links: Array<{ label: string; href: string }> = []
  if (sections.some(s => s.type === 'benefits'))     links.push({ label: 'Funcionalidades', href: '#funcionalidades' })
  if (sections.some(s => s.type === 'social_proof')) links.push({ label: 'Depoimentos',     href: '#depoimentos' })
  if (sections.some(s => s.type === 'pricing'))      links.push({ label: 'Preços',          href: '#precos' })
  if (sections.some(s => s.type === 'faq'))          links.push({ label: 'Perguntas',       href: '#faq' })
  return links.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n      ')
}

export function renderHtmlV3Html(ctx: PipelineContext, businessName: string): string {
  if (!ctx.hero || !ctx.design) {
    throw new Error('renderHtmlV3Html exige hero + design')
  }

  const hero = ctx.hero
  const design = ctx.design

  // Slots do hero (só)
  const heroSlots: Record<string, string | boolean> = {
    BUSINESS_NAME: escapeHtml(businessName),
    LOGO_URL: ctx.research?.logo_url ?? '',
    IF_LOGO_URL: Boolean(ctx.research?.logo_url),
    IF_NO_LOGO_URL: !ctx.research?.logo_url,
    EYEBROW: escapeHtml(hero.trust_stats?.[0] ?? ''),
    IF_EYEBROW: Boolean(hero.trust_stats?.[0]),
    HEADLINE_HTML: highlightHeadline(hero.headline),
    HEADLINE_ALT: escapeHtml(hero.headline),
    SUBHEADLINE: escapeHtml(hero.subheadline),
    CTA_PRIMARY: escapeHtml(hero.cta),
    CTA_PRIMARY_HREF: '#cta',
    CTA_SECONDARY: escapeHtml(hero.cta_secondary ?? ''),
    CTA_SECONDARY_HREF: '#funcionalidades',
    IF_CTA_SECONDARY: Boolean(hero.cta_secondary),
    HERO_IMAGE_URL: ctx.visual?.hero_data_url ?? '',
    IF_HERO_IMAGE_URL: Boolean(ctx.visual?.hero_data_url),
    IF_NO_HERO_IMAGE_URL: !ctx.visual?.hero_data_url,
    TRUST_STAT_1: escapeHtml(hero.trust_stats?.[0] ?? ''),
    IF_TRUST_STAT_1: Boolean(hero.trust_stats?.[0]),
    TRUST_STAT_2: escapeHtml(hero.trust_stats?.[1] ?? ''),
    IF_TRUST_STAT_2: Boolean(hero.trust_stats?.[1]),
    TRUST_STAT_3: escapeHtml(hero.trust_stats?.[2] ?? ''),
    IF_TRUST_STAT_3: Boolean(hero.trust_stats?.[2]),
    NAV_LINKS_HTML: buildNavLinksHtml(ctx),
    PRIMARY_COLOR: design.primary,
    ACCENT_COLOR: design.accent,
  }

  const heroHtml = fillSlots(heroCalTemplate, heroSlots)

  // Runtime de tracking Meta Pixel + GA4
  const trackingScript = `<script>${trackingRuntime}</script>`

  return `${GOOGLE_FONTS}\n${heroHtml}\n${trackingScript}`
}
