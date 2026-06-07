/**
 * Hero variant: ASYMMETRIC
 *
 * Copy alinhada à ESQUERDA com badge flutuante grande +
 * mockup/imagem rotacionado(-3deg) à direita com sombra dramática.
 * Mood "bold" / "energetico" — chama atenção.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { blobPattern, browserMockup, badge } from '../../decorations'
import { cleanText, isStatTooWeak, estimateTextHeight, truncate } from '../helpers'

const PAGE_W = 1200

export function buildHeroAsymmetric(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('HeroAsymmetric exige hero + design')

  const fonts = getFontStack(design.typography)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const elements: Element[] = []

  const COPY_X = 80
  const COPY_W = 560
  const VISUAL_X = 680
  const VISUAL_W = 460

  // Badge circular flutuante grande no topo esquerdo
  const eyebrowText = isStatTooWeak(hero.trust_stats?.[0] ?? '')
    ? '7 DIAS GRÁTIS'
    : cleanText(hero.trust_stats?.[0] ?? '').replace(/^[^\w]+/, '').slice(0, 18).toUpperCase()
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: COPY_X + COPY_W - 60, y: 56, w: 120, h: 120,
    bgImage: badge(eyebrowText, design.accent),
    rotation: 12,
    zIndex: 3,
  } as Element)

  // Headline gigante esquerda
  const headlineText = truncate(hero.headline, 50)
  const HEADLINE_FONT = isDisplay ? 52 : 60
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W, fontSize: HEADLINE_FONT, lineHeight: 1.05,
    minLines: 2, maxLines: 4, isDisplay,
  })
  const HEADLINE_Y = 140
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

  // Linha decorativa colorida abaixo
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: COPY_X, y: HEADLINE_Y + HEADLINE_H + 16, w: 80, h: 4,
    bgColor: design.accent,
    borderRadius: 2,
    zIndex: 1,
  } as Element)

  // Subhead
  const subheadText = truncate(hero.subheadline, 180)
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: COPY_W - 40, fontSize: 17, lineHeight: 1.65,
    minLines: 2, maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 44
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: COPY_X, y: SUBHEAD_Y, w: COPY_W - 40, h: SUBHEAD_H,
    html: subheadText,
    fontSize: 17,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'left',
    lineHeight: 1.65,
    zIndex: 1,
  } as Element)

  // 2 CTAs
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 40
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: COPY_X, y: ctaY, w: 260, h: 60,
    text: hero.cta, link: '#cta',
    bgColor: design.accent, color: '#ffffff',
    fontSize: 16, fontWeight: 800,
    borderRadius: 30, padding: [18, 28],
    shadow: 'xl' as never, zIndex: 2,
  } as Element)
  if (hero.cta_secondary) {
    elements.push({
      id: genId('el'),
      type: 'botao',
      x: COPY_X + 274, y: ctaY, w: 200, h: 60,
      text: hero.cta_secondary, link: '#funcionalidades',
      bgColor: 'transparent', color: '#ffffff',
      fontSize: 14, fontWeight: 700,
      borderRadius: 30, padding: [18, 22],
      borders: { width: 1, color: 'rgba(255,255,255,0.50)' },
      zIndex: 2,
    } as Element)
  }

  // Trust stats
  let trustEndY = ctaY + 60
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(1, 3) // skip 0 (já usado no badge)
    let py = ctaY + 88
    stats.forEach(s => {
      const cleaned = truncate(s, 60)
      const sh = estimateTextHeight(cleaned, {
        width: COPY_W, fontSize: 13, lineHeight: 1.4, maxLines: 2,
      })
      elements.push({
        id: genId('el'), type: 'texto',
        x: COPY_X, y: py, w: COPY_W, h: sh,
        html: cleaned,
        fontSize: 13, fontFamily: fonts.body,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'left', zIndex: 1,
      } as Element)
      py += sh + 6
    })
    trustEndY = py
  }

  const dynamicHeroH = Math.max(680, trustEndY + 80)
  const VISUAL_H = 420
  const visualY = Math.round((dynamicHeroH - VISUAL_H) / 2)

  // Visual rotacionado -3deg com sombra
  if (visual?.hero_data_url) {
    elements.push({
      id: genId('el'),
      type: 'imagem',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      src: visual.hero_data_url,
      alt: '', objectFit: 'cover',
      borderRadius: 20,
      rotation: -3,
      shadow: 'xl' as never,
      zIndex: 2,
    } as Element)
  } else {
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: VISUAL_X, y: visualY, w: VISUAL_W, h: VISUAL_H,
      bgImage: browserMockup(design.primary, design.accent),
      rotation: -3,
      shadow: 'xl' as never,
      borderRadius: 16,
      zIndex: 2,
    } as Element)
  }

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    bgGradient: {
      type: 'linear', angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    bgImage: blobPattern(design.accent, design.gradient_end),
    bgSize: 'cover',
    elements,
  }
}
