import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const MAX_BYTES   = 2 * 1024 * 1024 // 2 MB
const BUCKET      = 'assets'
const ALLOWED     = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']

export async function POST(req: NextRequest) {
  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Arquivo muito grande (máx 2 MB)' }, { status: 413 })

    // Already-resized 32×32 PNG comes from the client (Canvas API)
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext    = file.type === 'image/svg+xml' ? 'svg' : 'png'
    const path   = `favicons/${user.id}-${Date.now()}.${ext}`

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: ext === 'svg' ? 'image/svg+xml' : 'image/png',
        upsert: true,
      })

    if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[favicon upload]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
