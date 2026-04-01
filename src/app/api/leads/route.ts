import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

// Rota PÚBLICA — chamada pelo formulário das páginas publicadas
// Não requer autenticação, mas valida page_id e limita campos

const leadSchema = z.object({
  page_id:    z.string().uuid(),
  name:       z.string().max(100).optional(),
  email:      z.string().email().max(254).optional(),
  phone:      z.string().max(20).optional(),
  custom_fields: z.record(z.string(), z.string().max(500)).optional(),
}).refine(d => d.email || d.phone || d.name, {
  message: 'Informe ao menos nome, e-mail ou telefone',
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = leadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { page_id, name, email, phone, custom_fields } = parsed.data

    // Verificar se a página existe e está publicada
    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('id, workspace_id, status')
      .eq('id', page_id)
      .eq('status', 'published')
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Extrair contexto da request
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : null
    const userAgent = request.headers.get('user-agent') ?? ''

    // Detectar dispositivo básico a partir do User-Agent
    let device: 'mobile' | 'desktop' | 'tablet' | null = null
    if (/tablet|ipad/i.test(userAgent)) device = 'tablet'
    else if (/mobile|android|iphone/i.test(userAgent)) device = 'mobile'
    else if (userAgent) device = 'desktop'

    // Extrair UTMs da URL de referência
    const referer = request.headers.get('referer') ?? ''
    let utmSource: string | null = null
    let utmMedium: string | null = null
    let utmCampaign: string | null = null
    let utmTerm: string | null = null
    let utmContent: string | null = null

    try {
      const refUrl = new URL(referer)
      utmSource   = refUrl.searchParams.get('utm_source')
      utmMedium   = refUrl.searchParams.get('utm_medium')
      utmCampaign = refUrl.searchParams.get('utm_campaign')
      utmTerm     = refUrl.searchParams.get('utm_term')
      utmContent  = refUrl.searchParams.get('utm_content')
    } catch {}

    // Salvar lead
    const { error } = await supabaseAdmin.from('leads').insert({
      workspace_id:   page.workspace_id,
      page_id:        page.id,
      name:           name ?? null,
      email:          email ?? null,
      phone:          phone ?? null,
      custom_fields:  custom_fields ?? null,
      device,
      ip,
      referral_source: referer || null,
      utm_source:     utmSource,
      utm_medium:     utmMedium,
      utm_campaign:   utmCampaign,
      utm_term:       utmTerm,
      utm_content:    utmContent,
    })

    if (error) {
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    // Registrar view também (conversão)
    await supabaseAdmin.from('page_views').insert({
      page_id:      page.id,
      workspace_id: page.workspace_id,
      device,
      utm_source:   utmSource,
      utm_medium:   utmMedium,
      utm_campaign: utmCampaign,
    })

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
