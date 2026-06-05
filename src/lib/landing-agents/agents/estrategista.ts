/**
 * Agente 1 — Estrategista
 *
 * Define a PROMESSA CENTRAL da página. Tudo (copy, design, ordem das seções)
 * deve servir essa promessa. Sem promessa clara, a página vira só "mais uma".
 *
 * Output enriquece ctx.strategy.
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, StrategyOutput } from '../types'

const SYSTEM = `Você é um estrategista de marketing direto, especialista em landing pages SaaS e infoprodutos PT-BR.

Sua missão: extrair do briefing a PROMESSA CENTRAL única — aquela transformação concreta que, sozinha, faria o visitante converter.

Princípios:
- Promessa = transformação ESPECÍFICA, mensurável. NÃO "mais produtividade" — sim "fechar 3 propostas por semana sem perseguir cliente".
- A pior promessa é a genérica. Prefira ousada e específica em vez de segura e ampla.
- Persona não é demografia — é um conjunto de crenças, dores e vocabulário.
- Objeções vêm em ordem: as 3 que mais bloqueiam a compra primeiro.

Responda APENAS com JSON válido, sem markdown, sem prosa.`

const estrategista: Agent = {
  key: 'estrategista',
  name: 'Estrategista',
  icon: '🎯',
  description: 'Define promessa central, persona e objeções',

  async run(ctx) {
    const { input } = ctx
    const { text } = await chat({
      model: MODELS.reasoning,
      ...PROFILES.factual,
      maxTokens: 2000,
      system: SYSTEM,
      prompt: `Briefing do cliente:
- Página: "${input.pageName}"
- Negócio: ${input.businessName}
- Segmento: ${input.segment}
- Público-alvo descrito: ${input.targetAudience}
- Dor principal: ${input.painPoint}
- Desejo / transformação: ${input.desire}
- Oferta: ${input.offer}
${input.guarantee ? `- Garantia: ${input.guarantee}` : ''}
${input.objections ? `- Objeções listadas: ${input.objections}` : ''}
${input.competitors ? `- Diferencial vs concorrentes: ${input.competitors}` : ''}
${input.price ? `- Preço/planos: ${input.price}` : ''}

Devolva JSON:
{
  "promise": "transformação específica e mensurável em 1 frase (ex.: 'Fechar 3 propostas por semana sem perseguir cliente')",
  "current_state": "estado atual do cliente — frustração concreta",
  "desired_state": "estado desejado — resultado concreto",
  "objections": ["3-5 objeções em ordem de impacto: a maior primeiro"],
  "persona": "1-2 frases descrevendo persona pelo que ela CRÊ e VALORIZA, não dados demográficos",
  "vocabulary": ["6-10 termos/expressões que o público usa de verdade"],
  "tone": "formal | conversacional | tecnico | inspiracional"
}`,
    })

    const data = parseJSON<StrategyOutput>(text)
    if (!data?.promise) throw new Error('Estrategista: JSON inválido ou sem promessa')

    ctx.strategy = data
    return {
      summary: data.promise.slice(0, 80),
      data,
    }
  },
}

export default estrategista
