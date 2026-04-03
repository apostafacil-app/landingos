import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Users, Monitor, Smartphone, Globe } from 'lucide-react'
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

  const { data: leads } = await supabase
    .from('leads')
    .select('id, name, email, phone, device, country, utm_source, utm_campaign, created_at, pages(name, slug)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(500)

  const total = leads?.length ?? 0

  function DeviceIcon({ device }: { device: string | null }) {
    if (device === 'mobile') return <Smartphone size={12} className="inline mr-1" />
    if (device === 'desktop') return <Monitor size={12} className="inline mr-1" />
    return <Globe size={12} className="inline mr-1" />
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Leads" subtitle="Contatos captados pelas suas páginas publicadas" />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total} lead{total !== 1 ? 's' : ''} captado{total !== 1 ? 's' : ''}
          </p>
          {total > 0 && <ExportButton workspaceId={workspaceId} />}
        </div>

        {!leads || leads.length === 0 ? (
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Users size={30} className="text-emerald-400" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Nenhum lead ainda</h2>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Os leads aparecerão aqui quando visitantes preencherem o formulário das suas páginas publicadas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-[#f9fafb] border-b border-border">
                  <th className="text-left px-5 py-3 font-medium rounded-tl-xl">Contato</th>
                  <th className="text-left px-3 py-3 font-medium">Página</th>
                  <th className="text-left px-3 py-3 font-medium">Dispositivo</th>
                  <th className="text-left px-3 py-3 font-medium">Origem</th>
                  <th className="text-right px-5 py-3 font-medium rounded-tr-xl">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => {
                  const page = (lead.pages as unknown) as { name: string; slug: string } | null
                  return (
                    <tr key={lead.id} className="hover:bg-[#f9fafb] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{lead.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lead.email ?? lead.phone ?? '—'}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        {page ? (
                          <div>
                            <p className="text-foreground font-medium">{page.name}</p>
                            <p className="text-xs text-muted-foreground">/{page.slug}</p>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-3.5">
                        {lead.device ? (
                          <span className="inline-flex items-center text-xs text-muted-foreground capitalize">
                            <DeviceIcon device={lead.device} />
                            {lead.device}
                          </span>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-muted-foreground">
                        {lead.utm_source ? (
                          <div>
                            <span className="font-medium text-foreground">{lead.utm_source}</span>
                            {lead.utm_campaign && <p className="text-muted-foreground">{lead.utm_campaign}</p>}
                          </div>
                        ) : lead.country ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(lead.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
