/**
 * Social Proof variant: WALL
 *
 * Depoimentos em "muro" assimétrico — primeiro card em destaque grande
 * (depoimento mais longo do array), demais em coluna menor à direita.
 * Inspiração: Linear / Vercel / Notion testimonials.
 *
 * Mais "premium" que grid uniforme. Bom pra páginas com 3-6 depoimentos.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../../types'
import { getFontStack } from '../../fonts'
import { avatarInitial, dotsPattern } from '../../decorations'
import { cleanText, truncate, estimateTextHeight } from '../helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

type Item = { text: string; author: string; role?: string; rating?: number }

export function buildSocialProofWall(section: SectionCopy, ctx: PipelineContext): Block {
  const d = section.data as { eyebrow?: string; headline?: string; items?: Item[] }
  const items = (d.items ?? []).slice(0, 5)
  const design = ctx.design!
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []

  let y = 96
  if (d.eyebrow) {
    const eb = cleanText(d.eyebrow)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: 0, y, w: PAGE_W, h: 24,
      html: eb,
      fontSize: 12, fontWeight: 800, letterSpacing: 2,
      color: 'rgba(255,255,255,0.75)',
      textAlign: 'center',
    } as Element)
    y += 32
  }
  if (d.headline) {
    const headlineText = truncate(d.headline, 80)
    const hH = estimateTextHeight(headlineText, {
      width: 760, fontSize: 38, lineHeight: 1.15, minLines: 1, maxLines: 3,
      isDisplay: design.typography === 'display' || design.typography === 'serif-premium',
    })
    elements.push({
      id: genId('el'),
      type: 'titulo',
      headingLevel: 2,
      x: Math.round((PAGE_W - 760) / 2), y, w: 760, h: hH,
      html: headlineText,
      fontSize: 38, fontWeight: 800,
      fontFamily: fonts.heading,
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.15,
    } as Element)
    y += hH + 56
  }

  // Card grande à esquerda (60% largura) — pega o depoimento mais longo
  if (items.length === 0) {
    return { id: genId('blk'), height: y + 80, bgColor: design.primary, elements }
  }

  // Escolhe o item com texto mais longo pra ser o destaque
  const sortedByLength = [...items].sort((a, b) => (b.text?.length ?? 0) - (a.text?.length ?? 0))
  const featured = sortedByLength[0]
  const rest = items.filter(i => i !== featured).slice(0, 4)

  const FEATURED_W = 580
  const FEATURED_X = CONTENT_X
  const featuredText = truncate(featured.text || '', 320)
  const featuredAuthor = truncate(featured.author || 'Cliente', 30)
  const featuredRole = truncate(featured.role || '', 50)
  const featuredTextH = estimateTextHeight(`"${featuredText}"`, {
    width: FEATURED_W - 64, fontSize: 18, lineHeight: 1.7, minLines: 4, maxLines: 9,
  })
  const FEATURED_H = 132 + featuredTextH + 28 + 64 + 32

  // Card destacado
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: FEATURED_X, y, w: FEATURED_W, h: FEATURED_H,
    bgColor: '#ffffff',
    borderRadius: 22,
    shadow: 'xl' as never,
  } as Element)
  // Aspas grandes
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: FEATURED_X + 32, y: y + 16, w: 80, h: 80,
    html: '"',
    fontSize: 120, fontWeight: 900,
    color: `${design.gradient_end}33`,
    lineHeight: 1, textAlign: 'left',
    fontFamily: 'Georgia, serif',
  } as Element)
  // 5 estrelas
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: FEATURED_X + 32, y: y + 100, w: FEATURED_W - 64, h: 24,
    html: '★'.repeat(featured.rating ?? 5),
    fontSize: 18, color: '#f59e0b', textAlign: 'left', letterSpacing: 3,
  } as Element)
  // Texto do depoimento
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: FEATURED_X + 32, y: y + 132, w: FEATURED_W - 64, h: featuredTextH,
    html: `"${featuredText}"`,
    fontSize: 18, color: '#1e293b', lineHeight: 1.7,
    fontFamily: fonts.body,
    textAlign: 'left',
  } as Element)
  // Autor (avatar + nome + role)
  const authorY = y + 132 + featuredTextH + 28
  elements.push({
    id: genId('el'),
    type: 'caixa',
    x: FEATURED_X + 32, y: authorY, w: 52, h: 52,
    bgImage: avatarInitial(featuredAuthor, design.primary),
    borderRadius: 26,
  } as Element)
  elements.push({
    id: genId('el'),
    type: 'texto',
    x: FEATURED_X + 96, y: authorY + 4, w: FEATURED_W - 128, h: 22,
    html: `<strong>${featuredAuthor}</strong>`,
    fontSize: 15, fontWeight: 700,
    color: design.primary,
    textAlign: 'left',
  } as Element)
  if (featuredRole) {
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: FEATURED_X + 96, y: authorY + 28, w: FEATURED_W - 128, h: 20,
      html: featuredRole,
      fontSize: 13, color: '#64748b', textAlign: 'left',
    } as Element)
  }

  // Coluna direita — cards menores empilhados verticalmente
  const RIGHT_X = CONTENT_X + FEATURED_W + 24
  const RIGHT_W = CONTENT_W - FEATURED_W - 24
  let ry = y
  const gap = 16

  rest.forEach((t) => {
    const text = truncate(t.text || '', 140)
    const author = truncate(t.author || 'Cliente', 26)
    const role = truncate(t.role || '', 36)
    const textH = estimateTextHeight(`"${text}"`, {
      width: RIGHT_W - 48, fontSize: 14, lineHeight: 1.65, minLines: 2, maxLines: 5,
    })
    const cardH = 24 + textH + 16 + 44 + 20

    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: RIGHT_X, y: ry, w: RIGHT_W, h: cardH,
      bgColor: '#ffffff',
      borderRadius: 16,
      shadow: 'md' as never,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: RIGHT_X + 20, y: ry + 14, w: RIGHT_W - 40, h: 16,
      html: '★'.repeat(t.rating ?? 5),
      fontSize: 12, color: '#f59e0b', letterSpacing: 1, textAlign: 'left',
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: RIGHT_X + 20, y: ry + 36, w: RIGHT_W - 40, h: textH,
      html: `"${text}"`,
      fontSize: 14, color: '#475569', lineHeight: 1.65,
      fontFamily: fonts.body,
      textAlign: 'left',
    } as Element)
    // Autor inline (avatar + nome)
    const ay = ry + 36 + textH + 16
    elements.push({
      id: genId('el'),
      type: 'caixa',
      x: RIGHT_X + 20, y: ay, w: 32, h: 32,
      bgImage: avatarInitial(author, design.primary),
      borderRadius: 16,
    } as Element)
    elements.push({
      id: genId('el'),
      type: 'texto',
      x: RIGHT_X + 64, y: ay + 4, w: RIGHT_W - 84, h: 22,
      html: `<strong>${author}</strong>${role ? ` <span style="color:#94a3b8;font-weight:400"> · ${role}</span>` : ''}`,
      fontSize: 12,
      color: design.primary,
      textAlign: 'left',
    } as Element)

    ry += cardH + gap
  })

  // Altura final = maior entre featured e right column
  const bottomY = Math.max(y + FEATURED_H, ry)

  return {
    id: genId('blk'),
    height: bottomY + 96,
    bgGradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: design.primary, pos: 0 },
        { color: design.gradient_end, pos: 100 },
      ],
    },
    // Dots pattern como bg do block — full width
    bgImage: dotsPattern('#ffffff'),
    bgSize: 'auto',
    elements,
  }
}
