/**
 * Agente 8 — SEO & Schema
 *
 * Gera metadados SEO + JSON-LD schema.org (@graph) com Organization, WebPage,
 * FAQPage (se houver FAQ) e Product/Service (se houver pricing).
 *
 * Lê: ctx.strategy, ctx.architecture, ctx.sections
 * Escreve: ctx.seo
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, SeoOutput } from '../types'

const SYSTEM = `Você gera metadados SEO e JSON-LD schema.org VÁLIDO.
Responda APENAS com JSON válido.`

const seo: Agent = {
  key: 'seo',
  name: 'SEO & Schema',
  icon: '🧬',
  description: 'Slug, meta tags e JSON-LD',

  async run(ctx) {
    const { input, strategy, hero, sections } = ctx
    if (!strategy || !hero || !sections) throw new Error('SEO exige strategy + hero + sections')

    const faqSection = sections.find(s => s.type === 'faq')
    const faqItems = (faqSection?.data?.items as Array<{ q: string; a: string }> | undefined) ?? []
    const pricingSection = sections.find(s => s.type === 'pricing')

    const hoje = new Date().toISOString().slice(0, 10)

    const { text } = await chat({
      model: MODELS.structured,
      ...PROFILES.precise,
      maxTokens: 2000,
      system: SYSTEM,
      prompt: `Gere metadados SEO para a landing page.

NEGÓCIO: ${input.businessName}
SEGMENTO: ${input.segment}
PROMESSA: ${strategy.promise}
HEADLINE: ${hero.headline}
SUBHEADLINE: ${hero.subheadline}
${faqItems.length ? `\nFAQ (${faqItems.length} perguntas — todas devem entrar no FAQPage):\n${faqItems.map(f => `- ${f.q}`).join('\n')}` : ''}
${pricingSection ? '\nTEM SEÇÃO DE PREÇOS — inclua Product no schema.' : ''}

JSON:
{
  "focus_keyphrase": "palavra-chave de foco (2-4 palavras) baseada no segmento + transformação",
  "slug": "url-amigavel-sem-acentos-com-palavra-chave",
  "meta_title": "≤60 chars, deve conter a focus_keyphrase",
  "meta_description": "150-160 chars, contendo focus_keyphrase + promessa concreta",
  "schema_jsonld": [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "...",
      "description": "...",
      "datePublished": "${hoje}"
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "${input.businessName}",
      "description": "..."
    }${faqItems.length ? `,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "pergunta", "acceptedAnswer": { "@type": "Answer", "text": "resposta em texto puro" } }
      ]
    }` : ''}${pricingSection ? `,
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "${input.businessName}",
      "offers": [{ "@type": "Offer", "name": "plano", "price": "valor" }]
    }` : ''}
  ]
}

${faqItems.length ? `IMPORTANTE: inclua TODAS as ${faqItems.length} perguntas no FAQPage com resposta REAL.` : ''}`,
    })

    const data = parseJSON<SeoOutput>(text)
    if (!data?.slug) throw new Error('SEO: slug vazio')

    // Normaliza slug
    data.slug = data.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)

    ctx.seo = data
    return {
      summary: data.slug,
      data,
    }
  },
}

export default seo
