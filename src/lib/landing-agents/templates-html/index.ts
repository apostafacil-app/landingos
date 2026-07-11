/**
 * Renderer HTML mestre (v3-html) — orquestração de templates + variantes.
 *
 * Estratégia:
 * - Escolhe variante do hero/benefits/offer baseado em `design.mood` (Designer
 *   agent decide). Nichos diferentes → páginas diferentes. Nada de "todas
 *   iguais".
 * - Insere transições SVG (waves/diagonais) entre seções pra quebrar a
 *   sensação de blocos retangulares.
 *
 * Estrutura final:
 * - shared-styles + transition-styles
 * - hero (variante A/B por mood)
 * - transition
 * - benefits (variante A/B por mood)
 * - transition
 * - social_proof
 * - transition
 * - pricing
 * - transition
 * - faq
 * - offer (variante A/B por mood)
 * - footer
 * - tracking-runtime
 */

import type { PipelineContext, SectionCopy, DesignSystem } from '../types'
import { fillSlots, escapeHtml } from './slots'
import { sharedStyles } from './shared-styles'
import { transitionStyles, pickTransition } from './transitions'
import { heroCalTemplate } from './hero-cal'
import { heroFullTemplate } from './hero-full'
import { benefitsGridTemplate, renderBenefitItem } from './benefits-grid'
import { benefitsAlternatingTemplate, renderBenefitAltItem } from './benefits-alternating'
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

/**
 * Hash determinístico simples pra selecionar variante baseado no businessName.
 * Mesmo cliente sempre gera mesmo layout (previsível). Clientes diferentes
 * caem em variantes diferentes (variação real).
 */
function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (((h << 5) - h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Escolhe variante do hero.
 * - mood 'bold' ou 'energetico' → sempre hero-full (imagem full-bleed dramática)
 * - mood 'elegante' ou 'minimalista' → sempre hero-cal (split limpo)
 * - default (clean etc): hash do nome decide 50/50 → variação entre clientes
 */
function pickHeroVariant(design: DesignSystem, businessName: string): 'full' | 'cal' {
  const mood = (design.mood ?? '').toLowerCase()
  if (mood.includes('bold') || mood.includes('energetico') || mood.includes('energético')) return 'full'
  if (mood.includes('elegante') || mood.includes('minimalista')) return 'cal'
  // 50/50 determinístico por nome
  return hashString(businessName) % 2 === 0 ? 'cal' : 'full'
}

/**
 * Escolhe variante de benefits.
 * - mood 'elegante' → alternating (editorial zigzag)
 * - mood 'bold' → grid (grid 3 col dramático)
 * - default: hash pra variar entre grid e alternating
 */
function pickBenefitsVariant(design: DesignSystem, businessName: string): 'alternating' | 'grid' {
  const mood = (design.mood ?? '').toLowerCase()
  if (mood.includes('elegante') || mood.includes('editorial')) return 'alternating'
  if (mood.includes('bold') || mood.includes('energetico') || mood.includes('energético')) return 'grid'
  return hashString(businessName + 'benefits') % 2 === 0 ? 'grid' : 'alternating'
}

/**
 * Estilo de transição SVG entre seções.
 */
function pickTransitionStyle(design: DesignSystem, businessName: string): 'soft' | 'geometric' | 'bold' {
  const mood = (design.mood ?? '').toLowerCase()
  if (mood.includes('bold') || mood.includes('energetico') || mood.includes('energético')) return 'bold'
  if (mood.includes('minimalista') || mood.includes('minimal')) return 'geometric'
  if (mood.includes('elegante')) return 'soft'
  // hash pra variar entre soft/geometric/bold
  const styles: Array<'soft' | 'geometric' | 'bold'> = ['soft', 'geometric', 'bold']
  return styles[hashString(businessName + 'trans') % styles.length]
}

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
  const template = pickHeroVariant(design, businessName) === 'full' ? heroFullTemplate : heroCalTemplate
  return fillSlots(template, {
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

function renderBenefits(section: SectionCopy, ctx: PipelineContext, businessName: string): string {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = d.items ?? []
  const design = ctx.design!
  const variant = pickBenefitsVariant(design, businessName)

  const itemsHtml = items.slice(0, 6).map((item, idx) => {
    const iconRaw = item.icon ?? ''
    const iconColor = variant === 'alternating' ? design.primary : '#ffffff'
    const iconSvgFromEmoji = emojiToSvg(iconRaw, iconColor)
    const iconContent = iconSvgFromEmoji || iconRaw || iconSvg('zap', iconColor)
    return variant === 'alternating'
      ? renderBenefitAltItem(iconContent, escapeHtml(item.title ?? ''), escapeHtml(item.description ?? ''), idx)
      : renderBenefitItem(iconContent, escapeHtml(item.title ?? ''), escapeHtml(item.description ?? ''))
  }).join('\n      ')

  const template = variant === 'alternating' ? benefitsAlternatingTemplate : benefitsGridTemplate
  return fillSlots(template, {
    EYEBROW: escapeHtml(d.eyebrow ?? ''),
    IF_EYEBROW: Boolean(d.eyebrow),
    HEADLINE: escapeHtml(d.headline ?? 'Feito pra quem precisa de resultado'),
    SUBTITLE: '',
    IF_SUBTITLE: false,
    ITEMS_HTML: itemsHtml,
    PRIMARY_COLOR: design.primary,
    ACCENT_COLOR: design.accent,
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
  // Copy Seções emite 'q'/'a' curtos (docstring de copy-secoes.ts:164 confirma).
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

/**
 * Cores de fundo por seção — determina cor da transição SVG.
 * Alterna branco↔soft entre seções pra maximizar transições visíveis
 * (branco→soft→branco→soft = 3 transições em vez de 1).
 */
const SECTION_BG: Record<string, string> = {
  benefits:     '#ffffff',
  social_proof: '#fafafa',
  pricing:      '#ffffff',
  faq:          '#fafafa',
  offer:        '#0a0a0a',
  footer:       '#fafafa',
}

export function renderHtmlV3Html(ctx: PipelineContext, businessName: string): string {
  if (!ctx.hero || !ctx.design) {
    throw new Error('renderHtmlV3Html exige hero + design')
  }

  const design = ctx.design
  const transitionStyle = pickTransitionStyle(design, businessName)

  const parts: string[] = [
    GOOGLE_FONTS,
    sharedStyles(design.primary, design.accent),
    transitionStyles,
    renderHero(ctx, businessName),
  ]

  const sections = ctx.sections ?? []
  let prevBg: string | null = pickHeroVariant(design, businessName) === 'full' ? '#0a0a0a' : '#ffffff'

  for (const section of sections) {
    try {
      const currentBg = SECTION_BG[section.type]
      if (!currentBg) continue

      // Insere transição SVG quando cor muda entre seções
      if (prevBg && prevBg !== currentBg) {
        parts.push(pickTransition(transitionStyle, currentBg))
      }

      switch (section.type) {
        case 'benefits':     parts.push(renderBenefits(section, ctx, businessName)); break
        case 'social_proof': parts.push(renderSocialProof(section)); break
        case 'pricing':      parts.push(renderPricing(section)); break
        case 'faq':          parts.push(renderFaq(section)); break
        case 'offer':        parts.push(renderOffer(section, ctx)); break
      }

      prevBg = currentBg
    } catch (e) {
      console.warn(`[renderHtmlV3Html] falha em "${section.type}":`, e instanceof Error ? e.message : e)
    }
  }

  // Transição antes do footer (offer→footer é dark→soft)
  if (prevBg && prevBg !== SECTION_BG.footer) {
    parts.push(pickTransition(transitionStyle, SECTION_BG.footer))
  }
  parts.push(renderFooter(ctx, businessName))
  parts.push(`<script>${trackingRuntime}</script>`)

  return parts.join('\n')
}
