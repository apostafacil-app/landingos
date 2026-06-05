/**
 * Agente 2 — Pesquisador
 *
 * Coleta contexto externo:
 * - Scrape do site informado (já com proteção SSRF via safeFetch)
 * - Extração de logo
 * - Se Perplexity habilitado: benchmark de seções comuns no nicho
 *
 * Output enriquece ctx.research.
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import { safeFetch, SsrfError } from '@/lib/ssrf'
import { extractLogoUrl, htmlToText } from '../scrape'
import type { Agent, ResearchOutput } from '../types'

const SYSTEM = `Você é um pesquisador de mercado especializado em landing pages PT-BR.
Sua tarefa: a partir de um briefing e (opcionalmente) do conteúdo de sites concorrentes,
identificar quais SEÇÕES costumam aparecer em landings de alta conversão desse nicho.
Responda APENAS com JSON válido.`

const pesquisador: Agent = {
  key: 'pesquisador',
  name: 'Pesquisador',
  icon: '🔬',
  description: 'Analisa site, concorrentes e benchmark do nicho',

  async run(ctx) {
    const { input, strategy } = ctx

    // 1. Scrape do site do cliente (opcional)
    let website_context = ''
    let logo_url: string | null = null
    if (input.websiteUrl) {
      try {
        const html = await safeFetch(input.websiteUrl)
        website_context = htmlToText(html, 3000)
        logo_url = extractLogoUrl(html, input.websiteUrl)
      } catch (e) {
        if (e instanceof SsrfError) {
          throw new Error(`URL inválida: ${e.message}`)
        }
        // Outros erros de rede: continuar sem contexto
      }
    }

    // 2. Benchmark de seções — só faz LLM call se vale a pena
    //    (tem site OU concorrentes informados OU é nicho rico)
    let benchmark_sections: string[] = []
    let competitor_insights = ''
    let citations: string[] = []

    const useWeb = Boolean(input.competitors || website_context)
    if (useWeb) {
      const useResearch = Boolean(input.competitors)  // só liga Perplexity se há concorrentes pra pesquisar
      const model = useResearch ? MODELS.research : MODELS.reasoning

      const { text, citations: c } = await chat({
        model,
        ...PROFILES.factual,
        maxTokens: 1500,
        system: SYSTEM,
        prompt: `Briefing:
- Segmento: ${input.segment}
- Negócio: ${input.businessName}
- Promessa central: ${strategy?.promise ?? input.desire}
- Objeções principais: ${strategy?.objections?.join(' | ') ?? input.objections ?? ''}

${input.competitors ? `Concorrentes/diferenciais: ${input.competitors}\n${useResearch ? 'Pesquise rapidamente esses concorrentes na web se reconhecer os nomes.' : ''}` : ''}

${website_context ? `Texto extraído do site do cliente (resumo):\n${website_context.slice(0, 1500)}` : ''}

Devolva JSON:
{
  "benchmark_sections": ["lista de tipos de seção que landings de alta conversão desse nicho costumam ter, em ordem"],
  "competitor_insights": "2-3 frases com observações úteis sobre como concorrentes posicionam mensagens (vazio se não houver dados)"
}`,
      })

      const parsed = parseJSON<{ benchmark_sections?: string[]; competitor_insights?: string }>(text)
      benchmark_sections = parsed?.benchmark_sections ?? []
      competitor_insights = parsed?.competitor_insights ?? ''
      citations = c
    }

    const research: ResearchOutput = {
      website_context,
      logo_url,
      citations,
      benchmark_sections,
      competitor_insights,
    }
    ctx.research = research

    const summary = [
      website_context ? 'site lido' : null,
      logo_url ? 'logo OK' : null,
      benchmark_sections.length ? `${benchmark_sections.length} padrões` : null,
    ].filter(Boolean).join(' · ') || 'sem dados externos'

    return { summary, data: research }
  },
}

export default pesquisador
