import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase/admin'

interface Props {
  params: Promise<{ slug: string }>
}

interface PageData {
  id: string
  name: string
  slug: string
  status: string
  html: string | null
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
      id, name, slug, status, html,
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

export default async function PublicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page || !page.html) notFound()

  const gtmId    = page.gtm_id    || null
  const gaId     = page.ga_id     || null
  const pixelId  = page.fb_pixel_id || null

  const lgpdMessage = page.lgpd_message || 'Este site usa cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade.'

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

        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
          img { max-width: 100%; height: auto; }

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
        <div dangerouslySetInnerHTML={{ __html: page.html }} />

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

        {/* Form submit handler */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
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
                if (!inp.name || !inp.value) return;
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
              var redirect      = form.getAttribute('data-redirect')       || '';
              var webhookUrl    = form.getAttribute('data-webhook-url')    || '';
              var webhookMethod = form.getAttribute('data-webhook-method') || 'POST_JSON';
              var webhookToken  = form.getAttribute('data-webhook-token')  || '';

              // Fire webhook (best-effort, non-blocking)
              if (webhookUrl) {
                try {
                  var wHeaders = { 'Content-Type': 'application/json' };
                  if (webhookToken) wHeaders['Authorization'] = 'Bearer ' + webhookToken;
                  var wBody = Object.assign({}, payload);
                  if (webhookMethod === 'GET') {
                    var qs = Object.keys(wBody).map(function(k){ return encodeURIComponent(k)+'='+encodeURIComponent(wBody[k]); }).join('&');
                    fetch(webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + qs).catch(function(){});
                  } else {
                    fetch(webhookUrl, { method: 'POST', headers: wHeaders, body: JSON.stringify(wBody) }).catch(function(){});
                  }
                } catch(ex) {}
              }

              fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(function(r){ return r.json(); }).then(function(){
                if (redirect) { window.location.href = redirect; }
                else {
                  if (btn) { btn.disabled = false; btn.textContent = '✓ Enviado com sucesso!'; }
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
