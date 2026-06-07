/**
 * Tipos compartilhados pela pipeline de geração de páginas.
 *
 * O `PipelineContext` é o objeto que TODOS os agentes leem e escrevem.
 * Cada agente enriquece o contexto com seu output (ex.: agente 1 escreve
 * `ctx.strategy`, agente 3 lê `ctx.strategy` + `ctx.research` pra montar
 * `ctx.architecture`, etc).
 */

import type { GeneratePageInput } from '@/lib/validations/page'

export type StrategyOutput = {
  /** Promessa central em 1 frase — base de toda a página */
  promise: string
  /** Estado atual do cliente (dor) */
  current_state: string
  /** Estado desejado (transformação) */
  desired_state: string
  /** 3-5 objeções principais, ordenadas por relevância */
  objections: string[]
  /** Persona refinada: quem ela é, o que valoriza, onde sente atrito */
  persona: string
  /** Vocabulário do segmento — termos que ressoam com o público */
  vocabulary: string[]
  /** Tom recomendado: formal / conversacional / técnico / inspiracional */
  tone: 'formal' | 'conversacional' | 'tecnico' | 'inspiracional'
}

export type ResearchOutput = {
  /** Texto extraído do site informado (limitado a ~3000 chars) */
  website_context: string
  /** URL da logo detectada no site (ou null) */
  logo_url: string | null
  /** Citações/fontes da pesquisa (preenchido por Perplexity) */
  citations: string[]
  /** Padrões de seção encontrados em concorrentes / nicho */
  benchmark_sections: string[]
  /** Insights sobre o concorrente (se houver) */
  competitor_insights: string
}

export type PageSection = {
  type: 'hero' | 'benefits' | 'summary' | 'comparison' | 'social_proof' | 'pricing' | 'faq' | 'offer'
  /** Por que essa seção está aqui — qual objeção quebra / qual desejo amplifica */
  purpose: string
  /** Esboço dos pontos a cobrir (não é a copy final) */
  outline: string[]
}

export type ArchitectureOutput = {
  /** Seções na ordem em que devem aparecer */
  sections: PageSection[]
  /** Justificativa do flow */
  rationale: string
}

export type DesignSystem = {
  palette_id: string                // ex.: 'azul-confianca'
  primary: string                   // hex
  gradient_end: string              // hex
  accent: string                    // hex
  background: string                // hex
  mode: 'light' | 'dark'
  typography: 'system' | 'serif-premium' | 'display' | 'monoespacada'
  mood: 'clean' | 'bold' | 'elegante' | 'energetico' | 'minimalista'
  rationale: string                 // por que essa escolha cabe ao segmento
  // Variant escolhido pra cada bloco — biblioteca de templates
  layout_variants?: {
    hero?:         'split' | 'centered'         // split (atual) ou centered
    benefits?:     'cards' | 'zigzag'           // cards (atual) ou zigzag editorial
    social_proof?: 'cards' | 'wall'             // cards (atual) ou wall (1 destaque + N pequenos)
  }
}

export type HeroCopy = {
  headline: string                  // transformação concreta, ≤9 palavras
  subheadline: string               // 1-2 frases que expandem
  cta: string                       // verbo + benefício (CTA primário)
  cta_secondary?: string            // ghost button — "Ver como funciona", "Saber mais", etc
  trust_stats: string[]             // 3 bullets
}

export type SectionCopy = {
  type: PageSection['type']
  /** Copy renderizada — varia por tipo (benefits=items[], faq=items[], etc) */
  data: Record<string, unknown>
}

export type VisualOutput = {
  hero_prompt: string               // prompt em inglês
  hero_data_url: string | null      // base64 image
  inline_images: Array<{ section_type: string; data_url: string; alt: string }>
  error?: string
}

export type SeoOutput = {
  slug: string
  meta_title: string
  meta_description: string
  schema_jsonld: unknown[]          // @graph
  focus_keyphrase: string
}

export type CroAuditOutput = {
  verdict: 'aprovado' | 'revisar'
  issues: Array<{ section: string; problem: string; suggestion: string }>
  applied_fixes: string[]
}

/** Contexto compartilhado entre agentes. */
export type PipelineContext = {
  // Input do usuário
  input: GeneratePageInput
  // Outputs incrementais
  strategy?: StrategyOutput
  research?: ResearchOutput
  architecture?: ArchitectureOutput
  design?: DesignSystem
  hero?: HeroCopy
  sections?: SectionCopy[]
  visual?: VisualOutput
  seo?: SeoOutput
  cro?: CroAuditOutput
  // Auditoria
  started_at: string
  workspace_id: string
  user_id: string
}

/** Resultado de um agente — vai pro SSE e pra etapas[] */
export type AgentResult = {
  key: string
  name: string
  icon: string
  model: string
  status: 'ok' | 'error'
  ms: number
  summary: string                   // ex.: '3 seções', 'Veredito: aprovado'
  data?: unknown                    // dump pra debug
  error?: string
}

export type Agent = {
  key: string
  name: string
  icon: string
  description: string
  /** Função que roda o agente e devolve um resumo do que fez. */
  run(ctx: PipelineContext): Promise<{ summary: string; data?: unknown }>
}

export type PipelineOptions = {
  /** Auditor CRO liga/desliga (default: true) */
  cro_audit: boolean
  /** Gerar imagens via IA (default: true). Quando false, pula agente 7. */
  generate_images: boolean
  /** Modelo de imagem premium (default: false → usa Gemini Nano Banana) */
  premium_images: boolean
}
