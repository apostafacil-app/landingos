/**
 * Agente 5 — Copywriter de Hero
 *
 * Hero é o componente de maior alavancagem: 80% dos visitantes decidem rolar
 * (ou não) baseado no que veem aqui. Por isso, agente dedicado, modelo top,
 * temperatura alta.
 *
 * Lê: ctx.strategy, ctx.architecture
 * Escreve: ctx.hero
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, HeroCopy } from '../types'

const SYSTEM = `Você é o melhor copywriter PT-BR para hero sections de landing pages.

REGRAS:
- Headline: transformação CONCRETA, máximo 9 palavras. Sem jargão. Sem "solução completa", "produtividade", "inovação".
- Subheadline: 1-2 frases que ampliam o headline com PROVA ou MECANISMO (como funciona). Sem repetir o headline.
- CTA primário: verbo de ação + benefício explícito. Sem "saiba mais", "clique aqui", "entre em contato".
- CTA secundário (ghost, opcional): pra quem ainda não quer comprar. Ex.: "Ver como funciona", "Conhecer a plataforma", "Ver demonstração". 2-4 palavras. NÃO pode ser sinônimo do primário.
- Trust stats: 3 bullets de prova social, número ou garantia. Use emoji curto no começo (🏆 ⭐ ✅ 🛡️ 🚀 💎 📊 ⏱️).

Tom calibrado pela ESTRATÉGIA — não invente persona nova.
Responda APENAS com JSON válido.`

const copyHero: Agent = {
  key: 'copy-hero',
  name: 'Copy Hero',
  icon: '✍️',
  description: 'Headline, subheadline, CTA e prova social',

  async run(ctx) {
    const { input, strategy, architecture } = ctx
    if (!strategy || !architecture) throw new Error('Copy Hero exige strategy + architecture')

    const heroSection = architecture.sections.find(s => s.type === 'hero')

    const { text } = await chat({
      model: MODELS.copy,
      ...PROFILES.creative,
      maxTokens: 1200,
      system: SYSTEM,
      prompt: `ESTRATÉGIA:
- Promessa: ${strategy.promise}
- Estado atual: ${strategy.current_state}
- Estado desejado: ${strategy.desired_state}
- Persona: ${strategy.persona}
- Tom: ${strategy.tone}
- Vocabulário do nicho: ${strategy.vocabulary.join(', ')}

BRIEFING ORIGINAL:
- Negócio: ${input.businessName}
- Oferta: ${input.offer}
${input.guarantee ? `- Garantia: ${input.guarantee}` : ''}

OBJETIVO DA HERO (segundo o arquiteto): ${heroSection?.purpose ?? 'introduzir a promessa'}
${heroSection?.outline?.length ? `OUTLINE: ${heroSection.outline.join(' | ')}` : ''}

Devolva JSON:
{
  "headline": "≤9 palavras, transformação concreta",
  "subheadline": "1-2 frases com mecanismo ou prova, sem repetir headline",
  "cta": "verbo + benefício (ex.: 'Quero começar grátis')",
  "cta_secondary": "2-4 palavras, opção mais leve (ex.: 'Ver como funciona')",
  "trust_stats": ["🏆 stat 1", "⭐ stat 2", "✅ stat 3"]
}`,
    })

    const hero = parseJSON<HeroCopy>(text)
    if (!hero?.headline || !hero?.cta) throw new Error('Copy Hero: headline/cta vazios')

    ctx.hero = hero
    return {
      summary: hero.headline,
      data: hero,
    }
  },
}

export default copyHero
