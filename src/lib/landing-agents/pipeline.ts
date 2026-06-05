/**
 * Orquestrador do pipeline multi-agente.
 *
 * Roda 9 agentes em sequência (auditor CRO opcional). Cada agente lê/escreve
 * no `PipelineContext` compartilhado. Emite eventos SSE pra o frontend mostrar
 * progresso em tempo real (igual GEO).
 */

import type { PipelineContext, AgentResult, PipelineOptions, Agent } from './types'
import type { GeneratePageInput } from '@/lib/validations/page'

import estrategista   from './agents/estrategista'
import pesquisador    from './agents/pesquisador'
import arquiteto      from './agents/arquiteto'
import designer       from './agents/designer'
import copyHero       from './agents/copy-hero'
import copySecoes     from './agents/copy-secoes'
import { makeDiretorVisual, diretorVisualSkip } from './agents/diretor-visual'
import seo            from './agents/seo'
import auditorCro     from './agents/auditor-cro'

export type PipelineEvent =
  | { type: 'pipeline:start';  total: number; promise_hint: string }
  | { type: 'agent:start';     index: number; key: string; name: string; icon: string }
  | { type: 'agent:done';      index: number; result: AgentResult }
  | { type: 'pipeline:done';   summary: { headline: string; slug: string } }
  | { type: 'pipeline:error';  error: string }

export type PipelineInput = {
  input: GeneratePageInput
  user_id: string
  workspace_id: string
  options: PipelineOptions
}

export type PipelineResult = {
  ctx: PipelineContext
  steps: AgentResult[]
}

/**
 * Roda a pipeline. `emit` é chamado a cada evento (usar com SSE).
 */
export async function runPipeline(
  input: PipelineInput,
  emit: (event: PipelineEvent) => void = () => {},
): Promise<PipelineResult> {
  const ctx: PipelineContext = {
    input: input.input,
    user_id: input.user_id,
    workspace_id: input.workspace_id,
    started_at: new Date().toISOString(),
  }

  const agents: Agent[] = [
    estrategista,
    pesquisador,
    arquiteto,
    designer,
    copyHero,
    copySecoes,
    input.options.generate_images ? makeDiretorVisual(input.options) : diretorVisualSkip,
    seo,
  ]
  if (input.options.cro_audit) {
    agents.push(auditorCro)
  }

  emit({ type: 'pipeline:start', total: agents.length, promise_hint: input.input.desire.slice(0, 80) })

  const steps: AgentResult[] = []
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i]
    emit({ type: 'agent:start', index: i, key: agent.key, name: agent.name, icon: agent.icon })

    const t0 = Date.now()
    try {
      const out = await agent.run(ctx)
      const result: AgentResult = {
        key: agent.key,
        name: agent.name,
        icon: agent.icon,
        model: '',  // preencher se quiser logar
        status: 'ok',
        ms: Date.now() - t0,
        summary: out.summary,
        data: out.data,
      }
      steps.push(result)
      emit({ type: 'agent:done', index: i, result })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      const result: AgentResult = {
        key: agent.key,
        name: agent.name,
        icon: agent.icon,
        model: '',
        status: 'error',
        ms: Date.now() - t0,
        summary: `erro: ${msg.slice(0, 60)}`,
        error: msg,
      }
      steps.push(result)
      emit({ type: 'agent:done', index: i, result })

      // Agentes críticos travam o pipeline. Outros (visual, cro) seguem.
      if (isCriticalAgent(agent.key)) {
        emit({ type: 'pipeline:error', error: `Agente "${agent.name}" falhou: ${msg}` })
        throw e
      }
    }
  }

  emit({
    type: 'pipeline:done',
    summary: {
      headline: ctx.hero?.headline ?? '',
      slug: ctx.seo?.slug ?? '',
    },
  })

  return { ctx, steps }
}

function isCriticalAgent(key: string): boolean {
  return ['estrategista', 'arquiteto', 'designer', 'copy-hero', 'copy-secoes', 'seo'].includes(key)
}
