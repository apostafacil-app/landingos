import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const BUCKET = 'page-images'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()

    if (!member?.workspace_id) {
      return NextResponse.json({ images: [] })
    }

    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(member.workspace_id, {
        limit: 200,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error || !files) {
      return NextResponse.json({ images: [] })
    }

    const images = files
      .filter((f) => f.name !== '.emptyFolderPlaceholder' && f.name)
      .map((f) => {
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage
          .from(BUCKET)
          .getPublicUrl(`${member.workspace_id}/${f.name}`)
        return {
          name: f.name,
          url: publicUrl,
          size: f.metadata?.size ?? 0,
          createdAt: f.created_at,
        }
      })

    return NextResponse.json({ images })
  } catch (err) {
    console.error('[images/list] error:', err)
    return NextResponse.json({ images: [] })
  }
}
