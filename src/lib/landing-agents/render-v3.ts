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
 * BLOCO HERO
 * ────────────────────────────────────────────────────────────────────────── */
function buildHero(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('Hero exige hero + design')

  const elements: Element[] = []

  // Imagem de fundo (se gerada pela IA) — vai com opacity baixa pra texto ler bem
  if (visual?.hero_data_url) {
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: 0, y: 0, w: PAGE_W, h: 720,
      src: visual.hero_data_url,
      alt: 'Hero',
      objectFit: 'cover',
      opacity: 0.25,
      zIndex: 0,
    } as Element)
  }

  // Headline
  elements.push(makeText({
    y: 160, w: 880,
    type: 'titulo', headingLevel: 1,
    html: hero.headline,
    fontSize: 56,
    fontWeight: 900,
    color: '#ffffff',
    h: 140,
    lineHeight: 1.1,
  }))

  // Subheadline
  elements.push(makeText({
    y: 320, w: 640,
    html: hero.subheadline,
    fontSize: 19,
    color: 'rgba(255,255,255,0.88)',
    h: 80,
    lineHeight: 1.6,
  }))

  // CTA
  elements.push(makeButton({
    y: 420,
    text: hero.cta,
    bgColor: design.accent,
  }))

  // Trust stats (3 textos pequenos lado a lado)
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats.slice(0, 3)
    const totalW = 800
    const gap = 24
    const itemW = (totalW - gap * (stats.length - 1)) / stats.length
    const startX = (PAGE_W - totalW) / 2
    stats.forEach((s, i) => {
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: Math.round(startX + i * (itemW + gap)),
        y: 540, w: Math.round(itemW), h: 40,
        html: s,
        fontSize: 14,
        color: 'rgba(255,255,255,0.92)',
        textAlign: 'center',
      } as Element)
    })
  }

  return {
    id: genId('blk'),
    height: 640,
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
 * BLOCO BENEFITS — 3 colunas
 * ────────────────────────────────────────────────────────────────────────── */
function buildBenefits(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = (d.items ?? []).slice(0, 6)
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) {
    elements.push(makeText({
      y, h: 28, html: d.eyebrow,
      fontSize: 12, fontWeight: 800,
      color: ctx.design!.accent,
    }))
    y += 36
  }
  if (d.headline) {
    elements.push(makeText({
      y, w: 800, h: 70, html: d.headline,
      type: 'titulo', headingLevel: 2,
      fontSize: 36, fontWeight: 800,
      color: ctx.design!.primary,
      lineHeight: 1.15,
    }))
    y += 90
  }

  // Grid de cards 3 colunas
  const cols = items.length <= 2 ? items.length : 3
  const gap = 24
  const cardW = (CONTENT_W - gap * (cols - 1)) / cols
  const cardH = 220

  items.forEach((item, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cardW + gap))
    const cy = y + row * (cardH + gap)

    // Caixa de fundo
    elements.push(makeBox({
      x: cx, y: cy, w: Math.round(cardW), h: cardH,
      bgColor: '#ffffff', borderColor: '#e8edf5', borderRadius: 14,
    }))
    // Ícone (emoji)
    if (item.icon) {
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: cx + 24, y: cy + 24, w: 60, h: 40,
        html: item.icon,
        fontSize: 32, textAlign: 'left',
      } as Element)
    }
    // Título
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 76, w: Math.round(cardW) - 48, h: 28,
      html: item.title ?? '',
      fontSize: 17, fontWeight: 700,
      color: ctx.design!.primary,
      textAlign: 'left',
    } as Element)
    // Descrição
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 112, w: Math.round(cardW) - 48, h: 90,
      html: item.description ?? '',
      fontSize: 14, color: '#64748b', lineHeight: 1.65,
      textAlign: 'left',
    } as Element)
  })

  const rows = Math.ceil(items.length / cols)
  const totalH = y + rows * (cardH + gap) + 80

  return {
    id: genId('blk'),
    height: totalH,
    bgColor: '#ffffff',
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
 * BLOCO SOCIAL PROOF — 3 cards de depoimento
 * ────────────────────────────────────────────────────────────────────────── */
function buildSocialProof(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ text: string; author: string; role?: string; rating?: number }> }
  const items = (d.items ?? []).slice(0, 6)
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) {
    elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.75)' }))
    y += 36
  }
  if (d.headline) {
    elements.push(makeText({ y, w: 800, h: 70, html: d.headline, type: 'titulo', headingLevel: 2, fontSize: 36, fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }))
    y += 100
  }

  const cols = items.length <= 2 ? items.length : 3
  const gap = 24
  const cardW = (CONTENT_W - gap * (cols - 1)) / cols
  const cardH = 240

  items.forEach((t, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cardW + gap))
    const cy = y + row * (cardH + gap)

    elements.push(makeBox({ x: cx, y: cy, w: Math.round(cardW), h: cardH, bgColor: '#ffffff', borderRadius: 14 }))

    // Stars
    const rating = t.rating ?? 5
    elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: cy + 24, w: Math.round(cardW) - 48, h: 24, html: '★'.repeat(rating), fontSize: 16, color: '#f59e0b', textAlign: 'left' } as Element)

    // Texto depoimento
    elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: cy + 60, w: Math.round(cardW) - 48, h: 110, html: `"${t.text}"`, fontSize: 14, color: '#475569', lineHeight: 1.7, textAlign: 'left' } as Element)

    // Autor
    elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: cy + cardH - 50, w: Math.round(cardW) - 48, h: 36, html: `<strong>${t.author}</strong>${t.role ? ` · ${t.role}` : ''}`, fontSize: 13, color: ctx.design!.primary, textAlign: 'left' } as Element)
  })

  const rows = Math.ceil(items.length / cols)
  return {
    id: genId('blk'),
    height: y + rows * (cardH + gap) + 80,
    bgColor: ctx.design!.primary,
    elements,
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * BLOCO PRICING — cards de planos
 * ────────────────────────────────────────────────────────────────────────── */
function buildPricing(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; plans?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }> }
  const plans = (d.plans ?? []).slice(0, 4)
  const elements: Element[] = []

  let y = 80
  if (d.eyebrow) { elements.push(makeText({ y, h: 28, html: d.eyebrow, fontSize: 12, fontWeight: 800, color: ctx.design!.accent })); y += 36 }
  if (d.headline) { elements.push(makeText({ y, w: 800, h: 70, html: d.headline, type: 'titulo', headingLevel: 2, fontSize: 36, fontWeight: 800, color: ctx.design!.primary, lineHeight: 1.15 })); y += 100 }

  const cols = plans.length
  const gap = 24
  const cardW = Math.min(320, (CONTENT_W - gap * (cols - 1)) / cols)
  const totalW = cardW * cols + gap * (cols - 1)
  const startX = (PAGE_W - totalW) / 2
  const cardH = 480

  plans.forEach((p, idx) => {
    const cx = Math.round(startX + idx * (cardW + gap))
    const highlighted = p.highlighted

    if (highlighted) {
      // Card destacado com gradient
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: cx, y, w: Math.round(cardW), h: cardH,
        borderRadius: 20,
      } as Element)
      // sobrepor com caixa colorida (gradient não é per-element no V3, usamos cor sólida do primary)
      elements.push(makeBox({ x: cx, y, w: Math.round(cardW), h: cardH, bgColor: ctx.design!.primary, borderRadius: 20 }))
    } else {
      elements.push(makeBox({ x: cx, y, w: Math.round(cardW), h: cardH, bgColor: '#ffffff', borderColor: '#e8edf5', borderRadius: 20 }))
    }

    const textColor = highlighted ? '#ffffff' : ctx.design!.primary
    const subColor  = highlighted ? 'rgba(255,255,255,0.9)' : '#475569'
    const accentColor = highlighted ? '#ffffff' : ctx.design!.accent

    // Nome do plano
    elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: y + 24, w: Math.round(cardW) - 48, h: 24, html: p.name.toUpperCase(), fontSize: 12, fontWeight: 800, letterSpacing: 2, color: highlighted ? 'rgba(255,255,255,0.7)' : '#64748b', textAlign: 'center' } as Element)
    // Preço
    elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: y + 60, w: Math.round(cardW) - 48, h: 70, html: p.price, fontSize: 44, fontWeight: 900, color: textColor, textAlign: 'center', lineHeight: 1 } as Element)
    // Features
    let fy = y + 160
    for (const f of (p.features ?? []).slice(0, 7)) {
      elements.push({ id: genId('el'), type: 'texto', x: cx + 24, y: fy, w: 18, h: 22, html: '✓', fontSize: 14, fontWeight: 800, color: accentColor, textAlign: 'left' } as Element)
      elements.push({ id: genId('el'), type: 'texto', x: cx + 48, y: fy, w: Math.round(cardW) - 72, h: 22, html: f, fontSize: 13, color: subColor, textAlign: 'left' } as Element)
      fy += 32
    }
  })

  return {
    id: genId('blk'),
    height: y + cardH + 80,
    bgColor: '#f8fafc',
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
 * BLOCO OFFER — CTA final com gradient
 * ────────────────────────────────────────────────────────────────────────── */
function buildOffer(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { headline?: string; description?: string; cta?: string }
  const elements: Element[] = []

  elements.push(makeText({
    y: 100, w: 880, h: 80,
    html: d.headline ?? 'Pronto para começar?',
    type: 'titulo', headingLevel: 2,
    fontSize: 44, fontWeight: 900,
    color: '#ffffff',
    lineHeight: 1.15,
  }))

  if (d.description) {
    elements.push(makeText({
      y: 200, w: 560, h: 60,
      html: d.description,
      fontSize: 17, color: 'rgba(255,255,255,0.88)',
      lineHeight: 1.65,
    }))
  }

  elements.push(makeButton({
    y: 290,
    text: d.cta ?? 'Quero começar',
    bgColor: ctx.design!.accent,
    w: 320,
  }))

  return {
    id: genId('blk'),
    height: 420,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: ctx.design!.primary, pos: 0 },
        { color: ctx.design!.gradient_end, pos: 100 },
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

  const blocks: Block[] = []
  blocks.push(buildHero(ctx))

  for (const section of ctx.sections) {
    try {
      switch (section.type) {
        case 'benefits':     blocks.push(buildBenefits(section, ctx)); break
        case 'summary':      blocks.push(buildSummary(section, ctx)); break
        case 'comparison':   blocks.push(buildComparison(section, ctx, businessName)); break
        case 'social_proof': blocks.push(buildSocialProof(section, ctx)); break
        case 'pricing':      blocks.push(buildPricing(section, ctx)); break
        case 'faq':          blocks.push(buildFaq(section, ctx)); break
        case 'offer':        blocks.push(buildOffer(section, ctx)); break
      }
    } catch (e) {
      console.warn(`[renderHtmlV3] falha ao construir bloco "${section.type}":`, e instanceof Error ? e.message : e)
    }
  }

  const page: PageModel = {
    version: 3,
    width: PAGE_W,
    bgColor: '#ffffff',
    fontFamily: ctx.design.typography === 'serif-premium' ? "'Playfair Display'" : undefined,
    blocks,
  }

  return serializePage(page)
}
