import DOMPurify from 'isomorphic-dompurify'

// Domínios permitidos para iframes (video embeds)
const ALLOWED_IFRAME_ORIGINS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com',
]

// Tags e atributos permitidos para landing pages (geração por IA)
const BASE_CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
    'a', 'img',
    'button', 'form', 'input', 'label', 'textarea',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'figure', 'figcaption', 'style',
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'style', 'data-gjs-type',
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height', 'loading',
    'type', 'placeholder', 'name', 'value', 'required',
    'for', 'frameborder', 'allow', 'allowfullscreen',
  ],
  // Bloquear absolutamente qualquer handler de evento
  FORBID_ATTR: [
    'onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeyup', 'onkeypress', 'onscroll', 'ondblclick',
  ],
  FORBID_TAGS: ['script', 'object', 'embed', 'link', 'meta', 'base'],
  FORCE_BODY: true,
}

// Para HTML salvo pelo editor (inclui iframes de vídeo)
const EDITOR_CONFIG = {
  ...BASE_CONFIG,
  ALLOWED_TAGS: [...BASE_CONFIG.ALLOWED_TAGS, 'iframe'],
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, BASE_CONFIG) as string
}

/** Sanitize HTML from the GrapesJS editor.
 *  Allows YouTube/Vimeo iframes but validates src origin. */
export function sanitizeEditorHtml(html: string): string {
  // First pass: DOMPurify with iframes allowed
  const clean = DOMPurify.sanitize(html, EDITOR_CONFIG) as string

  // Second pass: strip iframes whose src is not an allowed origin
  // We do this via a simple regex check — DOMPurify already ran the full DOM parse
  return clean.replace(/<iframe[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i)
    if (!srcMatch) return '' // no src → strip

    const src = srcMatch[1]
    const allowed = ALLOWED_IFRAME_ORIGINS.some((origin) => src.startsWith(origin))
    return allowed ? tag : '' // only allow YouTube/Vimeo
  })
}
