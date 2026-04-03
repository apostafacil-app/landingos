import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Eye, Users, TrendingUp } from 'lucide-react'
import { RowActions } from './_row-actions'

export default async function PaginasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  const { data: pages } = await supabase
    .from('page_metrics')
    .select('*')
    .eq('workspace_id', member?.workspace_id)
    .order('leads_total', { ascending: false })

  const count = pages?.length ?? 0

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Páginas" subtitle="Gerencie e acompanhe suas landing pages" />

      <div className="p-6 max-w-5xl space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {count} página{count !== 1 ? 's' : ''} criada{count !== 1 ? 's' : ''}
          </p>
          <Link
            href="/paginas/nova"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nova página com IA
          </Link>
        </div>

        {!pages || pages.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
              <FileText size={30} className="text-primary/50" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Nenhuma página ainda</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Crie sua primeira landing page com IA em menos de 2 minutos.
            </p>
            <Link
              href="/paginas/nova"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Criar com IA
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground bg-[#f9fafb] border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Página</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-right px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1"><Eye size={11} /> Views</span>
                  </th>
                  <th className="text-right px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1"><Users size={11} /> Leads</span>
                  </th>
                  <th className="text-right px-3 py-3 font-medium">
                    <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Conv. 7d</span>
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((page) => (
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
                    <td className="px-3 py-3.5 text-right font-semibold text-primary">{page.conversion_rate_7d ?? 0}%</td>
                    <td className="px-3 py-3.5 text-right">
                      <RowActions page={page} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
