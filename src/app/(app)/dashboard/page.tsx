import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { LeadsChart } from '@/components/pages/LeadsChart'
import { FileText, Users, Eye, TrendingUp, TrendingDown, Plus, ArrowUpRight } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

/** Calcula variação percentual entre valor atual e anterior */
function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : null
  return Math.round(((curr - prev) / prev) * 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(plan, ai_credits_limit, ai_credits_used)')
    .eq('user_id', user.id)
    .single()

  const workspaceId = member?.workspace_id
  const workspace = (member?.workspaces as unknown) as { plan: string; ai_credits_limit: number; ai_credits_used: number } | null

  // Datas para comparação semanal
  const now = new Date()
  const d7  = subDays(now, 7).toISOString()   // início da semana atual
  const d14 = subDays(now, 14).toISOString()  // início da semana anterior

  // Queries paralelas para não penalizar performance
  const [
    { data: pages },
    { data: leadsCurr },
    { data: leadsPrev },
    { data: pagesCurr },
    { data: pagesPrev },
  ] = await Promise.all([
    supabase.from('page_metrics').select('*').eq('workspace_id', workspaceId).order('leads_7d', { ascending: false }),
    // Leads últimos 7 dias (para chart e comparação)
    supabase.from('leads').select('created_at').eq('workspace_id', workspaceId).gte('created_at', d7),
    // Leads 7-14 dias atrás (semana anterior)
    supabase.from('leads').select('created_at').eq('workspace_id', workspaceId).gte('created_at', d14).lt('created_at', d7),
    // Páginas criadas nesta semana
    supabase.from('pages').select('id').eq('workspace_id', workspaceId).gte('created_at', d7),
    // Páginas criadas na semana anterior
    supabase.from('pages').select('id').eq('workspace_id', workspaceId).gte('created_at', d14).lt('created_at', d7),
  ])

  const totalPages = pages?.length ?? 0
  const totalLeads = pages?.reduce((s, p) => s + (p.leads_total ?? 0), 0) ?? 0
  const totalViews = pages?.reduce((s, p) => s + (p.views_total ?? 0), 0) ?? 0
  const leadsWeek = leadsCurr?.length ?? 0
  const leadsWeekPrev = leadsPrev?.length ?? 0
  const pagesThisWeek = pagesCurr?.length ?? 0
  const pagesPrevWeek = pagesPrev?.length ?? 0
  const avgConversion = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0'

  // Variações percentuais
  const leadsChange = pctChange(leadsWeek, leadsWeekPrev)
  const pagesChange = pctChange(pagesThisWeek, pagesPrevWeek)

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i)
    const label = format(day, 'EEE', { locale: ptBR })
    const dateStr = format(day, 'yyyy-MM-dd')
    const leads = leadsCurr?.filter(l => l.created_at.startsWith(dateStr)).length ?? 0
    return { date: label, leads }
  })

  const creditsUsed = workspace?.ai_credits_used ?? 0
  const creditsLimit = workspace?.ai_credits_limit ?? 10
  const creditsLeft = creditsLimit - creditsUsed
  const creditsPct = Math.min((creditsUsed / creditsLimit) * 100, 100)

  const stats = [
    {
      label: 'Páginas criadas', value: totalPages,
      icon: FileText, color: 'bg-blue-50 text-blue-600', border: 'border-l-blue-500',
      change: pagesChange, changeSub: 'vs semana passada',
    },
    {
      label: 'Leads esta semana', value: leadsWeek,
      icon: Users, color: 'bg-emerald-50 text-emerald-600', border: 'border-l-emerald-500',
      sub: `${totalLeads} total`, change: leadsChange, changeSub: 'vs semana passada',
    },
    {
      label: 'Visualizações', value: totalViews,
      icon: Eye, color: 'bg-violet-50 text-violet-600', border: 'border-l-violet-500',
    },
    {
      label: 'Taxa de conversão', value: `${avgConversion}%`,
      icon: TrendingUp, color: 'bg-amber-50 text-amber-600', border: 'border-l-amber-500',
      sub: 'média geral',
    },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Dashboard" subtitle="Visão geral da sua conta" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, border, sub, change, changeSub }) => (
            <div key={label} className={`bg-white rounded-xl p-5 border-l-4 ${border} shadow-[0_1px_4px_rgba(0,0,0,0.06)]`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium mb-2">{label}</p>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  {/* Indicador de tendência — regras 6.11 e 6.12 */}
                  {change !== null && change !== undefined ? (
                    <div className={`flex items-center gap-0.5 mt-1.5 text-xs font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {change >= 0
                        ? <TrendingUp size={11} />
                        : <TrendingDown size={11} />
                      }
                      <span>{change >= 0 ? '+' : ''}{change}%</span>
                      {changeSub && <span className="text-muted-foreground font-normal ml-0.5">{changeSub}</span>}
                    </div>
                  ) : sub ? (
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                  ) : null}
                </div>
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0 ml-3`}>
                  <Icon size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Credits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">Leads captados</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Últimos 7 dias</p>
              </div>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {leadsWeek} esta semana
              </span>
            </div>
            <LeadsChart data={chartData} />
          </div>

          <div className="bg-white rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex flex-col">
            <h2 className="text-[14px] font-semibold text-foreground mb-1">Créditos de IA</h2>
            <p className="text-xs text-muted-foreground mb-5">Gerações de página disponíveis</p>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-primary">{creditsLeft}</span>
                <span className="text-sm text-muted-foreground mb-1">/ {creditsLimit}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">créditos disponíveis</p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${creditsPct}%` }}
                />
              </div>
            </div>

            <Link
              href="/paginas/nova"
              className="mt-5 flex items-center justify-center gap-2 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Gerar página com IA
            </Link>
          </div>
        </div>

        {/* Tabela de páginas */}
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-[14px] font-semibold text-foreground">Suas páginas</h2>
            <Link href="/paginas" className="text-xs text-primary hover:underline flex items-center gap-1 font-medium">
              Ver todas <ArrowUpRight size={12} />
            </Link>
          </div>

          {!pages || pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={36} className="mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhuma página criada ainda.</p>
              <Link href="/paginas/nova" className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                <Plus size={14} /> Criar com IA
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-[#f9fafb]">
                  <th className="text-left px-5 py-3 font-medium">Página</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-right px-3 py-3 font-medium">Views</th>
                  <th className="text-right px-3 py-3 font-medium">Leads</th>
                  <th className="text-right px-5 py-3 font-medium">Conversão 7d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.slice(0, 5).map(page => (
                  <tr key={page.page_id} className="hover:bg-[#f9fafb] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/paginas/${page.page_id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {page.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">/{page.slug}</p>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground">{page.views_total ?? 0}</td>
                    <td className="px-3 py-3.5 text-right text-muted-foreground">{page.leads_total ?? 0}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-primary">{page.conversion_rate_7d ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
