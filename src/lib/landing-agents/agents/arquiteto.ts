/**
 * Agente 3 — Arquiteto de Página
 *
 * Decide a ESTRUTURA da página: quais seções entram, em que ordem, e qual é o
 * objetivo de cada uma. NÃO escreve copy — só monta o blueprint.
 *
 * Lê: ctx.strategy + ctx.research
 * Escreve: ctx.architecture
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, ArchitectureOutput, PageSection } from '../types'

const SYSTEM = `Você é arquiteto de conversão para landing pages PT-BR.

Princípios:
- Cada seção existe pra QUEBRAR UMA OBJEÇÃO específica ou AMPLIFICAR UM DESEJO. Sem propósito, fora.
- Hero sempre primeiro. Offer sempre último.
- Ordem do meio é decisão de estratégia: o que o visitante PRECISA acreditar antes de aceitar o CTA?
- Não inclua seções "porque é bonito". Inclua porque a página fica mais convincente.
- Comparativo só se há concorrentes/diferencial claro.
- Pricing só se há preço/planos definidos.
- FAQ sempre (mínimo 4 perguntas das objeções reais).

Tipos disponíveis: hero, benefits, summary, comparison, social_proof, pricing, faq, offer.

Responda APENAS com JSON válido.`

const arquiteto: Agent = {
  key: 'arquiteto',
  name: 'Arquiteto',
  icon: '🏗️',
  description: 'Define quais seções entram e em que ordem',

  async run(ctx) {
    const { input, strategy, research } = ctx
    if (!strategy) throw new Error('Arquiteto exige ctx.strategy')

    const { text } = await chat({
      model: MODELS.reasoning,
      ...PROFILES.precise,
      maxTokens: 2500,
      system: SYSTEM,
      prompt: `Monte a estrutura da página.

PROMESSA: ${strategy.promise}
PERSONA: ${strategy.persona}
TOM: ${strategy.tone}
OBJEÇÕES (em ordem): ${strategy.objections.join(' | ')}

DADOS DISPONÍVEIS:
- Garantia/trial: ${input.guarantee || 'não informado'}
- Preço/planos: ${input.price || 'não informado'}
- Concorrentes/diferencial: ${input.competitors || 'não informado'}
${research?.benchmark_sections?.length ? `- Benchmark do nicho: ${research.benchmark_sections.join(', ')}` : ''}
${research?.competitor_insights ? `- Insights concorrentes: ${research.competitor_insights}` : ''}

REGRAS:
- Primeira seção SEMPRE type:"hero"
- Última seção SEMPRE type:"offer"
- Mínimo 4 seções, máximo 7
- type:"comparison" só se houver dado de concorrente
- type:"pricing" só se houver preço/planos
- type:"faq" sempre (cobre as objeções reais)

Devolva JSON:
{
  "sections": [
    {
      "type": "hero",
      "purpose": "introduzir promessa central e disparar primeira impressão",
      "outline": ["pontos a cobrir — esboço, não a copy final"]
    }
  ],
  "rationale": "1-2 frases explicando POR QUE essa ordem"
}`,
    })

    const data = parseJSON<ArchitectureOutput>(text)
    if (!data?.sections?.length) throw new Error('Arquiteto: sem seções')

    // Garante hero primeiro e offer último (defensivo)
    const sections = ensureHeroAndOffer(data.sections)
    ctx.architecture = { sections, rationale: data.rationale ?? '' }

    return {
      summary: `${sections.length} seções: ${sections.map(s => s.type).join(' → ')}`,
      data: ctx.architecture,
    }
  },
}

function ensureHeroAndOffer(sections: PageSection[]): PageSection[] {
  const list = [...sections]
  if (list[0]?.type !== 'hero') {
    list.unshift({ type: 'hero', purpose: 'introduzir promessa central', outline: [] })
  }
  if (list[list.length - 1]?.type !== 'offer') {
    list.push({ type: 'offer', purpose: 'fechamento e CTA principal', outline: [] })
  }
  // Garante FAQ — se não veio, injeta antes do offer
  if (!list.some(s => s.type === 'faq')) {
    list.splice(list.length - 1, 0, {
      type: 'faq',
      purpose: 'quebrar objeções remanescentes',
      outline: ['4-6 perguntas das objeções listadas'],
    })
  }
  return list
}

export default arquiteto
