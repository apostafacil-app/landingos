'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const updatePageSchema = z.object({
  pageId:          z.string().uuid(),
  name:            z.string().min(1).max(100),
  slug:            z.string().regex(/^[a-z0-9-]{1,60}$/),
  metaTitle:       z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
})

type ActionState = { error?: string; success?: boolean } | undefined

export async function updatePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const parsed = updatePageSchema.safeParse({
    pageId:          formData.get('pageId'),
    name:            formData.get('name'),
    slug:            formData.get('slug'),
    metaTitle:       formData.get('metaTitle') || undefined,
    metaDescription: formData.get('metaDescription') || undefined,
  })
  if (!parsed.success) return { error: 'Dados inválidos' }

  const { pageId, name, slug, metaTitle, metaDescription } = parsed.data

  // Verificar ownership via workspace_id do token JWT — nunca via body
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return { error: 'Workspace não encontrado' }

  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('id', pageId)
    .eq('workspace_id', member.workspace_id)
    .single()
  if (!page) return { error: 'Página não encontrada' }

  // Verificar slug único no workspace (exceto a própria página)
  const { data: conflict } = await supabaseAdmin
    .from('pages')
    .select('id')
    .eq('workspace_id', member.workspace_id)
    .eq('slug', slug)
    .neq('id', pageId)
    .maybeSingle()
  if (conflict) return { error: 'Esse slug já está em uso por outra página' }

  const { error } = await supabaseAdmin
    .from('pages')
    .update({ name, slug, meta_title: metaTitle, meta_description: metaDescription })
    .eq('id', pageId)

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }

  revalidatePath(`/paginas/${pageId}`)
  return { success: true }
}

export async function togglePublish(pageId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return

  const newStatus = currentStatus === 'published' ? 'draft' : 'published'
  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'published') updates.published_at = new Date().toISOString()

  await supabaseAdmin
    .from('pages')
    .update(updates)
    .eq('id', pageId)
    .eq('workspace_id', member.workspace_id)

  revalidatePath(`/paginas/${pageId}`)
  revalidatePath('/paginas')
}
