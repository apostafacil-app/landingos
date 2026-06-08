/**
 * Rota PARALELA — pipeline multi-agente via OpenRouter.
 *
 * Coexiste com `/api/ai/generate` (legada, Anthropic SDK direto, prompt monolítico).
 * Quando estabilizar, substituímos a rota legada.
 *
 * Modos de resposta:
 *  - GET ?stream=1: SSE stream com eventos da pipeline (`agent:start`, `agent:done`...)
 *  - POST: roda a pipeline síncrona e devolve { pageId, slug } (igual rota legada)
 *
 * Mantém todas as guardas da rota legada:
 *  - Auth via supabase.auth.getUser()
 *  - Workspace via workspace_members
 *  - Zod validation
 *  - consume_ai_credit RPC
 *  - sanitização HTML
 *  - audit log security_events
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generatePageSchema } from '@/lib/validations/page'
import { sanitizeHtml } from '@/lib/sanitize'
import { runPipeline, type PipelineEvent } from '@/lib/landing-agents/pipeline'
import { renderHtmlV3 } from '@/lib/landing-agents/render-v3'
import type { PipelineOptions } from '@/lib/landing-agents/types'

export const runtime = 'nodejs'
export const maxDuration = 300  // pipeline pode demorar até ~5 min com Sonnet x9

type AuthedContext = {
  user_id: string
  workspace_id: string
}

async function authenticateAndConsumeCredit(): Promise<
  { ok: true; ctx: AuthedContext } | { ok: false; status: number; error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: 'Não autorizado' }

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!member?.workspace_id) {
    return { ok: false, status: 403, error: 'Workspace não encontrado' }
  }

  // Consome crédito atomicamente — mesma RPC da rota legada
  const { data: credited, error: creditError } = await supabaseAdmin.rpc('consume_ai_credit', {
    p_workspace_id: member.workspace_id,
  })
  if (creditError) {
    console.warn('[/api/ai/generate-v2] consume_ai_credit error (migration pendente?):', creditError.message)
  } else if (!credited) {
    return { ok: false, status: 402, error: 'Créditos de IA esgotados. Aguarde a renovação do plano.' }
  }

  return { ok: true, ctx: { user_id: user.id, workspace_id: member.workspace_id } }
}

function parseOptions(body: Record<string, unknown>): PipelineOptions {
  const opts = (body.options ?? {}) as Record<string, unknown>
  return {
    cro_audit:       opts.cro_audit       !== false,   // default true
    generate_images: opts.generate_images !== false,   // default true
    premium_images:  opts.premium_images  === true,    // default false
  }
}

/**
 * Body opcional pode trazer `layout_variants: { hero, benefits, social_proof }`
 * pra forçar variants do template library, sobrescrevendo a escolha do Designer.
 * Útil pra testar A/B no mesmo briefing.
 */
function applyLayoutVariantOverrides(
  ctx: Awaited<ReturnType<typeof runPipeline>>['ctx'],
  body: Record<string, unknown>,
): void {
  if (!ctx.design) return

  // Override theme inteiro (carrega typography + variants coordenados)
  const themeId = body.theme_id as string | undefined
  if (themeId) {
    // Lazy import pra evitar ciclo
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getThemeById } = require('@/lib/landing-agents/themes') as typeof import('@/lib/landing-agents/themes')
    const theme = getThemeById(themeId)
    ctx.design.typography = theme.typography
    ctx.design.layout_variants = theme.variants
    ctx.design.rationale = `[forced theme ${theme.id}] ${ctx.design.rationale}`
  }

  const overrides = body.layout_variants as Record<string, string> | undefined
  if (!overrides) return
  const allowed = {
    hero:         ['split', 'centered', 'asymmetric', 'image-bg'],
    benefits:     ['cards', 'zigzag', 'icons-grid'],
    social_proof: ['cards', 'wall', 'stats-strip'],
    pricing:      ['cards-3', 'highlight-center'],
    comparison:   ['table', 'side-by-side'],
    faq:          ['accordion', 'two-col'],
    offer:        ['splash', 'image-bg'],
  } as const
  const merged = { ...(ctx.design.layout_variants ?? {}) }
  for (const key of ['hero', 'benefits', 'social_proof', 'pricing', 'comparison', 'faq', 'offer'] as const) {
    const v = overrides[key]
    if (v && (allowed[key] as readonly string[]).includes(v)) {
      (merged as Record<string, string>)[key] = v
    }
  }
  ctx.design.layout_variants = merged
}

async function savePage(
  ctx: Awaited<ReturnType<typeof runPipeline>>['ctx'],
  authed: AuthedContext,
  input: ReturnType<typeof generatePageSchema.parse>,
): Promise<{ pageId: string; slug: string } | { error: string }> {
  if (!ctx.hero || !ctx.sections || !ctx.design || !ctx.seo) {
    return { error: 'Pipeline incompleta — alguma fase crítica falhou' }
  }

  // 1. Render HTML no formato V3 (com data-lp-model="v3", .lp-block, .lp-el) +
  //    sanitização. Formato V3 é o que o editor parseia em blocos editáveis.
  const rawHtml = renderHtmlV3(ctx, input.businessName)
  const safeHtml = sanitizeHtml(rawHtml)

  // 2. Slug único
  let slug = ctx.seo.slug
  const { data: existing } = await supabaseAdmin
    .from('pages')
    .select('id')
    .eq('workspace_id', authed.workspace_id)
    .eq('slug', slug)
    .maybeSingle()
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  // 3. Salva no banco (content guarda o JSON da pipeline pra futuras edições)
  const { data: page, error: pageError } = await supabaseAdmin
    .from('pages')
    .insert({
      workspace_id: authed.workspace_id,
      name: input.pageName,
      slug,
      status: 'draft',
      content: {
        version: 'v2-multi-agent',
        strategy: ctx.strategy,
        architecture: ctx.architecture,
        design: ctx.design,
        hero: ctx.hero,
        sections: ctx.sections,
        seo: ctx.seo,
        cro: ctx.cro,
        research_sources: ctx.research?.citations ?? [],
      },
      html: safeHtml,
      meta_title: ctx.seo.meta_title,
      meta_description: ctx.seo.meta_description,
    })
    .select('id')
    .single()

  if (pageError || !page) return { error: pageError?.message || 'Erro ao salvar página' }

  // 4. Audit log
  supabaseAdmin.from('security_events').insert({
    user_id: authed.user_id,
    workspace_id: authed.workspace_id,
    event: 'ai_generation_v2',
    resource: 'pages',
    action: 'create',
    result: 'success',
    metadata: {
      page_id: page.id,
      pipeline: 'multi-agent-v2',
      cro_verdict: ctx.cro?.verdict,
      images: ctx.visual?.hero_data_url ? 1 : 0,
    },
  }).then(({ error }) => {
    if (error) console.warn('[/api/ai/generate-v2] security_events insert:', error.message)
  })

  return { pageId: page.id, slug }
}

/* ──────────────────────────────────────────────────────────────────────────
 * POST — modo síncrono (compatível com o form atual)
 * ────────────────────────────────────────────────────────────────────────── */

export async function POST(request: Request) {
  try {
    const auth = await authenticateAndConsumeCredit()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const parsed = generatePageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }

    const options = parseOptions(body)
    const { ctx, steps } = await runPipeline({
      input: parsed.data,
      user_id: auth.ctx.user_id,
      workspace_id: auth.ctx.workspace_id,
      options,
    })

    // Override de variants do form (modo teste) — só aplica se passou no body
    applyLayoutVariantOverrides(ctx, body)

    const saved = await savePage(ctx, auth.ctx, parsed.data)
    if ('error' in saved) {
      return NextResponse.json({ error: saved.error, steps }, { status: 500 })
    }

    return NextResponse.json({ pageId: saved.pageId, slug: saved.slug, steps })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[/api/ai/generate-v2] FATAL:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * POST com ?stream=1 — modo SSE
 * (mesma rota; só muda o handler de resposta)
 * Implementação: lemos o body uma vez, devolvemos um stream.
 * ────────────────────────────────────────────────────────────────────────── */

export async function PUT(request: Request) {
  // Usar PUT pra evitar conflito de Content-Type no SSE.
  // (Algumas plataformas tratam POST sem body diferente.)
  try {
    const auth = await authenticateAndConsumeCredit()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const parsed = generatePageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const options = parseOptions(body)

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: PipelineEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
        try {
          const { ctx } = await runPipeline({
            input: parsed.data,
            user_id: auth.ctx.user_id,
            workspace_id: auth.ctx.workspace_id,
            options,
          }, send)

          const saved = await savePage(ctx, auth.ctx, parsed.data)
          if ('error' in saved) {
            send({ type: 'pipeline:error', error: saved.error })
          } else {
            // Override final do pipeline:done com pageId/slug pra o frontend redirecionar
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'saved', pageId: saved.pageId, slug: saved.slug })}\n\n`))
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          send({ type: 'pipeline:error', error: msg })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
