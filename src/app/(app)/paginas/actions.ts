'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/** Retorna workspace_id do usuário autenticado */
async function resolveWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  return member?.workspace_id ?? null
}

/** 4.3 — Excluir página com verificação de ownership */
export async function deletePage(pageId: string): Promise<{ error?: string; success?: boolean }> {
  if (!pageId || !/^[0-9a-f-]{36}$/.test(pageId)) return { error: 'ID inválido' }

  const workspaceId = await resolveWorkspace()
  if (!workspaceId) return { error: 'Não autorizado' }

  // Verificar ownership via user client (respeita RLS de SELECT)
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('id', pageId)
    .eq('workspace_id', workspaceId)
    .maybeSingle()

  if (!page) return { error: 'Página não encontrada ou sem permissão.' }

  // Admin client bypassa RLS — único modo garantido de deletar
  const { error: deleteErr } = await supabaseAdmin
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('workspace_id', workspaceId)

  if (deleteErr) return { error: `Erro ao excluir: ${deleteErr.message}` }

  // Invalida o cache RSC da listagem — Next.js vai re-renderizar automaticamente
  revalidatePath('/paginas', 'page')
  revalidatePath('/dashboard')
  return { success: true }
}

/** 4.3 — Duplicar página (cria cópia como rascunho) */
export async function duplicatePage(pageId: string): Promise<{ newId?: string; error?: string }> {
  if (!pageId || !/^[0-9a-f-]{36}$/.test(pageId)) return { error: 'ID inválido' }

  const workspaceId = await resolveWorkspace()
  if (!workspaceId) return { error: 'Não autorizado' }

  const supabase = await createClient()
  const { data: original } = await supabase
    .from('pages')
    .select('name, slug, html, meta_title, meta_description')
    .eq('id', pageId)
    .eq('workspace_id', workspaceId)
    .single()
  if (!original) return { error: 'Página não encontrada' }

  // Gerar slug único: slug-copia, slug-copia-2, slug-copia-3 ...
  const baseSlug = `${original.slug}-copia`
  let slug = baseSlug

  for (let attempt = 1; attempt <= 10; attempt++) {
    const { data: conflict } = await supabaseAdmin
      .from('pages')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .maybeSingle()

    if (!conflict) break
    slug = `${baseSlug}-${attempt}`
  }

  const { data: newPage, error } = await supabaseAdmin
    .from('pages')
    .insert({
      workspace_id: workspaceId,
      name: `${original.name} (Cópia)`,
      slug,
      html: original.html,
      meta_title: original.meta_title,
      meta_description: original.meta_description,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !newPage) return { error: 'Erro ao duplicar.' }

  revalidatePath('/paginas')
  revalidatePath('/dashboard')
  return { newId: newPage.id }
}
