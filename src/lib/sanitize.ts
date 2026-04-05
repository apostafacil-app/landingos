import sanitizeHtmlLib, { type IOptions } from 'sanitize-html'

// Domínios permitidos para iframes (video embeds)
const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]

// Atributos permitidos em qualquer tag
const COMMON_ATTRS = [
  'class', 'id', 'style', 'data-gjs-type',
  'href', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading',
  'type', 'placeholder', 'name', 'value', 'required',
  'for', 'frameborder', 'allow', 'allowfullscreen',
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
]

// Monta allowedAttributes para sanitize-html (whitelist por tag — mais seguro)
const ALLOWED_ATTRS: IOptions['allowedAttributes'] = { '*': COMMON_ATTRS }

const BASE_OPTIONS: IOptions = {
  allowedTags: BASE_TAGS,
  allowedAttributes: ALLOWED_ATTRS,
  // sanitize-html já remove event handlers por default (não está na whitelist)
  disallowedTagsMode: 'discard',
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
