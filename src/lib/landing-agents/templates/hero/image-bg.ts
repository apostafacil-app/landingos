/**
 * Hero variant: IMAGE-BG
 *
 * Imagem AI ocupa o background do hero inteiro (full-bleed). Copy centralizada
 * por cima com overlay escuro pra legibilidade.
 * Mood "premium" / "elegante" — visual marca-forte.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { browserMockup } from '../../decorations'
import { cleanText, isStatTooWeak, estimateTextHeight, truncate } from '../helpers'

const PAGE_W = 1200

export function buildHeroImageBg(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('HeroImageBg exige hero + design')

  const fonts = getFontStack(design.typography)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const elements: Element[] = []

  const COPY_W = 760
  const COPY_X = Math.round((PAGE_W - COPY_W) / 2)

  // Eyebrow
  const eyebrowText = isStatTooWeak(hero.trust_stats?.[0] ?? '')
    ? 'Sob medida pro seu segmento'
    : cleanText(hero.trust_stats?.[0] ?? '').replace(/^[^\w]+/, '').slice(0, 42)
  const ebW = Math.min(eyebrowText.length * 7 + 60, 380)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: Math.round((PAGE_W - ebW) / 2), y: 140, w: ebW, h: 32,
    bgColor: 'rgba(0,0,0,0.4)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1, borderRadius: 16,
    zIndex: 2,
  } as Element)
  elements.push({
    id: genId('el'), type: 'texto',
    x: Math.round((PAGE_W - ebW) / 2) + 14, y: 147, w: ebW - 28, h: 18,
    html: `✨ ${eyebrowText}`,
    fontSize: 12, fontWeight: 700,
    color: '#ffffff', textAlign: 'center', zIndex: 3,
  } as Element)

  // Headline
  const headlineText = truncate(hero.headline, 50)
  const HEADLINE_FONT = isDisplay ? 60 : 68
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W, fontSize: HEADLINE_FONT, lineHeight: 1.05,
    minLines: 2, maxLines: 4, isDisplay,
  })
  const HEADLINE_Y = 200
  elements.push({
    id: genId('el'), type: 'titulo', headingLevel: 1,
    x: COPY_X, y: HEADLINE_Y, w: COPY_W, h: HEADLINE_H,
    html: headlineText,
    fontSize: HEADLINE_FONT, fontWeight: 900,
    fontFamily: fonts.heading,
    color: '#ffffff', textAlign: 'center',
    lineHeight: 1.05, letterSpacing: -1.5,
    textShadow: 'lg' as never,
    zIndex: 2,
  } as Element)

  // Subhead
  const subheadText = truncate(hero.subheadline, 180)
  const SUBHEAD_W = 620
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: SUBHEAD_W, fontSize: 18, lineHeight: 1.65, minLines: 2, maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 36
  elements.push({
    id: genId('el'), type: 'texto',
    x: Math.round((PAGE_W - SUBHEAD_W) / 2), y: SUBHEAD_Y, w: SUBHEAD_W, h: SUBHEAD_H,
    html: subheadText,
    fontSize: 18, fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center', lineHeight: 1.65,
    textShadow: 'md' as never,
    zIndex: 2,
  } as Element)

  // CTAs
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 40
  const hasSec = Boolean(hero.cta_secondary)
  const ctaW = 280
  const totalCtaW = hasSec ? (ctaW + 16 + 220) : ctaW
  const ctaStartX = Math.round((PAGE_W - totalCtaW) / 2)
  elements.push({
    id: genId('el'), type: 'botao',
    x: ctaStartX, y: ctaY, w: ctaW, h: 60,
    text: hero.cta, link: '#cta',
    bgColor: design.accent, color: '#ffffff',
    fontSize: 16, fontWeight: 800,
    borderRadius: 12, padding: [18, 28],
    shadow: 'xl' as never, zIndex: 3,
  } as Element)
  if (hasSec) {
    elements.push({
      id: genId('el'), type: 'botao',
      x: ctaStartX + ctaW + 16, y: ctaY, w: 220, h: 60,
      text: hero.cta_secondary!, link: '#funcionalidades',
      bgColor: 'rgba(255,255,255,0.12)', color: '#ffffff',
      fontSize: 14, fontWeight: 700,
      borderRadius: 12, padding: [18, 24],
      borders: { width: 1, color: 'rgba(255,255,255,0.5)' },
      zIndex: 3,
    } as Element)
  }

  const dynamicHeroH = Math.max(700, ctaY + 140)

  // Imagem AI ou mockup como BG full-bleed
  if (visual?.hero_data_url) {
    elements.unshift({
      id: genId('el'), type: 'imagem',
      x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
      src: visual.hero_data_url,
      alt: '', objectFit: 'cover',
      zIndex: 0,
    } as Element)
  } else {
    elements.unshift({
      id: genId('el'), type: 'caixa',
      x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
      bgImage: browserMockup(design.primary, design.accent),
      zIndex: 0,
    } as Element)
  }

  // Overlay escuro pra texto ler bem
  elements.unshift({
    id: genId('el'), type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
    bgColor: 'rgba(0,0,0,0.55)',
    zIndex: 1,
  } as Element)

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    bgColor: design.primary,
    elements,
  }
}
