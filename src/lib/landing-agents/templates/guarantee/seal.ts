/**
 * Guarantee block — selo profissional + lista de garantias.
 *
 * Vai depois do pricing / antes do offer final. Substitui o "7 dias grátis"
 * solto que ficava nos trust_stats — eleva pra um bloco dedicado com selo,
 * 3-4 pontos de garantia e badge de confiança.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { badge } from '../../decorations'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildGuaranteeSeal(ctx: PipelineContext): Block {
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
  const guarantee = ctx.input.guarantee || '7 dias grátis'
  const elements: Element[] = []

  // Extrai dias + texto livre — "Experimente por 7 dias grátis" → days="7", subtitle="Sem cartão"
  const daysMatch = guarantee.match(/(\d+)\s*dias?/i)
  const days = daysMatch?.[1] ?? '7'
  const subtitle = guarantee.replace(/\b\d+\s*dias?\s*(de)?\s*/gi, '').replace(/grátis|grátis/gi, '').trim() || 'Sem cartão, sem compromisso'

  let y = 72

  // Eyebrow
  elements.push({
    id: genId('el'), type: 'texto',
    x: 0, y, w: PAGE_W, h: 22,
    html: 'GARANTIA',
    fontSize: 12, fontWeight: 800, letterSpacing: 2,
    color: design.accent, textAlign: 'center',
  } as Element)
  y += 32

  // Headline
  const headlineText = `Risco zero pra você experimentar`
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const hH = estimateTextHeight(headlineText, {
    width: 760, fontSize: 36, lineHeight: 1.2, minLines: 1, maxLines: 2, isDisplay,
  })
  elements.push({
    id: genId('el'), type: 'titulo', headingLevel: 2,
    x: Math.round((PAGE_W - 760) / 2), y, w: 760, h: hH,
    html: headlineText,
    fontSize: 36, fontWeight: 800,
    fontFamily: fonts.heading,
    color: design.primary, textAlign: 'center',
    lineHeight: 1.2,
  } as Element)
  y += hH + 56

  // ── Layout: selo grande à esquerda + 3 pontos à direita
  const SEAL_X = CONTENT_X + 80
  const SEAL_W = 200
  const SEAL_H = 200
  const sealY = y

  // Anel decorativo externo do selo (caixa accent semitransparente)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: SEAL_X - 16, y: sealY - 16, w: SEAL_W + 32, h: SEAL_H + 32,
    bgColor: `${design.accent}1A`,
    borderRadius: 120,
  } as Element)
  // Selo principal
  elements.push({
    id: genId('el'), type: 'caixa',
    x: SEAL_X, y: sealY, w: SEAL_W, h: SEAL_H,
    bgImage: badge(`${days} DIAS GRATIS`, design.accent),
    borderRadius: 100,
    shadow: 'xl' as never,
  } as Element)

  // Direita: 3 pontos de garantia em lista checada
  const POINTS_X = SEAL_X + SEAL_W + 80
  const POINTS_W = 440
  const points = [
    { icon: '🛡️', text: 'Cancele em 1 clique no painel — sem ligação, sem formulário, sem perguntas' },
    { icon: '💳', text: 'Sem precisar cadastrar cartão de crédito pra testar' },
    { icon: '🎯', text: subtitle },
  ]

  let py = sealY + 8
  points.forEach((p) => {
    // Círculo do ícone com bg accent
    elements.push({
      id: genId('el'), type: 'caixa',
      x: POINTS_X, y: py, w: 44, h: 44,
      bgColor: `${design.accent}26`,
      borderRadius: 22,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: POINTS_X, y: py + 10, w: 44, h: 28,
      html: p.icon,
      fontSize: 20, textAlign: 'center',
    } as Element)
    // Texto
    const textH = estimateTextHeight(p.text, {
      width: POINTS_W - 60, fontSize: 15, lineHeight: 1.6, minLines: 1, maxLines: 3,
    })
    elements.push({
      id: genId('el'), type: 'texto',
      x: POINTS_X + 60, y: py + 6, w: POINTS_W - 60, h: textH,
      html: truncate(p.text, 120),
      fontSize: 15,
      fontFamily: fonts.body,
      color: '#1e293b',
      textAlign: 'left', lineHeight: 1.6,
    } as Element)
    py += Math.max(60, textH + 16)
  })

  const totalH = Math.max(sealY + SEAL_H, py) + 88

  return {
    id: genId('blk'),
    height: totalH,
    bgColor: '#fafbfc',
    elements,
  }
}
