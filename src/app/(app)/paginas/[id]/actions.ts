'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sanitizeEditorHtml } from '@/lib/sanitize'
import { z } from 'zod'

const updatePageSchema = z.object({
  pageId:             z.string().uuid(),
  name:               z.string().min(1).max(100),
  slug:               z.string().regex(/^[a-z0-9-]{1,60}$/),
  metaTitle:          z.string().max(160).optional(),
  metaDescription:    z.string().max(320).optional(),
  metaKeywords:       z.string().max(500).optional(),
  faviconUrl:         z.string().max(2000).optional(),
  indexable:          z.boolean().optional(),
  ogTitle:            z.string().max(200).optional(),
  ogDescription:      z.string().max(500).optional(),
  ogImageUrl:         z.string().max(2000).optional(),
  fbPixelId:          z.string().max(100).optional(),
  fbApiToken:         z.string().max(500).optional(),
  gaId:               z.string().max(50).optional(),
  gtmId:              z.string().max(50).optional(),
  headCode:           z.string().max(50000).optional(),
  bodyCode:           z.string().max(50000).optional(),
  lgpdEnabled:        z.boolean().optional(),
  lgpdMessage:        z.string().max(1000).optional(),
  notificationEmails: z.string().max(2000).optional(),
})

type ActionState = { error?: string; success?: boolean } | undefined

async function resolveWorkspace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: member } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  return member?.workspace_id ?? null
}

export async function updatePage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const parsed = updatePageSchema.safeParse({
    pageId:             formData.get('pageId'),
    name:               formData.get('name'),
    slug:               formData.get('slug'),
    metaTitle:          formData.get('metaTitle')          || undefined,
    metaDescription:    formData.get('metaDescription')    || undefined,
    metaKeywords:       formData.get('metaKeywords')       || undefined,
    faviconUrl:         formData.get('faviconUrl')         || undefined,
    indexable:          formData.get('indexable') !== 'false',
    ogTitle:            formData.get('ogTitle')            || undefined,
    ogDescription:      formData.get('ogDescription')      || undefined,
    ogImageUrl:         formData.get('ogImageUrl')         || undefined,
    fbPixelId:          formData.get('fbPixelId')          || undefined,
    fbApiToken:         formData.get('fbApiToken')         || undefined,
    gaId:               formData.get('gaId')               || undefined,
    gtmId:              formData.get('gtmId')              || undefined,
    headCode:           formData.get('headCode')           || undefined,
    bodyCode:           formData.get('bodyCode')           || undefined,
    lgpdEnabled:        formData.get('lgpdEnabled') === 'true',
    lgpdMessage:        formData.get('lgpdMessage')        || undefined,
    notificationEmails: formData.get('notificationEmails') || undefined,
  })
  if (!parsed.success) return { error: 'Dados inválidos' }

  const d = parsed.data

  const { data: member } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  if (!member) return { error: 'Workspace não encontrado' }

  const { data: page } = await supabase
    .from('pages').select('id').eq('id', d.pageId).eq('workspace_id', member.workspace_id).single()
  if (!page) return { error: 'Página não encontrada' }

  const { data: conflict } = await supabaseAdmin
    .from('pages').select('id')
    .eq('workspace_id', member.workspace_id).eq('slug', d.slug).neq('id', d.pageId).maybeSingle()
  if (conflict) return { error: 'Esse slug já está em uso por outra página' }

  const { error } = await supabaseAdmin.from('pages').update({
    name:                d.name,
    slug:                d.slug,
    meta_title:          d.metaTitle          ?? null,
    meta_description:    d.metaDescription    ?? null,
    meta_keywords:       d.metaKeywords       ?? null,
    favicon_url:         d.faviconUrl         || null,
    indexable:           d.indexable          ?? true,
    og_title:            d.ogTitle            ?? null,
    og_description:      d.ogDescription      ?? null,
    og_image_url:        d.ogImageUrl         || null,
    fb_pixel_id:         d.fbPixelId          ?? null,
    fb_api_token:        d.fbApiToken         ?? null,
    ga_id:               d.gaId               ?? null,
    gtm_id:              d.gtmId              ?? null,
    head_code:           d.headCode           ?? null,
    body_code:           d.bodyCode           ?? null,
    lgpd_enabled:        d.lgpdEnabled        ?? false,
    lgpd_message:        d.lgpdMessage        ?? null,
    notification_emails: d.notificationEmails ?? null,
  }).eq('id', d.pageId)

  if (error) return { error: 'Erro ao salvar. Tente novamente.' }
  revalidatePath(`/paginas/${d.pageId}`)
  return { success: true }
}

export async function saveHtml(pageId: string, rawHtml: string): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }
  if (!pageId || !/^[0-9a-f-]{36}$/.test(pageId)) return { error: 'ID inválido' }
  if (rawHtml.length > 2_000_000) return { error: 'Conteúdo muito grande' }
  const workspaceId = await resolveWorkspace()
  if (!workspaceId) return { error: 'Workspace não encontrado' }
  const { data: page } = await supabase
    .from('pages').select('id').eq('id', pageId).eq('workspace_id', workspaceId).single()
  if (!page) return { error: 'Página não encontrada' }
  // sanitizeEditorHtml preserva iframes (YouTube/Vimeo) que sao usados em
  // elementos de video. Usar sanitizeHtml (o basico) removeria todos os
  // videos ao salvar.
  const safeHtml = sanitizeEditorHtml(rawHtml)
  const { error } = await supabaseAdmin.from('pages').update({ html: safeHtml }).eq('id', pageId)
  if (error) return { error: 'Erro ao salvar' }
  revalidatePath(`/paginas/${pageId}`)
  return { success: true }
}

export async function togglePublish(pageId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: member } = await supabase
    .from('workspace_members').select('workspace_id').eq('user_id', user.id).single()
  if (!member) return
  const newStatus = currentStatus === 'published' ? 'draft' : 'published'
  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === 'published') updates.published_at = new Date().toISOString()
  await supabaseAdmin.from('pages').update(updates)
    .eq('id', pageId).eq('workspace_id', member.workspace_id)
  revalidatePath(`/paginas/${pageId}`)
  revalidatePath('/paginas')
}

export async function deletePage(pageId: string): Promise<{ error?: string }> {
  if (!pageId || !/^[0-9a-f-]{36}$/.test(pageId)) return { error: 'ID inválido' }
  const workspaceId = await resolveWorkspace()
  if (!workspaceId) return { error: 'Não autorizado' }
  const supabase = await createClient()
  const { data: page } = await supabase.from('pages').select('id')
    .eq('id', pageId).eq('workspace_id', workspaceId).maybeSingle()
  if (!page) return { error: 'Página não encontrada ou sem permissão.' }
  const { error: deleteErr } = await supabaseAdmin.from('pages').delete()
    .eq('id', pageId).eq('workspace_id', workspaceId)
  if (deleteErr) return { error: `Erro ao excluir: ${deleteErr.message}` }
  revalidatePath('/paginas', 'page')
  redirect('/paginas')
}
