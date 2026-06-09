/**
 * Hero variant: CENTERED
 *
 * Copy 100% centralizada, sem coluna visual à direita.
 * Quando há imagem AI: vira backdrop full-bleed + overlay sutil.
 * Senão: gradient + blob pattern decorativo.
 *
 * Mood "elegante" / "minimalista" / "premium".
 *
 * AUDITADO 100% — sem overlay "quadro preto", eyebrow preserva ícone do
 * trust_stat original, headline com tamanho ajustado por fonte, CTAs
 * visualmente balanceados.
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

  // Copy centralizada — largura generosa, paddings laterais limpos
  const COPY_W = 880
  const COPY_X = Math.round((PAGE_W - COPY_W) / 2)

  // ── EYEBROW: preserva o emoji ORIGINAL do trust_stat (não força ✨ fixo).
  // Caso 1: trust_stat tem "🏆 ERP exclusivo..." → renderiza com ícone SVG trophy
  // Caso 2: trust_stat fraco/vazio → usa fallback "Feito sob medida..."
  const candidate = hero.trust_stats?.[0] ?? ''
  let eyebrowHtml: string
  if (isStatTooWeak(candidate)) {
    eyebrowHtml = `<svg style="display:inline-block;vertical-align:-3px;width:14px;height:14px;margin-right:8px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/></svg>Feito sob medida pro seu segmento`
  } else {
    const truncated = truncate(candidate, 70)
    eyebrowHtml = swapLeadingEmoji(truncated, '#ffffff', 14)
  }
  // Estima largura do eyebrow pra centralizar pill
  const eyebrowTextLen = eyebrowHtml.replace(/<svg[\s\S]*?<\/svg>/g, '').length
  const ebW = Math.min(eyebrowTextLen * 7 + 80, 480)
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: Math.round((PAGE_W - ebW) / 2), y: 100, w: ebW, h: 34,
    bgColor: 'rgba(255,255,255,0.16)',
    borderColor: 'rgba(255,255,255,0.32)',
    borderWidth: 1,
    borderRadius: 17,
    zIndex: 2,
  } as Element)
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: Math.round((PAGE_W - ebW) / 2), y: 108, w: ebW, h: 20,
    html: eyebrowHtml,
    fontSize: 12, fontWeight: 700,
    color: '#ffffff', textAlign: 'center', zIndex: 3,
  } as Element)

  // ── HEADLINE: limite 80 chars, fonte ajustada à largura disponível
  const headlineText = truncate(hero.headline, 80)
  // Display/serif: 48px (Fraunces/Syne são largas). System/sans: 60px.
  const HEADLINE_FONT = isDisplay ? 48 : 60
  const HEADLINE_H = estimateTextHeight(headlineText, {
    width: COPY_W, fontSize: HEADLINE_FONT, lineHeight: 1.1,
    minLines: 1, maxLines: 4, isDisplay, isMono,
  })
  const HEADLINE_Y = 168
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
    lineHeight: 1.1,
    letterSpacing: -0.8,
    zIndex: 2,
  } as Element)

  // ── SUBHEAD: largura confortável (720), gap respiratório do headline
  const SUBHEAD_FONT = 18
  const SUBHEAD_W = 720
  const subheadText = truncate(hero.subheadline, 200)
  const SUBHEAD_H = estimateTextHeight(subheadText, {
    width: SUBHEAD_W, fontSize: SUBHEAD_FONT, lineHeight: 1.6,
    minLines: 1, maxLines: 4,
  })
  const SUBHEAD_Y = HEADLINE_Y + HEADLINE_H + 32
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: Math.round((PAGE_W - SUBHEAD_W) / 2), y: SUBHEAD_Y, w: SUBHEAD_W, h: SUBHEAD_H,
    html: subheadText,
    fontSize: SUBHEAD_FONT,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 1.6,
    zIndex: 2,
  } as Element)

  // ── CTAs centralizados — primary maior que ghost (balanço visual)
  const ctaY = SUBHEAD_Y + SUBHEAD_H + 40
  const hasSec = Boolean(hero.cta_secondary)
  const PRIMARY_W = 260
  const SECONDARY_W = 200
  const CTA_GAP = 16
  const totalCtaW = hasSec ? (PRIMARY_W + CTA_GAP + SECONDARY_W) : PRIMARY_W
  const ctaStartX = Math.round((PAGE_W - totalCtaW) / 2)
  elements.push({
    id: genId('el'),
    type: 'botao',
    x: ctaStartX, y: ctaY, w: PRIMARY_W, h: 58,
    text: truncate(hero.cta, 30),
    link: '#cta',
    bgColor: design.accent,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 800,
    borderRadius: 12,
    padding: [18, 28],
    shadow: 'xl',
    zIndex: 3,
  } as Element)
  if (hasSec) {
    elements.push({
      id: genId('el'),
      type: 'botao',
      x: ctaStartX + PRIMARY_W + CTA_GAP, y: ctaY, w: SECONDARY_W, h: 58,
      text: truncate(hero.cta_secondary!, 26),
      link: '#funcionalidades',
      bgColor: 'rgba(255,255,255,0.12)',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 700,
      borderRadius: 12,
      padding: [18, 24],
      borders: { width: 1, color: 'rgba(255,255,255,0.4)' },
      zIndex: 3,
    } as Element)
  }

  // ── TRUST STATS: linha horizontal abaixo dos CTAs, ícones SVG (não emoji)
  let trustEndY = ctaY + 58
  if (hero.trust_stats?.length) {
    const stats = hero.trust_stats
      .filter(s => !isStatTooWeak(s))
      .slice(0, 3)
    if (stats.length) {
      const TRUST_TOTAL_W = 920
      const trustY = ctaY + 96
      const colW = (TRUST_TOTAL_W - (stats.length - 1) * 24) / stats.length
      const trustStartX = Math.round((PAGE_W - TRUST_TOTAL_W) / 2)

      stats.forEach((s, i) => {
        const truncated = truncate(s, 70)
        const withSvg = swapLeadingEmoji(truncated, '#ffffff', 16)
        const sh = estimateTextHeight(truncated, {
          width: colW, fontSize: 14, lineHeight: 1.45,
          minLines: 1, maxLines: 2,
        })
        elements.push({
          id: genId('el'),
          type: 'texto',
          x: Math.round(trustStartX + i * (colW + 24)),
          y: trustY,
          w: Math.round(colW),
          h: sh,
          html: withSvg,
          fontSize: 14,
          fontFamily: fonts.body,
          color: 'rgba(255,255,255,0.92)',
          textAlign: 'center',
          zIndex: 2,
        } as Element)
        trustEndY = Math.max(trustEndY, trustY + sh)
      })
    }
  }

  const dynamicHeroH = Math.max(640, trustEndY + 80)

  // ── OVERLAY sobre imagem AI: preto neutro 0.45 (não cor primary).
  // Cor primary podia ficar muito tinted (vermelho/verde/etc) parecendo
  // 'quadro colorido'. Preto neutro deixa a imagem com cor própria, só
  // escurece levemente pra texto branco ler bem.
  if (visual?.hero_data_url) {
    elements.unshift({
      id: genId('el'),
      type: 'caixa',
      x: 0, y: 0, w: PAGE_W, h: dynamicHeroH,
      bgColor: 'rgba(0,0,0,0.45)',
      zIndex: 1,
    } as Element)
  }

  return {
    id: genId('blk'),
    height: dynamicHeroH,
    // Quando tem imagem: bgImage cobre full-bleed. bgGradient como fallback.
    // Quando não tem imagem: blob pattern + gradient mostra cor da paleta.
    bgGradient: visual?.hero_data_url ? undefined : {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    bgColor: design.primary,
    bgImage: visual?.hero_data_url ?? blobPattern(design.accent, design.gradient_end),
    bgSize: 'cover',
    elements,
  }
}
