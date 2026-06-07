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
} from './decorations'
import { getFontStack } from './fonts'

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
 * Heurística: chars por linha ~ width / (fontSize * 0.52), depois multiplica
 * por line-height e adiciona padding. Não é exato (varia por fonte e letras),
 * mas resolve 90% dos casos em que texto vaza por h fixo curto.
 */
function estimateTextHeight(text: string, opts: {
  width: number
  fontSize: number
  lineHeight?: number
  minLines?: number
  maxLines?: number
}): number {
  const lh = opts.lineHeight ?? 1.5
  const charsPerLine = Math.max(8, Math.floor(opts.width / (opts.fontSize * 0.52)))
  const cleanedLen = (text ?? '').replace(/<[^>]+>/g, '').length
  let lines = Math.max(1, Math.ceil(cleanedLen / charsPerLine))
  if (opts.minLines && lines < opts.minLines) lines = opts.minLines
  if (opts.maxLines && lines > opts.maxLines) lines = opts.maxLines
  return Math.ceil(lines * opts.fontSize * lh) + 4
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

  return {
    id: genId('blk'),
    height: NAV_H,
    // Mesmo gradient do hero pra integrar visualmente — bgColor:'transparent'
    // não funciona porque o bloco fica em fluxo vertical sobre o bg da página
    // (branco). Usar o gradient garante continuidade visual ao hero.
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
  const headlineText = truncate(hero.headline, 60)
  const HEADLINE_FONT = 56  // reduzido de 64 pra dar mais respiro
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W,
    fontSize: HEADLINE_FONT,
    lineHeight: 1.05,
    minLines: 2,
    maxLines: 4,
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
    lineHeight: 1.05,
    letterSpacing: -1.5,
    zIndex: 1,
  } as Element)

  // Subheadline — começa logo após headline + gap 32px
  const SUBHEAD_FONT = 17
  const subheadText = truncate(hero.subheadline, 160)
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: COPY_W - 40,
    fontSize: SUBHEAD_FONT,
    lineHeight: 1.6,
    minLines: 2,
    maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 32
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
    shadow: 'lg' as never,
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
  // Filtra placeholders óbvios + trunca cada um a 60 chars defensivo
  let trustEndY = ctaY + 54
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(0, 3)
    let py = ctaY + 84
    stats.forEach((s) => {
      const cleaned = truncate(s, 60)
      const sh = estimateTextHeight(cleaned, {
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
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X - 8, y: visualY - 8, w: VISUAL_W + 16, h: VISUAL_H + 16,
      bgColor: 'rgba(255,255,255,0.12)',
      borderRadius: 20,
      zIndex: 1,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      src: visual.hero_data_url,
      alt: 'Hero',
      objectFit: 'cover',
      borderRadius: 16,
      shadow: 'xl' as never,
      zIndex: 2,
    } as Element)
  } else {
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      bgImage: browserMockup(design.primary, design.accent),
      shadow: 'xl' as never,
      borderRadius: 14,
      zIndex: 2,
    } as Element)
  }

  // Blob pattern de fundo — inserido NO INÍCIO do array pra ficar atrás dos
  // outros elementos. Altura dinâmica = altura final do bloco.
  elements.unshift({
    id: genId('el'),
    type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
    bgImage: blobPattern(design.accent, design.gradient_end),
    zIndex: 0,
  } as Element)

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
      shadow: 'md' as never,
    } as Element)
    // Faixa accent no topo
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx, y: cy, w: Math.round(cardW), h: 4,
      bgColor: design.accent,
      borderRadius: 16,
    } as Element)

    // Círculo do ícone
    const iconBg = `${design.primary}1A`
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx + 28, y: cy + 36, w: 56, h: 56,
      bgColor: iconBg,
      borderRadius: 14,
    } as Element)
    if (item.icon) {
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + 28, y: cy + 48, w: 56, h: 32,
        html: item.icon,
        fontSize: 28, textAlign: 'center',
      } as Element)
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
      shadow: 'lg' as never,
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
    elements: [
      // Dots pattern overlay (atrás de tudo)
      {
        id: genId('el'),
        type: 'caixa',
        x: 0, y: 0, w: PAGE_W, h: y + rows * (cardH + gap) + 88,
        bgImage: dotsPattern('#ffffff'),
        zIndex: 0,
      } as Element,
      ...elements,
    ],
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
        shadow: 'md' as never,
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
        shadow: 'xl' as never,
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
        shadow: 'sm' as never,
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

  // Blob pattern de fundo (igual hero, mas com cores diferentes)
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: OFFER_H,
    bgImage: blobPattern(design.accent, '#ffffff'),
    zIndex: 0,
  } as Element)

  // Selo de garantia à esquerda (não-eu-disse: é decorativo, agente CRO ainda
  // pode mexer no texto, mas o selo dá uma "âncora visual" de confiança)
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: 80, y: 168, w: 140, h: 140,
    bgImage: badge('7 DIAS GRÁTIS', design.accent),
    rotation: -8,
    zIndex: 2,
  } as Element)

  // Headline
  elements.push({
    id: genId('el'),
    type: 'titulo',
    headingLevel: 2,
    x: 280, y: 120, w: 840, h: 100,
    html: cleanText(d.headline ?? 'Pronto para começar?'),
    fontSize: 44, fontWeight: 900,
    color: '#ffffff', lineHeight: 1.15,
    textAlign: 'left',
    zIndex: 1,
  } as Element)

  // Descrição
  if (d.description) {
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: 280, y: 240, w: 720, h: 80,
      html: cleanText(d.description),
      fontSize: 17, color: 'rgba(255,255,255,0.92)',
      lineHeight: 1.65,
      textAlign: 'left',
      zIndex: 1,
    } as Element)
  }

  // CTA
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: 280, y: 348, w: 320, h: 60,
    text: d.cta ?? 'Quero começar',
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 16, fontWeight: 800,
    borderRadius: 12,
    padding: [16, 32],
    shadow: 'xl' as never,
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

  blocks.push(buildHero(ctx))

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
        case 'benefits':     block = buildBenefits(section, ctx); break
        case 'summary':      block = buildSummary(section, ctx); break
        case 'comparison':   block = buildComparison(section, ctx, businessName); break
        case 'social_proof': block = buildSocialProof(section, ctx); break
        case 'pricing':      block = buildPricing(section, ctx); break
        case 'faq':          block = buildFaq(section, ctx); break
        case 'offer':        block = buildOffer(section, ctx); break
      }
      if (block) {
        // Adiciona anchor id se o block tem âncora navegável
        const anchor = anchorByType[section.type]
        if (anchor) {
          (block as Block & { anchorId?: string }).anchorId = anchor
        }
        blocks.push(block)
      }
    } catch (e) {
      console.warn(`[renderHtmlV3] falha ao construir bloco "${section.type}":`, e instanceof Error ? e.message : e)
    }
  }

  const page: PageModel = {
    version: 3,
    width: PAGE_W,
    bgColor: '#ffffff',
    fontFamily: fonts.body,
    blocks,
  }

  const html = serializePage(page)

  // Injeta as tags <link> do Google Fonts no início do HTML.
  // Sem isso, fontFamily: 'Syne' cai pra fallback genérico.
  return fonts.linkTags ? `${fonts.linkTags}\n${html}` : html
}
