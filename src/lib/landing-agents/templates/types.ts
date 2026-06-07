/**
 * Tipos compartilhados pelos templates de bloco.
 *
 * Cada template é uma função que recebe o contexto da pipeline + a copy da
 * seção e devolve um Block V3 pronto pra ser serializado.
 *
 * O Designer agente escolhe qual template usar via `ctx.design.layout_variants`.
 */

import type { Block } from '@/components/editor/v3/types'
import type { PipelineContext, SectionCopy } from '../types'

export type BlockTemplate<S extends SectionCopy | undefined = SectionCopy> = (
  section: S,
  ctx: PipelineContext,
  meta?: { businessName: string }
) => Block

export type HeroVariant       = 'split' | 'centered' | 'asymmetric'
export type BenefitsVariant   = 'cards' | 'zigzag'
export type SocialProofVariant = 'cards' | 'wall'
export type PricingVariant    = 'cards-3' | 'highlight-center'
export type OfferVariant      = 'splash' | 'banner-cta'

/**
 * Tabela de variantes escolhidas pelo Designer pra essa página.
 * Se não definida, usa variant default (a primeira de cada lista).
 */
export type LayoutVariants = {
  hero?:         HeroVariant
  benefits?:     BenefitsVariant
  social_proof?: SocialProofVariant
  pricing?:      PricingVariant
  offer?:        OfferVariant
}
