import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Constrói um documento HTML completo para o srcDoc do iframe.
 * - Inclui favicon se configurado
 * - Estilos de reset básico
 * - Garante que conteúdo puro de <body> (formato do editor) seja renderizado corretamente
 */
function buildPreviewDoc(html: string, opts: { faviconUrl?: string | null; name?: string } = {}): string {
  const { faviconUrl, name = 'Preview' } = opts

  // Se o HTML já é um documento completo, injetar o favicon e retornar
  if (/^\s*<!doctype/i.test(html) || /^\s*<html/i.test(html)) {
    if (faviconUrl && !html.includes('rel="icon"')) {
      return html.replace('</head>', `<link rel="icon" href="${faviconUrl}" />\n</head>`)
    }
    return html
  }

  // Caso contrário, é conteúdo de <body> (formato padrão do editor)
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${name}</title>
${faviconUrl ? `<link rel="icon" href="${faviconUrl}" />` : ''}
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }

  /* ─── LandingOS V3 layout (fallback para HTMLs antigos sem inline) ─── */
  .lp-page  { margin: 0; }
  .lp-block { position: relative; overflow: hidden; margin: 0 auto; max-width: 1200px; width: 100%; }
  .lp-el    { position: absolute; box-sizing: border-box; }
  .lp-el img { width: 100%; height: 100%; display: block; }
  .lp-page img { max-width: none; height: auto; }
  .lp-imagem img, .lp-page .lp-imagem img { width: 100%; height: 100%; }
</style>
</head>
<body>
${html}
</body>
</html>`
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
    .select('id, name, html, status, slug, favicon_url')
    .eq('id', id)
    .eq('workspace_id', member.workspace_id)
    .maybeSingle()

  if (!page || !page.html) notFound()

  const isDraft = page.status !== 'published'
  const srcDoc = buildPreviewDoc(page.html, { faviconUrl: page.favicon_url, name: page.name })

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
        srcDoc={srcDoc}
        style={{ flex: 1, border: 'none', display: 'block', width: '100%' }}
        title={`Preview: ${page.name}`}
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    </div>
  )
}
