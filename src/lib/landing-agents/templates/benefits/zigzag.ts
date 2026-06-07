/**
 * Benefits variant: ZIGZAG
 *
 * Cada benefit ocupa uma linha inteira, alternando ícone+texto na esquerda
 * e direita. Layout editorial, mais "storytelling" do que grid de cards.
 *
 * Bom pra páginas com 3-5 benefícios "narrativos" (explicar passo a passo).
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildBenefitsZigzag(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = (d.items ?? []).slice(0, 5)
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []

  let y = 96
  if (d.eyebrow) {
    const eyebrowText = cleanText(d.eyebrow)
    const ebW = Math.min(eyebrowText.length * 7 + 60, 360)
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: Math.round((PAGE_W - ebW) / 2), y, w: ebW, h: 32,
      bgColor: `${design.accent}1A`,
      borderRadius: 16,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: Math.round((PAGE_W - ebW) / 2) + 14, y: y + 7, w: ebW - 28, h: 18,
      html: eyebrowText,
      fontSize: 12, fontWeight: 800, letterSpacing: 1.2,
      color: design.accent,
      textAlign: 'center',
    } as Element)
    y += 50
  }
  if (d.headline) {
    const headlineText = truncate(d.headline, 80)
    const hH = estimateTextHeight(headlineText, {
      width: 760, fontSize: 38, lineHeight: 1.15,
      minLines: 1, maxLines: 3,
      isDisplay: design.typography === 'display' || design.typography === 'serif-premium',
    })
    elements.push({
      id: genId('el'),
      type: 'titulo',
      headingLevel: 2,
      x: Math.round((PAGE_W - 760) / 2), y, w: 760, h: hH,
      html: headlineText,
      fontSize: 38, fontWeight: 800,
      fontFamily: fonts.heading,
      color: design.primary,
      textAlign: 'center',
      lineHeight: 1.15,
    } as Element)
    y += hH + 32
  }

  // Cada item: linha inteira, alternando lado
  const ICON_SIZE = 96
  const ITEM_GAP = 56
  const itemContentW = CONTENT_W - ICON_SIZE - 48  // gap entre ícone e texto

  items.forEach((item, idx) => {
    const isReverse = idx % 2 === 1
    const iconX = isReverse ? CONTENT_X + CONTENT_W - ICON_SIZE : CONTENT_X
    const textX = isReverse ? CONTENT_X : CONTENT_X + ICON_SIZE + 48
    const titleText = truncate(item.title ?? '', 50)
    const descText  = truncate(item.description ?? '', 180)

    const titleH = estimateTextHeight(titleText, {
      width: itemContentW, fontSize: 22, lineHeight: 1.3, minLines: 1, maxLines: 2,
    })
    const descH = estimateTextHeight(descText, {
      width: itemContentW, fontSize: 15, lineHeight: 1.7, minLines: 2, maxLines: 4,
    })
    const rowH = Math.max(ICON_SIZE, titleH + 12 + descH)

    // Caixa decorativa de fundo do ícone (círculo grande colorido)
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: iconX, y: y + Math.round((rowH - ICON_SIZE) / 2),
      w: ICON_SIZE, h: ICON_SIZE,
      bgColor: `${design.primary}14`,
      borderRadius: 48,
    } as Element)
    // Halo accent
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: iconX + 12, y: y + Math.round((rowH - ICON_SIZE) / 2) + 12,
      w: ICON_SIZE - 24, h: ICON_SIZE - 24,
      bgColor: `${design.accent}1A`,
      borderRadius: 36,
    } as Element)
    if (item.icon) {
      elements.push({
        id: genId('el'),
        type: 'texto',
        x: iconX, y: y + Math.round((rowH - ICON_SIZE) / 2) + 24,
        w: ICON_SIZE, h: ICON_SIZE - 48,
        html: item.icon,
        fontSize: 44,
        textAlign: 'center',
      } as Element)
    }

    // Número grande decorativo atrás do título (01, 02, 03...)
    const numStr = String(idx + 1).padStart(2, '0')
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: isReverse ? textX : textX + itemContentW - 100,
      y: y - 4,
      w: 100, h: 60,
      html: numStr,
      fontSize: 56,
      fontWeight: 900,
      fontFamily: fonts.heading,
      color: `${design.accent}26`,
      textAlign: isReverse ? 'left' : 'right',
      lineHeight: 1,
    } as Element)

    // Título
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: textX, y: y + 8, w: itemContentW, h: titleH,
      html: titleText,
      fontSize: 22, fontWeight: 700,
      color: design.primary,
      textAlign: 'left',
      lineHeight: 1.3,
    } as Element)
    // Descrição
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: textX, y: y + 8 + titleH + 12, w: itemContentW, h: descH,
      html: descText,
      fontSize: 15,
      fontFamily: fonts.body,
      color: '#475569',
      textAlign: 'left',
      lineHeight: 1.7,
    } as Element)

    // Linha separadora entre items (não no último)
    if (idx < items.length - 1) {
      elements.push({
        id: genId('el'),
        type: 'caixa',
        x: CONTENT_X + 120, y: y + rowH + 28, w: CONTENT_W - 240, h: 1,
        bgColor: '#eef2f7',
      } as Element)
    }

    y += rowH + ITEM_GAP
  })

  return {
    id: genId('blk'),
    height: y + 56,
    bgColor: '#ffffff',
    elements,
  }
}
