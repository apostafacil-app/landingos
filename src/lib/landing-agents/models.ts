/**
 * Catálogo central de modelos OpenRouter usados pela pipeline de geração de páginas.
 *
 * IDs do OpenRouter mudam com frequência — troque aqui sem mexer no resto.
 * Catálogo completo: https://openrouter.ai/models
 */

export const MODELS = {
  // Pesquisa com busca web + citações (Perplexity Sonar)
  research: 'perplexity/sonar-pro',

  // Raciocínio cuidadoso e copywriting (Claude Sonnet 4.6) — onde qualidade importa
  reasoning: 'anthropic/claude-sonnet-4.6',
  copy: 'anthropic/claude-sonnet-4.6',

  // Tarefas estruturadas/determinísticas (design system, SEO, JSON-LD)
  // ~16x mais barato que gpt-4o, mesma qualidade pra JSON estruturado
  structured: 'openai/gpt-4o-mini',
  cheap: 'openai/gpt-4o-mini',

  // Geração de imagem — Gemini Nano Banana (modalities: ["image","text"])
  // Alternativa premium: 'openai/gpt-5-image'
  image: 'google/gemini-3.1-flash-image-preview',
  imagePremium: 'openai/gpt-5-image',
} as const

/**
 * Perfis de temperatura por tipo de tarefa.
 * - factual: pesquisa, fact-check (baixa criatividade)
 * - creative: copywriting (alta criatividade)
 * - precise: estrutura, schema, design system (determinístico)
 */
export const PROFILES = {
  factual:  { temperature: 0.2 },
  creative: { temperature: 0.8 },
  precise:  { temperature: 0.1 },
} as const

export type ModelKey = keyof typeof MODELS
export type ProfileKey = keyof typeof PROFILES
