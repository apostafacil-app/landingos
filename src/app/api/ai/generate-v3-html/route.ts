/**
 * Rota experimental — pipeline multi-agente v2 + renderer HTML premium.
 *
 * Idêntica à /api/ai/generate-v2 exceto pelo passo final: em vez de gerar
 * coordenadas absolutas (renderHtmlV3), preenche slots em templates HTML/CSS
 * pré-desenhados premium (renderHtmlV3Html).
 *
 * Coexiste com /api/ai/generate-v2 pra você comparar visualmente sem risco.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generatePageSchema } from '@/lib/validations/page'
import { sanitizeHtml } from '@/lib/sanitize'
import { runPipeline } from '@/lib/landing-agents/pipeline'
import { renderHtmlV3Html } from '@/lib/landing-agents/templates-html'
import type { PipelineOptions } from '@/lib/landing-agents/types'
import { externalizeBase64Images } from '@/lib/image-storage'

export const runtime = 'nodejs'
export const maxDuration = 300

async function authenticateAndConsumeCredit(): Promise<
  { ok: true; ctx: { user_id: string; workspace_id: string } } | { ok: false; status: number; error: string }
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

  const { data: credited, error: creditError } = await supabaseAdmin.rpc('consume_ai_credit', {
    p_workspace_id: member.workspace_id,
  })
  if (creditError) {
    console.warn('[/api/ai/generate-v3-html] consume_ai_credit:', creditError.message)
  } else if (!credited) {
    return { ok: false, status: 402, error: 'Créditos de IA esgotados.' }
  }

  return { ok: true, ctx: { user_id: user.id, workspace_id: member.workspace_id } }
}

function parseOptions(body: Record<string, unknown>): PipelineOptions {
  const opts = (body.options ?? {}) as Record<string, unknown>
  return {
    cro_audit:       opts.cro_audit       !== false,
    generate_images: opts.generate_images !== false,
    premium_images:  opts.premium_images  === true,
  }
}

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

    if (!ctx.hero || !ctx.design || !ctx.seo) {
      return NextResponse.json({ error: 'Pipeline incompleta', steps }, { status: 500 })
    }

    // Renderer NOVO: HTML premium com templates mestres
    const rawHtml = renderHtmlV3Html(ctx, parsed.data.businessName)

    // Externaliza imagens base64 → Storage (não deve ter mais quando pipeline
    // usa URLs, mas mantém pra caso de SVG inline dentro dos templates)
    let htmlPreSanitize = rawHtml
    try {
      const ext = await externalizeBase64Images(rawHtml, auth.ctx.workspace_id)
      htmlPreSanitize = ext.html
    } catch (e) {
      console.error('[generate-v3-html] externalize falhou:', e)
    }

    const safeHtml = sanitizeHtml(htmlPreSanitize)

    // Slug único
    let slug = ctx.seo.slug
    const { data: existing } = await supabaseAdmin
      .from('pages')
      .select('id')
      .eq('workspace_id', auth.ctx.workspace_id)
      .eq('slug', slug)
      .maybeSingle()
    if (existing) slug = `${slug}-${Date.now().toString(36)}`

    const { data: page, error: pageError } = await supabaseAdmin
      .from('pages')
      .insert({
        workspace_id: auth.ctx.workspace_id,
        name: parsed.data.pageName,
        slug,
        status: 'draft',
        content: {
          version: 'v3-html-premium',
          strategy: ctx.strategy,
          architecture: ctx.architecture,
          design: ctx.design,
          hero: ctx.hero,
          sections: ctx.sections,
          seo: ctx.seo,
          cro: ctx.cro,
        },
        html: safeHtml,
        meta_title: ctx.seo.meta_title,
        meta_description: ctx.seo.meta_description,
      })
      .select('id')
      .single()

    if (pageError || !page) {
      return NextResponse.json({ error: pageError?.message || 'Erro ao salvar página', steps }, { status: 500 })
    }

    return NextResponse.json({ pageId: page.id, slug, steps })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[/api/ai/generate-v3-html] FATAL:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
