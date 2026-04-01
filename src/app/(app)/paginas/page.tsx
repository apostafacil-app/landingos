import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus } from 'lucide-react'

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

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Páginas" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {pages?.length ?? 0} página{pages?.length !== 1 ? 's' : ''} criada{pages?.length !== 1 ? 's' : ''}
          </p>
          <Link
            href="/paginas/nova"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Nova página com IA
          </Link>
        </div>

        {!pages || pages.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <h2 className="font-semibold text-foreground mb-2">Nenhuma página ainda</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Crie sua primeira landing page com IA em menos de 2 minutos.
            </p>
            <Link
              href="/paginas/nova"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Criar com IA
            </Link>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs">
                    <th className="text-left px-5 py-3 font-medium">Página</th>
                    <th className="text-left px-3 py-3 font-medium">Status</th>
                    <th className="text-right px-3 py-3 font-medium">Views</th>
                    <th className="text-right px-3 py-3 font-medium">Leads</th>
                    <th className="text-right px-3 py-3 font-medium">Conversão 7d</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.page_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{page.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">/{page.slug}</p>
                      </td>
                      <td className="px-3 py-4">
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="px-3 py-4 text-right">{page.views_total ?? 0}</td>
                      <td className="px-3 py-4 text-right">{page.leads_total ?? 0}</td>
                      <td className="px-3 py-4 text-right font-medium text-primary">
                        {page.conversion_rate_7d ?? 0}%
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/paginas/${page.page_id}`}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
