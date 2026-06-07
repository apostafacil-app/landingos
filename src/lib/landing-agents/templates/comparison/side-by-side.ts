/**
 * Comparison variant: SIDE-BY-SIDE
 *
 * 2 cards grandes lado a lado — "Sem nosso produto" (vermelho/cinza) vs
 * "Com nosso produto" (gradient colorido). Cada um lista 4-6 pontos.
 * Mais visual e dramático que tabela.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildComparisonSideBySide(section: SectionCopy, ctx: PipelineContext, businessName: string): Block {
  const d = section.data as { eyebrow?: string; headline?: string; rows?: Array<{ feature: string; us: string; them: string }> }
  const rows = (d.rows ?? []).slice(0, 6)
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
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
    y += hH + 56
  }

  if (!rows.length) return { id: genId('blk'), height: y + 80, bgColor: '#fafbfc', elements }

  const cardW = (CONTENT_W - 32) / 2
  const cardH = 80 + rows.length * 56 + 32
  const leftX = CONTENT_X
  const rightX = CONTENT_X + cardW + 32

  // Card LEFT — sem nosso produto (cinza)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: leftX, y, w: cardW, h: cardH,
    bgColor: '#ffffff',
    borderColor: '#e8edf5', borderWidth: 1,
    borderRadius: 20,
    shadow: 'sm' as never,
    zIndex: 1,
  } as Element)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: leftX, y, w: cardW, h: 60,
    bgColor: '#fee2e2',
    borderRadius: 20,
    zIndex: 2,
  } as Element)
  elements.push({
    id: genId('el'), type: 'texto',
    x: leftX, y: y + 20, w: cardW, h: 24,
    html: `Sem ${truncate(businessName, 30)}`,
    fontSize: 16, fontWeight: 800,
    color: '#dc2626', textAlign: 'center',
    fontFamily: fonts.body,
    zIndex: 3,
  } as Element)
  // Items lado esquerdo
  rows.forEach((r, i) => {
    const fy = y + 80 + i * 56
    elements.push({
      id: genId('el'), type: 'texto',
      x: leftX + 24, y: fy + 4, w: 24, h: 24,
      html: '✗',
      fontSize: 18, fontWeight: 900,
      color: '#dc2626', textAlign: 'center',
      zIndex: 2,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: leftX + 56, y: fy, w: cardW - 80, h: 48,
      html: truncate(r.them, 70),
      fontSize: 14, color: '#64748b',
      textAlign: 'left', lineHeight: 1.6,
      fontFamily: fonts.body,
      zIndex: 2,
    } as Element)
  })

  // Card RIGHT — com nosso produto (gradient + accent)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: rightX, y, w: cardW, h: cardH,
    bgColor: design.primary,
    borderRadius: 20,
    shadow: 'xl' as never,
    zIndex: 1,
  } as Element)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: rightX, y, w: cardW, h: 60,
    bgColor: design.accent,
    borderRadius: 20,
    zIndex: 2,
  } as Element)
  elements.push({
    id: genId('el'), type: 'texto',
    x: rightX, y: y + 20, w: cardW, h: 24,
    html: `Com ${truncate(businessName, 30)}`,
    fontSize: 16, fontWeight: 800,
    color: '#ffffff', textAlign: 'center',
    fontFamily: fonts.body,
    zIndex: 3,
  } as Element)
  rows.forEach((r, i) => {
    const fy = y + 80 + i * 56
    elements.push({
      id: genId('el'), type: 'caixa',
      x: rightX + 24, y: fy + 4, w: 24, h: 24,
      bgColor: 'rgba(255,255,255,0.18)',
      borderRadius: 12,
      zIndex: 2,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: rightX + 24, y: fy + 6, w: 24, h: 20,
      html: '✓',
      fontSize: 14, fontWeight: 900,
      color: '#ffffff', textAlign: 'center',
      zIndex: 3,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: rightX + 56, y: fy, w: cardW - 80, h: 48,
      html: truncate(r.us, 70),
      fontSize: 14, color: '#ffffff',
      textAlign: 'left', lineHeight: 1.6,
      fontWeight: 500,
      fontFamily: fonts.body,
      zIndex: 2,
    } as Element)
  })

  return {
    id: genId('blk'),
    height: y + cardH + 88,
    bgColor: '#fafbfc',
    elements,
  }
}
