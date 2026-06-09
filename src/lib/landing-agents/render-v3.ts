/**
 * Renderiza o resultado da pipeline em formato V3 do editor.
 *
 * Substitui o `render.ts` (que gerava HTML com classes `ai-*` incompatíveis
 * com o parser V3, fazendo o editor abrir vazio).
 *
 * Estratégia: monta um `PageModel` V3 do zero, com elementos absolutamente
 * posicionados em um canvas 1200px, e chama `serializePage` do serializer
 * oficial. O HTML resultante tem `data-lp-model="v3"` + `.lp-block` + `.lp-el`,
 * que o `parsePage` do editor reconhece e renderiza como blocos editáveis.
 */

import type { Block, Element, PageModel } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import { serializePage } from '@/components/editor/v3/serializer'
import type { PipelineContext, SectionCopy } from './types'
import {
  blobPattern, dotsPattern, browserMockup, avatarInitial, badge,
  topWave, bottomWave, diagonalSlash,
} from './decorations'
import { getFontStack } from './fonts'
import { emojiToSvg, stripLeadingEmoji, swapLeadingEmoji } from './icons'
// Biblioteca de templates — variantes alternativas escolhidas pelo Designer
import { buildHeroCentered } from './templates/hero/centered'
import { buildHeroAsymmetric } from './templates/hero/asymmetric'
import { buildHeroImageBg } from './templates/hero/image-bg'
import { buildBenefitsZigzag } from './templates/benefits/zigzag'
import { buildBenefitsIconsGrid } from './templates/benefits/icons-grid'
import { buildSocialProofWall } from './templates/social_proof/wall'
import { buildSocialProofStatsStrip } from './templates/social_proof/stats-strip'
import { buildPricingHighlightCenter } from './templates/pricing/highlight-center'
import { buildFaqTwoCol } from './templates/faq/two-col'
import { buildComparisonSideBySide } from './templates/comparison/side-by-side'
import { buildOfferImageBg } from './templates/offer/image-bg'
import { buildFooter } from './templates/footer'
import { buildGuaranteeSeal } from './templates/guarantee/seal'

/** Remove [PLACEHOLDER], placeholders "X" textuais e whitespace duplicado. */
function cleanText(s: string): string {
  return (s ?? '')
    .replace(/\[PLACEHOLDER\]/gi, '')
    // Placeholders numéricos soltos: "X horas", "Mais de X", "N clientes",
    // "###" — substituídos por "muitas/muitos" (qualitativo).
    .replace(/\b(mais de|cerca de|aproximadamente)\s+[XYN]\b/gi, 'centenas de')
    .replace(/\b[XYN]\s+(horas|minutos|clientes|usuários|empresas|negócios|revendas)\b/gi, 'muitas $1')
    .replace(/\b###+\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** True se o trust stat é só placeholder vazio depois do cleanup (não vale mostrar). */
function isStatTooWeak(s: string): boolean {
  const clean = cleanText(s).replace(/^[^\w]+/, '').trim()
  // Sem letras significativas (ex.: só emoji + "X") = lixo
  return clean.length < 10
}

/**
 * Estima a altura necessária pra um texto caber numa largura dada.
 *
 * Heurística: chars por linha ~ width / (fontSize * charWidthRatio).
 * charWidthRatio varia por fonte:
 *  - 0.52: system-ui regular/medium (default conservador)
 *  - 0.60: display/serif heavy (Syne 800, Playfair 700+) — letras mais largas
 *  - 0.45: monoespaçada
 *
 * SAFETY_MULTIPLIER: 1.15 → reserva 15% a mais de altura como margem de erro
 * porque a heurística sempre subestima (palavras longas viram linha sozinha,
 * pontuação, kerning). Sem isso, hero com Syne quebra em 4 linhas quando
 * estimou 2 → subhead sobrepõe.
 */
function estimateTextHeight(text: string, opts: {
  width: number
  fontSize: number
  lineHeight?: number
  minLines?: number
  maxLines?: number
  /** Heavy display font (Syne 800, Playfair 900) usam ratio mais largo */
  isDisplay?: boolean
  isMono?: boolean
}): number {
  const lh = opts.lineHeight ?? 1.5
  const charRatio = opts.isMono ? 0.45 : (opts.isDisplay ? 0.60 : 0.52)
  const charsPerLine = Math.max(6, Math.floor(opts.width / (opts.fontSize * charRatio)))
  const cleanedLen = (text ?? '').replace(/<[^>]+>/g, '').length
  let lines = Math.max(1, Math.ceil(cleanedLen / charsPerLine))
  if (opts.minLines && lines < opts.minLines) lines = opts.minLines
  if (opts.maxLines && lines > opts.maxLines) lines = opts.maxLines
  // Safety multiplier — heurística sempre subestima
  return Math.ceil(lines * opts.fontSize * lh * 1.15) + 4
}

/** Trunca texto preservando palavras inteiras. Adiciona '…' se cortou. */
function truncate(text: string, maxChars: number): string {
  const s = cleanText(text)
  if (s.length <= maxChars) return s
  const cut = s.slice(0, maxChars).replace(/\s+\S*$/, '')
  return `${cut}…`
}

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2   // 80

/**
 * Cria um block separador fininho (wave/diagonal SVG) entre blocks de cores
 * diferentes. Quebra a sensação de "blocos retangulares uniformes".
 * Estilo: 'wave' (curva suave) | 'wave-up' (curva invertida) | 'diagonal' (slash angular)
 */
/**
 * Estima a cor "dominante" de fundo do block — usada pra decidir se vale
 * inserir wave separator antes do próximo (cores muito próximas = sem wave).
 */
function blockBgHint(block: Block | undefined): string | null {
  if (!block) return null
  // bgGradient.stops[0] como dominante (gradient começa por essa cor)
  const grad = (block as Block & { bgGradient?: { stops?: Array<{ color: string }> } }).bgGradient
  if (grad?.stops?.[0]?.color) return grad.stops[0].color
  return block.bgColor ?? null
}

function makeSeparator(fromColor: string, toColor: string, style: 'wave' | 'wave-up' | 'diagonal' = 'wave'): Block {
  const SEP_H = style === 'wave-up' ? 80 : 60
  const svgFn = style === 'wave'     ? topWave
              : style === 'wave-up'  ? bottomWave
              :                        diagonalSlash
  return {
    id: genId('blk'),
    height: SEP_H,
    bgColor: fromColor,          // fundo do separator = cor da seção ANTERIOR
    bgImage: svgFn(toColor),     // wave pintada com cor da PRÓXIMA seção
    bgSize: 'cover',
    elements: [],
  }
}

/**
 * Cria um elemento "âncora" invisível com `id="..."` pra que links
 * #funcionalidades / #precos / #faq do nav superior funcionem.
 *
 * Top -80px compensa a altura do nav (72px + 8 de folga) — sem isso
 * o link rola até o topo do bloco mas o nav cobre o título.
 *
 * É renderizado como elemento "texto" com HTML inline contendo
 * o `<div id="...">`. Sanitize preserva `id` em divs internas.
 */
function makeAnchor(anchorName: string): Element {
  return {
    id: genId('el'),
    type: 'texto',
    x: 0, y: -80, w: 1, h: 1,
    html: `<div id="${anchorName}" style="position:absolute;top:0"></div>`,
    fontSize: 1,
    color: 'transparent',
    zIndex: -1,
  } as Element
}

/** Helper: cria elemento texto/título centralizado horizontalmente */
function makeText(opts: {
  y: number
  w?: number
  h?: number
  html: string
  type?: 'texto' | 'titulo'
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  fontSize?: number
  fontWeight?: number
  color?: string
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
}): Element {
  const w = opts.w ?? CONTENT_W
  const x = Math.round((PAGE_W - w) / 2)
  return {
    id: genId('el'),
    type: opts.type ?? 'texto',
    x, y: opts.y, w, h: opts.h ?? 60,
    html: opts.html,
    headingLevel: opts.headingLevel,
    fontSize: opts.fontSize,
    fontWeight: opts.fontWeight,
    color: opts.color,
    textAlign: opts.align ?? 'center',
    lineHeight: opts.lineHeight,
  } as Element
}

function makeButton(opts: { y: number; text: string; link?: string; bgColor: string; color?: string; w?: number }): Element {
  const w = opts.w ?? 260
  const x = Math.round((PAGE_W - w) / 2)
  return {
    id: genId('el'),
    type: 'botao',
    x, y: opts.y, w, h: 56,
    text: opts.text,
    link: opts.link ?? '#cta',
    bgColor: opts.bgColor,
    color: opts.color ?? '#ffffff',
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 10,
    padding: [16, 32],
  } as Element
}

function makeBox(opts: { x: number; y: number; w: number; h: number; bgColor?: string; borderColor?: string; borderRadius?: number }): Element {
  return {
    id: genId('el'),
    type: 'caixa',
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    bgColor: opts.bgColor,
    borderColor: opts.borderColor,
    borderWidth: opts.borderColor ? 1 : 0,
    borderRadius: opts.borderRadius ?? 14,
  } as Element
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO NAV — barra superior com logo + links âncora + CTA secundário
 *
 * Fica em cima do hero. Visualmente "integra" com o gradient do hero
 * (mesmo bg semitransparente) ou tem fundo branco quando o hero é light.
 * ────────────────────────────────────────────────────────────────────────── */
function buildNav(ctx: PipelineContext, businessName: string): Block {
  const design = ctx.design!
  const research = ctx.research
  const sections = ctx.sections ?? []

  const NAV_H = 72
  const elements: Element[] = []

  // ── Logo ou nome da marca à esquerda
  if (research?.logo_url) {
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: 80, y: 18, w: 140, h: 36,
      src: research.logo_url,
      alt: businessName,
      objectFit: 'contain',
    } as Element)
  } else {
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: 80, y: 24, w: 240, h: 28,
      html: businessName,
      fontSize: 20,
      fontWeight: 800,
      color: '#ffffff',
      textAlign: 'left',
    } as Element)
  }

  // ── Links âncora no centro/direita
  // Detecta quais seções existem pra montar âncoras relevantes
  const hasBenefits  = sections.some(s => s.type === 'benefits')
  const hasPricing   = sections.some(s => s.type === 'pricing')
  const hasFaq       = sections.some(s => s.type === 'faq')
  const hasSocialPrf = sections.some(s => s.type === 'social_proof')

  const links: Array<{ label: string; href: string }> = []
  if (hasBenefits)  links.push({ label: 'Funcionalidades', href: '#funcionalidades' })
  if (hasSocialPrf) links.push({ label: 'Depoimentos',     href: '#depoimentos' })
  if (hasPricing)   links.push({ label: 'Preços',          href: '#precos' })
  if (hasFaq)       links.push({ label: 'Perguntas',       href: '#faq' })

  // Centro: começa após logo, termina antes do CTA secundário
  const navLinksX = 360
  const navLinksW = 480
  const linkW = navLinksW / Math.max(links.length, 1)

  links.forEach((link, i) => {
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: navLinksX + i * linkW, y: 26,
      w: linkW, h: 24,
      html: `<a href="${link.href}" style="color:inherit;text-decoration:none">${link.label}</a>`,
      fontSize: 14,
      fontWeight: 500,
      color: 'rgba(255,255,255,0.88)',
      textAlign: 'center',
    } as Element)
  })

  // ── CTA "Entrar" ghost à direita
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: PAGE_W - 224, y: 18, w: 144, h: 36,
    text: 'Começar agora',
    link: '#cta',
    bgColor: 'rgba(255,255,255,0.16)',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 8,
    padding: [8, 16],
    borders: {
      width: 1,
      color: 'rgba(255,255,255,0.32)',
    },
  } as Element)

  // Quando o hero usa imagem AI como bg (variants image-bg/centered), o nav
  // CONTINUA a mesma imagem com overlay escuro — visualmente "imagem flui do
  // nav pro hero" sem corte. Antes o gradient sólido criava retângulo opaco
  // bloqueando a parte de cima da foto, parecia "quadro por cima".
  const heroVariant = design.layout_variants?.hero ?? 'split'
  const heroUsesImage = (heroVariant === 'image-bg' || heroVariant === 'centered')
                       && Boolean(ctx.visual?.hero_data_url)

  if (heroUsesImage) {
    // Quando hero tem imagem AI, nav usa COR ESCURA SÓLIDA semi-transparente
    // (não repete a imagem) pra não parecer "imagem duplicada no cabeçalho".
    // Visualmente: navbar tipo Apple — fundo escuro neutro, contraste forte
    // pro logo + links serem legíveis sem competir com a imagem do hero abaixo.
    return {
      id: genId('blk'),
      height: NAV_H,
      bgColor: '#0a0f1e',
      elements,
    }
  }

  return {
    id: genId('blk'),
    height: NAV_H,
    // Gradient do hero — pra hero split/asymmetric (sem imagem como bg)
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO HERO — layout split: copy à esquerda, visual à direita
 *
 * Decoração de fundo: blob pattern radial (sempre presente).
 * À direita: imagem AI se disponível, senão mockup browser estilizado.
 * ────────────────────────────────────────────────────────────────────────── */
function buildHero(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('Hero exige hero + design')

  const fonts = getFontStack(design.typography)
  const elements: Element[] = []
  const HERO_H = 720  // mínimo — pode crescer dinamicamente se copy for longa
  // Blob pattern de fundo é INSERIDO NO FINAL com altura dinâmica (ver abaixo).

  // 2. Layout split: 50/50 com gap interno
  const COPY_X = 80
  const COPY_W = 540
  const VISUAL_X = 660
  const VISUAL_W = 480

  // ───── Coluna esquerda: copy
  // Eyebrow badge "Sparkle + frase curta" (estilo Manus).
  // Pega 1º trust_stat se for sólido, senão usa "Feito sob medida" como fallback.
  const candidate = hero.trust_stats?.[0] ?? ''
  const eyebrowText = isStatTooWeak(candidate)
    ? 'Feito sob medida pro seu segmento'
    : cleanText(candidate).replace(/^[^\w]+/, '').slice(0, 42).trim() || 'Feito sob medida'
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: COPY_X, y: 80, w: Math.min(eyebrowText.length * 7 + 60, 360), h: 32,
    bgColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1,
  } as Element)
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: COPY_X + 14, y: 87, w: Math.min(eyebrowText.length * 7 + 32, 332), h: 18,
    html: `✨ ${eyebrowText}`,
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'left',
    zIndex: 2,
  } as Element)

  // Headline — calcula altura dinâmica baseada no conteúdo da IA.
  // Truncate defensivo a 60 chars caso ignore o limite do prompt.
  const headlineText = truncate(hero.headline, 50)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const isMono    = design.typography === 'monoespacada'
  // Fonte display em peso alto fica MUITO larga — reduzir tamanho compensa
  const HEADLINE_FONT = isDisplay ? 48 : 56
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W,
    fontSize: HEADLINE_FONT,
    lineHeight: 1.08,
    minLines: 2,
    maxLines: 5,
    isDisplay,
    isMono,
  })
  const HEADLINE_Y = 128
  elements.push({
    id: genId('el'),
    type: 'titulo',
    headingLevel: 1,
    x: COPY_X, y: HEADLINE_Y, w: COPY_W, h: HEADLINE_H,
    html: headlineText,
    fontSize: HEADLINE_FONT,
    fontWeight: 800,
    fontFamily: fonts.heading,
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.08,
    letterSpacing: -1.2,
    zIndex: 1,
  } as Element)

  // Subheadline — começa após headline + gap maior (48px) pra dar respiro
  const SUBHEAD_FONT = 17
  const subheadText = truncate(hero.subheadline, 160)
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: COPY_W - 40,
    fontSize: SUBHEAD_FONT,
    lineHeight: 1.6,
    minLines: 2,
    maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 48
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: COPY_X, y: SUBHEAD_Y, w: COPY_W - 40, h: SUBHEAD_H,
    html: subheadText,
    fontSize: SUBHEAD_FONT,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'left',
    lineHeight: 1.6,
    zIndex: 1,
  } as Element)

  // CTAs primary + ghost — depois da subhead + gap 36px
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 36
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: COPY_X, y: ctaY, w: 240, h: 54,
    text: hero.cta,
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 800,
    borderRadius: 10,
    padding: [14, 24],
    shadow: 'lg',
    zIndex: 2,
  } as Element)
  if (hero.cta_secondary) {
    elements.push({
      id: genId('el'),
      type: 'botao',
      x: COPY_X + 254, y: ctaY, w: 200, h: 54,
      text: hero.cta_secondary,
      link: '#funcionalidades',
      bgColor: 'rgba(255,255,255,0.10)',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 10,
      padding: [14, 20],
      borders: {
        width: 1,
        color: 'rgba(255,255,255,0.40)',
      },
      zIndex: 2,
    } as Element)
  }

  // Trust stats em linha abaixo do CTA (compactos)
  // Filtra placeholders óbvios + trunca + swap emoji → SVG inline
  let trustEndY = ctaY + 54
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(0, 3)
    let py = ctaY + 84
    stats.forEach((s) => {
      const truncated = truncate(s, 60)
      // Emoji do início vira SVG inline (profissional, não infantil)
      const cleaned = swapLeadingEmoji(truncated, '#ffffff', 16)
      const sh = estimateTextHeight(truncated, {
        width: COPY_W,
        fontSize: 13,
        lineHeight: 1.4,
        minLines: 1,
        maxLines: 2,
      })
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: COPY_X, y: py, w: COPY_W, h: sh,
        html: cleaned,
        fontSize: 13,
        fontFamily: fonts.body,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'left',
        zIndex: 1,
      } as Element)
      py += sh + 4
    })
    trustEndY = py
  }

  // Altura total do hero — calculada dinamicamente pra acomodar copy variável.
  // Mínimo HERO_H, mas cresce se copy for mais longa.
  const dynamicHeroH = Math.max(HERO_H, trustEndY + 80)

  // ───── Coluna direita: imagem AI ou mockup dashboard rico
  // Posiciona centralizado verticalmente em relação ao copy
  const VISUAL_H = 400
  const visualY = Math.max(132, Math.round((dynamicHeroH - VISUAL_H) / 2))
  if (visual?.hero_data_url) {
    // Sem caixa-moldura translúcida atrás — gerava "retângulo cinza visível"
    // quando a imagem AI carregava. Sombra dramática do shadow:'xl' já dá o
    // destaque visual sozinha.
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      src: visual.hero_data_url,
      alt: 'Hero',
      objectFit: 'cover',
      borderRadius: 16,
      shadow: 'xl',
      zIndex: 2,
    } as Element)
  } else {
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      bgImage: browserMockup(design.primary, design.accent),
      shadow: 'xl',
      borderRadius: 14,
      zIndex: 2,
    } as Element)
  }

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    // Blob pattern como block.bgImage — serializer renderiza <img.lp-bg-img>
    // em 100% da largura. Sem isto, blob cobre só 1200px centrais e gradient
    // cobre tudo → faixa lateral diferente em telas largas.
    bgImage: blobPattern(design.accent, design.gradient_end),
    bgSize: 'cover',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO BENEFITS — cards com ícone em círculo + border-top accent
 * ────────────────────────────────────────────────────────────────────────── */
function buildBenefits(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = (d.items ?? []).slice(0, 6)
  const elements: Element[] = []
  const design = ctx.design!

  let y = 88
  if (d.eyebrow) {
    elements.push(makeText({
      y, h: 28, html: d.eyebrow,
      fontSize: 12, fontWeight: 800,
      color: design.accent,
    }))
    y += 38
  }
  if (d.headline) {
    elements.push(makeText({
      y, w: 760, h: 70, html: d.headline,
      type: 'titulo', headingLevel: 2,
      fontSize: 38, fontWeight: 800,
      color: design.primary,
      lineHeight: 1.15,
    }))
    y += 100
  }

  const cols = items.length <= 2 ? items.length : 3
  const gap = 28

  // Calcular altura UNIFORME dos cards: max altura entre todos os items.
  // Isso garante grid simétrico mesmo com descrições de comprimentos diferentes.
  const cardW = (CONTENT_W - gap * (cols - 1)) / cols
  const innerW = Math.round(cardW) - 56
  const TITLE_GAP = 16
  const DESC_GAP = 12
  const CARD_PAD_BOTTOM = 28
  const TITLE_Y_OFFSET = 108  // ícone (56) + gap (52) = espaço pro ícone

  const cardHeights = items.map(item => {
    const titleH = estimateTextHeight(cleanText(item.title ?? ''), {
      width: innerW, fontSize: 18, lineHeight: 1.3, minLines: 1, maxLines: 3,
    })
    const descH = estimateTextHeight(cleanText(item.description ?? ''), {
      width: innerW, fontSize: 14, lineHeight: 1.7, minLines: 2, maxLines: 5,
    })
    return TITLE_Y_OFFSET + titleH + DESC_GAP + descH + CARD_PAD_BOTTOM
  })
  const cardH = Math.max(256, ...cardHeights)

  items.forEach((item, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cardW + gap))
    const cy = y + row * (cardH + gap)

    // Caixa principal
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx, y: cy, w: Math.round(cardW), h: cardH,
      bgColor: '#ffffff',
      borderColor: '#eef2f7',
      borderWidth: 1,
      borderRadius: 16,
      shadow: 'md',
    } as Element)
    // Faixa accent no topo
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx, y: cy, w: Math.round(cardW), h: 4,
      bgColor: design.accent,
      borderRadius: 16,
    } as Element)

    // Círculo do ícone com SVG profissional (Lucide-style) — substitui emoji
    // que parecia "infantil". Fallback pra emoji se não houver mapeamento.
    const iconBg = `${design.primary}1A`
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx + 28, y: cy + 36, w: 56, h: 56,
      bgColor: iconBg,
      borderRadius: 14,
    } as Element)
    if (item.icon) {
      const svgHtml = emojiToSvg(item.icon, design.primary)
      if (svgHtml) {
        // SVG inline 28x28 centralizado dentro do círculo 56x56
        elements.push({
          id: genId('el'),
          type: 'texto',
          x: cx + 28 + 14, y: cy + 36 + 14, w: 28, h: 28,
          html: svgHtml,
          fontSize: 14,
          textAlign: 'center',
        } as Element)
      } else {
        // Emoji fallback (acontece raramente quando IA usa emoji não mapeado)
        elements.push({
          id: genId('el'),
          type: 'texto',
          x: cx + 28, y: cy + 48, w: 56, h: 32,
          html: item.icon,
          fontSize: 28, textAlign: 'center',
        } as Element)
      }
    }
    // Título — altura dinâmica
    const titleText = truncate(item.title ?? '', 40)
    const titleH = estimateTextHeight(titleText, {
      width: innerW, fontSize: 18, lineHeight: 1.3, minLines: 1, maxLines: 3,
    })
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 28, y: cy + TITLE_Y_OFFSET, w: innerW, h: titleH,
      html: titleText,
      fontSize: 18, fontWeight: 700,
      color: design.primary,
      textAlign: 'left',
      lineHeight: 1.3,
    } as Element)
    // Descrição — começa abaixo do título + gap
    const descText = truncate(item.description ?? '', 110)
    const descH = estimateTextHeight(descText, {
      width: innerW, fontSize: 14, lineHeight: 1.7, minLines: 2, maxLines: 5,
    })
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 28, y: cy + TITLE_Y_OFFSET + titleH + DESC_GAP, w: innerW, h: descH,
      html: descText,
      fontSize: 14, color: '#64748b', lineHeight: 1.7,
      textAlign: 'left',
    } as Element)
  })

  const rows = Math.ceil(items.length / cols)
  const totalH = y + rows * (cardH + gap) + 88

  return {
    id: genId('blk'),
    height: totalH,
    bgColor: '#fafbfc',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO SUMMARY — lista vertical com checkmarks
 * ────────────────────────────────────────────────────────────────────────── */
function buildSummary(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<string | { title?: string; description?: string }> }
  const items = (d.items ?? []).slice(0, 8)
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) {
    elements.push(makeText({
      y, h: 28, html: d.eyebrow,
      fontSize: 12, fontWeight: 800,
      color: 'rgba(255,255,255,0.75)',
    }))
    y += 36
  }
  if (d.headline) {
    elements.push(makeText({
      y, w: 800, h: 70, html: d.headline,
      type: 'titulo', headingLevel: 2,
      fontSize: 36, fontWeight: 800,
      color: '#ffffff', lineHeight: 1.15,
    }))
    y += 100
  }

  const colW = 480
  const gap = 16
  const cols = 2
  const startX = (PAGE_W - (colW * cols + gap)) / 2

  items.forEach((item, idx) => {
    const text = typeof item === 'string' ? item : (item.title ?? item.description ?? '')
    const col = idx % cols
    const row = Math.floor(idx / cols)
    const cx = Math.round(startX + col * (colW + gap))
    const cy = y + row * 48

    elements.push({
      id: genId('el'),
      type: 'icone',
      x: cx, y: cy + 8, w: 24, h: 24,
      iconId: 'check',
      bgColor: ctx.design!.accent,
      color: '#ffffff',
      borderRadius: 12,
    } as Element)

    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 36, y: cy + 4, w: colW - 36, h: 40,
      html: text,
      fontSize: 15, color: 'rgba(255,255,255,0.92)',
      textAlign: 'left',
    } as Element)
  })

  const totalH = y + Math.ceil(items.length / cols) * 48 + 80
  return {
    id: genId('blk'),
    height: totalH,
    bgColor: ctx.design!.primary,
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO COMPARISON — tabela visual com caixas (sem <table>)
 * ────────────────────────────────────────────────────────────────────────── */
function buildComparison(section: SectionCopy, ctx: PipelineContext, businessName: string): Block {
  const d = section.data as { eyebrow?: string; headline?: string; rows?: Array<{ feature: string; us: string; them: string }> }
  const rows = (d.rows ?? []).slice(0, 6)
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) {
    elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: ctx.design!.accent }))
    y += 36
  }
  if (d.headline) {
    elements.push(makeText({ y, w: 800, h: 70, html: d.headline, type: 'titulo', headingLevel: 2, fontSize: 36, fontWeight: 800, color: ctx.design!.primary, lineHeight: 1.15 }))
    y += 100
  }

  // 3 colunas: feature / us / them
  const col1W = 360, col2W = 320, col3W = 320, gap = 12
  const totalW = col1W + col2W + col3W + gap * 2
  const startX = (PAGE_W - totalW) / 2
  const rowH = 56

  // Cabeçalho
  elements.push(makeBox({ x: Math.round(startX), y, w: col1W, h: rowH, bgColor: ctx.design!.primary, borderRadius: 8 }))
  elements.push(makeBox({ x: Math.round(startX + col1W + gap), y, w: col2W, h: rowH, bgColor: ctx.design!.primary, borderRadius: 8 }))
  elements.push(makeBox({ x: Math.round(startX + col1W + col2W + gap * 2), y, w: col3W, h: rowH, bgColor: ctx.design!.primary, borderRadius: 8 }))
  elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX) + 20, y: y + 18, w: col1W - 40, h: 24, html: 'Recurso', fontSize: 13, fontWeight: 700, color: '#ffffff', textAlign: 'left' } as Element)
  elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX + col1W + gap) + 20, y: y + 18, w: col2W - 40, h: 24, html: `Com ${businessName}`, fontSize: 13, fontWeight: 700, color: '#ffffff', textAlign: 'left' } as Element)
  elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX + col1W + col2W + gap * 2) + 20, y: y + 18, w: col3W - 40, h: 24, html: 'Alternativa', fontSize: 13, fontWeight: 700, color: '#ffffff', textAlign: 'left' } as Element)
  y += rowH + 8

  rows.forEach(r => {
    elements.push(makeBox({ x: Math.round(startX), y, w: col1W, h: rowH, bgColor: '#ffffff', borderColor: '#e8edf5', borderRadius: 8 }))
    elements.push(makeBox({ x: Math.round(startX + col1W + gap), y, w: col2W, h: rowH, bgColor: '#ffffff', borderColor: '#e8edf5', borderRadius: 8 }))
    elements.push(makeBox({ x: Math.round(startX + col1W + col2W + gap * 2), y, w: col3W, h: rowH, bgColor: '#ffffff', borderColor: '#e8edf5', borderRadius: 8 }))
    elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX) + 20, y: y + 18, w: col1W - 40, h: 24, html: r.feature, fontSize: 14, color: '#1e293b', textAlign: 'left' } as Element)
    elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX + col1W + gap) + 20, y: y + 18, w: col2W - 40, h: 24, html: r.us, fontSize: 14, fontWeight: 700, color: '#22c55e', textAlign: 'left' } as Element)
    elements.push({ id: genId('el'), type: 'texto', x: Math.round(startX + col1W + col2W + gap * 2) + 20, y: y + 18, w: col3W - 40, h: 24, html: r.them, fontSize: 14, color: '#ef4444', textAlign: 'left' } as Element)
    y += rowH + 4
  })

  return {
    id: genId('blk'),
    height: y + 80,
    bgColor: '#f8fafc',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO SOCIAL PROOF — cards com avatar circular + dots pattern de fundo
 * ────────────────────────────────────────────────────────────────────────── */
function buildSocialProof(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ text: string; author: string; role?: string; rating?: number }> }
  const items = (d.items ?? []).slice(0, 6)
  const elements: Element[] = []
  const design = ctx.design!

  let y = 88
  if (d.eyebrow) {
    elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.8)' }))
    y += 38
  }
  if (d.headline) {
    elements.push(makeText({ y, w: 800, h: 70, html: d.headline, type: 'titulo', headingLevel: 2, fontSize: 38, fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }))
    y += 100
  }

  const cols = items.length <= 2 ? items.length : 3
  const gap = 28
  const cardW = (CONTENT_W - gap * (cols - 1)) / cols
  const innerW = Math.round(cardW) - 48
  const TEXT_Y = 108
  const AUTHOR_GAP = 24
  const AUTHOR_BLOCK_H = 64  // avatar 44 + linha extra
  const CARD_PAD_BOTTOM = 24

  // Altura uniforme baseada no maior depoimento
  const cardHeights = items.map(t => {
    const text = truncate(t.text || '', 220)
    const textH = estimateTextHeight(`"${text}"`, {
      width: innerW, fontSize: 14, lineHeight: 1.7, minLines: 3, maxLines: 8,
    })
    return TEXT_Y + textH + AUTHOR_GAP + AUTHOR_BLOCK_H + CARD_PAD_BOTTOM
  })
  const cardH = Math.max(280, ...cardHeights)

  items.forEach((t, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cardW + gap))
    const cy = y + row * (cardH + gap)
    const author = truncate(t.author || 'Cliente', 30)
    const role = truncate(t.role || '', 44)
    const text = truncate(t.text || '', 220)

    // Card branco com sombra
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx, y: cy, w: Math.round(cardW), h: cardH,
      bgColor: '#ffffff',
      borderRadius: 18,
      shadow: 'lg',
    } as Element)

    // Aspas decorativas
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 8, w: 48, h: 56,
      html: '"',
      fontSize: 84,
      fontWeight: 900,
      color: `${design.gradient_end}33`,
      lineHeight: 1,
      textAlign: 'left',
      fontFamily: 'Georgia, serif',
    } as Element)

    // Stars
    const rating = t.rating ?? 5
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 76, w: innerW, h: 22,
      html: '★'.repeat(rating),
      fontSize: 15, color: '#f59e0b', textAlign: 'left',
      letterSpacing: 2,
    } as Element)

    // Texto depoimento — altura dinâmica
    const textH = estimateTextHeight(`"${text}"`, {
      width: innerW, fontSize: 14, lineHeight: 1.7, minLines: 3, maxLines: 8,
    })
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + TEXT_Y, w: innerW, h: textH,
      html: `"${text}"`,
      fontSize: 14, color: '#475569', lineHeight: 1.7,
      textAlign: 'left',
    } as Element)

    // Bloco autor — Y calculado a partir do final do texto + gap
    const authorY = cy + TEXT_Y + textH + AUTHOR_GAP
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx + 24, y: authorY, w: 44, h: 44,
      bgImage: avatarInitial(author, design.primary),
      borderRadius: 22,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 80, y: authorY + 4, w: Math.round(cardW) - 104, h: 20,
      html: `<strong>${author}</strong>`,
      fontSize: 14,
      fontWeight: 700,
      color: design.primary,
      textAlign: 'left',
    } as Element)
    if (role) {
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + 80, y: authorY + 24, w: Math.round(cardW) - 104, h: 18,
        html: role,
        fontSize: 12, color: '#94a3b8', textAlign: 'left',
      } as Element)
    }
  })

  const rows = Math.ceil(items.length / cols)
  return {
    id: genId('blk'),
    height: y + rows * (cardH + gap) + 88,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    // Dots pattern como bg do block (full-width, casa com o gradient)
    bgImage: dotsPattern('#ffffff'),
    bgSize: 'auto',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO PRICING — cards com badge "Mais popular" + faixa accent
 * ────────────────────────────────────────────────────────────────────────── */
function buildPricing(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; plans?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }> }
  let plans = (d.plans ?? []).slice(0, 4)
  const design = ctx.design!

  // Se mais de 1 plano e nenhum highlighted, marca o do meio (ou o 2º se há 2)
  if (plans.length > 1 && !plans.some(p => p.highlighted)) {
    const idx = plans.length === 2 ? 1 : Math.floor(plans.length / 2)
    plans = plans.map((p, i) => i === idx ? { ...p, highlighted: true } : p)
  }

  const elements: Element[] = []

  let y = 88
  if (d.eyebrow) { elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: design.accent })); y += 38 }
  if (d.headline) { elements.push(makeText({ y, w: 800, h: 70, html: d.headline, type: 'titulo', headingLevel: 2, fontSize: 38, fontWeight: 800, color: design.primary, lineHeight: 1.15 })); y += 100 }

  const cols = plans.length
  const gap = 24
  const cardW = Math.min(340, (CONTENT_W - gap * (cols - 1)) / cols)
  const totalW = cardW * cols + gap * (cols - 1)
  const startX = (PAGE_W - totalW) / 2
  const cardH = 540

  plans.forEach((p, idx) => {
    const cx = Math.round(startX + idx * (cardW + gap))
    const highlighted = p.highlighted

    // Badge "Mais popular" — flutua acima do card destacado
    if (highlighted) {
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx + Math.round(cardW / 2) - 80, y: y - 18,
        w: 160, h: 36,
        bgColor: design.accent,
        borderRadius: 18,
        shadow: 'md',
        zIndex: 3,
      } as Element)
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + Math.round(cardW / 2) - 80, y: y - 11,
        w: 160, h: 22,
        html: '⭐ MAIS POPULAR',
        fontSize: 11,
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 2,
        zIndex: 4,
      } as Element)
    }

    // Card principal
    if (highlighted) {
      // Caixa com gradient primary
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx, y, w: Math.round(cardW), h: cardH,
        bgColor: design.primary,
        borderRadius: 22,
        shadow: 'xl',
        zIndex: 1,
      } as Element)
      // Overlay accent semitransparente (dá profundidade)
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx, y, w: Math.round(cardW), h: 5,
        bgColor: design.accent,
        borderRadius: 22,
        zIndex: 2,
      } as Element)
    } else {
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx, y, w: Math.round(cardW), h: cardH,
        bgColor: '#ffffff',
        borderColor: '#e8edf5',
        borderWidth: 1,
        borderRadius: 22,
        shadow: 'sm',
        zIndex: 1,
      } as Element)
    }

    const textColor = highlighted ? '#ffffff' : design.primary
    const subColor  = highlighted ? 'rgba(255,255,255,0.92)' : '#475569'
    const accentColor = highlighted ? '#ffffff' : design.accent

    // Nome do plano
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: y + 36, w: Math.round(cardW) - 48, h: 24,
      html: (p.name ?? '').toUpperCase(),
      fontSize: 12, fontWeight: 800, letterSpacing: 2,
      color: highlighted ? 'rgba(255,255,255,0.75)' : '#94a3b8',
      textAlign: 'center',
      zIndex: 2,
    } as Element)
    // Preço
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: y + 76, w: Math.round(cardW) - 48, h: 64,
      html: p.price ?? '',
      fontSize: 42, fontWeight: 900,
      color: textColor, textAlign: 'center', lineHeight: 1,
      zIndex: 2,
    } as Element)

    // Linha separadora
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx + 36, y: y + 160, w: Math.round(cardW) - 72, h: 1,
      bgColor: highlighted ? 'rgba(255,255,255,0.2)' : '#eef2f7',
      zIndex: 2,
    } as Element)

    // Features
    let fy = y + 184
    for (const f of (p.features ?? []).slice(0, 7)) {
      // Check em círculo
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx + 24, y: fy + 2, w: 20, h: 20,
        bgColor: highlighted ? 'rgba(255,255,255,0.18)' : `${design.accent}1F`,
        borderRadius: 10,
        zIndex: 2,
      } as Element)
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + 24, y: fy + 4, w: 20, h: 16,
        html: '✓',
        fontSize: 11, fontWeight: 900,
        color: accentColor,
        textAlign: 'center',
        zIndex: 3,
      } as Element)
      // Texto da feature
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + 52, y: fy, w: Math.round(cardW) - 76, h: 24,
        html: cleanText(f),
        fontSize: 13, color: subColor,
        textAlign: 'left',
        lineHeight: 1.5,
        zIndex: 2,
      } as Element)
      fy += 38
    }
  })

  return {
    id: genId('blk'),
    height: y + cardH + 88,
    bgColor: '#fafbfc',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO FAQ — usa o FaqElement nativo do V3 (já com accordion)
 * ────────────────────────────────────────────────────────────────────────── */
function buildFaq(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ q: string; a: string }> }
  const items = (d.items ?? [])
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) { elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: ctx.design!.accent })); y += 36 }
  elements.push(makeText({
    y, w: 800, h: 60,
    html: d.headline || 'Perguntas frequentes',
    type: 'titulo', headingLevel: 2,
    fontSize: 36, fontWeight: 800,
    color: ctx.design!.primary,
  }))
  y += 90

  // FaqElement nativo — accordion built-in do V3
  const faqW = 800
  const faqX = (PAGE_W - faqW) / 2
  const faqH = items.length * 80 + 24

  elements.push({
    id: genId('el'),
    type: 'faq',
    x: Math.round(faqX), y, w: faqW, h: faqH,
    items: items.map(it => ({
      id: genId('faq'),
      q: it.q,
      a: it.a,
    })),
    qColor: ctx.design!.primary,
    qFontSize: 16,
    qFontWeight: 700,
    qHeadingLevel: 3,
    aColor: '#475569',
    aFontSize: 14,
    aLineHeight: 1.7,
    iconColor: ctx.design!.accent,
    iconStyle: 'plus',
    itemBgColor: '#ffffff',
    itemBorderColor: '#e8edf5',
    itemBorderRadius: 12,
    itemSpacing: 8,
    itemPaddingX: 24,
    itemPaddingY: 18,
    allowMultipleOpen: false,
  } as Element)

  return {
    id: genId('blk'),
    height: y + faqH + 80,
    bgColor: '#f8fafc',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO OFFER — CTA final com blob pattern + selo de garantia
 * ────────────────────────────────────────────────────────────────────────── */
function buildOffer(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { headline?: string; description?: string; cta?: string }
  const design = ctx.design!
  const elements: Element[] = []
  const OFFER_H = 480

  // Blob pattern de fundo agora vai como block.bgImage (full-width).

  // Selo de garantia à esquerda — SÓ aparece se NÃO houver bloco de garantia
  // dedicado (que já tem selo próprio). Evita duplicação visual.
  const hasGuaranteeBlock = Boolean(ctx.input.guarantee?.trim())
  if (!hasGuaranteeBlock) {
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: 80, y: 168, w: 140, h: 140,
      bgImage: badge('7 DIAS GRÁTIS', design.accent),
      rotation: -8,
      zIndex: 2,
    } as Element)
  }

  // Headline — se não tem selo, centralizar mais a copy
  const headlineX = hasGuaranteeBlock ? 160 : 280
  const headlineW = hasGuaranteeBlock ? 880 : 840
  elements.push({
    id: genId('el'),
    type: 'titulo',
    headingLevel: 2,
    x: headlineX, y: 120, w: headlineW, h: 100,
    html: cleanText(d.headline ?? 'Pronto para começar?'),
    fontSize: 44, fontWeight: 900,
    color: '#ffffff', lineHeight: 1.15,
    textAlign: hasGuaranteeBlock ? 'center' : 'left',
    zIndex: 1,
  } as Element)

  // Descrição
  const descX = hasGuaranteeBlock ? 160 : 280
  const descW = hasGuaranteeBlock ? 880 : 720
  if (d.description) {
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: descX, y: 240, w: descW, h: 80,
      html: cleanText(d.description),
      fontSize: 17, color: 'rgba(255,255,255,0.92)',
      lineHeight: 1.65,
      textAlign: hasGuaranteeBlock ? 'center' : 'left',
      zIndex: 1,
    } as Element)
  }

  // CTA — centralizado se não tem selo, alinhado à esquerda se tem
  const ctaX = hasGuaranteeBlock ? Math.round((PAGE_W - 320) / 2) : 280
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: ctaX, y: 348, w: 320, h: 60,
    text: d.cta ?? 'Quero começar',
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 16, fontWeight: 800,
    borderRadius: 12,
    padding: [16, 32],
    shadow: 'xl',
    zIndex: 2,
  } as Element)

  return {
    id: genId('blk'),
    height: OFFER_H,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    bgImage: blobPattern(design.accent, '#ffffff'),
    bgSize: 'cover',
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * MAIN — monta PageModel V3 e serializa em HTML
 * ────────────────────────────────────────────────────────────────────────── */
export function renderHtmlV3(ctx: PipelineContext, businessName: string): string {
  if (!ctx.design || !ctx.hero || !ctx.sections) {
    throw new Error('renderHtmlV3 exige design + hero + sections')
  }

  const fonts = getFontStack(ctx.design.typography)
  const blocks: Block[] = []

  // Nav superior (transparente, posicionada visualmente em cima do hero
  // pelo navegador via fluxo de bloco). Como nosso modelo V3 empilha blocks
  // verticalmente, o nav fica COMO bloco autônomo no topo — visualmente
  // separado do hero. Ainda melhor que sem nav.
  blocks.push(buildNav(ctx, businessName))

  const lv = ctx.design.layout_variants ?? {}

  // ── HERO ──
  switch (lv.hero) {
    case 'centered':   blocks.push(buildHeroCentered(ctx)); break
    case 'asymmetric': blocks.push(buildHeroAsymmetric(ctx)); break
    case 'image-bg':   blocks.push(buildHeroImageBg(ctx)); break
    default:           blocks.push(buildHero(ctx))
  }

  // Mapeia tipo de seção -> anchor id pra navegação âncora funcionar
  const anchorByType: Record<string, string> = {
    benefits:     'funcionalidades',
    social_proof: 'depoimentos',
    pricing:      'precos',
    faq:          'faq',
  }

  for (const section of ctx.sections) {
    try {
      let block: Block | null = null
      switch (section.type) {
        case 'benefits':
          block = lv.benefits === 'zigzag'     ? buildBenefitsZigzag(section, ctx)
               : lv.benefits === 'icons-grid' ? buildBenefitsIconsGrid(section, ctx)
               :                                 buildBenefits(section, ctx)
          break
        case 'summary':      block = buildSummary(section, ctx); break
        case 'comparison':
          block = lv.comparison === 'side-by-side'
            ? buildComparisonSideBySide(section, ctx, businessName)
            : buildComparison(section, ctx, businessName)
          break
        case 'social_proof':
          block = lv.social_proof === 'wall'        ? buildSocialProofWall(section, ctx)
               : lv.social_proof === 'stats-strip' ? buildSocialProofStatsStrip(section, ctx)
               :                                      buildSocialProof(section, ctx)
          break
        case 'pricing':
          block = lv.pricing === 'highlight-center'
            ? buildPricingHighlightCenter(section, ctx)
            : buildPricing(section, ctx)
          break
        case 'faq':
          block = lv.faq === 'two-col'
            ? buildFaqTwoCol(section, ctx)
            : buildFaq(section, ctx)
          break
        case 'offer':
          block = lv.offer === 'image-bg'
            ? buildOfferImageBg(section, ctx)
            : buildOffer(section, ctx)
          break
      }
      if (block) {
        const anchor = anchorByType[section.type]
        if (anchor) {
          block.elements.unshift(makeAnchor(anchor))
        }
        // Wave separator entre blocks de cores diferentes — quebra a
        // sensação de "blocos retangulares uniformes". Style varia entre
        // wave/wave-up/diagonal a cada inserção pra dar ritmo visual.
        const prev = blocks[blocks.length - 1]
        const prevBg = blockBgHint(prev)
        const currBg = blockBgHint(block)
        if (prev && prevBg !== currBg && prevBg && currBg) {
          const styles = ['wave', 'wave-up', 'diagonal'] as const
          const sepStyle = styles[blocks.length % styles.length]
          blocks.push(makeSeparator(prevBg, currBg, sepStyle))
        }
        blocks.push(block)
      }
    } catch (e) {
      console.warn(`[renderHtmlV3] falha ao construir bloco "${section.type}":`, e instanceof Error ? e.message : e)
    }
  }

  // Bloco de garantia profissional (se há campo guarantee no briefing) —
  // injetado ANTES do offer pra reforçar redução de risco perto do CTA final.
  if (ctx.input.guarantee && ctx.input.guarantee.trim()) {
    const offerIdx = blocks.findIndex(b => {
      // Heurística: offer normalmente é o último block colorido antes do footer.
      // Aqui detectamos pelo bgColor primary (offers usam gradient primary).
      const bg = blockBgHint(b)
      return bg === ctx.design!.primary
    })
    // Injeta no fim, ANTES do offer (último block)
    const insertAt = blocks.length - 1
    if (insertAt > 0) {
      blocks.splice(insertAt, 0, buildGuaranteeSeal(ctx))
    } else {
      blocks.push(buildGuaranteeSeal(ctx))
    }
  }

  // Footer SEMPRE no final
  blocks.push(buildFooter(ctx, businessName))

  const page: PageModel = {
    version: 3,
    width: PAGE_W,
    bgColor: '#ffffff',
    fontFamily: fonts.body,
    blocks,
  }

  const html = serializePage(page)

  // CSS de hover/transição/animações sutis + suporte a SVG inline.
  // Aplicado em .lp-page no publicado. Editor V3 ignora — não afeta canvas.
  const HOVER_CSS = `<style>
/* SVG inline ocupa 100% do container — pra ícones Lucide-style em .lp-texto */
.lp-page .lp-texto svg { width: 100%; height: 100%; display: block; }
/* Botões: levanta sutilmente no hover */
.lp-page .lp-botao { transition: transform .18s ease, box-shadow .18s ease, filter .18s ease; }
.lp-page .lp-botao:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(0,0,0,0.18); filter: brightness(1.06); }
.lp-page .lp-botao:active { transform: translateY(0); filter: brightness(0.95); }
/* Caixas (cards): levanta no hover */
.lp-page .lp-caixa { transition: transform .25s ease, box-shadow .25s ease; }
.lp-page .lp-caixa:hover { transform: translateY(-3px); }
/* FAQ accordion: brilha no hover */
.lp-page details.ai-faq-item summary { transition: background-color .15s ease; }
.lp-page details.ai-faq-item:hover summary { filter: brightness(1.04); }
/* Links: fade no hover */
.lp-page a[href]:not(.lp-botao) { transition: opacity .15s ease; }
.lp-page a[href]:not(.lp-botao):hover { opacity: 0.7; }
/* Imagens: zoom sutil */
.lp-page .lp-imagem img { transition: transform .4s ease; }
.lp-page .lp-imagem:hover img { transform: scale(1.03); }
</style>`

  // Injeta as tags <link> do Google Fonts + hover CSS no início do HTML.
  return `${fonts.linkTags}${HOVER_CSS}\n${html}`
}
