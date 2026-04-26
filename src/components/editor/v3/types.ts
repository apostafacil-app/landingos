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
  bgImage?:     string
  borderWidth?: number
  borderColor?: string
}

export interface IconeElement extends BaseElement {
  type:         'icone'
  emoji?:       string        // se for emoji
  svg?:         string        // se for svg inline
  /** ID de ícone da biblioteca interna (icons-library.ts). Se setado,
   *  serializer renderiza o SVG correspondente. Mais consistente que emoji. */
  iconId?:      string
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

/** Gradiente CSS bem estruturado (não string livre) */
export interface BlockGradient {
  type: 'linear' | 'radial'
  /** Para linear: ângulo em deg (ex: 135). Para radial: ignorado. */
  angle?: number
  /** Stops do gradiente. Cada stop tem cor e posição (0-100). */
  stops: { color: string; pos?: number }[]
}

export interface Block {
  id:           string
  /** ID do template original (ex: 'beneficios-3col'). Permite "Atualizar
   *  para versão mais recente" — substituir conteúdo pelo template atual
   *  da biblioteca. Vazio se bloco foi criado from-scratch. */
  templateId?:  string
  height:       number                    // altura em pixels (desktop)
  heightMobile?: number                   // altura em pixels (mobile)
  bgColor?:     string
  bgGradient?:  BlockGradient             // gradiente — sobrepõe bgColor se presente
  bgImage?:     string
  bgSize?:      'cover' | 'contain' | 'auto'
  bgPosition?:  string                    // "center", "top left", "50% 50%", etc.
  bgRepeat?:    'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  bgAttachment?: 'scroll' | 'fixed'       // 'fixed' = parallax
  /** Camada de cor sobreposta à imagem (pra escurecer/clarear) */
  bgOverlayColor?:   string               // hex
  bgOverlayOpacity?: number               // 0-1
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

/** Largura padrão do viewport mobile (iPhone SE) */
export const MOBILE_WIDTH = 390

/**
 * Retorna os coords ativos do elemento para o device dado.
 * - Desktop: usa coords base (x/y/w/h)
 * - Mobile com el.mobile: usa mobile
 * - Mobile sem el.mobile: usa coords desktop as-is (podem vazar do canvas;
 *   o usuário usa "Refazer mobile" pra auto-gerar layout otimizado).
 *
 * pageWidth é aceito por compatibilidade mas não é mais usado para escalar.
 */
export function getActiveCoords(
  el: BaseElement,
  device: 'Desktop' | 'Mobile',
  _pageWidth?: number,
): { x: number; y: number; w: number; h: number } {
  if (device === 'Mobile' && el.mobile) return el.mobile
  return { x: el.x, y: el.y, w: el.w, h: el.h }
}

/** Altura efetiva do bloco por device. Em Mobile sem heightMobile usa altura
 *  desktop como fallback (pode vazar visualmente — esperado até o usuário
 *  rodar "Refazer mobile"). */
export function getActiveBlockHeight(
  block: Block,
  device: 'Desktop' | 'Mobile',
  _pageWidth?: number,
): number {
  if (device === 'Mobile' && block.heightMobile) return block.heightMobile
  return block.height
}

/** Gap + padding usados no auto-stack mobile */
const MOBILE_STACK_PADDING = 16
const MOBILE_STACK_GAP     = 16

/**
 * Reconstrói o layout mobile automaticamente.
 * Aplica stack vertical centralizado, preservando aspect-ratio de mídia.
 *
 * - Imagens/Vídeos: largura total − 2*padding, altura preserva aspect-ratio
 * - Ícones/Círculos: mantêm tamanho (centralizados horizontalmente)
 * - Botão/Texto/Título/Caixa: largura total − 2*padding, altura mantida
 * - Elementos ordenados pela ordem Y do desktop
 * - block.heightMobile é recalculado com base no stack final
 *
 * Retorna uma nova PageModel com el.mobile e block.heightMobile atualizados.
 */
export function rebuildMobileLayout(page: PageModel): PageModel {
  const innerW = MOBILE_WIDTH - 2 * MOBILE_STACK_PADDING
  return {
    ...page,
    blocks: page.blocks.map(block => {
      // Ordena por Y desktop — mantém ordem visual que o usuário desenhou
      const sorted = [...block.elements].sort((a, b) => a.y - b.y)
      let cursorY = MOBILE_STACK_PADDING
      const stacked = sorted.map(el => {
        const type = el.type
        let newW: number, newH: number, newX: number
        if (type === 'imagem' || type === 'video') {
          // Preserva aspect ratio — largura total, altura proporcional
          const ratio = el.h / el.w
          newW = innerW
          newH = Math.max(40, Math.round(innerW * ratio))
          newX = MOBILE_STACK_PADDING
        } else if (type === 'icone' || type === 'circulo') {
          // Elementos "pontuais" mantêm tamanho, centralizados
          newW = Math.min(el.w, innerW)
          newH = el.h
          newX = Math.round((MOBILE_WIDTH - newW) / 2)
        } else {
          // botao, texto, titulo, caixa → largura total
          newW = innerW
          newH = el.h
          newX = MOBILE_STACK_PADDING
        }
        const mobile = { x: newX, y: cursorY, w: newW, h: newH }
        cursorY += newH + MOBILE_STACK_GAP
        return { ...el, mobile }
      })
      // Preserva a ordem original (não a ordenada por Y) mas com mobile recalculado
      const byId = new Map(stacked.map(e => [e.id, e]))
      return {
        ...block,
        elements: block.elements.map(e => byId.get(e.id) ?? e),
        heightMobile: cursorY + MOBILE_STACK_PADDING - MOBILE_STACK_GAP,
      }
    }),
  }
}
