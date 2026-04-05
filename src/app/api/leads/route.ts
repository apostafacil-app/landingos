import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

    // Buscar página + notification_emails
    const { data: page } = await supabaseAdmin
      .from('pages')
      .select('id, workspace_id, status, name, notification_emails')
      .eq('id', page_id)
      .eq('status', 'published')
      .single()

    if (!page) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Contexto da request
    const forwarded = request.headers.get('x-forwarded-for')
    const ip        = forwarded ? forwarded.split(',')[0].trim() : null
    const userAgent = request.headers.get('user-agent') ?? ''

    let device: 'mobile' | 'desktop' | 'tablet' | null = null
    if (/tablet|ipad/i.test(userAgent))            device = 'tablet'
    else if (/mobile|android|iphone/i.test(userAgent)) device = 'mobile'
    else if (userAgent)                             device = 'desktop'

    const referer = request.headers.get('referer') ?? ''
    let utmSource: string | null = null, utmMedium: string | null = null,
        utmCampaign: string | null = null, utmTerm: string | null = null,
        utmContent: string | null = null
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
      workspace_id:    page.workspace_id,
      page_id:         page.id,
      name:            name    ?? null,
      email:           email   ?? null,
      phone:           phone   ?? null,
      custom_fields:   custom_fields ?? null,
      device,
      ip,
      referral_source: referer || null,
      utm_source:      utmSource,
      utm_medium:      utmMedium,
      utm_campaign:    utmCampaign,
      utm_term:        utmTerm,
      utm_content:     utmContent,
    })

    if (error) {
      return NextResponse.json({ error: 'Erro ao salvar lead' }, { status: 500 })
    }

    // Registrar view (conversão)
    await supabaseAdmin.from('page_views').insert({
      page_id:      page.id,
      workspace_id: page.workspace_id,
      device,
      utm_source:   utmSource,
      utm_medium:   utmMedium,
      utm_campaign: utmCampaign,
    })

    // Notificação por e-mail (Resend)
    if (resend && page.notification_emails) {
      const emails = page.notification_emails
        .split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.includes('@'))

      if (emails.length > 0) {
        const leadInfo = [
          name  && `Nome: ${name}`,
          email && `E-mail: ${email}`,
          phone && `Telefone: ${phone}`,
          utmSource && `Origem: ${utmSource}`,
          device && `Dispositivo: ${device}`,
        ].filter(Boolean).join('\n')

        await resend.emails.send({
          from:    'LandingOS <leads@landingos.com.br>',
          to:      emails,
          subject: `Novo lead em "${page.name}"`,
          text:    `Você recebeu um novo lead!\n\n${leadInfo}\n\nPágina: ${page.name}`,
          html:    `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
              <h2 style="color:#1e293b;margin:0 0 4px;">🎯 Novo lead capturado!</h2>
              <p style="color:#64748b;margin:0 0 20px;font-size:14px;">Página: <strong>${page.name}</strong></p>
              <div style="background:#f8fafc;border-radius:12px;padding:20px;border:1px solid #e2e8f0;">
                ${name  ? `<p style="margin:0 0 8px;"><strong>Nome:</strong> ${name}</p>` : ''}
                ${email ? `<p style="margin:0 0 8px;"><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
                ${phone ? `<p style="margin:0 0 8px;"><strong>Telefone:</strong> ${phone}</p>` : ''}
                ${utmSource ? `<p style="margin:0 0 8px;"><strong>Origem:</strong> ${utmSource}</p>` : ''}
                ${device    ? `<p style="margin:0;"><strong>Dispositivo:</strong> ${device}</p>` : ''}
              </div>
              <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">
                Enviado pelo LandingOS — <a href="https://landingos.com.br/leads">Ver todos os leads</a>
              </p>
            </div>
          `,
        }).catch(() => { /* silent — não bloquear o lead por falha no email */ })
      }
    }

    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
