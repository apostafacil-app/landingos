import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Força SSR fresh em cada request — sem isso Vercel pode servir HTML
// cacheado de antes dos fixes do post-processor (font-family, stars).
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

interface PageData {
  id: string
  name: string
  slug: string
  status: string
  html: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  favicon_url: string | null
  indexable: boolean | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  fb_pixel_id: string | null
  fb_api_token: string | null
  ga_id: string | null
  gtm_id: string | null
  head_code: string | null
  body_code: string | null
  lgpd_enabled: boolean | null
  lgpd_message: string | null
}

async function getPage(slug: string): Promise<PageData | null> {
  const { data } = await supabaseAdmin
    .from('pages')
    .select(`
      id, name, slug, status, html, content,
      meta_title, meta_description, meta_keywords,
      favicon_url, indexable,
      og_title, og_description, og_image_url,
      fb_pixel_id, fb_api_token, ga_id, gtm_id,
      head_code, body_code,
      lgpd_enabled, lgpd_message
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Página não encontrada' }
  return {
    title:       page.meta_title       || page.name,
    description: page.meta_description || undefined,
    keywords:    page.meta_keywords    || undefined,
    robots:      page.indexable === false ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      title:       page.og_title       || page.meta_title || page.name,
      description: page.og_description || page.meta_description || undefined,
      images:      page.og_image_url ? [page.og_image_url] : undefined,
    },
  }
}

/**
 * Post-processor: conserta problemas em HTMLs antigos salvos no banco
 * antes que fixes do serializer fossem aplicados. Roda em runtime sobre
 * page.html antes do dangerouslySetInnerHTML.
 */
function fixOldHtmlIssues(html: string): string {
  let out = html

  // 1) font-family multi-palavra sem aspas → CSS parser falha e cai pro
  //    fallback serif em h1-h6. Quota com aspas simples.
  out = out.replace(
    /font-family:\s*([A-Za-z][A-Za-z0-9-]+(?:\s+[A-Za-z][A-Za-z0-9-]+)+)(\s*[;"])/g,
    (_match, family, terminator) => {
      const f = family.trim()
      if (/^['"]/.test(f) || !f.includes(' ')) return _match
      return `font-family: '${f}'${terminator}`
    },
  )

  // 2) sanitize-html antigo strippava viewBox (camelCase) dos SVG.
  //    Sem viewBox, polygon coordenadas (24x24) renderizam em pixel-direto
  //    e ficam fora da area visivel do SVG (~11x11px) → aparece chevron
  //    quebrado em vez do icon. Inje ta viewBox="0 0 24 24" em qualquer
  //    SVG inline da biblioteca de icones (identificavel por xmlns +
  //    style com width%/height% mas SEM viewBox).
  out = out.replace(
    /<svg\b([^>]*?)>/g,
    (match, attrs) => {
      // Já tem viewBox? não mexe
      if (/\bviewBox=/i.test(attrs)) return match
      // É um SVG da nossa biblioteca? heuristica: tem xmlns + style com %
      if (!/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(attrs)) return match
      if (!/style="[^"]*width:\s*\d+%/.test(attrs)) return match
      return `<svg viewBox="0 0 24 24"${attrs}>`
    },
  )

  // 3) Outline star icons em tamanho pequeno renderizam mal por
  //    stroke-width:2. Substitui por filled (uso 99% e' rating filled).
  out = out.replace(
    /<svg\b([^>]*?)>\s*<polygon\s+points="12 2 15\.09 8\.26[^"]*"\s*\/>\s*<\/svg>/g,
    (match, attrs) => {
      if (/\bfill="currentColor"/.test(attrs)) return match
      const viewBox = (attrs.match(/viewBox="([^"]+)"/i) || [])[1] ?? '0 0 24 24'
      const styleM  = attrs.match(/style="([^"]*)"/)
      const style   = styleM ? ` style="${styleM[1]}"` : ''
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" stroke="none"${style}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    },
  )

  return out
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page || !page.html) notFound()

  const gtmId    = page.gtm_id    || null
  const gaId     = page.ga_id     || null
  const pixelId  = page.fb_pixel_id || null

  const lgpdMessage = page.lgpd_message || 'Este site usa cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade.'

  // FAQ Schema.org (JSON-LD) — para Google Rich Results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faqItems: Array<{ q: string; a: string }> = (page.content?.sections ?? [])
    .filter((s: any) => s.type === 'faq')
    .flatMap((s: any) => s.items ?? [])
    .filter((item: any) => item.q && item.a)

  const faqJsonLd = faqItems.length > 0 ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }) : null

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{page.meta_title || page.name}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.meta_keywords    && <meta name="keywords"    content={page.meta_keywords} />}
        {page.indexable === false && <meta name="robots" content="noindex,nofollow" />}

        {/* Favicon */}
        {page.favicon_url && <link rel="icon" href={page.favicon_url} />}

        {/* OG / Social */}
        {(page.og_title || page.meta_title) && (
          <meta property="og:title" content={page.og_title || page.meta_title || page.name} />
        )}
        {(page.og_description || page.meta_description) && (
          <meta property="og:description" content={page.og_description || page.meta_description || ''} />
        )}
        {page.og_image_url && <meta property="og:image" content={page.og_image_url} />}

        {/* FAQ Schema.org JSON-LD */}
        {faqJsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
        )}

        {/* Google Tag Manager */}
        {gtmId && (
          <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');` }} />
        )}

        {/* Google Analytics (GA4) */}
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');` }} />
          </>
        )}

        {/* Facebook Pixel */}
        {pixelId && (
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');` }} />
        )}

        {/* Page ID for form submission */}
        <script dangerouslySetInnerHTML={{ __html: `window.__lpPageId=${JSON.stringify(page.id)};` }} />

        {/* Custom <head> code */}
        {page.head_code && (
          <div dangerouslySetInnerHTML={{ __html: page.head_code }} />
        )}

        {/* Google Fonts — carrega as fontes mais usadas em landing pages
            premium. preconnect acelera o handshake. display=swap evita FOIT. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap"
        />

        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

          /* ─── LandingOS V3 — regras de layout ──────────────────────────
             Aplicadas globalmente para garantir que páginas funcionem
             mesmo se o sanitize-html stripou o <style> embedded no HTML.
             Server-rendered (não passa por sanitize). ────────────────── */
          .lp-page  { margin: 0; }
          /* Bloco full-width (cor/imagem de fundo "vazam" pra fora do container) */
          .lp-block { position: relative; overflow: hidden; width: 100%; }
          /* Inner: área onde elementos absolutos vivem, centralizada com max-width */
          .lp-block-inner { position: relative; margin: 0 auto; max-width: 1200px; width: 100%; height: 100%; }
          .lp-el    { position: absolute; box-sizing: border-box; z-index: 2; }
          /* Reset margin/padding de tags block (h1-h6, p, ul, ol, blockquote).
             CRÍTICO: o margin default do user-agent (ex: <h4> tem margin-top:
             1.33em) SOMA ao "top" de elementos position:absolute — empurrando
             títulos pra baixo e bagunçando o layout (sobrepondo elementos
             abaixo). O editor não tem esse problema porque renderiza tudo
             como <div>; só o publicado usa <h1>-<h6> semânticos. */
          .lp-page h1, .lp-page h2, .lp-page h3,
          .lp-page h4, .lp-page h5, .lp-page h6,
          .lp-page p, .lp-page ul, .lp-page ol, .lp-page blockquote {
            margin: 0; padding: 0;
          }
          .lp-page ul, .lp-page ol { list-style-position: inside; }
          /* Background image como camada (sanitize remove url() em CSS bg-image) */
          .lp-bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; pointer-events: none; }
          .lp-el img { width: 100%; height: 100%; display: block; }
          /* Sobrescreve o reset img (max-width:100%; height:auto) */
          .lp-page img { max-width: none; height: auto; }
          .lp-imagem img, .lp-page .lp-imagem img { width: 100%; height: 100%; }

          /* ─── Animações de entrada (V3) ─────────────────────────────── */
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

          /* LGPD Banner */
          #lgpd-banner {
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
            background: #1e293b; color: #fff; padding: 16px 24px;
            display: flex; align-items: center; justify-content: space-between;
            gap: 16px; flex-wrap: wrap; font-family: system-ui, sans-serif;
            font-size: 14px; line-height: 1.5; box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          }
          #lgpd-banner.hidden { display: none; }
          #lgpd-accept {
            background: #2563eb; color: #fff; border: none; border-radius: 8px;
            padding: 10px 24px; font-size: 14px; font-weight: 600; cursor: pointer;
            white-space: nowrap;
          }
          #lgpd-accept:hover { background: #1d4ed8; }
        `}</style>
      </head>
      <body>
        {/* GTM noscript */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Page content */}
        <div dangerouslySetInnerHTML={{ __html: fixOldHtmlIssues(page.html) }} />

        {/* LGPD Banner */}
        {page.lgpd_enabled && (
          <div id="lgpd-banner">
            <span>{lgpdMessage}</span>
            <button id="lgpd-accept">Aceitar e continuar</button>
          </div>
        )}

        {/* Custom body code */}
        {page.body_code && (
          <div dangerouslySetInnerHTML={{ __html: page.body_code }} />
        )}

        {/* Form submit handler + máscaras + UTM auto-fill */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            // ── Máscaras (BR) ─────────────────────────────────────────
            // Aplicadas em input[data-lp-mask] no input event.
            function maskValue(kind, v) {
              v = (v || '').replace(/\\D/g, '');
              if (kind === 'phone-br') {
                if (v.length > 11) v = v.slice(0,11);
                if (v.length > 10) return v.replace(/(\\d{2})(\\d{5})(\\d{0,4}).*/, '($1) $2-$3');
                if (v.length > 6)  return v.replace(/(\\d{2})(\\d{4})(\\d{0,4}).*/, '($1) $2-$3');
                if (v.length > 2)  return v.replace(/(\\d{2})(\\d{0,5}).*/, '($1) $2');
                return v.length ? '(' + v : '';
              }
              if (kind === 'cpf') {
                if (v.length > 11) v = v.slice(0,11);
                return v.replace(/(\\d{3})(\\d{0,3})(\\d{0,3})(\\d{0,2}).*/, function(_,a,b,c,d){
                  return [a, b && '.'+b, c && '.'+c, d && '-'+d].filter(Boolean).join('');
                });
              }
              if (kind === 'cnpj') {
                if (v.length > 14) v = v.slice(0,14);
                return v.replace(/(\\d{2})(\\d{0,3})(\\d{0,3})(\\d{0,4})(\\d{0,2}).*/, function(_,a,b,c,d,e){
                  return [a, b && '.'+b, c && '.'+c, d && '/'+d, e && '-'+e].filter(Boolean).join('');
                });
              }
              if (kind === 'cep') {
                if (v.length > 8) v = v.slice(0,8);
                return v.replace(/(\\d{5})(\\d{0,3}).*/, function(_,a,b){
                  return [a, b && '-'+b].filter(Boolean).join('');
                });
              }
              return v;
            }
            document.addEventListener('input', function(e){
              var t = e.target;
              if (!t || !t.getAttribute) return;
              var k = t.getAttribute('data-lp-mask');
              if (!k) return;
              t.value = maskValue(k, t.value);
            });

            // ── Pré-preenchimento UTM em inputs hidden ────────────────
            try {
              var qs = new URLSearchParams(window.location.search);
              document.querySelectorAll('input[type="hidden"]').forEach(function(h){
                var n = h.getAttribute('name');
                if (!n || h.value) return;
                var v = qs.get(n);
                if (v) h.value = v;
              });
            } catch(ex) {}

            // ── Submit handler ────────────────────────────────────────
            document.addEventListener('submit', function(e){
              var form = e.target;
              if (!form || !form.hasAttribute || !form.hasAttribute('data-lp-form')) return;
              e.preventDefault();
              var btn = form.querySelector('button[type="submit"]');
              var originalText = btn ? btn.textContent : '';
              if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
              var inputs = form.querySelectorAll('input, select, textarea');
              var name = null, email = null, phone = null, custom = {};
              inputs.forEach(function(inp){
                if (!inp.name) return;
                // Checkboxes/radios: agrupar por name (múltiplos valores)
                if (inp.type === 'checkbox' || inp.type === 'radio') {
                  if (!inp.checked) return;
                  if (custom[inp.name] != null) {
                    custom[inp.name] = [].concat(custom[inp.name], inp.value);
                  } else {
                    custom[inp.name] = inp.value;
                  }
                  return;
                }
                if (!inp.value) return;
                if (inp.name === 'name')        name  = inp.value;
                else if (inp.name === 'email')  email = inp.value;
                else if (inp.name === 'phone')  phone = inp.value;
                else                            custom[inp.name] = inp.value;
              });
              var payload = { page_id: window.__lpPageId };
              if (name)  payload.name  = name;
              if (email) payload.email = email;
              if (phone) payload.phone = phone;
              if (Object.keys(custom).length) payload.custom_fields = custom;
              var redirect       = form.getAttribute('data-redirect')        || '';
              var successMsg     = form.getAttribute('data-success-message') || '';
              var webhookUrl     = form.getAttribute('data-webhook-url')     || '';
              var webhookMethod  = form.getAttribute('data-webhook-method')  || 'POST_JSON';
              var webhookToken   = form.getAttribute('data-webhook-token')   || '';
              var fbPixelEvent   = form.getAttribute('data-fb-pixel-event')  || '';

              // Fire webhook (best-effort, non-blocking)
              if (webhookUrl) {
                try {
                  var wHeaders = { 'Content-Type': 'application/json' };
                  if (webhookToken) wHeaders['Authorization'] = 'Bearer ' + webhookToken;
                  var wBody = Object.assign({}, payload);
                  if (webhookMethod === 'GET') {
                    var qsW = Object.keys(wBody).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(wBody[k]); }).join('&');
                    fetch(webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + qsW).catch(function(){});
                  } else {
                    fetch(webhookUrl, { method: 'POST', headers: wHeaders, body: JSON.stringify(wBody) }).catch(function(){});
                  }
                } catch(ex) {}
              }

              // Fire Facebook Pixel event (se configurado E fbq disponível)
              if (fbPixelEvent && typeof window.fbq === 'function') {
                try { window.fbq('track', fbPixelEvent); } catch(ex) {}
              }
              // Google Tag Manager dataLayer push
              if (window.dataLayer && typeof window.dataLayer.push === 'function') {
                try { window.dataLayer.push({ event: 'lp_form_submit', form_id: form.id || null }); } catch(ex) {}
              }

              fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(function(r){ return r.json(); }).then(function(){
                if (redirect) { window.location.href = redirect; }
                else {
                  var msg = successMsg || '✓ Enviado com sucesso!';
                  if (btn) { btn.disabled = false; btn.textContent = msg; }
                  form.reset();
                  setTimeout(function(){ if (btn) btn.textContent = originalText; }, 4000);
                }
              }).catch(function(){
                if (btn) { btn.disabled = false; btn.textContent = originalText; }
              });
            });
          })();
        ` }} />

        {/* LGPD dismiss script */}
        {page.lgpd_enabled && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(){
              var KEY = 'lgpd_accepted';
              var banner = document.getElementById('lgpd-banner');
              var btn = document.getElementById('lgpd-accept');
              if (!banner) return;
              if (localStorage.getItem(KEY)) { banner.classList.add('hidden'); return; }
              btn && btn.addEventListener('click', function() {
                localStorage.setItem(KEY, '1');
                banner.classList.add('hidden');
              });
            })();
          ` }} />
        )}
      </body>
    </html>
  )
}
