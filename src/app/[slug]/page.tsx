import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ slug: string }>
}

/* ── Fetch page by slug (public — service role bypasses RLS) ───────── */
async function getPage(slug: string) {
  const { data } = await supabaseAdmin
    .from('pages')
    .select('id, name, slug, status, html, meta_title, meta_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return data
}

/* ── Dynamic SEO metadata ──────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Página não encontrada' }
  return {
    title: page.meta_title || page.name,
    description: page.meta_description || undefined,
  }
}

/* ── Page component ────────────────────────────────────────────────── */
export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page || !page.html) notFound()

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{page.meta_title || page.name}</title>
        {page.meta_description && (
          <meta name="description" content={page.meta_description} />
        )}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
          img { max-width: 100%; height: auto; }
        `}</style>
      </head>
      <body dangerouslySetInnerHTML={{ __html: page.html }} />
    </html>
  )
}
