/**
 * Offer variant: IMAGE-BG
 *
 * Imagem AI cobre fundo + overlay escuro forte. Headline gigante centralizado,
 * CTA dramático. Mood "premium" / "luxo".
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200

export function buildOfferImageBg(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { headline?: string; description?: string; cta?: string }
  const design = ctx.design!
  const visual = ctx.visual
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []
  const OFFER_H = 520

  // Imagem AI ou gradient como bg (full-bleed)
  if (visual?.hero_data_url) {
    elements.push({
      id: genId('el'), type: 'imagem',
      x: 0, y: 0, w: PAGE_W, h: OFFER_H,
      src: visual.hero_data_url,
      alt: '', objectFit: 'cover',
      zIndex: 0,
    } as Element)
  }
  // Overlay escuro forte
  elements.push({
    id: genId('el'), type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: OFFER_H,
    bgColor: 'rgba(0,0,0,0.62)',
    zIndex: 1,
  } as Element)

  const headlineText = truncate(d.headline ?? 'Pronto para começar?', 60)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const hH = estimateTextHeight(headlineText, {
    width: 880, fontSize: 56, lineHeight: 1.08, minLines: 1, maxLines: 3, isDisplay,
  })
  elements.push({
    id: genId('el'), type: 'titulo', headingLevel: 2,
    x: 160, y: 120, w: 880, h: hH,
    html: headlineText,
    fontSize: 56, fontWeight: 900,
    fontFamily: fonts.heading,
    color: '#ffffff', textAlign: 'center', lineHeight: 1.08,
    letterSpacing: -1.2,
    zIndex: 2,
  } as Element)

  if (d.description) {
    const desc = truncate(d.description, 140)
    const dH = estimateTextHeight(desc, {
      width: 660, fontSize: 18, lineHeight: 1.65, minLines: 1, maxLines: 3,
    })
    elements.push({
      id: genId('el'), type: 'texto',
      x: Math.round((PAGE_W - 660) / 2), y: 120 + hH + 24, w: 660, h: dH,
      html: desc,
      fontSize: 18, fontFamily: fonts.body,
      color: 'rgba(255,255,255,0.95)',
      textAlign: 'center', lineHeight: 1.65,
      zIndex: 2,
    } as Element)
  }

  const ctaText = truncate(d.cta ?? 'Quero começar', 30)
  elements.push({
    id: genId('el'), type: 'botao',
    x: Math.round((PAGE_W - 320) / 2), y: 360, w: 320, h: 64,
    text: ctaText, link: '#cta',
    bgColor: design.accent, color: '#ffffff',
    fontSize: 17, fontWeight: 800,
    borderRadius: 14, padding: [20, 32],
    shadow: 'xl' as never,
    zIndex: 3,
  } as Element)

  return {
    id: genId('blk'),
    height: OFFER_H,
    bgColor: design.primary,
    elements,
  }
}
