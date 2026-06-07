/**
 * FAQ variant: TWO-COL
 *
 * 2 colunas de perguntas em accordion. Bom pra páginas com 6+ FAQs.
 * Mais compacto que o accordion vertical único.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildFaqTwoCol(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ q: string; a: string }> }
  const items = d.items ?? []
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
  const headlineText = truncate(d.headline || 'Perguntas frequentes', 80)
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
  y += hH + 48

  // 2 colunas — divide items metade/metade
  const half = Math.ceil(items.length / 2)
  const left = items.slice(0, half)
  const right = items.slice(half)
  const COL_W = (CONTENT_W - 24) / 2

  // FaqElement nativo numa coluna
  const computeFaqHeight = (its: Array<{ q: string; a: string }>) => its.length * 80 + 24

  if (left.length) {
    elements.push({
      id: genId('el'), type: 'faq',
      x: CONTENT_X, y, w: COL_W, h: computeFaqHeight(left),
      items: left.map(it => ({ id: genId('faq'), q: truncate(it.q, 80), a: truncate(it.a, 220) })),
      qColor: design.primary,
      qFontSize: 15, qFontWeight: 700, qHeadingLevel: 3,
      aColor: '#475569', aFontSize: 13, aLineHeight: 1.7,
      iconColor: design.accent, iconStyle: 'plus',
      itemBgColor: '#ffffff',
      itemBorderColor: '#e8edf5',
      itemBorderRadius: 12,
      itemSpacing: 8,
      itemPaddingX: 20, itemPaddingY: 16,
      allowMultipleOpen: false,
    } as Element)
  }
  if (right.length) {
    elements.push({
      id: genId('el'), type: 'faq',
      x: CONTENT_X + COL_W + 24, y, w: COL_W, h: computeFaqHeight(right),
      items: right.map(it => ({ id: genId('faq'), q: truncate(it.q, 80), a: truncate(it.a, 220) })),
      qColor: design.primary,
      qFontSize: 15, qFontWeight: 700, qHeadingLevel: 3,
      aColor: '#475569', aFontSize: 13, aLineHeight: 1.7,
      iconColor: design.accent, iconStyle: 'plus',
      itemBgColor: '#ffffff',
      itemBorderColor: '#e8edf5',
      itemBorderRadius: 12,
      itemSpacing: 8,
      itemPaddingX: 20, itemPaddingY: 16,
      allowMultipleOpen: false,
    } as Element)
  }

  const maxH = Math.max(computeFaqHeight(left), computeFaqHeight(right))
  return {
    id: genId('blk'),
    height: y + maxH + 96,
    bgColor: '#fafbfc',
    elements,
  }
}
