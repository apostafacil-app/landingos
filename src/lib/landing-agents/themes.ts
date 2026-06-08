/**
 * Design Themes — combos coordenados de tipografia + variants + tom.
 *
 * Em vez do Designer escolher cada eixo isoladamente (que gera combinações
 * incoerentes), ele escolhe 1 theme inteiro. Cada theme tem identidade própria
 * inspirada em landing pages reconhecidas.
 *
 * Funciona como "estilo de referência" — o output sempre vai parecer com a
 * marca-referência, mas com a copy e cores específicas do briefing.
 */

import type { DesignSystem } from './types'

export type ThemeId = 'stripe' | 'linear' | 'notion' | 'vercel' | 'apple' | 'webflow' | 'default'

export type DesignTheme = {
  id: ThemeId
  name: string
  description: string  // pra o Designer agente decidir
  /** Categorias de mood que combinam */
  moods: Array<'clean' | 'bold' | 'elegante' | 'energetico' | 'minimalista'>
  typography: DesignSystem['typography']
  variants: NonNullable<DesignSystem['layout_variants']>
}

export const THEMES: DesignTheme[] = [
  {
    id: 'default',
    name: 'Padrão (split / cards)',
    description: 'B2B previsível. Hero split, benefits grid, cards uniformes. Mais seguro.',
    moods: ['clean'],
    typography: 'display',
    variants: {
      hero: 'split', benefits: 'cards', social_proof: 'cards',
      pricing: 'cards-3', comparison: 'table', faq: 'accordion', offer: 'splash',
    },
  },
  {
    id: 'stripe',
    name: 'Stripe-style',
    description: 'Limpo, geometric, B2B premium. Outfit + Inter, hero split, cards uniformes, comparison side-by-side.',
    moods: ['clean', 'bold'],
    typography: 'modern',
    variants: {
      hero: 'split', benefits: 'cards', social_proof: 'cards',
      pricing: 'highlight-center', comparison: 'side-by-side', faq: 'accordion', offer: 'splash',
    },
  },
  {
    id: 'linear',
    name: 'Linear-style',
    description: 'Minimalista premium tech. Cal/Inter, hero centered, benefits zigzag, social proof wall.',
    moods: ['minimalista', 'elegante'],
    typography: 'cal',
    variants: {
      hero: 'centered', benefits: 'zigzag', social_proof: 'wall',
      pricing: 'highlight-center', comparison: 'side-by-side', faq: 'two-col', offer: 'splash',
    },
  },
  {
    id: 'notion',
    name: 'Notion-style',
    description: 'Editorial moderno, friendly. Fraunces + Inter, benefits icons-grid, social wall.',
    moods: ['clean', 'elegante'],
    typography: 'editorial',
    variants: {
      hero: 'centered', benefits: 'icons-grid', social_proof: 'wall',
      pricing: 'cards-3', comparison: 'table', faq: 'two-col', offer: 'splash',
    },
  },
  {
    id: 'vercel',
    name: 'Vercel-style',
    description: 'Black + accents, brutalmente direto. Display heavy, image-bg no hero, stats-strip.',
    moods: ['bold', 'energetico'],
    typography: 'display',
    variants: {
      hero: 'image-bg', benefits: 'icons-grid', social_proof: 'stats-strip',
      pricing: 'highlight-center', comparison: 'side-by-side', faq: 'two-col', offer: 'image-bg',
    },
  },
  {
    id: 'apple',
    name: 'Apple-style',
    description: 'Premium luxo, imagens dominam. Image-bg em tudo, copy curta, ar generoso.',
    moods: ['elegante', 'minimalista'],
    typography: 'modern',
    variants: {
      hero: 'image-bg', benefits: 'zigzag', social_proof: 'wall',
      pricing: 'cards-3', comparison: 'table', faq: 'accordion', offer: 'image-bg',
    },
  },
  {
    id: 'webflow',
    name: 'Webflow-style',
    description: 'Criativo ousado, playful. Bricolage + DM Sans, asymmetric, comparison side-by-side.',
    moods: ['energetico', 'bold'],
    typography: 'playful',
    variants: {
      hero: 'asymmetric', benefits: 'icons-grid', social_proof: 'stats-strip',
      pricing: 'highlight-center', comparison: 'side-by-side', faq: 'two-col', offer: 'splash',
    },
  },
]

export function getThemeById(id: string | undefined): DesignTheme {
  return THEMES.find(t => t.id === id) ?? THEMES[0]
}
