/**
 * Hero variant: IMAGE-BG
 *
 * Imagem AI ocupa o background do hero inteiro (full-bleed). Copy centralizada
 * por cima com overlay escuro neutro pra legibilidade.
 *
 * Mood "premium" / "elegante" — visual marca-forte.
 *
 * AUDITADO 100% — eyebrow preserva emoji do trust_stat original (SVG inline),
 * headline com tamanho ajustado por fonte (Fraunces/Syne são largas), CTAs
 * balanceados, trust stats com SVG icons embaixo, overlay neutro (preto 0.5)
 * em vez de cor primary tinted.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { browserMockup } from '../../decorations'
import { isStatTooWeak, estimateTextHeight, truncate } from '../helpers'
import { swapLeadingEmoji } from '../../icons'

const PAGE_W = 1200

export function buildHeroImageBg(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('HeroImageBg exige hero + design')

  const fonts = getFontStack(design.typography)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const isMono = design.typography === 'monoespacada'
  const elements: Element[] = []

  // Copy largura confortável — não tão larga quanto centered (760 vs 880)
  // porque image-bg tem overlay escuro + texto branco fica mais legível
  // com linhas mais curtas.
  const COPY_W = 780
  const COPY_X = Math.round((PAGE_W - COPY_W) / 2)

  // ── EYEBROW: pill semitransparente preto + SVG do trust_stat original
  const candidate = hero.trust_stats?.[0] ?? ''
  let eyebrowHtml: string
  if (isStatTooWeak(candidate)) {
    eyebrowHtml = `<svg style="display:inline-block;vertical-align:-3px;width:14px;height:14px;margin-right:8px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/></svg>Sob medida pro seu segmento`
  } else {
    eyebrowHtml = swapLeadingEmoji(truncate(candidate, 60), '#ffffff', 14)
  }
  const ebLen = eyebrowHtml.replace(/<svg[\s\S]*?<\/svg>/g, '').length
  const ebW = Math.min(ebLen * 7 + 80, 440)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: Math.round((PAGE_W - ebW) / 2), y: 140, w: ebW, h: 34,
    bgColor: 'rgba(0,0,0,0.45)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1, borderRadius: 17,
    zIndex: 2,
  } as Element)
  elements.push({
    id: genId('el'), type: 'texto',
    x: Math.round((PAGE_W - ebW) / 2), y: 148, w: ebW, h: 20,
    html: eyebrowHtml,
    fontSize: 12, fontWeight: 700,
    color: '#ffffff', textAlign: 'center', zIndex: 3,
  } as Element)

  // ── HEADLINE: limite 80 chars, fonte ajustada pra fontes display largas
  const headlineText = truncate(hero.headline, 80)
  const HEADLINE_FONT = isDisplay ? 52 : 60
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W, fontSize: HEADLINE_FONT, lineHeight: 1.1,
    minLines: 1, maxLines: 4, isDisplay, isMono,
  })
  const HEADLINE_Y = 200
  elements.push({
    id: genId('el'), type: 'titulo', headingLevel: 1,
    x: COPY_X, y: HEADLINE_Y, w: COPY_W, h: HEADLINE_H,
    html: headlineText,
    fontSize: HEADLINE_FONT, fontWeight: 900,
    fontFamily: fonts.heading,
    color: '#ffffff', textAlign: 'center',
    lineHeight: 1.1, letterSpacing: -0.8,
    textShadow: 'lg',  // ajuda legibilidade sobre foto
    zIndex: 2,
  } as Element)

  // ── SUBHEAD
  const subheadText = truncate(hero.subheadline, 200)
  const SUBHEAD_W = 680
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: SUBHEAD_W, fontSize: 18, lineHeight: 1.6, minLines: 1, maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 32
  elements.push({
    id: genId('el'), type: 'texto',
    x: Math.round((PAGE_W - SUBHEAD_W) / 2), y: SUBHEAD_Y, w: SUBHEAD_W, h: SUBHEAD_H,
    html: subheadText,
    fontSize: 18, fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.96)',
    textAlign: 'center', lineHeight: 1.6,
    textShadow: 'md',
    zIndex: 2,
  } as Element)

  // ── CTAs
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 40
  const hasSec = Boolean(hero.cta_secondary)
  const PRIMARY_W = 280
  const SECONDARY_W = 220
  const CTA_GAP = 16
  const totalCtaW = hasSec ? (PRIMARY_W + CTA_GAP + SECONDARY_W) : PRIMARY_W
  const ctaStartX = Math.round((PAGE_W - totalCtaW) / 2)
  elements.push({
    id: genId('el'), type: 'botao',
    x: ctaStartX, y: ctaY, w: PRIMARY_W, h: 60,
    text: truncate(hero.cta, 30), link: '#cta',
    bgColor: design.accent, color: '#ffffff',
    fontSize: 16, fontWeight: 800,
    borderRadius: 12, padding: [18, 28],
    shadow: 'xl', zIndex: 3,
  } as Element)
  if (hasSec) {
    elements.push({
      id: genId('el'), type: 'botao',
      x: ctaStartX + PRIMARY_W + CTA_GAP, y: ctaY, w: SECONDARY_W, h: 60,
      text: truncate(hero.cta_secondary!, 26), link: '#funcionalidades',
      bgColor: 'rgba(255,255,255,0.14)', color: '#ffffff',
      fontSize: 14, fontWeight: 700,
      borderRadius: 12, padding: [18, 24],
      borders: { width: 1, color: 'rgba(255,255,255,0.5)' },
      zIndex: 3,
    } as Element)
  }

  // ── TRUST STATS embaixo dos CTAs (igual centered, com SVG icons)
  let trustEndY = ctaY + 60
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(0, 3)
    if (stats.length) {
      const TRUST_TOTAL_W = 880
      const trustY = ctaY + 96
      const colW = (TRUST_TOTAL_W - (stats.length - 1) * 24) / stats.length
      const trustStartX = Math.round((PAGE_W - TRUST_TOTAL_W) / 2)

      stats.forEach((s, i) => {
        const truncated = truncate(s, 65)
        const withSvg = swapLeadingEmoji(truncated, '#ffffff', 14)
        const sh = estimateTextHeight(truncated, {
          width: colW, fontSize: 13, lineHeight: 1.45,
          minLines: 1, maxLines: 2,
        })
        elements.push({
          id: genId('el'), type: 'texto',
          x: Math.round(trustStartX + i * (colW + 24)),
          y: trustY,
          w: Math.round(colW),
          h: sh,
          html: withSvg,
          fontSize: 13,
          fontFamily: fonts.body,
          color: 'rgba(255,255,255,0.92)',
          textAlign: 'center',
          textShadow: 'sm',
          zIndex: 2,
        } as Element)
        trustEndY = Math.max(trustEndY, trustY + sh)
      })
    }
  }

  const dynamicHeroH = Math.max(700, trustEndY + 80)

  // Overlay PRETO NEUTRO 0.5 — antes era 0.55. Não usa cor primary tinted
  // (que ficava vermelho/verde/etc dependendo da paleta, parecia "filtro
  // colorido"). Preto neutro deixa a imagem AI com cor própria, só escurece
  // pra texto branco ser legível.
  elements.unshift({
    id: genId('el'), type: 'caixa',
    x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
    bgColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  } as Element)

  // Imagem AI ou mockup vai como block.bgImage (full-bleed real)
  const bgImage = visual?.hero_data_url ?? browserMockup(design.primary, design.accent)

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    bgColor: design.primary,
    bgImage,
    bgSize: 'cover',
    elements,
  }
}
