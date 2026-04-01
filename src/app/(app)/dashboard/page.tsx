import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LeadsChart } from '@/components/pages/LeadsChart'
import { FileText, Users, Eye, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar workspace do usuário
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(plan, ai_credits_limit, ai_credits_used)')
    .eq('user_id', user.id)
    .single()

  const workspaceId = member?.workspace_id
  const workspace = (member?.workspaces as unknown) as { plan: string; ai_credits_limit: number; ai_credits_used: number } | null

  // Métricas das páginas
  const { data: pages } = await supabase
    .from('page_metrics')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('leads_7d', { ascending: false })

  const totalPages = pages?.length ?? 0
  const totalLeads = pages?.reduce((sum, p) => sum + (p.leads_total ?? 0), 0) ?? 0
  const totalViews = pages?.reduce((sum, p) => sum + (p.views_total ?? 0), 0) ?? 0
  const leadsWeek = pages?.reduce((sum, p) => sum + (p.leads_7d ?? 0), 0) ?? 0
  const avgConversion = totalViews > 0
    ? ((totalLeads / totalViews) * 100).toFixed(1)
    : '0.0'

  // Leads dos últimos 7 dias agrupados por dia
  const since = subDays(new Date(), 6).toISOString()
  const { data: leadsRaw } = await supabase
    .from('leads')
    .select('created_at')
    .eq('workspace_id', workspaceId)
    .gte('created_at', since)

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const label = format(day, 'dd/MM', { locale: ptBR })
    const dateStr = format(day, 'yyyy-MM-dd')
    const leads = leadsRaw?.filter(l => l.created_at.startsWith(dateStr)).length ?? 0
    return { date: label, leads }
  })

  const creditsUsed = workspace?.ai_credits_used ?? 0
  const creditsLimit = workspace?.ai_credits_limit ?? 10
  const creditsLeft = creditsLimit - creditsUsed

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Dashboard" />

      <div className="p-6 space-y-6">
        {/* Cards de métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Páginas criadas"
            value={totalPages}
            icon={<FileText size={18} className="text-primary" />}
          />
          <MetricCard
            label="Leads (7 dias)"
            value={leadsWeek}
            icon={<Users size={18} className="text-primary" />}
            sub={`${totalLeads} total`}
          />
          <MetricCard
            label="Visualizações"
            value={totalViews}
            icon={<Eye size={18} className="text-primary" />}
          />
          <MetricCard
            label="Taxa de conversão"
            value={`${avgConversion}%`}
            icon={<TrendingUp size={18} className="text-primary" />}
            sub="média geral"
          />
        </div>

        {/* Gráfico + créditos IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">Leads captados</h2>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </div>
              <Badge variant="secondary">{leadsWeek} esta semana</Badge>
            </div>
            <LeadsChart data={chartData} />
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div>
              <h2 className="font-semibold text-foreground mb-1">Créditos de IA</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Usados para gerar páginas com inteligência artificial
              </p>
              <div className="text-4xl font-bold text-primary mb-1">{creditsLeft}</div>
              <p className="text-sm text-muted-foreground">de {creditsLimit} disponíveis</p>

              {/* Barra de progresso */}
              <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((creditsUsed / creditsLimit) * 100, 100)}%` }}
                />
              </div>
            </div>

            <a
              href="/paginas/nova"
              className="mt-6 inline-flex items-center justify-center w-full h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              + Criar página com IA
            </a>
          </Card>
        </div>

        {/* Tabela de páginas */}
        <Card className="p-5">
          <h2 className="font-semibold text-foreground mb-4">Suas páginas</h2>
          {!pages || pages.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <FileText size={36} className="mx-auto mb-3 opacity-30" />
              <p>Nenhuma página criada ainda.</p>
              <p className="mt-1">Use o botão acima para criar sua primeira landing page com IA.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left py-2 pr-4 font-medium">Página</th>
                    <th className="text-left py-2 pr-4 font-medium">Status</th>
                    <th className="text-right py-2 pr-4 font-medium">Views</th>
                    <th className="text-right py-2 pr-4 font-medium">Leads</th>
                    <th className="text-right py-2 font-medium">Conversão 7d</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.page_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-foreground">{page.name}</p>
                        <p className="text-xs text-muted-foreground">/{page.slug}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-right">{page.views_total ?? 0}</td>
                      <td className="py-3 pr-4 text-right">{page.leads_total ?? 0}</td>
                      <td className="py-3 text-right font-medium text-primary">
                        {page.conversion_rate_7d ?? 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  )
}
