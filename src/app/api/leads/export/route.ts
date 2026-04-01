import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  // Autenticação obrigatória
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Workspace_id sempre do token JWT — nunca da query string
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 403 })
  }

  // Buscar leads do workspace autenticado
  const { data: leads, error } = await supabase
    .from('leads')
    .select('name, email, phone, device, country, region, city, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referral_source, created_at, pages(name, slug)')
    .eq('workspace_id', member.workspace_id)
    .order('created_at', { ascending: false })
    .limit(10000)

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar leads' }, { status: 500 })
  }

  // Gerar CSV
  const headers = [
    'Nome', 'E-mail', 'Telefone', 'Página', 'Slug',
    'Dispositivo', 'País', 'Estado', 'Cidade',
    'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Term', 'UTM Content',
    'Referência', 'Data',
  ]

  const rows = (leads ?? []).map(lead => {
    const page = (lead.pages as unknown) as { name: string; slug: string } | null
    return [
      lead.name ?? '',
      lead.email ?? '',
      lead.phone ?? '',
      page?.name ?? '',
      page?.slug ?? '',
      lead.device ?? '',
      lead.country ?? '',
      lead.region ?? '',
      lead.city ?? '',
      lead.utm_source ?? '',
      lead.utm_medium ?? '',
      lead.utm_campaign ?? '',
      lead.utm_term ?? '',
      lead.utm_content ?? '',
      lead.referral_source ?? '',
      new Date(lead.created_at).toLocaleString('pt-BR'),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
