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

/** Remove [PLACEHOLDER] (case-insensitive) e excesso de aspas vazadas. */
function cleanText(s: string): string {
  return (s ?? '')
    .replace(/\[PLACEHOLDER\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
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
 * BLOCO HERO — layout split: copy à esquerda, visual à direita
 *
 * Decoração de fundo: blob pattern radial (sempre presente).
 * À direita: imagem AI se disponível, senão mockup browser estilizado.
 * ────────────────────────────────────────────────────────────────────────── */
function buildHero(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('Hero exige hero + design')

  const elements: Element[] = []
  const HERO_H = 680

  // 1. Decoração de fundo — blob pattern (cobre todo o bloco)
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: HERO_H,
    bgImage: blobPattern(design.accent, design.gradient_end),
    zIndex: 0,
  } as Element)

  // 2. Layout split: 50/50 com gap interno
  const COPY_X = 80
  const COPY_W = 520
  const VISUAL_X = 640
  const VISUAL_W = 480

  // ───── Coluna esquerda: copy
  // Eyebrow badge "Novo" / "Pra gráficas"
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: COPY_X, y: 120, w: 220, h: 32,
    bgColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1,
  } as Element)
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: COPY_X + 14, y: 127, w: 192, h: 18,
    html: `✨ ${(hero.trust_stats?.[0] ?? 'Pronto para usar').replace(/^[^\w]+/, '').slice(0, 32)}`,
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
    textAlign: 'left',
    zIndex: 2,
  } as Element)

  // Headline
  elements.push({
    id: genId('el'),
    type: 'titulo',
    headingLevel: 1,
    x: COPY_X, y: 180, w: COPY_W, h: 160,
    html: hero.headline,
    fontSize: 48,
    fontWeight: 900,
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.08,
    zIndex: 1,
  } as Element)

  // Subheadline
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: COPY_X, y: 360, w: COPY_W, h: 100,
    html: hero.subheadline,
    fontSize: 17,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'left',
    lineHeight: 1.6,
    zIndex: 1,
  } as Element)

  // CTA + texto secundário lado a lado
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: COPY_X, y: 480, w: 280, h: 56,
    text: hero.cta,
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 800,
    borderRadius: 10,
    padding: [16, 28],
    shadow: 'lg' as never,
    zIndex: 2,
  } as Element)

  // Trust stats em pills horizontais abaixo do CTA
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats.slice(0, 3)
    let py = 568
    stats.forEach((s) => {
      const cleaned = cleanText(s)
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: COPY_X, y: py, w: COPY_W, h: 24,
        html: cleaned,
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'left',
        zIndex: 1,
      } as Element)
      py += 26
    })
  }

  // ───── Coluna direita: imagem AI ou mockup decorativo
  if (visual?.hero_data_url) {
    // Imagem AI — moldura branca + sombra
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X - 8, y: 152, w: VISUAL_W + 16, h: 376,
      bgColor: 'rgba(255,255,255,0.12)',
      borderRadius: 20,
      zIndex: 1,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: VISUAL_X, y: 160, w: VISUAL_W, h: 360,
      src: visual.hero_data_url,
      alt: 'Hero',
      objectFit: 'cover',
      borderRadius: 16,
      shadow: 'xl' as never,
      zIndex: 2,
    } as Element)
  } else {
    // Mockup decorativo de tela
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X, y: 160, w: VISUAL_W, h: 360,
      bgImage: browserMockup(design.primary, design.accent),
      shadow: 'xl' as never,
      borderRadius: 14,
      zIndex: 2,
    } as Element)
  }

  return {
    id: genId('blk'),
    height: HERO_H,
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
  const cardW = (CONTENT_W - gap * (cols - 1)) / cols
  const cardH = 256

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

    // Círculo do ícone — caixa colorida arredondada com emoji centralizado
    const iconBg = `${design.primary}1A`  // primary com 10% alpha
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
    // Título
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 28, y: cy + 108, w: Math.round(cardW) - 56, h: 28,
      html: cleanText(item.title ?? ''),
      fontSize: 18, fontWeight: 700,
      color: design.primary,
      textAlign: 'left',
      lineHeight: 1.3,
    } as Element)
    // Descrição
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 28, y: cy + 144, w: Math.round(cardW) - 56, h: 96,
      html: cleanText(item.description ?? ''),
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
  const cardH = 280

  items.forEach((t, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cardW + gap))
    const cy = y + row * (cardH + gap)
    const author = cleanText(t.author) || 'Cliente'
    const role = cleanText(t.role || '')
    const text = cleanText(t.text || '')

    // Card branco com sombra
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx, y: cy, w: Math.round(cardW), h: cardH,
      bgColor: '#ffffff',
      borderRadius: 18,
      shadow: 'lg' as never,
    } as Element)

    // Aspas decorativas grandes (texto)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 8, w: 48, h: 56,
      html: '"',
      fontSize: 84,
      fontWeight: 900,
      color: `${design.gradient_end}33`,  // 20% alpha
      lineHeight: 1,
      textAlign: 'left',
      fontFamily: 'Georgia, serif',
    } as Element)

    // Stars
    const rating = t.rating ?? 5
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 76, w: Math.round(cardW) - 48, h: 22,
      html: '★'.repeat(rating),
      fontSize: 15, color: '#f59e0b', textAlign: 'left',
      letterSpacing: 2,
    } as Element)

    // Texto depoimento
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 24, y: cy + 108, w: Math.round(cardW) - 48, h: 110,
      html: `"${text}"`,
      fontSize: 14, color: '#475569', lineHeight: 1.7,
      textAlign: 'left',
    } as Element)

    // Avatar circular com inicial
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: cx + 24, y: cy + cardH - 64, w: 44, h: 44,
      bgImage: avatarInitial(author, design.primary),
      borderRadius: 22,
    } as Element)

    // Nome do autor + cargo
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: cx + 80, y: cy + cardH - 58, w: Math.round(cardW) - 104, h: 20,
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
        x: cx + 80, y: cy + cardH - 36, w: Math.round(cardW) - 104, h: 18,
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
