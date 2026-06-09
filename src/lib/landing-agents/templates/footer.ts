/**
 * Footer — sempre presente no final da página.
 *
 * Logo + tagline + 3 colunas de links (produto, empresa, legal) + © year.
 * Tema light/dark adaptado pra contraste com o offer anterior.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../types'
import { getFontStack } from '../fonts'
import { cleanText } from './helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

export function buildFooter(ctx: PipelineContext, businessName: string): Block {
  const design = ctx.design!
  const research = ctx.research
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []
  const FOOTER_H = 320

  // Cor de fundo: azul-cinza escuro independente da paleta (sempre footer escuro).
  const bg = '#0f172a'
  const textColor = 'rgba(255,255,255,0.7)'
  const titleColor = '#ffffff'
  const linkColor = 'rgba(255,255,255,0.85)'

  let y = 64
  // ── Coluna esquerda: logo + tagline
  if (research?.logo_url) {
    elements.push({
      id: genId('el'), type: 'imagem',
      x: CONTENT_X, y, w: 160, h: 40,
      src: research.logo_url,
      alt: businessName,
      objectFit: 'contain',
    } as Element)
  } else {
    elements.push({
      id: genId('el'), type: 'texto',
      x: CONTENT_X, y, w: 240, h: 32,
      html: cleanText(businessName),
      fontSize: 22, fontWeight: 800,
      fontFamily: fonts.heading,
      color: titleColor, textAlign: 'left',
    } as Element)
  }
  // Tagline
  const tagline = ctx.strategy?.promise
    ? cleanText(ctx.strategy.promise).slice(0, 100)
    : ''
  if (tagline) {
    elements.push({
      id: genId('el'), type: 'texto',
      x: CONTENT_X, y: y + 56, w: 320, h: 64,
      html: tagline,
      fontSize: 14,
      fontFamily: fonts.body,
      color: textColor, textAlign: 'left', lineHeight: 1.6,
    } as Element)
  }

  // ── Coluna meio: links Produto
  const COL_W = 180
  const col2X = CONTENT_X + 380
  const col3X = col2X + COL_W + 40
  const col4X = col3X + COL_W + 40

  const productLinks = [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Preços', href: '#precos' },
    { label: 'Perguntas', href: '#faq' },
  ]
  const companyLinks = [
    { label: 'Sobre', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contato', href: '#' },
  ]
  const legalLinks = [
    { label: 'Termos de uso', href: '#' },
    { label: 'Política de privacidade', href: '#' },
    { label: 'LGPD', href: '#' },
  ]

  renderColumn('Produto', productLinks, col2X, y, elements, { titleColor, linkColor, fonts })
  renderColumn('Empresa', companyLinks, col3X, y, elements, { titleColor, linkColor, fonts })
  renderColumn('Legal',   legalLinks,   col4X, y, elements, { titleColor, linkColor, fonts })

  // ── Linha separadora + copyright
  elements.push({
    id: genId('el'), type: 'caixa',
    x: CONTENT_X, y: FOOTER_H - 80, w: CONTENT_W, h: 1,
    bgColor: 'rgba(255,255,255,0.12)',
  } as Element)
  const year = new Date().getFullYear()
  elements.push({
    id: genId('el'), type: 'texto',
    x: CONTENT_X, y: FOOTER_H - 56, w: CONTENT_W, h: 24,
    html: `© ${year} ${cleanText(businessName)}. Todos os direitos reservados.`,
    fontSize: 13,
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  } as Element)

  return {
    id: genId('blk'),
    height: FOOTER_H,
    bgColor: bg,
    elements,
  }
}

function renderColumn(
  title: string,
  links: Array<{ label: string; href: string }>,
  x: number,
  y: number,
  elements: Element[],
  ctx: { titleColor: string; linkColor: string; fonts: ReturnType<typeof getFontStack> },
): void {
  elements.push({
    id: genId('el'), type: 'texto',
    x, y, w: 180, h: 22,
    html: title.toUpperCase(),
    fontSize: 12, fontWeight: 800, letterSpacing: 2,
    color: ctx.titleColor,
    fontFamily: ctx.fonts.body,
    textAlign: 'left',
  } as Element)
  let ly = y + 36
  for (const l of links) {
    elements.push({
      id: genId('el'), type: 'texto',
      x, y: ly, w: 180, h: 22,
      html: `<a href="${l.href}" style="color:inherit;text-decoration:none">${l.label}</a>`,
      fontSize: 14,
      fontFamily: ctx.fonts.body,
      color: ctx.linkColor,
      textAlign: 'left',
    } as Element)
    ly += 28
  }
}
