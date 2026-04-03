import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Get workspace from JWT — never from body
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 403 })
  }

  // Check page limit (basic guard — detailed plan limits handled in billing)
  const { count } = await supabaseAdmin
    .from('pages')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', member.workspace_id)

  if ((count ?? 0) >= 100) {
    return NextResponse.json({ error: 'Limite de páginas atingido' }, { status: 429 })
  }

  // Generate a unique slug
  const baseSlug = `minha-pagina-${Date.now().toString(36)}`

  const { data: page, error } = await supabaseAdmin
    .from('pages')
    .insert({
      workspace_id: member.workspace_id,
      name: 'Nova página',
      slug: baseSlug,
      html: '',
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !page) {
    return NextResponse.json({ error: 'Erro ao criar página' }, { status: 500 })
  }

  return NextResponse.json({ pageId: page.id })
}
