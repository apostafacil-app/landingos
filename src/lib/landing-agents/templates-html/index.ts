/**
 * Renderer HTML mestre (v3-html).
 *
 * Consome o mesmo ctx da pipeline multi-agente v2 (strategy, hero, sections,
 * design, visual, seo) e monta HTML premium usando templates HTML/CSS
 * pré-desenhados com slots preenchidos.
 *
 * Estrutura da página:
 * - shared-styles (CSS variables + reset + utilities)
 * - hero-cal (nav + hero split)
 * - benefits-grid (grid 3 col)
 * - social-proof-cards (grid depoimentos)
 * - pricing-clean (3 planos, destaque central)
 * - faq-accordion (<details> nativo)
 * - offer-cta (CTA final dramático)
 * - footer-clean (4 col + copyright)
 * - tracking-runtime (fbq + gtag em CTAs)
 */

import type { PipelineContext, SectionCopy } from '../types'
import { fillSlots, escapeHtml } from './slots'
import { sharedStyles } from './shared-styles'
import { heroCalTemplate } from './hero-cal'
import { benefitsGridTemplate, renderBenefitItem } from './benefits-grid'
import { socialProofTemplate, renderTestimonial } from './social-proof-cards'
import { pricingTemplate, renderPlan } from './pricing-clean'
import { faqTemplate, renderFaqItem } from './faq-accordion'
import { offerTemplate } from './offer-cta'
import { footerTemplate } from './footer-clean'
import { trackingRuntime } from './tracking-runtime'
import { iconSvg, emojiToSvg } from '../icons'

const GOOGLE_FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
`.trim()

function highlightHeadline(headline: string): string {
  const safe = escapeHtml(headline)
  const words = safe.split(/\s+/)
  for (let i = words.length - 1; i >= 0; i--) {
    if (words[i].length > 3) {
      words[i] = `<em>${words[i]}</em>`
      break
    }
  }
  return words.join(' ')
}

function buildNavLinksHtml(ctx: PipelineContext): string {
  const sections = ctx.sections ?? []
  const links: Array<{ label: string; href: string }> = []
  if (sections.some(s => s.type === 'benefits'))     links.push({ label: 'Funcionalidades', href: '#funcionalidades' })
  if (sections.some(s => s.type === 'social_proof')) links.push({ label: 'Depoimentos',     href: '#depoimentos' })
  if (sections.some(s => s.type === 'pricing'))      links.push({ label: 'Preços',          href: '#precos' })
  if (sections.some(s => s.type === 'faq'))          links.push({ label: 'Perguntas',       href: '#faq' })
  return links.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n      ')
}

function renderHero(ctx: PipelineContext, businessName: string): string {
  const hero = ctx.hero!
  const design = ctx.design!
  return fillSlots(heroCalTemplate, {
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
  })
}

function renderBenefits(section: SectionCopy, ctx: PipelineContext): string {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = d.items ?? []
  const design = ctx.design!
  const itemsHtml = items.slice(0, 6).map(item => {
    // Se icon é emoji, tenta converter pra SVG Lucide
    const iconRaw = item.icon ?? ''
    const iconSvgFromEmoji = emojiToSvg(iconRaw, '#ffffff')
    const iconContent = iconSvgFromEmoji || iconRaw || iconSvg('zap', '#ffffff')
    return renderBenefitItem(iconContent, escapeHtml(item.title ?? ''), escapeHtml(item.description ?? ''))
  }).join('\n      ')

  return fillSlots(benefitsGridTemplate, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Feito pra quem precisa de resultado'),
    SUBTITLE: '',
    IF_SUBTITLE: false,
    ITEMS_HTML: itemsHtml,
  })
}

function renderSocialProof(section: SectionCopy): string {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ text?: string; author?: string; role?: string }> }
  const items = d.items ?? []
  const itemsHtml = items.slice(0, 6).map(t => renderTestimonial(
    escapeHtml((t.text ?? '').replace(/\[PLACEHOLDER\]/gi, '').trim()),
    escapeHtml(t.author ?? 'Cliente'),
    escapeHtml(t.role ?? ''),
  )).join('\n      ')

  return fillSlots(socialProofTemplate, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Quem já usa'),
    SUBTITLE: '',
    IF_SUBTITLE: false,
    ITEMS_HTML: itemsHtml,
  })
}

function renderPricing(section: SectionCopy): string {
  const d = section.data as { eyebrow?: string; headline?: string; plans?: Array<{ name?: string; price?: string; tagline?: string; features?: string[]; cta?: string; highlighted?: boolean }> }
  let plans = (d.plans ?? []).slice(0, 3)
  // Garante destaque no plano do meio se nenhum flagged
  if (plans.length >= 3 && !plans.some(p => p.highlighted)) {
    plans = plans.map((p, i) => ({ ...p, highlighted: i === 1 }))
  }
  const itemsHtml = plans.map(p => renderPlan(
    escapeHtml(p.name ?? 'Plano'),
    escapeHtml(p.price ?? 'R$ 0'),
    escapeHtml(p.tagline ?? ''),
    (p.features ?? []).map(f => escapeHtml(f)),
    escapeHtml(p.cta ?? 'Começar agora'),
    Boolean(p.highlighted),
  )).join('\n      ')

  return fillSlots(pricingTemplate, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Escolha seu plano'),
    SUBTITLE: '',
    IF_SUBTITLE: false,
    ITEMS_HTML: itemsHtml,
  })
}

function renderFaq(section: SectionCopy): string {
  // O agente Copy Seções gera 'q'/'a' curtos, mas pode gerar 'question'/'answer'.
  // Aceita ambos os shapes.
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ q?: string; a?: string; question?: string; answer?: string }> }
  const items = d.items ?? []
  const itemsHtml = items.slice(0, 10).map(f =>
    renderFaqItem(
      escapeHtml(f.q ?? f.question ?? ''),
      escapeHtml(f.a ?? f.answer ?? ''),
    )
  ).join('\n      ')

  return fillSlots(faqTemplate, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Perguntas frequentes'),
    SUBTITLE: '',
    IF_SUBTITLE: false,
    ITEMS_HTML: itemsHtml,
  })
}

function renderOffer(section: SectionCopy, ctx: PipelineContext): string {
  const d = section.data as { eyebrow?: string; headline?: string; description?: string; cta?: string; note?: string }
  const design = ctx.design!
  return fillSlots(offerTemplate, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Pronto pra começar?'),
    SUBTITLE: escapeHtml(d.description ?? ''),
    CTA_TEXT: escapeHtml(d.cta ?? ctx.hero?.cta ?? 'Começar agora'),
    NOTE: escapeHtml(d.note ?? ''),
    IF_NOTE: Boolean(d.note),
    PRIMARY_COLOR: design.primary,
    ACCENT_COLOR: design.accent,
  })
}

function renderFooter(ctx: PipelineContext, businessName: string): string {
  const sections = ctx.sections ?? []
  const productLinks: string[] = []
  if (sections.some(s => s.type === 'benefits'))     productLinks.push('<li><a href="#funcionalidades">Funcionalidades</a></li>')
  if (sections.some(s => s.type === 'social_proof')) productLinks.push('<li><a href="#depoimentos">Depoimentos</a></li>')
  if (sections.some(s => s.type === 'pricing'))      productLinks.push('<li><a href="#precos">Preços</a></li>')
  if (sections.some(s => s.type === 'faq'))          productLinks.push('<li><a href="#faq">Perguntas</a></li>')

  return fillSlots(footerTemplate, {
    BUSINESS_NAME: escapeHtml(businessName),
    LOGO_URL: ctx.research?.logo_url ?? '',
    IF_LOGO_URL: Boolean(ctx.research?.logo_url),
    IF_NO_LOGO_URL: !ctx.research?.logo_url,
    TAGLINE: escapeHtml(ctx.strategy?.promise ?? 'A ferramenta certa pra quem quer resultado.'),
    PRODUCT_LINKS_HTML: productLinks.join('\n          '),
    YEAR: String(new Date().getFullYear()),
  })
}

export function renderHtmlV3Html(ctx: PipelineContext, businessName: string): string {
  if (!ctx.hero || !ctx.design) {
    throw new Error('renderHtmlV3Html exige hero + design')
  }

  const parts: string[] = [
    GOOGLE_FONTS,
    sharedStyles(ctx.design.primary, ctx.design.accent),
    renderHero(ctx, businessName),
  ]

  const sections = ctx.sections ?? []
  for (const section of sections) {
    try {
      switch (section.type) {
        case 'benefits':     parts.push(renderBenefits(section, ctx)); break
        case 'social_proof': parts.push(renderSocialProof(section)); break
        case 'pricing':      parts.push(renderPricing(section)); break
        case 'faq':          parts.push(renderFaq(section)); break
        case 'offer':        parts.push(renderOffer(section, ctx)); break
        // comparison + summary: por enquanto puramente ignorados (raros)
      }
    } catch (e) {
      console.warn(`[renderHtmlV3Html] falha em "${section.type}":`, e instanceof Error ? e.message : e)
    }
  }

  parts.push(renderFooter(ctx, businessName))
  parts.push(`<script>${trackingRuntime}</script>`)

  return parts.join('\n')
}
