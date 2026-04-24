/**
 * LandingEditor V3 — Data Model
 *
 * Modelo inspirado no GreatPages:
 * - Página = pilha vertical de blocos
 * - Cada bloco tem altura fixa (por dispositivo) e fundo
 * - Elementos dentro do bloco são absolutamente posicionados
 */

export type ElementType =
  | 'imagem'
  | 'texto'
  | 'titulo'
  | 'botao'
  | 'caixa'
  | 'circulo'
  | 'icone'
  | 'video'

/** box-shadow preset key (chave dos presets no sections.tsx) */
export type ShadowPreset = 'none' | 'soft' | 'medium' | 'hard' | 'sharp' | 'neon'

/** Animação de entrada do elemento */
export type AnimType = 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'shake' | 'fold' | 'roll'
export type AnimDirection = 'center' | 'up' | 'down' | 'left' | 'right'

export interface Animation {
  type?:      AnimType
  direction?: AnimDirection
  duration?:  number  // ms
  delay?:     number  // ms
  repeat?:    'once' | 'loop'
}

/** Bordas com 4 cantos configuráveis individualmente */
export interface Borders {
  color?: string
  width?: number                           // largura uniforme (px)
  radius?: [number, number, number, number]  // [TL, TR, BR, BL] em px
  equalCorners?: boolean                   // se true, radius[0] aplica em todos
}

export interface BaseElement {
  id:       string
  type:     ElementType
  x:        number       // left em pixels (coords do bloco)
  y:        number       // top em pixels
  w:        number       // width
  h:        number       // height
  rotation?: number      // graus
  opacity?: number       // 0 a 1
  zIndex?:  number
  shadow?:  ShadowPreset                   // box-shadow preset
  animation?: Animation                    // animação de entrada
  borders?: Borders                        // bordas + radius por canto
  cssClass?: string                        // classe custom para CSS externo
  // Por breakpoint
  hideDesktop?: boolean
  hideMobile?:  boolean
  // Coords alternativos para mobile (se diferente de desktop)
  mobile?: { x: number; y: number; w: number; h: number }
}

/** Filtros CSS aplicáveis a imagem (efeitos visuais) */
export interface ImageFilters {
  hueRotate?:  number   // 0-360 deg
  saturate?:   number   // 0-200 (%)
  brightness?: number   // 0-200 (%)
  contrast?:   number   // 0-200 (%)
  invert?:     number   // 0-100 (%)
  sepia?:      number   // 0-100 (%)
  blur?:       number   // 0-30 (px)
  grayscale?:  number   // 0-100 (%)
}

export interface ImagemElement extends BaseElement {
  type:         'imagem'
  src:          string
  alt?:         string
  link?:        string
  linkTarget?:  '_self' | '_blank'
  objectFit?:   'cover' | 'contain' | 'fill' | 'scale-down'
  borderRadius?: number                 // DEPRECATED: use borders.radius
  filters?:     ImageFilters
}

export interface TextoElement extends BaseElement {
  type:         'texto' | 'titulo'
  /** Se type='titulo', qual nível semântico (h1-h6). Default h1 se titulo. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6
  html:         string          // HTML inline (suporta <b>, <i>, <a>, etc.)
  fontSize?:    number
  fontFamily?:  string
  color?:       string
  textAlign?:   'left' | 'center' | 'right' | 'justify'
  fontWeight?:  number
  lineHeight?:  number
  letterSpacing?: number
  /** text-shadow preset (pra texto usamos text-shadow, não box-shadow) */
  textShadow?:  ShadowPreset
}

export interface BotaoElement extends BaseElement {
  type:         'botao'
  text:         string
  link?:        string
  target?:      '_self' | '_blank'
  bgColor?:     string
  color?:       string
  borderRadius?: number
  fontSize?:    number
  fontWeight?:  number
  padding?:     [number, number]  // [vertical, horizontal]
}

export interface CaixaElement extends BaseElement {
  type:         'caixa'
  bgColor?:     string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  bgImage?:     string
}

export interface CirculoElement extends BaseElement {
  type:         'circulo'
  bgColor?:     string
  borderWidth?: number
  borderColor?: string
}

export interface IconeElement extends BaseElement {
  type:         'icone'
  emoji?:       string        // se for emoji
  svg?:         string        // se for svg inline
  bgColor?:     string
  color?:       string
  borderRadius?: number
  link?:        string
}

export interface VideoElement extends BaseElement {
  type:         'video'
  src:          string         // YouTube, Vimeo URL ou embed direto
  autoplay?:    boolean
  loop?:        boolean
  controls?:    boolean
}

export type Element =
  | ImagemElement
  | TextoElement
  | BotaoElement
  | CaixaElement
  | CirculoElement
  | IconeElement
  | VideoElement

export interface Block {
  id:           string
  height:       number                    // altura em pixels (desktop)
  heightMobile?: number                   // altura em pixels (mobile)
  bgColor?:     string
  bgImage?:     string
  bgSize?:      'cover' | 'contain' | 'auto'
  bgPosition?:  string                    // "center", "top left", etc.
  bgAttachment?: 'scroll' | 'fixed'
  padding?:     number                    // padding top/bottom
  elements:     Element[]
}

export interface PageModel {
  version:  3
  width:    number                         // largura máxima do conteúdo (ex: 1200)
  bgColor?: string
  fontFamily?: string                      // fonte base
  blocks:   Block[]
}

/** Cria um modelo vazio */
export function createEmptyPage(): PageModel {
  return {
    version: 3,
    width:   1200,
    bgColor: '#ffffff',
    blocks: [
      {
        id: `blk-${Date.now()}`,
        height: 400,
        bgColor: '#f8fafc',
        elements: [],
      },
    ],
  }
}

/** Gera um ID único */
export function genId(prefix = 'el'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
