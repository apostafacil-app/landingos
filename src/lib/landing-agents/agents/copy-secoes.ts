/**
 * Agente 6 — Copywriter de Seções
 *
 * Escreve a copy de TODAS as seções (exceto hero) seguindo o blueprint do arquiteto.
 * Garante coerência narrativa: cada seção amarra na anterior e prepara a próxima.
 *
 * Lê: ctx.strategy, ctx.architecture, ctx.hero
 * Escreve: ctx.sections
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, SectionCopy, PageSection } from '../types'

const SYSTEM = `Você é o melhor copywriter PT-BR para corpo de landing pages.

REGRAS GLOBAIS:
- Tom: calibrado pela estratégia recebida.
- ZERO clichês: "solução completa", "transforme sua vida", "mais produtividade", "feito por especialistas".
- Cada seção tem PROPÓSITO — não escreva nada que não sirva o propósito.

LIMITES DUROS DE TAMANHO (o render quebra se ultrapassar):
- Headline de seção: MÁX 60 CHARS
- Eyebrow: MÁX 30 CHARS
- Benefit title: MÁX 32 CHARS · description: MÁX 90 CHARS (≈2 linhas)
- Summary bullet: MÁX 70 CHARS
- Comparison row: "feature" MÁX 36, "us" MÁX 48, "them" MÁX 48
- Social proof text: MÁX 160 CHARS · author MÁX 24 · role MÁX 36
- Pricing feature: MÁX 52 CHARS · plan name MÁX 16
- FAQ question: MÁX 80 CHARS · answer MÁX 180 CHARS (≈3 linhas)
- Offer headline: MÁX 50 · description: MÁX 100 · cta: MÁX 26

CONTEÚDO:
- Benefits: cada item quebra UMA objeção específica. Inclua emoji em "icon".
- Summary: bullets concretos, frases curtas (não bullets-essay).
- Comparison: 4-6 linhas, "us" sempre concreto (✓ "Setup em 1 dia"), "them" sempre dor real (✗ "Suporte só em horário comercial").
- Social proof: marque depoimentos como "[PLACEHOLDER]" — NUNCA invente nomes reais. rating sempre 5.
- Pricing: nome curto, preço claro, 4-6 features por plano.
- FAQ: perguntas baseadas em objeções REAIS, resposta direta sem rodeio.
- Offer: reforça a transformação + adiciona urgência ou garantia + CTA.

Responda APENAS com JSON válido.`

const copySecoes: Agent = {
  key: 'copy-secoes',
  name: 'Copy Seções',
  icon: '📝',
  description: 'Copy de benefits, FAQ, social proof, pricing e offer',

  async run(ctx) {
    const { input, strategy, architecture, hero } = ctx
    if (!strategy || !architecture || !hero) throw new Error('Copy Seções exige strategy + architecture + hero')

    // Filtra seções que não são hero (hero já foi resolvida)
    const sectionsToWrite = architecture.sections.filter(s => s.type !== 'hero')

    const blueprint = sectionsToWrite.map((s, i) => `${i + 1}. ${s.type} — propósito: ${s.purpose}${s.outline?.length ? ` | outline: ${s.outline.join(', ')}` : ''}`).join('\n')

    const { text } = await chat({
      model: MODELS.copy,
      ...PROFILES.creative,
      maxTokens: 4500,
      system: SYSTEM,
      prompt: `ESTRATÉGIA:
- Promessa: ${strategy.promise}
- Persona: ${strategy.persona}
- Tom: ${strategy.tone}
- Objeções: ${strategy.objections.join(' | ')}
- Vocabulário: ${strategy.vocabulary.join(', ')}

HERO JÁ ESCRITA (pra você dar continuidade narrativa):
- Headline: ${hero.headline}
- Subheadline: ${hero.subheadline}
- CTA: ${hero.cta}

DADOS DO BRIEFING:
- Negócio: ${input.businessName}
- Oferta: ${input.offer}
${input.guarantee ? `- Garantia: ${input.guarantee}` : ''}
${input.price ? `- Preço/planos: ${input.price}` : ''}
${input.competitors ? `- Diferencial vs concorrentes: ${input.competitors}` : ''}

BLUEPRINT (escreva NESTA ordem, NÃO adicione seções extras):
${blueprint}

Devolva JSON:
{
  "sections": [
    ${schemaExamples(sectionsToWrite)}
  ]
}`,
    })

    const parsed = parseJSON<{ sections: SectionCopy[] }>(text)
    if (!parsed?.sections?.length) throw new Error('Copy Seções: JSON vazio')

    // Garante que o array preserva a ordem e tipos do blueprint
    const sectionsByType = new Map(parsed.sections.map(s => [s.type, s]))
    const ordered: SectionCopy[] = sectionsToWrite.map(s => {
      const got = sectionsByType.get(s.type)
      return got ?? { type: s.type, data: {} }
    })
    ctx.sections = ordered

    return {
      summary: `${ordered.length} seções: ${ordered.map(s => s.type).join(', ')}`,
      data: ordered,
    }
  },
}

/** Gera exemplos de schema para cada tipo de seção pedido no blueprint. */
function schemaExamples(sections: PageSection[]): string {
  return sections.map(s => {
    switch (s.type) {
      case 'benefits':
        return `{
      "type": "benefits",
      "data": {
        "eyebrow": "rótulo curto 3-5 palavras",
        "headline": "título da seção",
        "items": [
          { "icon": "🚀", "title": "benefício 1", "description": "frase que quebra objeção específica" }
        ]
      }
    }`
      case 'summary':
        return `{
      "type": "summary",
      "data": {
        "eyebrow": "...", "headline": "...",
        "items": ["bullet concreto 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
      }
    }`
      case 'comparison':
        return `{
      "type": "comparison",
      "data": {
        "eyebrow": "...", "headline": "...",
        "rows": [{ "feature": "diferencial específico", "us": "✓ como resolvemos", "them": "✗ como é sem nós" }]
      }
    }`
      case 'social_proof':
        return `{
      "type": "social_proof",
      "data": {
        "eyebrow": "...", "headline": "...",
        "items": [{ "text": "depoimento sobre resultado concreto [PLACEHOLDER]", "author": "Nome Sobrenome", "role": "Cargo · Empresa", "rating": 5 }]
      }
    }`
      case 'pricing':
        return `{
      "type": "pricing",
      "data": {
        "eyebrow": "...", "headline": "...",
        "plans": [{ "name": "Nome", "price": "R$X/mês", "features": ["feature 1", "feature 2", "feature 3"], "highlighted": false }]
      }
    }`
      case 'faq':
        return `{
      "type": "faq",
      "data": {
        "eyebrow": "...", "headline": "Perguntas frequentes",
        "items": [{ "q": "pergunta baseada em objeção real?", "a": "resposta direta e honesta" }]
      }
    }`
      case 'offer':
        return `{
      "type": "offer",
      "data": {
        "headline": "frase final que reforça a transformação",
        "description": "1 frase com urgência ou garantia",
        "cta": "verbo + benefício"
      }
    }`
      default:
        return `{ "type": "${s.type}", "data": {} }`
    }
  }).join(',\n    ')
}

export default copySecoes
