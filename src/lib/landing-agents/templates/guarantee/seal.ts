/**
 * Guarantee block — selo profissional grande + lista de garantias.
 *
 * Selo circular à esquerda com "N DIAS GRÁTIS" (N grande dramático),
 * lista de garantias à direita com ícones SVG profissionais.
 *
 * AUDITADO 100% — número do selo grande e legível, ícones SVG Lucide
 * (não emoji), texto dos pontos sempre faz sentido (não extrai do
 * input.guarantee), espaçamento equilibrado.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../../types'
import { getFontStack } from '../../fonts'
import { badge } from '../../decorations'
import { cleanText, truncate, estimateTextHeight } from '../helpers'
import { iconSvg } from '../../icons'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildGuaranteeSeal(ctx: PipelineContext): Block {
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
  const guarantee = ctx.input.guarantee || '7 dias grátis'
  const isDisplay = design.typography === 'display' || design.typography === 'serif-premium'
  const elements: Element[] = []

  // Extrai número de dias do briefing
  const daysMatch = guarantee.match(/(\d+)\s*dias?/i)
  const days = daysMatch?.[1] ?? '7'

  let y = 80

  // ── EYEBROW
  elements.push({
    id: genId('el'), type: 'texto',
    x: 0, y, w: PAGE_W, h: 22,
    html: 'GARANTIA',
    fontSize: 12, fontWeight: 800, letterSpacing: 2,
    color: design.accent, textAlign: 'center',
  } as Element)
  y += 32

  // ── HEADLINE
  const headlineText = 'Risco zero pra você experimentar'
  const hH = estimateTextHeight(headlineText, {
    width: 760, fontSize: 36, lineHeight: 1.2,
    minLines: 1, maxLines: 2, isDisplay,
  })
  elements.push({
    id: genId('el'), type: 'titulo', headingLevel: 2,
    x: Math.round((PAGE_W - 760) / 2), y, w: 760, h: hH,
    html: headlineText,
    fontSize: 36, fontWeight: 800,
    fontFamily: fonts.heading,
    color: design.primary, textAlign: 'center',
    lineHeight: 1.2,
    letterSpacing: -0.5,
  } as Element)
  y += hH + 64

  // ── LAYOUT: selo grande à esquerda + 3 pontos à direita
  const SEAL_SIZE = 220
  const SEAL_X = CONTENT_X + 60
  const sealY = y - 20

  // Anel decorativo externo do selo (caixa accent semitransparente)
  elements.push({
    id: genId('el'), type: 'caixa',
    x: SEAL_X - 18, y: sealY - 18, w: SEAL_SIZE + 36, h: SEAL_SIZE + 36,
    bgColor: `${design.accent}1A`,
    borderRadius: 140,
  } as Element)

  // Selo principal
  elements.push({
    id: genId('el'), type: 'caixa',
    x: SEAL_X, y: sealY, w: SEAL_SIZE, h: SEAL_SIZE,
    bgImage: badge(`${days} DIAS GRÁTIS`, design.accent),
    borderRadius: 120,
    shadow: 'xl',
  } as Element)

  // ── PONTOS DE GARANTIA à direita
  const POINTS_X = SEAL_X + SEAL_SIZE + 80
  const POINTS_W = 540

  const points = [
    {
      iconName: 'refresh',
      text: 'Cancele em 1 clique no painel — sem ligação, sem formulário, sem perguntas',
    },
    {
      iconName: 'lock',
      text: 'Sem cadastrar cartão de crédito — você só paga se decidir continuar',
    },
    {
      iconName: 'message',
      text: 'Suporte humano por chat ou WhatsApp desde o primeiro dia',
    },
  ]

  let py = sealY + 16
  const POINT_GAP = 24

  points.forEach((p) => {
    // Círculo do ícone com bg accent translúcido
    elements.push({
      id: genId('el'), type: 'caixa',
      x: POINTS_X, y: py, w: 48, h: 48,
      bgColor: `${design.accent}1F`,
      borderRadius: 24,
    } as Element)
    // SVG icon dentro do círculo
    elements.push({
      id: genId('el'), type: 'texto',
      x: POINTS_X + 12, y: py + 12, w: 24, h: 24,
      html: iconSvg(p.iconName, design.accent),
      fontSize: 12, textAlign: 'center',
    } as Element)
    // Texto do ponto
    const textW = POINTS_W - 72
    const textH = estimateTextHeight(p.text, {
      width: textW, fontSize: 15, lineHeight: 1.6,
      minLines: 1, maxLines: 3,
    })
    elements.push({
      id: genId('el'), type: 'texto',
      x: POINTS_X + 72, y: py + 10, w: textW, h: textH,
      html: p.text,
      fontSize: 15,
      fontFamily: fonts.body,
      color: '#1e293b',
      textAlign: 'left', lineHeight: 1.6,
    } as Element)
    py += Math.max(56 + POINT_GAP, textH + POINT_GAP)
  })

  // Altura final acomoda selo + pontos + padding bottom
  const totalH = Math.max(sealY + SEAL_SIZE, py) + 80

  return {
    id: genId('blk'),
    height: totalH,
    bgColor: '#fafbfc',
    elements,
  }
}
