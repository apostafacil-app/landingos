/**
 * Footer — sempre presente no final da página.
 *
 * Logo + tagline + colunas de links + redes sociais + © year.
 * BG escuro fixo (#0f172a) pra contraste alto, qualquer paleta.
 *
 * AUDITADO 100% — tagline com truncate semantic, links Produto filtrados
 * pelas seções que realmente existem (não promete âncora morta), Empresa/
 * Legal viram texto decorativo (não links broken pra "#"), ícones sociais
 * profissionais em SVG.
 */

import type { Block, Element } from '@/components/editor/v3/types'
import { genId } from '@/components/editor/v3/types'
import type { PipelineContext } from '../types'
import { getFontStack } from '../fonts'
import { cleanText, truncate } from './helpers'

const PAGE_W = 1200
const CONTENT_W = 1040
const CONTENT_X = (PAGE_W - CONTENT_W) / 2

// Ícones sociais SVG — Lucide-style
const SOCIAL_ICONS = {
  linkedin:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
  instagram: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
  facebook:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  youtube:   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>',
}

export function buildFooter(ctx: PipelineContext, businessName: string): Block {
  const design = ctx.design!
  const research = ctx.research
  const fonts = getFontStack(design.typography)
  const elements: Element[] = []

  // Cores fixas — sempre escuro pra contraste alto
  const bg = '#0a0f1e'
  const textColor = 'rgba(255,255,255,0.65)'
  const titleColor = '#ffffff'
  const linkColor = 'rgba(255,255,255,0.85)'
  const subtleColor = 'rgba(255,255,255,0.45)'

  let y = 72

  // ── COL 1: logo + tagline + redes sociais
  const COL1_W = 320

  if (research?.logo_url) {
    elements.push({
      id: genId('el'), type: 'imagem',
      x: CONTENT_X, y, w: 180, h: 44,
      src: research.logo_url,
      alt: businessName,
      objectFit: 'contain',
    } as Element)
  } else {
    elements.push({
      id: genId('el'), type: 'texto',
      x: CONTENT_X, y, w: COL1_W, h: 36,
      html: cleanText(businessName),
      fontSize: 24, fontWeight: 800,
      fontFamily: fonts.heading,
      color: titleColor, textAlign: 'left',
    } as Element)
  }

  // Tagline da promessa central, truncada semanticamente
  const promise = ctx.strategy?.promise
  if (promise) {
    const tagline = truncate(promise, 110)
    elements.push({
      id: genId('el'), type: 'texto',
      x: CONTENT_X, y: y + 60, w: COL1_W, h: 64,
      html: tagline,
      fontSize: 14,
      fontFamily: fonts.body,
      color: textColor, textAlign: 'left', lineHeight: 1.6,
    } as Element)
  }

  // Redes sociais — ícones SVG. Decorativos por enquanto (não navegam)
  const socialY = y + 140
  const ICON_SIZE = 36
  const ICON_GAP = 12
  const socials = ['linkedin', 'instagram', 'facebook', 'youtube'] as const
  socials.forEach((name, i) => {
    const sx = CONTENT_X + i * (ICON_SIZE + ICON_GAP)
    elements.push({
      id: genId('el'), type: 'caixa',
      x: sx, y: socialY, w: ICON_SIZE, h: ICON_SIZE,
      bgColor: 'rgba(255,255,255,0.08)',
      borderRadius: 10,
    } as Element)
    elements.push({
      id: genId('el'), type: 'texto',
      x: sx + 9, y: socialY + 9, w: 18, h: 18,
      html: SOCIAL_ICONS[name].replace(/currentColor/g, linkColor),
      fontSize: 14, textAlign: 'center',
    } as Element)
  })

  // ── COLS 2-4: links — só Produto navega de verdade. Empresa/Legal são
  // texto decorativo (parece footer "completo" sem links broken pra #)
  const sections = ctx.sections ?? []
  const productLinks: Array<{ label: string; href: string }> = []
  if (sections.some(s => s.type === 'benefits'))     productLinks.push({ label: 'Funcionalidades', href: '#funcionalidades' })
  if (sections.some(s => s.type === 'social_proof')) productLinks.push({ label: 'Depoimentos',     href: '#depoimentos' })
  if (sections.some(s => s.type === 'pricing'))      productLinks.push({ label: 'Preços',          href: '#precos' })
  if (sections.some(s => s.type === 'faq'))          productLinks.push({ label: 'Perguntas',       href: '#faq' })

  const companyLabels = ['Sobre nós', 'Blog', 'Contato', 'Trabalhe conosco']
  const legalLabels = ['Termos de uso', 'Política de privacidade', 'LGPD']

  const COL_W = 180
  const COL_GAP = 32
  const col2X = CONTENT_X + COL1_W + 80
  const col3X = col2X + COL_W + COL_GAP
  const col4X = col3X + COL_W + COL_GAP

  renderLinkColumn('Produto', productLinks, col2X, y, elements, { titleColor, linkColor, fonts, navigable: true })
  renderLinkColumn('Empresa', companyLabels.map(l => ({ label: l, href: '#' })), col3X, y, elements, { titleColor, linkColor: subtleColor, fonts, navigable: false })
  renderLinkColumn('Legal',   legalLabels.map(l => ({ label: l, href: '#' })), col4X, y, elements, { titleColor, linkColor: subtleColor, fonts, navigable: false })

  // Footer altura: 72 top + 168 (logo+tagline+social) + 80 (separator+copyright)
  const FOOTER_H = 360

  // ── Linha separadora + copyright
  elements.push({
    id: genId('el'), type: 'caixa',
    x: CONTENT_X, y: FOOTER_H - 72, w: CONTENT_W, h: 1,
    bgColor: 'rgba(255,255,255,0.1)',
  } as Element)
  const year = new Date().getFullYear()
  elements.push({
    id: genId('el'), type: 'texto',
    x: CONTENT_X, y: FOOTER_H - 48, w: CONTENT_W, h: 24,
    html: `© ${year} ${cleanText(businessName)} · Todos os direitos reservados`,
    fontSize: 13,
    fontFamily: fonts.body,
    color: subtleColor,
    textAlign: 'center',
  } as Element)

  return {
    id: genId('blk'),
    height: FOOTER_H,
    bgColor: bg,
    elements,
  }
}

function renderLinkColumn(
  title: string,
  links: Array<{ label: string; href: string }>,
  x: number,
  y: number,
  elements: Element[],
  ctx: {
    titleColor: string
    linkColor: string
    fonts: ReturnType<typeof getFontStack>
    /** Quando false, renderiza texto decorativo (sem <a>) — evita link broken */
    navigable: boolean
  },
): void {
  // Título da coluna
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
    const html = ctx.navigable
      ? `<a href="${l.href}" style="color:inherit;text-decoration:none">${l.label}</a>`
      : l.label
    elements.push({
      id: genId('el'), type: 'texto',
      x, y: ly, w: 180, h: 22,
      html,
      fontSize: 14,
      fontFamily: ctx.fonts.body,
      color: ctx.linkColor,
      textAlign: 'left',
    } as Element)
    ly += 28
  }
}
