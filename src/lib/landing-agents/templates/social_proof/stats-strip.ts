/**
 * Social Proof variant: STATS-STRIP
 *
 * Faixa horizontal compacta com 3-4 stats grandes (números/metricas)
 * extraídos dos depoimentos ou trust_stats da estratégia.
 * Bom pra quando depoimentos textuais não vingam.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildSocialProofStatsStrip(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Array<{ text: string; author: string; role?: string; rating?: number }> }
  const items = (d.items ?? []).slice(0, 4)
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []

  // Extrai números/dados dos depoimentos ou inventa stats genéricas
  // Fallback usa trust_stats da estratégia se houver
  const trust = ctx.hero?.trust_stats ?? []
  const stats: Array<{ value: string; label: string }> = []

  // Tenta achar números no texto dos depoimentos
  const numberRegex = /(\d+[%.]?\d*)\s*([a-zàâãéêíóôõúç]+(?:\s+[a-zàâãéêíóôõúç]+){0,3})/i
  for (const t of items) {
    const m = t.text?.match(numberRegex)
    if (m && stats.length < 4) {
      stats.push({ value: m[1], label: m[2].slice(0, 20) })
    }
  }
  // Complementa com trust_stats
  while (stats.length < 4 && stats.length < trust.length) {
    const stat = trust[stats.length]
    const cleaned = cleanText(stat).replace(/^[^\w]+/, '')
    const parts = cleaned.split(/\s+/)
    stats.push({
      value: parts[0]?.slice(0, 8) || '+',
      label: parts.slice(1).join(' ').slice(0, 28),
    })
  }
  // Fallback fixo
  while (stats.length < 3) {
    const fallbacks = [
      { value: '100%', label: 'satisfação garantida' },
      { value: '7', label: 'dias grátis' },
      { value: '1 dia', label: 'pra começar a usar' },
    ]
    stats.push(fallbacks[stats.length])
  }

  let y = 96
  if (d.eyebrow) {
    elements.push({
      id: genId('el'), type: 'texto',
      x: 0, y, w: PAGE_W, h: 22,
      html: cleanText(d.eyebrow),
      fontSize: 12, fontWeight: 800, letterSpacing: 2,
      color: 'rgba(255,255,255,0.8)', textAlign: 'center',
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
      color: '#ffffff', textAlign: 'center',
      lineHeight: 1.15,
    } as Element)
    y += hH + 48
  }

  // Faixa de stats
  const n = stats.length
  const cellW = CONTENT_W / n
  stats.forEach((s, i) => {
    const cx = CONTENT_X + i * cellW
    elements.push({
      id: genId('el'), type: 'texto',
      x: cx, y, w: cellW, h: 80,
      html: s.value,
      fontSize: 64, fontWeight: 900,
      fontFamily: fonts.heading,
      color: design.accent, textAlign: 'center',
      lineHeight: 1,
      letterSpacing: -1,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: cx + 16, y: y + 96, w: cellW - 32, h: 48,
      html: s.label,
      fontSize: 14, fontFamily: fonts.body,
      color: 'rgba(255,255,255,0.85)',
      textAlign: 'center', lineHeight: 1.4,
    } as Element)
    if (i < n - 1) {
      // Separador vertical fininho
      elements.push({
        id: genId('el'), type: 'caixa',
        x: cx + cellW - 1, y: y + 16, w: 1, h: 120,
        bgColor: 'rgba(255,255,255,0.15)',
      } as Element)
    }
  })

  return {
    id: genId('blk'),
    height: y + 200,
    bgGradient: {
      type: 'linear', angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    elements,
  }
}
