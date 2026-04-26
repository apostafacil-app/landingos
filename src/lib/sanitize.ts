import sanitizeHtmlLib, { type IOptions } from 'sanitize-html'

// Domínios permitidos para iframes (video embeds)
const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]

// Atributos permitidos em qualquer tag
const COMMON_ATTRS = [
  'class', 'id', 'style',
  'data-gjs-type',
  // Atributos do modelo V3 — CRÍTICO para persistência. sanitize-html remove
  // qualquer atributo que não esteja nesta whitelist. Sem esses data-lp-*,
  // o HTML salvo perde toda a informação estrutural e parsePage devolve vazio.
  'data-lp-model', 'data-lp-width', 'data-lp-bg', 'data-lp-font',
  'data-lp-id', 'data-lp-type',
  'data-lp-h-mob', 'data-lp-hide-mob', 'data-lp-hide-desk', 'data-lp-mob',
  'data-lp-shadow', 'data-lp-borders', 'data-lp-anim',
  'data-lp-class', 'data-lp-hlevel', 'data-lp-filters',
  'data-lp-overlay-color', 'data-lp-overlay-op', 'data-lp-bg-image',
  'data-lp-bg-grad', 'data-lp-icon-id',
  'aria-hidden',
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading',
  'type', 'placeholder', 'name', 'value', 'required',
  'for', 'frameborder', 'allow', 'allowfullscreen',
  // Atributos SVG — pra ícones inline funcionarem no publicado
  'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
  'stroke-linejoin', 'd', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2', 'x', 'y',
  'rx', 'ry', 'points', 'opacity', 'crossorigin',
]

const BASE_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'aside',
  'ul', 'ol', 'li',
  'strong', 'em', 'b', 'i', 'u', 'br', 'hr',
  'a', 'img',
  'button', 'form', 'input', 'label', 'textarea',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'blockquote', 'figure', 'figcaption', 'style',
  // SVG (ícones inline profissionais)
  'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse',
  'g', 'defs', 'use',
]

// Monta allowedAttributes para sanitize-html (whitelist por tag — mais seguro)
const ALLOWED_ATTRS: IOptions['allowedAttributes'] = { '*': COMMON_ATTRS }

const BASE_OPTIONS: IOptions = {
  allowedTags: BASE_TAGS,
  allowedAttributes: ALLOWED_ATTRS,
  // sanitize-html já remove event handlers por default (não está na whitelist)
  disallowedTagsMode: 'discard',
  // parseStyleAttributes=true é o default do sanitize-html v2: ele faz parse
  // PostCSS do style e aplica filtros próprios (incluindo descartar
  // url(...) com schemes não-http/https em background-image). Como nosso
  // style é gerado por código no V3 (não input direto do usuário) e queremos
  // preservar background-image: url(...), opacity, filter, etc. — desabilitamos.
  parseStyleAttributes: false,
}

const EDITOR_OPTIONS: IOptions = {
  ...BASE_OPTIONS,
  allowedTags: [...BASE_TAGS, 'iframe'],
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
}

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, BASE_OPTIONS)
}

/** Sanitize HTML do editor GrapesJS. Permite iframes YouTube/Vimeo. */
export function sanitizeEditorHtml(html: string): string {
  return sanitizeHtmlLib(html, EDITOR_OPTIONS)
}
