/**
 * Agente 3 — Arquiteto de Página
 *
 * Decide a ESTRUTURA da página: quais seções entram, em que ordem, e qual é o
 * objetivo de cada uma. NÃO escreve copy — só monta o blueprint.
 *
 * Lê: ctx.strategy + ctx.research
 * Escreve: ctx.architecture
 *
 * VARIEDADE ESTRUTURAL: o prompt induz randomização real via:
 * - 4 "estilos arquiteturais" diferentes escolhidos por hash da promessa
 * - Permite reordenar middle sections (social_proof às vezes antes de
 *   benefits, summary entre seções, etc)
 * - Tamanho variável (4-7 seções) baseado em quanto contexto a página
 *   realmente precisa
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, ArchitectureOutput, PageSection } from '../types'

const SYSTEM = `Você é arquiteto de conversão para landing pages PT-BR.

PRINCÍPIO CENTRAL: cada seção tem que GANHAR seu lugar. Página com 4 seções
focadas converte mais que página com 7 seções genéricas.

Tipos disponíveis:
- hero: 1ª impressão, promessa, CTA principal. SEMPRE 1º.
- benefits: features traduzidas em benefícios concretos pro cliente
- summary: bullets curtos que reforçam o pitch (1 frase cada)
- comparison: tabela "nós vs eles" — SÓ se há concorrente real
- social_proof: depoimentos, casos, métricas — SÓ se justificável
- pricing: planos — SÓ se preço informado E é fator de decisão
- faq: objeções remanescentes em formato pergunta/resposta
- offer: CTA final reforçando promessa. SEMPRE último.

LIBERDADE CRIATIVA:
- A ORDEM do meio é DECISÃO ESTRATÉGICA — não receita.
- Páginas B2B premium podem começar pelo social_proof (autoridade) antes
  de benefits (técnico).
- Páginas educativas/storytelling: benefits → summary → social_proof → faq.
- Páginas B2C SaaS: benefits → comparison → social_proof → pricing → faq.
- Infoproduto/curso: hero → social_proof (autoridade) → benefits →
  comparison → pricing → faq.
- Serviço alta consideração: hero → benefits → social_proof → faq → offer
  (sem pricing).
- Trial-first SaaS: hero → benefits → social_proof → faq → offer (pricing
  no painel pós-trial).

SEM RECEITA FIXA. Pense no FLUXO de crença que o visitante precisa percorrer.

Responda APENAS com JSON válido.`

const arquiteto: Agent = {
  key: 'arquiteto',
  name: 'Arquiteto',
  icon: '🏗️',
  description: 'Define quais seções entram e em que ordem',

  async run(ctx) {
    const { input, strategy, research } = ctx
    if (!strategy) throw new Error('Arquiteto exige ctx.strategy')

    // "Seed" derivada do briefing + timestamp pra induzir variação real
    // entre páginas similares. Sonnet com temperature 0.1 era determinístico
    // demais — sempre escolhia mesma sequência. Aumentamos pra 0.6 + seed.
    const seed = (Date.now() % 7) + (strategy.promise.length % 5)
    const archetypes = [
      'B2B premium "autoridade primeiro" — social_proof cedo, sem pricing',
      'SaaS B2C "comparativo" — benefits→comparison→social_proof→pricing→faq',
      'Storytelling/educativo — benefits→summary→social_proof→faq',
      'Trial-first — benefits→social_proof→faq (sem pricing, CTA é trial)',
      'Infoproduto/autoridade — social_proof→benefits→comparison→pricing→faq',
      'Serviço alta consideração — benefits→social_proof→faq (sem pricing)',
      'Tech minimalista — hero→summary→benefits→faq (poucas seções, alto impacto)',
    ]
    const archetype = archetypes[seed % archetypes.length]

    const { text } = await chat({
      model: MODELS.reasoning,
      temperature: 0.4,  // 0.4 dá variação sem quebrar formato JSON (0.6 quebrou)
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

DICA DE ARQUÉTIPO (use como inspiração, não cópia literal):
${archetype}

REGRAS DUROS:
- type:"hero" SEMPRE primeiro
- type:"offer" SEMPRE último
- Mínimo 4 seções, máximo 7
- type:"comparison" SÓ se houver dado de concorrente — caso contrário NÃO incluir
- type:"pricing" SÓ se houver preço/planos E for fator decisivo de venda
- type:"faq" sempre incluído (mínimo 4 perguntas reais)
- VARIE A ORDEM do meio — NÃO é obrigatório benefits→comparison→social_proof.
  Pense em qual ordem CONVENCE essa persona específica.

Devolva JSON:
{
  "sections": [
    {
      "type": "hero",
      "purpose": "introduzir promessa central",
      "outline": ["pontos a cobrir"]
    }
  ],
  "rationale": "1-2 frases explicando POR QUE essa ordem e POR QUE esse número de seções"
}`,
    })

    const data = parseJSON<ArchitectureOutput>(text)

    // Se Sonnet falhou ao formatar JSON (acontece com temperature alta), usa
    // arquitetura padrão em vez de matar a pipeline. Não é ótimo, mas é
    // melhor que erro fatal no form do usuário.
    let sections = data?.sections
    let rationale = data?.rationale ?? ''
    if (!sections?.length) {
      console.warn('[arquiteto] JSON inválido — usando arquitetura fallback. Texto bruto (200 chars):', text.slice(0, 200))
      sections = buildFallbackArchitecture(ctx)
      rationale = 'Arquitetura padrão (Sonnet retornou formato inválido)'
    }

    // Garante hero primeiro e offer último (defensivo)
    sections = ensureHeroAndOffer(sections)
    ctx.architecture = { sections, rationale }

    return {
      summary: `${sections.length} seções: ${sections.map(s => s.type).join(' → ')}`,
      data: ctx.architecture,
    }
  },
}

/**
 * Arquitetura padrão usada quando Sonnet falha em devolver JSON válido.
 * 6 seções clássicas de SaaS B2B — sempre funciona.
 */
function buildFallbackArchitecture(ctx: { input: { competitors?: string; price?: string } }): PageSection[] {
  const { input } = ctx
  const sections: PageSection[] = [
    { type: 'hero', purpose: 'apresentar promessa central', outline: [] },
    { type: 'benefits', purpose: 'quebrar objeções principais com features', outline: [] },
  ]
  if (input.competitors?.trim()) {
    sections.push({ type: 'comparison', purpose: 'diferencial vs alternativas', outline: [] })
  }
  sections.push({ type: 'social_proof', purpose: 'depoimentos pra confiança', outline: [] })
  if (input.price?.trim()) {
    sections.push({ type: 'pricing', purpose: 'transparência de preços', outline: [] })
  }
  sections.push({ type: 'faq', purpose: 'quebrar objeções remanescentes', outline: [] })
  sections.push({ type: 'offer', purpose: 'CTA final', outline: [] })
  return sections
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
