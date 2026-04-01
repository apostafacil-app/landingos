import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Download } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ExportButton } from './_export'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  const workspaceId = member?.workspace_id

  // Buscar leads com nome da página
  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, phone, device, country, utm_source, utm_campaign, created_at, pages(name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(500)

  const total = leads?.length ?? 0

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Leads" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {total} lead{total !== 1 ? 's' : ''} captado{total !== 1 ? 's' : ''}
          </p>
          {total > 0 && (
            <ExportButton workspaceId={workspaceId} />
          )}
        </div>

        {!leads || leads.length === 0 ? (
          <Card className="p-12 text-center">
            <Users size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="font-semibold text-foreground mb-2">Nenhum lead ainda</h2>
            <p className="text-sm text-muted-foreground">
              Os leads aparecerão aqui quando visitantes preencherem o formulário das suas páginas publicadas.
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left px-5 py-3 font-medium">Contato</th>
                    <th className="text-left px-3 py-3 font-medium">Página</th>
                    <th className="text-left px-3 py-3 font-medium">Dispositivo</th>
                    <th className="text-left px-3 py-3 font-medium">Origem</th>
                    <th className="text-right px-5 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const page = (lead.pages as unknown) as { name: string; slug: string } | null
                    return (
                      <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{lead.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{lead.email ?? lead.phone ?? '—'}</p>
                        </td>
                        <td className="px-3 py-3">
                          {page ? (
                            <div>
                              <p className="text-foreground">{page.name}</p>
                              <p className="text-xs text-muted-foreground">/{page.slug}</p>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-3">
                          {lead.device ? (
                            <Badge variant="secondary" className="text-xs capitalize">{lead.device}</Badge>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {lead.utm_source ? (
                            <span>{lead.utm_source}{lead.utm_campaign ? ` / ${lead.utm_campaign}` : ''}</span>
                          ) : lead.country ?? '—'}
                        </td>
                        <td className="px-5 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(lead.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
