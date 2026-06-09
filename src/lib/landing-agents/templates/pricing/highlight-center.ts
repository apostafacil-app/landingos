/**
 * Pricing variant: HIGHLIGHT-CENTER
 *
 * Plano central destacado MAIOR (altura + largura + transform scale visual)
 * com badge premium. Laterais menores e mais discretos.
 * Foco extremo no plano popular.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildPricingHighlightCenter(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; plans?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }> }
  let plans = (d.plans ?? []).slice(0, 3)
  const design = ctx.design!
  const fonts = getFontStack(design.typography)

  // Sempre destaca o do meio
  if (plans.length >= 3) {
    plans = plans.map((p, i) => ({ ...p, highlighted: i === 1 }))
  } else if (plans.length === 2) {
    plans = plans.map((p, i) => ({ ...p, highlighted: i === 1 }))
  }

  const elements: Element[] = []
  let y = 96
  if (d.eyebrow) {
    elements.push({
      id: genId('el'), type: 'texto',
      x: 0, y, w: PAGE_W, h: 22,
      html: cleanText(d.eyebrow),
      fontSize: 12, fontWeight: 800, letterSpacing: 2,
      color: design.accent, textAlign: 'center',
    } as Element)
    y += 30
  }
  if (d.headline) {
    const headlineText = truncate(d.headline, 80)
    const hH = estimateTextHeight(headlineText, {
      width: 760, fontSize: 38, lineHeight: 1.15, minLines: 1, maxLines: 3,
      isDisplay: design.typography === 'display' || design.typography === 'serif-premium',
    })
    elements.push({
      id: genId('el'), type: 'titulo', headingLevel: 2,
      x: Math.round((PAGE_W - 760) / 2), y, w: 760, h: hH,
      html: headlineText,
      fontSize: 38, fontWeight: 800,
      fontFamily: fonts.heading,
      color: design.primary, textAlign: 'center',
      lineHeight: 1.15,
    } as Element)
    y += hH + 64
  }

  // Cards lado a lado, central maior
  const N = plans.length
  if (N === 0) return { id: genId('blk'), height: y + 80, bgColor: '#fafbfc', elements }

  const SIDE_W = 280
  const CENTER_W = 340
  const SIDE_H = 480
  const CENTER_H = 540
  const gap = 0
  let totalW = SIDE_W * (N - 1) + (plans.some(p => p.highlighted) ? CENTER_W : SIDE_W)
  if (N === 1) totalW = CENTER_W
  totalW += gap * (N - 1)
  let cx = Math.round((PAGE_W - totalW) / 2)
  const centerY = y + 20

  plans.forEach(p => {
    const hl = p.highlighted
    const cw = hl ? CENTER_W : SIDE_W
    const ch = hl ? CENTER_H : SIDE_H
    const cy = hl ? y : centerY

    if (hl) {
      // Badge MAIS POPULAR flutuante
      elements.push({
        id: genId('el'), type: 'caixa',
        x: cx + Math.round((cw - 180) / 2), y: cy - 18, w: 180, h: 36,
        bgColor: design.accent,
        borderRadius: 18,
        shadow: 'md',
        zIndex: 3,
      } as Element)
      elements.push({
        id: genId('el'), type: 'texto',
        x: cx + Math.round((cw - 180) / 2), y: cy - 11, w: 180, h: 22,
        html: '⭐ MAIS POPULAR',
        fontSize: 11, fontWeight: 900,
        color: '#ffffff', textAlign: 'center', letterSpacing: 2,
        zIndex: 4,
      } as Element)
    }

    // Card
    elements.push({
      id: genId('el'), type: 'caixa',
      x: cx, y: cy, w: cw, h: ch,
      bgColor: hl ? design.primary : '#ffffff',
      borderColor: hl ? 'transparent' : '#e8edf5',
      borderWidth: hl ? 0 : 1,
      borderRadius: 24,
      shadow: hl ? ('xl') : ('sm'),
      zIndex: 1,
    } as Element)

    // Faixa accent topo no destacado
    if (hl) {
      elements.push({
        id: genId('el'), type: 'caixa',
        x: cx, y: cy, w: cw, h: 6,
        bgColor: design.accent,
        borderRadius: 24,
        zIndex: 2,
      } as Element)
    }

    const textColor = hl ? '#ffffff' : design.primary
    const subColor = hl ? 'rgba(255,255,255,0.92)' : '#475569'
    const accentColor = hl ? '#ffffff' : design.accent

    elements.push({
      id: genId('el'), type: 'texto',
      x: cx + 24, y: cy + (hl ? 56 : 36), w: cw - 48, h: 24,
      html: (p.name ?? '').toUpperCase(),
      fontSize: 12, fontWeight: 800, letterSpacing: 2,
      color: hl ? 'rgba(255,255,255,0.75)' : '#94a3b8',
      textAlign: 'center',
      fontFamily: fonts.body,
      zIndex: 2,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: cx + 24, y: cy + (hl ? 96 : 76), w: cw - 48, h: 64,
      html: p.price ?? '',
      fontSize: hl ? 48 : 36, fontWeight: 900,
      fontFamily: fonts.heading,
      color: textColor, textAlign: 'center', lineHeight: 1,
      zIndex: 2,
    } as Element)
    elements.push({
      id: genId('el'), type: 'caixa',
      x: cx + 32, y: cy + (hl ? 184 : 156), w: cw - 64, h: 1,
      bgColor: hl ? 'rgba(255,255,255,0.2)' : '#eef2f7',
      zIndex: 2,
    } as Element)

    let fy = cy + (hl ? 208 : 180)
    for (const f of (p.features ?? []).slice(0, 7)) {
      elements.push({
        id: genId('el'), type: 'caixa',
        x: cx + 24, y: fy + 2, w: 20, h: 20,
        bgColor: hl ? 'rgba(255,255,255,0.18)' : `${design.accent}1F`,
        borderRadius: 10, zIndex: 2,
      } as Element)
      elements.push({
        id: genId('el'), type: 'texto',
        x: cx + 24, y: fy + 4, w: 20, h: 16,
        html: '✓',
        fontSize: 11, fontWeight: 900,
        color: accentColor, textAlign: 'center', zIndex: 3,
      } as Element)
      elements.push({
        id: genId('el'), type: 'texto',
        x: cx + 52, y: fy, w: cw - 76, h: 24,
        html: truncate(f, 52),
        fontSize: 13, color: subColor,
        textAlign: 'left', lineHeight: 1.5,
        fontFamily: fonts.body,
        zIndex: 2,
      } as Element)
      fy += 36
    }

    cx += cw + gap
  })

  return {
    id: genId('blk'),
    height: y + CENTER_H + 88,
    bgColor: '#fafbfc',
    elements,
  }
}
