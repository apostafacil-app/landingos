/**
 * JSON ↔ HTML serialization
 *
 * Estratégia: o HTML publicado é autocontido com position:absolute.
 * Para re-editar, o editor parseia o HTML extraindo data-lp-* attributes.
 * Com isso, DB guarda só a coluna `html` e não precisamos mudar o schema.
 */

import type {
  PageModel, Block, Element, BaseElement, ImagemElement, TextoElement,
  BotaoElement, CaixaElement, CirculoElement, IconeElement, VideoElement,
  Borders, ShadowPreset,
} from './types'
import { createEmptyPage } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Serialize: PageModel → HTML string
// ─────────────────────────────────────────────────────────────────────────────

export function serializePage(page: PageModel): string {
  // TODO O LAYOUT EM STYLES INLINE: position:absolute em cada elemento,
  // position:relative em cada bloco, max-width no bloco, etc. Sem isso,
  // se o sanitize-html remover o conteúdo de <style> tag (comportamento
  // default por segurança), os estilos críticos sumiriam e a página
  // ficaria com elementos empilhados em flow layout em vez de absoluto.
  const pageStyle = [
    `font-family: ${page.fontFamily ?? 'Inter, system-ui, sans-serif'}`,
    `background: ${page.bgColor ?? '#ffffff'}`,
    `margin: 0`,
  ].join('; ')

  const blocksHtml = page.blocks.map(b => serializeBlock(b, page.width)).join('\n')
  return `<div class="lp-page" data-lp-model="v3" data-lp-width="${page.width}"${page.bgColor ? ` data-lp-bg="${escapeAttr(page.bgColor)}"` : ''}${page.fontFamily ? ` data-lp-font="${escapeAttr(page.fontFamily)}"` : ''} style="${pageStyle}">\n${blocksHtml}\n</div>`
}

function serializeBlock(block: Block, pageWidth = 1200): string {
  // ─── Padrão GreatPages: bloco full-width + content interno centralizado ───
  // .lp-block ocupa 100% da viewport (cor/imagem de fundo "vazam" pra fora
  //   do max-width) — efeito de seção completa ao publicar.
  // .lp-block-inner: max-width: ${pageWidth}, margin auto — área onde os
  //   elementos absolutos vivem (coordenadas x/y são relativas a esse inner).
  //
  // CRÍTICO: NÃO emitir `background-image: url(...)` no inline style.
  // sanitize-html (mesmo com parseStyleAttributes:false) REMOVE qualquer
  // url() dentro de CSS por segurança contra CSS injection.
  // Solução: renderizar bg image como <img> filho posicionado absoluto.
  const style = [
    `position: relative`,
    `overflow: hidden`,
    `width: 100%`,
    `height: ${block.height}px`,
    block.bgColor  ? `background-color: ${block.bgColor}` : '',
  ].filter(Boolean).join('; ')

  const innerStyle = [
    `position: relative`,
    `margin: 0 auto`,
    `max-width: ${pageWidth}px`,
    `width: 100%`,
    `height: 100%`,
  ].join('; ')

  const data = [
    `data-lp-id="${block.id}"`,
    block.heightMobile != null ? `data-lp-h-mob="${block.heightMobile}"` : '',
    block.bgImage ? `data-lp-bg-image="${escapeAttr(block.bgImage)}"` : '',
    block.bgOverlayColor ? `data-lp-overlay-color="${escapeAttr(block.bgOverlayColor)}"` : '',
    block.bgOverlayOpacity != null ? `data-lp-overlay-op="${block.bgOverlayOpacity}"` : '',
  ].filter(Boolean).join(' ')

  // Background image como <img class="lp-bg-img"> separado.
  // Fica fora do .lp-block-inner — cobre o bloco inteiro full-width.
  let bgImgHtml = ''
  if (block.bgImage) {
    const fit = block.bgSize === 'contain' ? 'contain'
              : block.bgSize === 'auto'    ? 'none'
              : 'cover'
    const pos = block.bgPosition ?? 'center'
    bgImgHtml = `<img class="lp-bg-img" src="${escapeAttr(block.bgImage)}" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${fit};object-position:${pos};z-index:0;pointer-events:none" />\n  `
  }

  // Camada de sobreposição (overlay) — também full-width, acima do bg-img.
  const overlayHtml = block.bgOverlayColor && (block.bgOverlayOpacity ?? 0) > 0
    ? `<div aria-hidden="true" style="position:absolute;inset:0;background-color:${block.bgOverlayColor};opacity:${block.bgOverlayOpacity};pointer-events:none;z-index:1"></div>\n  `
    : ''

  const elementsHtml = block.elements.map(serializeElement).join('\n    ')
  return `<section class="lp-block" ${data} style="${style}">\n  ${bgImgHtml}${overlayHtml}<div class="lp-block-inner" style="${innerStyle}">\n    ${elementsHtml}\n  </div>\n</section>`
}

/** Converte el.animation em valor CSS animation (ex: "lpFade 800ms ease 0ms 1 both"). */
function animationCss(anim: { type?: string; direction?: string; duration?: number; delay?: number; repeat?: string } | undefined): string {
  if (!anim || !anim.type || anim.type === 'none') return ''
  const NAMES: Record<string, string> = {
    fade: 'lpFade',
    'slide-up':    'lpSlideUp',
    'slide-down':  'lpSlideDown',
    'slide-left':  'lpSlideLeft',
    'slide-right': 'lpSlideRight',
    slide:  'lpSlideUp', // default direction
    bounce: 'lpBounce', zoom: 'lpZoom', shake: 'lpShake',
    fold:   'lpFold',   roll: 'lpRoll',
  }
  let key: string = anim.type
  if (anim.type === 'slide' && anim.direction && anim.direction !== 'center') {
    key = `slide-${anim.direction}`
  }
  const name = NAMES[key] ?? 'lpFade'
  const duration = anim.duration ?? 800
  const delay    = anim.delay ?? 0
  const iter     = anim.repeat === 'loop' ? 'infinite' : '1'
  return `${name} ${duration}ms ease ${delay}ms ${iter} both`
}

const SHADOW_CSS: Record<ShadowPreset, string> = {
  none: '',
  soft: '0 2px 8px rgba(0,0,0,0.12)',
  medium: '0 4px 16px rgba(0,0,0,0.18)',
  hard: '0 8px 28px rgba(0,0,0,0.25)',
  sharp: '4px 4px 0 rgba(0,0,0,0.8)',
  neon: '0 0 20px #60a5fa',
}

function bordersStyles(b: Borders | undefined): string[] {
  if (!b) return []
  const out: string[] = []
  if (b.width && b.width > 0) {
    out.push(`border: ${b.width}px solid ${b.color ?? '#000'}`)
  }
  if (b.radius) {
    const [tl, tr, br, bl] = b.equalCorners
      ? [b.radius[0], b.radius[0], b.radius[0], b.radius[0]]
      : b.radius
    if (tl || tr || br || bl) {
      out.push(`border-radius: ${tl}px ${tr}px ${br}px ${bl}px`)
    }
  }
  return out
}

function serializeElement(el: Element): string {
  const animCss = animationCss(el.animation)
  const baseStyle = [
    `position: absolute`,
    `box-sizing: border-box`,
    `left: ${el.x}px`,
    `top: ${el.y}px`,
    `width: ${el.w}px`,
    `height: ${el.h}px`,
    el.rotation ? `transform: rotate(${el.rotation}deg)` : '',
    // Z-index default 2 — fica acima do bg image (z-index:0) e overlay (z-index:1)
    `z-index: ${el.zIndex ?? 2}`,
    el.opacity !== undefined && el.opacity !== 1 ? `opacity: ${el.opacity}` : '',
    el.shadow && el.shadow !== 'none' ? `box-shadow: ${SHADOW_CSS[el.shadow]}` : '',
    animCss ? `animation: ${animCss}` : '',
    ...bordersStyles(el.borders),
  ].filter(Boolean)

  // JSON em atributos: usa aspas duplas com entities pra " (mais robusto
  // contra quoting que sanitize-html pode aplicar)
  const jsonAttr = (obj: unknown) => JSON.stringify(obj).replace(/"/g, '&quot;')

  const dataAttrs = [
    `data-lp-id="${el.id}"`,
    `data-lp-type="${el.type}"`,
    el.hideMobile  ? `data-lp-hide-mob="1"` : '',
    el.hideDesktop ? `data-lp-hide-desk="1"` : '',
    el.mobile ? `data-lp-mob="${jsonAttr(el.mobile)}"` : '',
    el.shadow && el.shadow !== 'none' ? `data-lp-shadow="${el.shadow}"` : '',
    el.borders ? `data-lp-borders="${jsonAttr(el.borders)}"` : '',
    el.animation && el.animation.type && el.animation.type !== 'none'
      ? `data-lp-anim="${jsonAttr(el.animation)}"` : '',
    el.cssClass ? `data-lp-class="${escapeAttr(el.cssClass)}"` : '',
  ].filter(Boolean).join(' ')

  switch (el.type) {
    case 'imagem':     return serializeImagem(el, baseStyle, dataAttrs)
    case 'texto':
    case 'titulo':     return serializeTexto(el, baseStyle, dataAttrs)
    case 'botao':      return serializeBotao(el, baseStyle, dataAttrs)
    case 'caixa':      return serializeCaixa(el, baseStyle, dataAttrs)
    case 'circulo':    return serializeCirculo(el, baseStyle, dataAttrs)
    case 'icone':      return serializeIcone(el, baseStyle, dataAttrs)
    case 'video':      return serializeVideo(el, baseStyle, dataAttrs)
    default:           return ''
  }
}

function serializeImagem(el: ImagemElement, styles: string[], data: string): string {
  // borderRadius legacy só aplica se borders não está preenchido
  if (el.borderRadius && !el.borders?.radius) styles.push(`border-radius: ${el.borderRadius}px`)
  styles.push('overflow: hidden')
  const imgStyles: string[] = []
  if (el.objectFit) imgStyles.push(`object-fit: ${el.objectFit}`)
  const filterCss = filtersToCss(el.filters)
  if (filterCss) imgStyles.push(`filter: ${filterCss}`)
  imgStyles.push('width: 100%', 'height: 100%', 'display: block')
  const extraData = el.filters
    ? ` data-lp-filters="${JSON.stringify(el.filters).replace(/"/g, '&quot;')}"`
    : ''
  const img = `<img src="${escapeAttr(el.src)}" alt="${escapeAttr(el.alt ?? '')}" style="${imgStyles.join('; ')}"${extraData} />`
  const target = el.linkTarget ?? '_blank'
  const inner = el.link
    ? `<a href="${escapeAttr(el.link)}" target="${target}" rel="noopener">${img}</a>`
    : img
  return `<div class="lp-el lp-imagem" ${data} style="${styles.join('; ')}">${inner}</div>`
}

function filtersToCss(f: ImagemElement['filters']): string {
  if (!f) return ''
  const parts: string[] = []
  if (f.hueRotate)                               parts.push(`hue-rotate(${f.hueRotate}deg)`)
  if (f.saturate   !== undefined && f.saturate   !== 100) parts.push(`saturate(${f.saturate}%)`)
  if (f.brightness !== undefined && f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`)
  if (f.contrast   !== undefined && f.contrast   !== 100) parts.push(`contrast(${f.contrast}%)`)
  if (f.invert)                                  parts.push(`invert(${f.invert}%)`)
  if (f.sepia)                                   parts.push(`sepia(${f.sepia}%)`)
  if (f.blur)                                    parts.push(`blur(${f.blur}px)`)
  if (f.grayscale)                               parts.push(`grayscale(${f.grayscale}%)`)
  return parts.join(' ')
}

function serializeTexto(el: TextoElement, styles: string[], data: string): string {
  if (el.fontSize)     styles.push(`font-size: ${el.fontSize}px`)
  if (el.fontFamily)   styles.push(`font-family: ${el.fontFamily}`)
  if (el.color)        styles.push(`color: ${el.color}`)
  if (el.textAlign)    styles.push(`text-align: ${el.textAlign}`)
  if (el.fontWeight)   styles.push(`font-weight: ${el.fontWeight}`)
  if (el.lineHeight)   styles.push(`line-height: ${el.lineHeight}`)
  if (el.letterSpacing) styles.push(`letter-spacing: ${el.letterSpacing}px`)
  // Tag semântico: h1-h6 se titulo com headingLevel, senão div
  // (mantém 'div' pra texto puro pra preservar quebras de linha + inline HTML)
  const tag = el.type === 'titulo' ? `h${el.headingLevel ?? 1}` : 'div'
  const extraData = el.type === 'titulo' && el.headingLevel
    ? ` data-lp-hlevel="${el.headingLevel}"` : ''
  return `<${tag} class="lp-el lp-${el.type}" ${data}${extraData} style="${styles.join('; ')}">${el.html}</${tag}>`
}

function serializeBotao(el: BotaoElement, styles: string[], data: string): string {
  const btnStyle = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    'width:100%',
    'height:100%',
    'cursor:pointer',
    'text-decoration:none',
    'text-align:center',
    el.bgColor      ? `background-color: ${el.bgColor}` : 'background-color: #2563eb',
    el.color        ? `color: ${el.color}` : 'color: #ffffff',
    el.borderRadius != null ? `border-radius: ${el.borderRadius}px` : 'border-radius: 8px',
    el.fontSize     ? `font-size: ${el.fontSize}px` : 'font-size: 15px',
    el.fontWeight   ? `font-weight: ${el.fontWeight}` : 'font-weight: 600',
    el.padding      ? `padding: ${el.padding[0]}px ${el.padding[1]}px` : '',
  ].filter(Boolean).join(';')

  const tag = el.link ? 'a' : 'span'
  const extra = el.link ? ` href="${escapeAttr(el.link)}" target="${el.target ?? '_self'}"` : ''
  return `<div class="lp-el lp-botao" ${data} style="${styles.join('; ')}"><${tag}${extra} style="${btnStyle}">${escapeHtml(el.text)}</${tag}></div>`
}

function serializeCaixa(el: CaixaElement, styles: string[], data: string): string {
  if (el.bgColor)      styles.push(`background-color: ${el.bgColor}`)
  if (el.borderRadius) styles.push(`border-radius: ${el.borderRadius}px`)
  if (el.borderWidth)  styles.push(`border: ${el.borderWidth}px solid ${el.borderColor ?? '#000'}`)
  // Bg image como <img> filho (sanitize-html remove url() em CSS bg-image).
  if (el.bgImage) styles.push('overflow: hidden')
  const dataExtra = el.bgImage ? ` data-lp-bg-image="${escapeAttr(el.bgImage)}"` : ''
  const bgImgChild = el.bgImage
    ? `<img class="lp-bg-img" src="${escapeAttr(el.bgImage)}" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" />`
    : ''
  return `<div class="lp-el lp-caixa" ${data}${dataExtra} style="${styles.join('; ')}">${bgImgChild}</div>`
}

function serializeCirculo(el: CirculoElement, styles: string[], data: string): string {
  styles.push('border-radius: 50%')
  styles.push('overflow: hidden')   // clipa bg image ao circulo
  if (el.bgColor)     styles.push(`background-color: ${el.bgColor}`)
  if (el.borderWidth) styles.push(`border: ${el.borderWidth}px solid ${el.borderColor ?? '#000'}`)
  const dataExtra = el.bgImage ? ` data-lp-bg-image="${escapeAttr(el.bgImage)}"` : ''
  const bgImgChild = el.bgImage
    ? `<img class="lp-bg-img" src="${escapeAttr(el.bgImage)}" alt="" aria-hidden="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none" />`
    : ''
  return `<div class="lp-el lp-circulo" ${data}${dataExtra} style="${styles.join('; ')}">${bgImgChild}</div>`
}

function serializeIcone(el: IconeElement, styles: string[], data: string): string {
  const inner = [
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'width:100%',
    'height:100%',
    'font-size:40px',
    el.bgColor ? `background-color: ${el.bgColor}` : '',
    el.color   ? `color: ${el.color}` : '',
    el.borderRadius != null ? `border-radius: ${el.borderRadius}px` : '',
  ].filter(Boolean).join(';')

  const content = el.emoji ?? el.svg ?? '★'
  const tag = el.link ? 'a' : 'div'
  const extra = el.link ? ` href="${escapeAttr(el.link)}" target="_blank" rel="noopener"` : ''
  return `<div class="lp-el lp-icone" ${data} style="${styles.join('; ')}"><${tag}${extra} style="${inner}">${content}</${tag}></div>`
}

function serializeVideo(el: VideoElement, styles: string[], data: string): string {
  const src = el.src
  // Suporta YouTube URL → converte pra embed
  const embed = /youtube\.com\/watch\?v=([^&]+)/.exec(src)
  const youtu = /youtu\.be\/([^?&]+)/.exec(src)
  const vid   = embed?.[1] || youtu?.[1]
  const url   = vid ? `https://www.youtube.com/embed/${vid}` : src
  return `<div class="lp-el lp-video" ${data} style="${styles.join('; ')}"><iframe src="${escapeAttr(url)}" style="width:100%;height:100%;border:0" allowfullscreen></iframe></div>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Parse: HTML string → PageModel
// ─────────────────────────────────────────────────────────────────────────────

export function parsePage(html: string | null): PageModel {
  if (!html || !html.trim()) return createEmptyPage()

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const root = doc.querySelector('[data-lp-model="v3"]')
  if (!root) return createEmptyPage()   // não é V3, retorna vazia

  const page: PageModel = {
    version: 3,
    width:    parseInt(root.getAttribute('data-lp-width') || '1200', 10),
    bgColor:  root.getAttribute('data-lp-bg')   ?? undefined,
    fontFamily: root.getAttribute('data-lp-font') ?? undefined,
    blocks:   [],
  }

  root.querySelectorAll(':scope > .lp-block').forEach(blockEl => {
    const heightStr = (blockEl as HTMLElement).style.height
    const opStr = blockEl.getAttribute('data-lp-overlay-op')
    const block: Block = {
      id:       blockEl.getAttribute('data-lp-id') || `blk-${Math.random().toString(36).slice(2, 7)}`,
      height:   parseInt(heightStr, 10) || 400,
      heightMobile: blockEl.getAttribute('data-lp-h-mob')
        ? parseInt(blockEl.getAttribute('data-lp-h-mob')!, 10) : undefined,
      bgColor:     (blockEl as HTMLElement).style.backgroundColor  || undefined,
      // Le primeiro o data-attr (fallback robusto), depois style
      bgImage:     blockEl.getAttribute('data-lp-bg-image')
                || extractUrl((blockEl as HTMLElement).style.backgroundImage)
                || undefined,
      bgSize:      ((blockEl as HTMLElement).style.backgroundSize as Block['bgSize']) || undefined,
      bgPosition:  (blockEl as HTMLElement).style.backgroundPosition || undefined,
      bgRepeat:    ((blockEl as HTMLElement).style.backgroundRepeat as Block['bgRepeat']) || undefined,
      bgAttachment: ((blockEl as HTMLElement).style.backgroundAttachment as Block['bgAttachment']) || undefined,
      bgOverlayColor:   blockEl.getAttribute('data-lp-overlay-color') || undefined,
      bgOverlayOpacity: opStr ? parseFloat(opStr) : undefined,
      elements: [],
    }

    // Elementos podem estar em :scope > .lp-el (formato antigo) ou
    // dentro de :scope > .lp-block-inner > .lp-el (formato atual full-width).
    const inner = blockEl.querySelector(':scope > .lp-block-inner')
    const elContainer: ParentNode = inner ?? blockEl
    elContainer.querySelectorAll(':scope > .lp-el').forEach(elNode => {
      const el = parseElement(elNode as HTMLElement)
      if (el) block.elements.push(el)
    })

    page.blocks.push(block)
  })

  if (page.blocks.length === 0) {
    page.blocks.push({ id: `blk-${Date.now()}`, height: 400, elements: [] })
  }
  return page
}

function parseElement(node: HTMLElement): Element | null {
  const type = node.getAttribute('data-lp-type') as Element['type'] | null
  if (!type) return null

  const s = node.style
  const base: BaseElement = {
    id:   node.getAttribute('data-lp-id') || `el-${Math.random().toString(36).slice(2, 7)}`,
    type,
    x:    parseInt(s.left, 10) || 0,
    y:    parseInt(s.top, 10)  || 0,
    w:    parseInt(s.width, 10)|| 100,
    h:    parseInt(s.height, 10)|| 40,
    rotation:   extractRotation(s.transform) ?? undefined,
    zIndex:     s.zIndex ? parseInt(s.zIndex, 10) : undefined,
    opacity:    s.opacity ? parseFloat(s.opacity) : undefined,
    shadow:     (node.getAttribute('data-lp-shadow') as ShadowPreset | null) ?? undefined,
    cssClass:   node.getAttribute('data-lp-class') ?? undefined,
    hideMobile:  node.getAttribute('data-lp-hide-mob')  === '1',
    hideDesktop: node.getAttribute('data-lp-hide-desk') === '1',
  }
  // Browser já decodifica entities (&quot; → "). Parse direto. Mantemos o
  // .replace por compat com HTML antigo que usava &apos; manual.
  const mobJson = node.getAttribute('data-lp-mob')
  if (mobJson) {
    try { base.mobile = JSON.parse(mobJson.replace(/&apos;/g, "'")) } catch {}
  }
  const bordersJson = node.getAttribute('data-lp-borders')
  if (bordersJson) {
    try { base.borders = JSON.parse(bordersJson.replace(/&apos;/g, "'")) } catch {}
  }
  const animJson = node.getAttribute('data-lp-anim')
  if (animJson) {
    try { base.animation = JSON.parse(animJson.replace(/&apos;/g, "'")) } catch {}
  }

  switch (type) {
    case 'imagem': {
      const img = node.querySelector('img')
      const anchor = node.querySelector('a')
      const filtersJson = img?.getAttribute('data-lp-filters')
      let filters: ImagemElement['filters']
      if (filtersJson) {
        try { filters = JSON.parse(filtersJson) } catch {}
      }
      return {
        ...base, type,
        src:   img?.getAttribute('src') ?? '',
        alt:   img?.getAttribute('alt') ?? undefined,
        link:  anchor?.getAttribute('href') ?? undefined,
        linkTarget: (anchor?.getAttribute('target') as ImagemElement['linkTarget']) ?? undefined,
        objectFit: (img?.style.objectFit as ImagemElement['objectFit']) || undefined,
        borderRadius: parseInt(s.borderRadius, 10) || undefined,
        filters,
      }
    }
    case 'texto':
    case 'titulo': {
      const hLevelAttr = node.getAttribute('data-lp-hlevel')
      const headingLevel = hLevelAttr
        ? (parseInt(hLevelAttr, 10) as 1|2|3|4|5|6)
        : (/^H([1-6])$/.exec(node.tagName)
          ? (parseInt(node.tagName[1], 10) as 1|2|3|4|5|6)
          : undefined)
      return {
        ...base, type,
        html: node.innerHTML,
        headingLevel,
        fontSize:      parseInt(s.fontSize, 10) || undefined,
        fontFamily:    s.fontFamily || undefined,
        color:         s.color || undefined,
        textAlign:     s.textAlign as TextoElement['textAlign'] || undefined,
        fontWeight:    s.fontWeight ? parseInt(s.fontWeight, 10) : undefined,
        lineHeight:    s.lineHeight ? parseFloat(s.lineHeight) : undefined,
        letterSpacing: s.letterSpacing ? parseInt(s.letterSpacing, 10) : undefined,
      }
    }
    case 'botao': {
      const inner = node.querySelector('a, span') as HTMLElement | null
      const is = inner?.style
      return {
        ...base, type,
        text:  inner?.textContent?.trim() ?? 'Botão',
        link:  (inner as HTMLAnchorElement)?.href || undefined,
        target:((inner as HTMLAnchorElement)?.target as '_blank' | '_self') || undefined,
        bgColor:      is?.backgroundColor || undefined,
        color:        is?.color || undefined,
        borderRadius: is ? parseInt(is.borderRadius, 10) || undefined : undefined,
        fontSize:     is ? parseInt(is.fontSize, 10) || undefined : undefined,
        fontWeight:   is?.fontWeight ? parseInt(is.fontWeight, 10) : undefined,
      }
    }
    case 'caixa':
      return {
        ...base, type,
        bgColor:      s.backgroundColor || undefined,
        // Le primeiro do data-attr (formato novo, robusto), fallback CSS bg-image
        bgImage:      node.getAttribute('data-lp-bg-image')
                  || extractUrl(s.backgroundImage)
                  || undefined,
        borderRadius: parseInt(s.borderRadius, 10) || undefined,
        borderWidth:  parseInt(s.borderWidth,  10) || undefined,
        borderColor:  s.borderColor || undefined,
      }
    case 'circulo':
      return {
        ...base, type,
        bgColor:      s.backgroundColor || undefined,
        bgImage:      node.getAttribute('data-lp-bg-image') || undefined,
        borderWidth:  parseInt(s.borderWidth, 10) || undefined,
        borderColor:  s.borderColor || undefined,
      }
    case 'icone': {
      const inner = (node.querySelector('a, div') as HTMLElement | null)
      return {
        ...base, type,
        emoji: inner?.textContent?.trim(),
        color: inner?.style.color || undefined,
        bgColor: inner?.style.backgroundColor || undefined,
        borderRadius: parseInt(s.borderRadius, 10) || undefined,
        link: (inner as HTMLAnchorElement | null)?.href || undefined,
      }
    }
    case 'video': {
      const iframe = node.querySelector('iframe')
      return { ...base, type, src: iframe?.getAttribute('src') ?? '' }
    }
    default: return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function extractUrl(bg: string | null | undefined): string | null {
  if (!bg) return null
  const m = /url\(["']?([^"')]+)["']?\)/.exec(bg)
  return m ? m[1] : null
}

function extractRotation(tr: string | null | undefined): number | null {
  if (!tr) return null
  const m = /rotate\(([-\d.]+)deg\)/.exec(tr)
  return m ? parseFloat(m[1]) : null
}
