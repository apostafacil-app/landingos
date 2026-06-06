/**
 * Agente 7 — Diretor Visual
 *
 * Gera a hero image (e opcionalmente imagens de seções) via OpenRouter,
 * usando o modelo de imagem do Gemini Nano Banana (ou GPT-5-image premium).
 *
 * Lê: ctx.strategy, ctx.design, ctx.hero
 * Escreve: ctx.visual
 */

import { chat, generateImage } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, VisualOutput, PipelineOptions } from '../types'

// Reforço negativo aplicado direto no modelo de imagem.
// Modelos de imagem ainda borram texto/UI — pedir explicitamente p/ evitar.
const NEGATIVE = ' No text, no words, no letters, no logos, no UI screenshots, no dashboards, no charts or graphs with labels. Clean photographic editorial style. Cinematic lighting. Natural composition.'

const PROMPT_SYSTEM = `Você cria prompts de imagem em INGLÊS para modelos de geração.
Devolva APENAS o prompt (1 parágrafo). Cena editorial 16:9, fotorrealista.
PROIBIDO: textos, palavras, telas de software, dashboards, gráficos com rótulos, logos (modelos borram texto e fica feio).
Foque em ambiente real, pessoas em ação, objetos físicos, ou metáforas visuais limpas.`

export function makeDiretorVisual(options: PipelineOptions): Agent {
  const imageModel = options.premium_images ? MODELS.imagePremium : MODELS.image

  return {
    key: 'diretor-visual',
    name: 'Diretor Visual',
    icon: '🖼️',
    description: 'Gera prompt em inglês + imagem hero',

    async run(ctx) {
      const { input, strategy, hero, design } = ctx
      if (!strategy || !hero || !design) throw new Error('Diretor Visual exige strategy + hero + design')

      // 1. Cria prompt em inglês (modelo barato basta — é só transcrição estilizada)
      const { text: heroPrompt } = await chat({
        model: MODELS.cheap,
        ...PROFILES.creative,
        maxTokens: 400,
        system: PROMPT_SYSTEM,
        prompt: `Briefing pra hero image:
- Segmento: ${input.segment}
- Promessa: ${strategy.promise}
- Estado desejado do cliente: ${strategy.desired_state}
- Mood visual: ${design.mood}
- Paleta dominante: ${design.palette_id} (primária ${design.primary})
- Modo: ${design.mode}

Crie 1 parágrafo em inglês descrevendo a CENA ideal pra ilustrar essa promessa.
Sem texto na imagem. Sem UI. Foque em ambiente, pessoas em ação ou metáfora visual concreta.`,
      })

      const heroPromptFinal = `${heroPrompt.trim()}.${NEGATIVE}`

      // 2. Gera imagem (best-effort — se falhar, segue sem imagem mas LOGA)
      let hero_data_url: string | null = null
      let error: string | undefined
      try {
        const r = await generateImage({ model: imageModel, prompt: heroPromptFinal })
        hero_data_url = r.dataUrls[0] ?? null
        if (!hero_data_url) error = 'Modelo não devolveu imagem'
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }
      if (error) {
        // Log explícito pra Vercel — sem isso silenciamos o problema.
        console.error(`[diretor-visual] hero image falhou (${imageModel}): ${error}`)
      }

      const visual: VisualOutput = {
        hero_prompt: heroPromptFinal,
        hero_data_url,
        inline_images: [],   // futuro: gerar 1 imagem por seção
        error,
      }
      ctx.visual = visual

      return {
        summary: hero_data_url ? 'hero image OK' : (error ? `falhou: ${error.slice(0, 60)}` : 'sem imagem'),
        data: { hero_prompt: heroPromptFinal, has_image: Boolean(hero_data_url), error },
      }
    },
  }
}

/** Fallback quando generate_images = false (apenas placeholder no contexto). */
export const diretorVisualSkip: Agent = {
  key: 'diretor-visual',
  name: 'Diretor Visual',
  icon: '🖼️',
  description: 'Pulado (geração de imagem desligada)',
  async run(ctx) {
    ctx.visual = { hero_prompt: '', hero_data_url: null, inline_images: [] }
    return { summary: 'pulado (toggle off)' }
  },
}
