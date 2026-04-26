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
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap" />
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

  /* ─── LandingOS V3 layout (fallback para HTMLs antigos sem inline) ─── */
  .lp-page  { margin: 0; }
  .lp-block { position: relative; overflow: hidden; width: 100%; }
  .lp-block-inner { position: relative; margin: 0 auto; max-width: 1200px; width: 100%; height: 100%; }
  .lp-el    { position: absolute; box-sizing: border-box; z-index: 2; }
  /* Reset margin/padding default em h1-h6/p/ul/ol — somam ao "top" em position:absolute */
  .lp-page h1, .lp-page h2, .lp-page h3,
  .lp-page h4, .lp-page h5, .lp-page h6,
  .lp-page p, .lp-page ul, .lp-page ol, .lp-page blockquote { margin: 0; padding: 0; }
  .lp-page ul, .lp-page ol { list-style-position: inside; }
  .lp-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }
  .lp-el img { width: 100%; height: 100%; display: block; }
  .lp-page img { max-width: none; height: auto; }
  .lp-imagem img, .lp-page .lp-imagem img { width: 100%; height: 100%; }

  /* Animações de entrada V3 */
  @keyframes lpFade       { from { opacity: 0 }                                   to { opacity: 1 } }
  @keyframes lpSlideUp    { from { opacity: 0; transform: translateY(40px) }      to { opacity: 1; transform: translateY(0) } }
  @keyframes lpSlideDown  { from { opacity: 0; transform: translateY(-40px) }     to { opacity: 1; transform: translateY(0) } }
  @keyframes lpSlideLeft  { from { opacity: 0; transform: translateX(40px) }      to { opacity: 1; transform: translateX(0) } }
  @keyframes lpSlideRight { from { opacity: 0; transform: translateX(-40px) }     to { opacity: 1; transform: translateX(0) } }
  @keyframes lpZoom       { from { opacity: 0; transform: scale(.85) }            to { opacity: 1; transform: scale(1) } }
  @keyframes lpBounce     { 0% { transform: translateY(-30px); opacity: 0 } 60% { transform: translateY(8px); opacity: 1 } 100% { transform: translateY(0) } }
  @keyframes lpShake      { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-8px) } 75% { transform: translateX(8px) } }
  @keyframes lpFold       { from { opacity: 0; transform: perspective(600px) rotateX(-90deg); transform-origin: top } to { opacity: 1; transform: perspective(600px) rotateX(0) } }
  @keyframes lpRoll       { from { opacity: 0; transform: rotate(-180deg) scale(.6) } to { opacity: 1; transform: rotate(0) scale(1) } }
</style>
</head>
<body>
${html}
</body>
</html>`
}

/** Mesmo post-processor da rota publica — ver [slug]/page.tsx pra detalhes. */
function fixOldHtmlIssues(html: string): string {
  let out = html
  out = out.replace(
    /font-family:\s*([A-Za-z][A-Za-z0-9-]+(?:\s+[A-Za-z][A-Za-z0-9-]+)+)(\s*[;"])/g,
    (_match, family, terminator) => {
      const f = family.trim()
      if (/^['"]/.test(f) || !f.includes(' ')) return _match
      return `font-family: '${f}'${terminator}`
    },
  )
  out = out.replace(
    /<svg([^>]*?)fill="none"([^>]*?)stroke="currentColor"([^>]*?)><polygon points="12 2 15\.09 8\.26 22 9\.27/g,
    '<svg$1fill="currentColor"$2stroke="none"$3><polygon points="12 2 15.09 8.26 22 9.27',
  )
  return out
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
  const srcDoc = buildPreviewDoc(fixOldHtmlIssues(page.html), { faviconUrl: page.favicon_url, name: page.name })

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
