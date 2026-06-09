/**
 * Hero variant: CENTERED
 *
 * Copy 100% centralizada, headline grande, sem coluna visual à direita.
 * Imagem AI (se houver) vira backdrop sutil cobrindo o bloco com opacity baixa.
 * Mood "elegante" / "minimalista" / "premium".
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { blobPattern } from '../../decorations'
import { cleanText, isStatTooWeak, estimateTextHeight, truncate } from '../helpers'
import { swapLeadingEmoji } from '../../icons'

const PAGE_W = 1200

export function buildHeroCentered(ctx: PipelineContext): Block {
  const { hero, design, visual } = ctx
  if (!hero || !design) throw new Error('HeroCentered exige hero + design')

  const fonts = getFontStack(design.typography)
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const isMono = design.typography === 'monoespacada'
  const elements: Element[] = []

  // Copy centralizada — largura grande, paddings laterais grandes
  const COPY_W = 840
  const COPY_X = Math.round((PAGE_W - COPY_W) / 2)

  // Eyebrow centralizado
  const candidate = hero.trust_stats?.[0] ?? ''
  const eyebrowText = isStatTooWeak(candidate)
    ? 'Feito sob medida pro seu segmento'
    : cleanText(candidate).replace(/^[^\w]+/, '').slice(0, 50).trim() || 'Feito sob medida'
  const ebW = Math.min(eyebrowText.length * 7 + 60, 400)
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: Math.round((PAGE_W - ebW) / 2), y: 96, w: ebW, h: 32,
    bgColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1,
    borderRadius: 16,
    zIndex: 1,
  } as Element)
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: Math.round((PAGE_W - ebW) / 2) + 14, y: 103, w: ebW - 28, h: 18,
    html: `✨ ${eyebrowText}`,
    fontSize: 12, fontWeight: 700,
    color: '#ffffff', textAlign: 'center', zIndex: 2,
  } as Element)

  // Headline centralizado, fonte display
  const headlineText = truncate(hero.headline, 60)
  const HEADLINE_FONT = isDisplay ? 56 : 64
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W, fontSize: HEADLINE_FONT, lineHeight: 1.06,
    minLines: 2, maxLines: 4, isDisplay, isMono,
  })
  const HEADLINE_Y = 156
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
    textAlign: 'center',
    lineHeight: 1.06,
    letterSpacing: -1.5,
    zIndex: 1,
  } as Element)

  // Subhead centralizada — largura menor pra ficar mais elegante
  const SUBHEAD_FONT = 18
  const SUBHEAD_W = 660
  const subheadText = truncate(hero.subheadline, 200)
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: SUBHEAD_W, fontSize: SUBHEAD_FONT, lineHeight: 1.65,
    minLines: 2, maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 40
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: Math.round((PAGE_W - SUBHEAD_W) / 2), y: SUBHEAD_Y, w: SUBHEAD_W, h: SUBHEAD_H,
    html: subheadText,
    fontSize: SUBHEAD_FONT,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 1.65,
    zIndex: 1,
  } as Element)

  // 2 CTAs centralizados
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 44
  const hasSecondaryCta = Boolean(hero.cta_secondary)
  const ctaW = 260
  const ctaGap = 16
  const totalCtaW = hasSecondaryCta ? (ctaW + ctaGap + 220) : ctaW
  const ctaStartX = Math.round((PAGE_W - totalCtaW) / 2)
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: ctaStartX, y: ctaY, w: ctaW, h: 56,
    text: hero.cta,
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 800,
    borderRadius: 12,
    padding: [16, 28],
    shadow: 'xl',
    zIndex: 2,
  } as Element)
  if (hasSecondaryCta) {
    elements.push({
      id: genId('el'),
      type: 'botao',
      x: ctaStartX + ctaW + ctaGap, y: ctaY, w: 220, h: 56,
      text: hero.cta_secondary!,
      link: '#funcionalidades',
      bgColor: 'rgba(255,255,255,0.10)',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 12,
      padding: [16, 24],
      borders: { width: 1, color: 'rgba(255,255,255,0.40)' },
      zIndex: 2,
    } as Element)
  }

  // Trust stats em linha horizontal (3 colunas com separadores)
  let trustEndY = ctaY + 56
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(0, 3)
    if (stats.length) {
      const TRUST_TOTAL_W = 880
      const trustY = ctaY + 96
      const colW = (TRUST_TOTAL_W - (stats.length - 1) * 16) / stats.length
      const trustStartX = Math.round((PAGE_W - TRUST_TOTAL_W) / 2)

      stats.forEach((s, i) => {
        const truncated = truncate(s, 60)
        const cleaned = swapLeadingEmoji(truncated, '#ffffff', 16)
        const sh = estimateTextHeight(truncated, {
          width: colW, fontSize: 13, lineHeight: 1.45, minLines: 1, maxLines: 2,
        })
        elements.push({
          id: genId('el'),
          type: 'texto',
          x: Math.round(trustStartX + i * (colW + 16)),
          y: trustY, w: Math.round(colW), h: sh,
          html: cleaned,
          fontSize: 13,
          fontFamily: fonts.body,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          zIndex: 1,
        } as Element)
        trustEndY = Math.max(trustEndY, trustY + sh)
      })
    }
  }

  const dynamicHeroH = Math.max(640, trustEndY + 96)

  // Overlay GRADIENT translúcido em CIMA da imagem AI — em vez de retângulo
  // sólido (que criava "quadro escuro" cortando a imagem), usa gradient do
  // primary com alpha variável: mais opaco em cima, transparente embaixo.
  // Texto fica legível sem "cortar" a imagem visualmente.
  if (visual?.hero_data_url) {
    elements.unshift({
      id: genId('el'),
      type: 'caixa',
      x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
      bgColor: `${design.primary}99`,  // 60% alpha
      zIndex: 0,
    } as Element)
  }

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    // Quando tem imagem AI, ela vai como bg (full-width real). Senão, blob pattern.
    // Antes a imagem ia como element com w:1200, sobrava faixa lateral em telas largas.
    bgImage: visual?.hero_data_url ?? blobPattern(design.accent, design.gradient_end),
    bgSize: 'cover',
    elements,
  }
}
