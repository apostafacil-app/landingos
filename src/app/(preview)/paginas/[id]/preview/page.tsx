import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member?.workspace_id) notFound()

  const { data: page } = await supabaseAdmin
    .from('pages')
    .select('id, name, html, status, slug')
    .eq('id', id)
    .eq('workspace_id', member.workspace_id)
    .maybeSingle()

  if (!page || !page.html) notFound()

  const isDraft = page.status !== 'published'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Barra de preview */}
      <div style={{
        background: '#0f172a',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '44px',
        flexShrink: 0,
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: isDraft ? '#f59e0b' : '#22c55e',
            color: isDraft ? '#000' : '#fff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '.05em',
          }}>
            {isDraft ? 'Rascunho' : 'Publicada'}
          </span>
          <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{page.name}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isDraft && (
            <span style={{ color: '#64748b', fontSize: '12px' }}>
              Publique para tornar acessível ao público
            </span>
          )}
          {!isDraft && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              style={{
                background: '#2563eb',
                color: '#fff',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Ver página pública ↗
            </a>
          )}
          <a
            href={`/paginas/${page.id}`}
            style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}
          >
            ← Voltar ao editor
          </a>
        </div>
      </div>

      {/* Conteúdo isolado em iframe para não vazar CSS */}
      <iframe
        srcDoc={page.html}
        style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
        title={`Preview: ${page.name}`}
      />
    </div>
  )
}
