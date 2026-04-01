import DOMPurify from 'isomorphic-dompurify'

// Tags e atributos permitidos para landing pages
const CONFIG = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
    'ul', 'ol', 'li',
    'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
    'a', 'img',
    'button', 'form', 'input', 'label', 'textarea',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'figure', 'figcaption',
  ],
  ALLOWED_ATTR: [
    'class', 'id', 'style',
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height', 'loading',
    'type', 'placeholder', 'name', 'value', 'required',
    'for',
  ],
  // Bloquear absolutamente qualquer handler de evento
  FORBID_ATTR: [
    'onclick', 'onerror', 'onload', 'onmouseover', 'onmouseout',
    'onfocus', 'onblur', 'onchange', 'onsubmit', 'onkeydown',
    'onkeyup', 'onkeypress', 'onscroll', 'ondblclick',
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'meta', 'base'],
  FORCE_BODY: true,
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, CONFIG) as string
}
