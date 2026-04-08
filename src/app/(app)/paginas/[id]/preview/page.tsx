import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params

  // Verificar autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verificar ownership via workspace
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member?.workspace_id) notFound()

  // Buscar página pelo id (sem filtro de status — funciona para rascunho e publicada)
  const { data: page } = await supabaseAdmin
    .from('pages')
    .select('id, name, html, status, slug')
    .eq('id', id)
    .eq('workspace_id', member.workspace_id)
    .maybeSingle()

  if (!page || !page.html) notFound()

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{page.name} — Preview</title>
        <meta name="robots" content="noindex,nofollow" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
          img { max-width: 100%; height: auto; }
          #preview-bar {
            position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
            background: #1e293b; color: #fff;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 20px; height: 44px;
            font-family: system-ui, sans-serif; font-size: 13px;
          }
          #preview-bar-left { display: flex; align-items: center; gap: 10px; }
          #preview-bar span.badge {
            background: #f59e0b; color: #000; font-size: 10px; font-weight: 700;
            padding: 2px 8px; border-radius: 999px; text-transform: uppercase; letter-spacing: .05em;
          }
          #preview-bar a, #preview-bar button {
            color: #94a3b8; background: none; border: none; cursor: pointer;
            font-size: 13px; text-decoration: none; padding: 0;
          }
          #preview-bar a:hover, #preview-bar button:hover { color: #fff; }
          #preview-bar .btn-publish {
            background: #2563eb; color: #fff; border-radius: 6px;
            padding: 6px 14px; font-size: 12px; font-weight: 600; text-decoration: none;
          }
          #preview-bar .btn-publish:hover { background: #1d4ed8; }
          body { padding-top: 44px; }
        `}</style>
      </head>
      <body>
        {/* Barra de preview */}
        <div id="preview-bar">
          <div id="preview-bar-left">
            <span className="badge">{page.status === 'published' ? 'Publicada' : 'Rascunho'}</span>
            <span style={{ color: '#cbd5e1' }}>{page.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href={`/paginas/${page.id}`}>← Voltar ao editor</a>
            {page.status !== 'published' && (
              <span style={{ color: '#64748b', fontSize: 12 }}>Publique para tornar acessível</span>
            )}
            {page.status === 'published' && (
              <a href={`/${page.slug}`} target="_blank" className="btn-publish">Ver página pública ↗</a>
            )}
          </div>
        </div>

        {/* Conteúdo da página */}
        <div dangerouslySetInnerHTML={{ __html: page.html }} />
      </body>
    </html>
  )
}
