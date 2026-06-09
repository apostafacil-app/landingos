/**
 * Benefits variant: ICONS-GRID
 *
 * Grid 4×N de ícones grandes circulares coloridos + texto curto abaixo.
 * Sem cards — espaçamento aéreo, foco no emoji/símbolo.
 * Bom pra 6-12 benefícios curtos.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildBenefitsIconsGrid(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ icon?: string; title?: string; description?: string }> }
  const items = (d.items ?? []).slice(0, 8)
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

  const cols = items.length <= 3 ? items.length : 4
  const gap = 32
  const cellW = (CONTENT_W - gap * (cols - 1)) / cols
  const cellInnerW = Math.round(cellW) - 32
  const ICON_SIZE = 80

  const cellHeights = items.map(item => {
    const titleH = estimateTextHeight(truncate(item.title ?? '', 50), {
      width: cellInnerW, fontSize: 16, lineHeight: 1.3, minLines: 1, maxLines: 2,
    })
    const descH = estimateTextHeight(truncate(item.description ?? '', 90), {
      width: cellInnerW, fontSize: 13, lineHeight: 1.6, minLines: 2, maxLines: 4,
    })
    return ICON_SIZE + 24 + titleH + 8 + descH + 16
  })
  const cellH = Math.max(220, ...cellHeights)

  items.forEach((item, idx) => {
    const row = Math.floor(idx / cols)
    const col = idx % cols
    const cx = Math.round(CONTENT_X + col * (cellW + gap))
    const cy = y + row * (cellH + gap)
    const iconCx = cx + Math.round((cellW - ICON_SIZE) / 2)

    // Círculo gradient pro ícone
    elements.push({
      id: genId('el'), type: 'caixa',
      x: iconCx, y: cy, w: ICON_SIZE, h: ICON_SIZE,
      bgColor: design.primary,
      borderRadius: 40,
      shadow: 'lg',
    } as Element)
    // Overlay accent
    elements.push({
      id: genId('el'), type: 'caixa',
      x: iconCx + 8, y: cy + 8, w: ICON_SIZE - 16, h: ICON_SIZE - 16,
      bgColor: design.accent,
      borderRadius: 32,
      opacity: 0.25,
    } as Element)
    if (item.icon) {
      elements.push({
        id: genId('el'), type: 'texto',
        x: iconCx, y: cy + 16, w: ICON_SIZE, h: ICON_SIZE - 16,
        html: item.icon,
        fontSize: 38, textAlign: 'center',
      } as Element)
    }

    // Título
    const titleText = truncate(item.title ?? '', 50)
    const titleH = estimateTextHeight(titleText, {
      width: cellInnerW, fontSize: 16, lineHeight: 1.3, minLines: 1, maxLines: 2,
    })
    elements.push({
      id: genId('el'), type: 'texto',
      x: cx + 16, y: cy + ICON_SIZE + 24, w: cellInnerW, h: titleH,
      html: titleText,
      fontSize: 16, fontWeight: 800,
      color: design.primary, textAlign: 'center',
      lineHeight: 1.3,
    } as Element)
    // Descrição
    const descText = truncate(item.description ?? '', 90)
    const descH = estimateTextHeight(descText, {
      width: cellInnerW, fontSize: 13, lineHeight: 1.6, minLines: 2, maxLines: 4,
    })
    elements.push({
      id: genId('el'), type: 'texto',
      x: cx + 16, y: cy + ICON_SIZE + 24 + titleH + 8, w: cellInnerW, h: descH,
      html: descText,
      fontSize: 13, color: '#64748b',
      textAlign: 'center', lineHeight: 1.6,
    } as Element)
  })

  const rows = Math.ceil(items.length / cols)
  const totalH = y + rows * (cellH + gap) + 88

  return {
    id: genId('blk'),
    height: totalH,
    bgColor: '#ffffff',
    elements,
  }
}
