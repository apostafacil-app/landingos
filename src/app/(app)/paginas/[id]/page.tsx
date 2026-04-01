import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageEditor } from './_editor'

export default async function PaginaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar workspace do usuário autenticado
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/login')

  // Buscar página — ownership verificado via workspace_id do token
  const { data: page } = await supabase
    .from('pages')
    .select('id, name, slug, status, html, meta_title, meta_description')
    .eq('id', id)
    .eq('workspace_id', member.workspace_id)
    .single()

  if (!page) notFound()

  // Buscar métricas
  const { data: metrics } = await supabase
    .from('page_metrics')
    .select('views_total, leads_total')
    .eq('page_id', id)
    .single()

  return (
    <PageEditor
      page={{
        ...page,
        leads_total: metrics?.leads_total ?? 0,
        views_total: metrics?.views_total ?? 0,
      }}
    />
  )
}
