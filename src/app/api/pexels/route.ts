import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

export async function GET(req: NextRequest) {
  // Auth guard — only logged-in users can use this proxy
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!PEXELS_API_KEY) {
    return NextResponse.json(
      { error: 'Pexels não configurado. Adicione PEXELS_API_KEY no .env.local' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('q') || 'business').slice(0, 100)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const perPage = 20

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`,
    {
      headers: { Authorization: PEXELS_API_KEY },
      next: { revalidate: 300 },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Erro na API Pexels' }, { status: res.status })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos = (data.photos || []).map((p: any) => ({
    id: p.id,
    url: p.src.large2x || p.src.large || p.src.original,
    thumb: p.src.medium,
    photographer: p.photographer,
    alt: p.alt || '',
  }))

  return NextResponse.json({
    photos,
    totalResults: data.total_results ?? 0,
    page: data.page ?? page,
    hasMore: Boolean(data.next_page),
  })
}
