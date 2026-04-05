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

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  if (!member) redirect('/login')

  const { data: page } = await supabase
    .from('pages')
    .select(`
      id, name, slug, status, html,
      meta_title, meta_description, meta_keywords,
      favicon_url, indexable,
      og_title, og_description, og_image_url,
      fb_pixel_id, fb_api_token, ga_id, gtm_id,
      head_code, body_code,
      lgpd_enabled, lgpd_message,
      notification_emails
    `)
    .eq('id', id)
    .eq('workspace_id', member.workspace_id)
    .single()

  if (!page) notFound()

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
