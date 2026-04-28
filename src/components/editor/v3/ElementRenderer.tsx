'use client'

/**
 * Renderiza cada tipo de elemento no canvas.
 * Elementos têm position:absolute e são colocados no coord (x, y, w, h).
 */

import { useRef, useEffect } from 'react'
import type {
  Element as Elem, ImagemElement, TextoElement, BotaoElement,
  CaixaElement, CirculoElement, IconeElement, VideoElement,
  FormularioElement, FormFieldConfig,
  FaqElement,
  TimerElement, TimerUnit,
  BaseElement, ImageFilters, ShadowPreset,
} from './types'
import { getActiveCoords } from './types'
import { iconSvg as iconSvgFromLibrary } from './icons-library'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers para converter propriedades do modelo em CSS
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Animações de entrada — injeta CSS keyframes globalmente 1x e aplica classe
// ─────────────────────────────────────────────────────────────────────────────

const ANIM_STYLE_ID = 'lp-v3-anims'
if (typeof document !== 'undefined' && !document.getElementById(ANIM_STYLE_ID)) {
  const style = document.createElement('style')
  style.id = ANIM_STYLE_ID
  style.textContent = `
    @keyframes lpFade { from { opacity: 0 } to { opacity: 1 } }
    @keyframes lpSlideUp   { from { opacity: 0; transform: translate3d(0, 30px, 0) }  to { opacity: 1; transform: none } }
    @keyframes lpSlideDown { from { opacity: 0; transform: translate3d(0, -30px, 0) } to { opacity: 1; transform: none } }
    @keyframes lpSlideLeft { from { opacity: 0; transform: translate3d(30px, 0, 0) }  to { opacity: 1; transform: none } }
    @keyframes lpSlideRight{ from { opacity: 0; transform: translate3d(-30px, 0, 0) } to { opacity: 1; transform: none } }
    @keyframes lpBounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0) }
      40%, 43% { transform: translate3d(0,-24px,0) }
      70% { transform: translate3d(0,-12px,0) }
      90% { transform: translate3d(0,-4px,0) }
    }
    @keyframes lpZoom { from { opacity: 0; transform: scale(0.5) } to { opacity: 1; transform: none } }
    @keyframes lpShake {
      0%, 100% { transform: translate3d(0,0,0) }
      10%, 30%, 50%, 70%, 90% { transform: translate3d(-8px,0,0) }
      20%, 40%, 60%, 80% { transform: translate3d(8px,0,0) }
    }
    @keyframes lpFold { from { opacity: 0; transform: perspective(400px) rotateX(90deg) } to { opacity: 1; transform: none } }
    @keyframes lpRoll { from { opacity: 0; transform: translate3d(-80px,0,0) rotate3d(0,0,1,-120deg) } to { opacity: 1; transform: none } }
  `
  document.head.appendChild(style)
}

const ANIM_NAMES: Record<string, string> = {
  fade: 'lpFade',
  'slide-up':    'lpSlideUp',
  'slide-down':  'lpSlideDown',
  'slide-left':  'lpSlideLeft',
  'slide-right': 'lpSlideRight',
  slide: 'lpSlideUp', // default direction
  bounce: 'lpBounce',
  zoom: 'lpZoom',
  shake: 'lpShake',
  fold: 'lpFold',
  roll: 'lpRoll',
}

function buildAnimationStyle(anim: { type?: string; direction?: string; duration?: number; delay?: number; repeat?: string } | undefined): React.CSSProperties {
  if (!anim || !anim.type || anim.type === 'none') return {}
  let key: string = anim.type
  if (anim.type === 'slide' && anim.direction && anim.direction !== 'center') {
    key = `slide-${anim.direction}`
  }
  const name = ANIM_NAMES[key] ?? ANIM_NAMES.fade
  const duration = anim.duration ?? 800
  const delay    = anim.delay ?? 0
  const iter     = anim.repeat === 'loop' ? 'infinite' : '1'
  return {
    animation: `${name} ${duration}ms ease ${delay}ms ${iter} both`,
  }
}

const SHADOW_PRESETS_CSS: Record<ShadowPreset, string> = {
  none:   'none',
  soft:   '0 2px 8px rgba(0,0,0,0.12)',
  medium: '0 4px 16px rgba(0,0,0,0.18)',
  hard:   '0 8px 28px rgba(0,0,0,0.25)',
  sharp:  '4px 4px 0 rgba(0,0,0,0.8)',
  neon:   '0 0 20px #60a5fa',
}

const TEXT_SHADOW_PRESETS_CSS: Record<ShadowPreset, string> = {
  none:   'none',
  soft:   '0 1px 2px rgba(0,0,0,0.25)',
  medium: '0 2px 4px rgba(0,0,0,0.4)',
  hard:   '0 3px 6px rgba(0,0,0,0.55)',
  sharp:  '2px 2px 0 rgba(0,0,0,0.8)',
  neon:   '0 0 10px rgba(96,165,250,0.9)',
}

function buildFilterString(f: ImageFilters | undefined): string | undefined {
  if (!f) return undefined
  const parts: string[] = []
  if (f.hueRotate)            parts.push(`hue-rotate(${f.hueRotate}deg)`)
  if (f.saturate   !== undefined && f.saturate   !== 100) parts.push(`saturate(${f.saturate}%)`)
  if (f.brightness !== undefined && f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`)
  if (f.contrast   !== undefined && f.contrast   !== 100) parts.push(`contrast(${f.contrast}%)`)
  if (f.invert)               parts.push(`invert(${f.invert}%)`)
  if (f.sepia)                parts.push(`sepia(${f.sepia}%)`)
  if (f.blur)                 parts.push(`blur(${f.blur}px)`)
  if (f.grayscale)            parts.push(`grayscale(${f.grayscale}%)`)
  return parts.length ? parts.join(' ') : undefined
}

function buildBorderRadius(el: BaseElement, legacy?: number): string | undefined {
  const b = el.borders
  if (b?.radius) {
    const [tl, tr, br, bl] = b.equalCorners
      ? [b.radius[0], b.radius[0], b.radius[0], b.radius[0]]
      : b.radius
    return `${tl}px ${tr}px ${br}px ${bl}px`
  }
  if (legacy) return `${legacy}px`
  return undefined
}

function buildBorder(el: BaseElement): string | undefined {
  const b = el.borders
  if (!b?.width || b.width <= 0) return undefined
  return `${b.width}px solid ${b.color ?? '#000000'}`
}

interface Props {
  element:    Elem
  isSelected: boolean
  isEditing:  boolean
  device?:    'Desktop' | 'Mobile'
  pageWidth?: number
  onEditChange:  (patch: Partial<Elem>) => void
  onEditCommit:  (patch: Partial<Elem>) => void
  onStopEditing: () => void
}

export function ElementRenderer({
  element, isSelected, isEditing, device = 'Desktop', pageWidth = 1200,
  onEditChange, onEditCommit, onStopEditing,
}: Props) {
  // Visibilidade por breakpoint (retorna null se oculto no device atual)
  if (device === 'Desktop' && element.hideDesktop) return null
  if (device === 'Mobile'  && element.hideMobile)  return null

  // Coords ativos: Desktop usa base. Mobile usa el.mobile se existir, senão
  // escala proporcionalmente do desktop (evita elementos vazarem do canvas).
  const coords = getActiveCoords(element, device, pageWidth)
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left:     coords.x,
    top:      coords.y,
    width:    coords.w,
    height:   coords.h,
    zIndex:   element.zIndex ?? (isSelected ? 10 : 1),
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    transformOrigin: 'center center',
    boxSizing: 'border-box',
    opacity:  element.opacity !== undefined ? element.opacity : undefined,
    boxShadow: element.shadow && element.shadow !== 'none' ? SHADOW_PRESETS_CSS[element.shadow] : undefined,
    // Promove o elemento selecionado para uma layer GPU.
    // Sem isso, mudanças de transform durante drag forçam o browser a
    // re-pintar texto/botões na CPU (custoso para fontes). Imagens já
    // ganham layer GPU automaticamente por serem replaced content.
    willChange: isSelected ? 'transform' : undefined,
    // Animação de entrada NÃO roda enquanto o elemento está selecionado:
    // os keyframes mexem em transform e conflitam com o transform que o
    // Moveable aplica durante drag (causa lag/freeze).
    // Para preview, há um botão "Pré-visualizar" no painel.
    ...(isSelected ? {} : buildAnimationStyle(element.animation)),
  }

  const dataAttrs = {
    'data-lp-id':   element.id,
    'data-lp-type': element.type,
  }

  switch (element.type) {
    case 'imagem':  return <ImagemRender el={element as ImagemElement}   style={baseStyle} data={dataAttrs} />
    case 'texto':
    case 'titulo':  return <TextoRender  el={element as TextoElement}
                                          style={baseStyle} data={dataAttrs}
                                          isEditing={isEditing}
                                          onEditChange={onEditChange}
                                          onEditCommit={onEditCommit}
                                          onStopEditing={onStopEditing} />
    case 'botao':   return <BotaoRender  el={element as BotaoElement}
                                          style={baseStyle} data={dataAttrs}
                                          isEditing={isEditing}
                                          onEditChange={onEditChange}
                                          onEditCommit={onEditCommit}
                                          onStopEditing={onStopEditing} />
    case 'caixa':   return <CaixaRender  el={element as CaixaElement}   style={baseStyle} data={dataAttrs} />
    case 'circulo': return <CirculoRender el={element as CirculoElement} style={baseStyle} data={dataAttrs} />
    case 'icone':   return <IconeRender  el={element as IconeElement}   style={baseStyle} data={dataAttrs} />
    case 'video':   return <VideoRender  el={element as VideoElement}   style={baseStyle} data={dataAttrs} />
    case 'formulario': return <FormularioRender el={element as FormularioElement} style={baseStyle} data={dataAttrs} />
    case 'faq':        return <FaqRender el={element as FaqElement} style={baseStyle} data={dataAttrs} />
    case 'timer':      return <TimerRender el={element as TimerElement} style={baseStyle} data={dataAttrs} />
    default:        return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Imagem
// ─────────────────────────────────────────────────────────────────────────────

function ImagemRender({ el, style, data }: {
  el: ImagemElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  return (
    <div {...data} className="lp-el lp-imagem" style={{
      ...style,
      borderRadius: buildBorderRadius(el, el.borderRadius),
      border:       buildBorder(el),
      overflow:     'hidden',
    }}>
      <img
        src={el.src}
        alt={el.alt ?? ''}
        draggable={false}
        style={{
          width: '100%', height: '100%', display: 'block',
          objectFit: el.objectFit ?? 'cover',
          filter: buildFilterString(el.filters),
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Texto / Título
// ─────────────────────────────────────────────────────────────────────────────

function TextoRender({
  el, style, data, isEditing,
  onEditChange, onEditCommit, onStopEditing,
}: {
  el: TextoElement
  style: React.CSSProperties
  data: Record<string, string>
  isEditing: boolean
  onEditChange: (patch: Partial<TextoElement>) => void
  onEditCommit: (patch: Partial<TextoElement>) => void
  onStopEditing: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Ao ENTRAR em modo edição, inicializamos o conteúdo via DOM uma única vez.
  // Evita que dangerouslySetInnerHTML seja re-aplicado em re-renders (o que
  // apagaria o texto digitado pelo usuário).
  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.innerHTML = el.html ?? ''
      ref.current.focus()
      // Cursor no final (UX mais natural que select-all)
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    // Intencional: não incluir el.html nas deps — não queremos resetar conteúdo
    // durante a edição só porque o model mudou em outro lugar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const handleBlur = () => {
    if (!ref.current) return
    const html = ref.current.innerHTML
    onEditCommit({ html } as Partial<TextoElement>)
    onStopEditing()
  }

  // Defaults de tamanho por nível de heading (CSS browser aproximado)
  const headingDefaults: Record<1|2|3|4|5|6, number> = { 1: 36, 2: 30, 3: 24, 4: 20, 5: 18, 6: 16 }
  const defaultFontSize = el.type === 'titulo'
    ? headingDefaults[el.headingLevel ?? 1]
    : 16

  const sharedStyle: React.CSSProperties = {
    ...style,
    height:        'auto',
    minHeight:     el.h,
    maxHeight:     'none',
    fontSize:      el.fontSize ?? defaultFontSize,
    fontFamily:    el.fontFamily,
    color:         el.color ?? '#0f172a',
    textAlign:     el.textAlign ?? 'left',
    fontWeight:    el.fontWeight ?? (el.type === 'titulo' ? 700 : 400),
    lineHeight:    el.lineHeight ?? 1.4,
    letterSpacing: el.letterSpacing,
    outline:       isEditing ? '2px solid #f59e0b' : undefined,
    outlineOffset: isEditing ? 2 : undefined,
    cursor:        isEditing ? 'text' : 'default',
    userSelect:    isEditing ? 'text' : 'none',
    // word-break: normal + overflow-wrap: break-word → quebra apenas em
    // espaços OU em palavras longas que estouram o box. Igual ao default do
    // browser na pagina publicada — assim editor e publicado renderizam
    // identico (ex: "⭐⭐⭐⭐⭐" sem espacos overflow do box em vez de
    // wrappar entre estrelas).
    wordBreak:     'normal',
    overflowWrap:  'break-word',
    whiteSpace:    'normal',
    textShadow:    el.textShadow && el.textShadow !== 'none'
      ? TEXT_SHADOW_PRESETS_CSS[el.textShadow]
      : undefined,
  }

  // Em modo edição, conteúdo é setado no useEffect via ref.innerHTML.
  // React NÃO gerencia children, para que keystrokes não sejam apagados por re-render.
  if (isEditing) {
    return (
      <div
        {...data}
        ref={ref}
        className={`lp-el lp-${el.type}`}
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Escape') { e.preventDefault(); ref.current?.blur() }
        }}
        style={sharedStyle}
      />
    )
  }

  // Modo display: usa dangerouslySetInnerHTML (estático, sem risco de wipe)
  return (
    <div
      {...data}
      ref={ref}
      className={`lp-el lp-${el.type}`}
      style={sharedStyle}
      dangerouslySetInnerHTML={{ __html: el.html }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Botão
// ─────────────────────────────────────────────────────────────────────────────

function BotaoRender({
  el, style, data, isEditing,
  onEditCommit, onStopEditing,
}: {
  el: BotaoElement
  style: React.CSSProperties
  data: Record<string, string>
  isEditing: boolean
  onEditChange: (patch: Partial<BotaoElement>) => void
  onEditCommit: (patch: Partial<BotaoElement>) => void
  onStopEditing: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Inicializa conteúdo no DOM uma vez ao entrar em edição.
  // Evita que React wipe o texto digitado em re-renders.
  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.textContent = el.text ?? ''
      ref.current.focus()
      // Cursor no final (natural pra editar rótulo)
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const handleBlur = () => {
    if (!ref.current) return
    onEditCommit({ text: ref.current.textContent ?? '' })
    onStopEditing()
  }

  // Borders do modelo: aplicadas no div visível interno (o botão em si).
  const innerBorderRadius = buildBorderRadius(el, el.borderRadius ?? 8)
  const innerBorder = buildBorder(el)

  // O outer também recebe borderRadius para que a box-shadow (que é aplicada
  // no outer via baseStyle) siga o contorno arredondado do botão.
  const outerStyle: React.CSSProperties = {
    ...style,
    borderRadius: innerBorderRadius,
  }

  const innerStyle: React.CSSProperties = {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: el.bgColor ?? '#2563eb',
    color:           el.color   ?? '#ffffff',
    borderRadius:    innerBorderRadius,
    border:          innerBorder,
    fontSize:        el.fontSize ?? 15,
    fontWeight:      el.fontWeight ?? 600,
    padding:         el.padding ? `${el.padding[0]}px ${el.padding[1]}px` : undefined,
    outline:         isEditing ? '2px solid #f59e0b' : undefined,
    outlineOffset:   isEditing ? 2 : undefined,
    cursor:          isEditing ? 'text' : 'pointer',
    userSelect:      isEditing ? 'text' : 'none',
    textAlign:       'center',
  }

  // Em edição, não renderizamos children — o conteúdo vem do ref.textContent no useEffect.
  if (isEditing) {
    return (
      <div {...data} className="lp-el lp-botao" style={outerStyle}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={e => {
            if (e.key === 'Escape') { e.preventDefault(); ref.current?.blur() }
            if (e.key === 'Enter')  { e.preventDefault(); ref.current?.blur() }
          }}
          style={innerStyle}
        />
      </div>
    )
  }

  return (
    <div {...data} className="lp-el lp-botao" style={outerStyle}>
      <div ref={ref} style={innerStyle}>
        {el.text}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Caixa
// ─────────────────────────────────────────────────────────────────────────────

function CaixaRender({ el, style, data }: {
  el: CaixaElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  return (
    <div {...data} className="lp-el lp-caixa" style={{
      ...style,
      backgroundColor: el.bgColor ?? (el.bgImage ? 'transparent' : '#e2e8f0'),
      overflow:        el.bgImage ? 'hidden' : undefined,
      // Prioriza el.borders; fallback para campos legacy
      borderRadius:    buildBorderRadius(el, el.borderRadius),
      border:          buildBorder(el) ?? (el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined),
    }}>
      {el.bgImage && (
        <img
          aria-hidden
          src={el.bgImage}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Círculo
// ─────────────────────────────────────────────────────────────────────────────

function CirculoRender({ el, style, data }: {
  el: CirculoElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  return (
    <div {...data} className="lp-el lp-circulo" style={{
      ...style,
      borderRadius:  '50%',
      overflow:      'hidden',
      backgroundColor: el.bgColor ?? (el.bgImage ? 'transparent' : '#3b82f6'),
      border: buildBorder(el) ?? (el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined),
    }}>
      {el.bgImage && (
        <img
          aria-hidden
          src={el.bgImage}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ícone
// ─────────────────────────────────────────────────────────────────────────────

function IconeRender({ el, style, data }: {
  el: IconeElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  const radius = buildBorderRadius(el, el.borderRadius)
  // Prioridade: iconId (SVG da biblioteca) → emoji → fallback ★
  const svgString = el.iconId ? iconSvgFromLibrary(el.iconId) : null
  return (
    // Outer recebe borderRadius pra box-shadow seguir o contorno
    <div {...data} className="lp-el lp-icone" style={{ ...style, borderRadius: radius }}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40,
        backgroundColor: el.bgColor,
        color:           el.color,
        borderRadius:    radius,
        border:          buildBorder(el),
      }}>
        {svgString
          ? <span dangerouslySetInnerHTML={{ __html: svgString }} style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }} />
          : (el.emoji ?? '★')}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Vídeo
// ─────────────────────────────────────────────────────────────────────────────

function VideoRender({ el, style, data }: {
  el: VideoElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  // YouTube: normaliza URL
  const yt1 = /youtube\.com\/watch\?v=([^&]+)/.exec(el.src)
  const yt2 = /youtu\.be\/([^?&]+)/.exec(el.src)
  const vid = yt1?.[1] || yt2?.[1]
  const url = vid ? `https://www.youtube.com/embed/${vid}` : el.src
  const radius = buildBorderRadius(el)
  return (
    // Outer recebe borderRadius + overflow:hidden pra box-shadow seguir o
    // contorno e o iframe respeitar os cantos arredondados
    <div {...data} className="lp-el lp-video" style={{
      ...style,
      borderRadius: radius,
      border:       buildBorder(el),
      overflow:     'hidden',
    }}>
      <iframe
        src={url}
        style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
        allowFullScreen
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Formulário (preview no canvas)
// pointerEvents:'none' nos inputs pra não competir com Moveable.
// O HTML real (com submit funcional) é gerado pelo serializer ao publicar.
// ─────────────────────────────────────────────────────────────────────────────

function FormularioRender({ el, style, data }: {
  el: FormularioElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  const inputBg     = el.inputBg     ?? '#ffffff'
  const inputColor  = el.inputColor  ?? '#0f172a'
  const inputBorder = el.inputBorderColor ?? '#e2e8f0'
  const inputRadius = el.inputRadius ?? 8
  const fieldGap    = el.fieldGap    ?? 12
  const submitBg    = el.submitBg    ?? '#2563eb'
  const submitColor = el.submitColor ?? '#ffffff'
  const submitRad   = el.submitRadius ?? 8

  return (
    <div
      {...data}
      className="lp-el lp-formulario"
      style={{
        ...style,
        backgroundColor: el.bgColor ?? '#ffffff',
        borderRadius: buildBorderRadius(el),
        border: buildBorder(el),
        overflow: 'auto',
        padding: 20,
        boxSizing: 'border-box',
      }}
    >
      <form
        // No editor o form não envia — preventDefault no submit
        onSubmit={e => e.preventDefault()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: fieldGap,
          height: '100%',
          // Inputs visualmente desabilitados — o canvas é só preview, edição
          // do conteúdo dos fields é via Properties Panel (etapa 2).
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {(el.fields ?? []).map((f) => (
          <FormFieldPreview
            key={f.id}
            field={f}
            inputBg={inputBg}
            inputColor={inputColor}
            inputBorder={inputBorder}
            inputRadius={inputRadius}
          />
        ))}
        <button
          type="button"
          tabIndex={-1}
          style={{
            width: '100%',
            padding: '13px 18px',
            border: 0,
            background: submitBg,
            color: submitColor,
            borderRadius: submitRad,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'default',
            marginTop: 4,
          }}
        >
          {el.submitText || 'Enviar'}
        </button>
      </form>
    </div>
  )
}

function FormFieldPreview({ field: f, inputBg, inputColor, inputBorder, inputRadius }: {
  field:       FormFieldConfig
  inputBg:     string
  inputColor:  string
  inputBorder: string
  inputRadius: number
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', boxSizing: 'border-box',
    background: inputBg, color: inputColor,
    border: `1px solid ${inputBorder}`, borderRadius: inputRadius,
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
  }
  const label = f.label && (
    <div style={{ fontSize: 13, fontWeight: 600, color: inputColor, marginBottom: 6 }}>
      {f.label}{f.required ? ' *' : ''}
    </div>
  )
  if (f.kind === 'hidden') {
    // Campos hidden mostram só um chip discreto no editor (não vai pro publicado)
    return (
      <div style={{
        fontSize: 11, color: '#64748b', padding: '4px 8px',
        background: '#f1f5f9', borderRadius: 4, alignSelf: 'flex-start',
      }}>
        🔒 Hidden: <strong>{f.name}</strong>{f.defaultValue ? ` = ${f.defaultValue}` : ''}
      </div>
    )
  }
  if (f.kind === 'texto-longo') {
    return (
      <div>
        {label}
        <textarea readOnly placeholder={f.placeholder} style={{ ...inputStyle, minHeight: 90, resize: 'none' }} />
      </div>
    )
  }
  if (f.kind === 'select') {
    return (
      <div>
        {label}
        <select disabled style={inputStyle}>
          {f.placeholder && <option>{f.placeholder}</option>}
          {(f.options ?? []).map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    )
  }
  if (f.kind === 'radio' || f.kind === 'checkbox-grupo') {
    return (
      <div>
        {label}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(f.options ?? []).map(o => (
            <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: inputColor }}>
              <input type={f.kind === 'radio' ? 'radio' : 'checkbox'} disabled />
              <span>{o}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }
  if (f.kind === 'lgpd') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: inputColor }}>
        <input type="checkbox" disabled />
        <span>{f.label || 'Concordo com os termos de uso e política de privacidade.'}</span>
      </label>
    )
  }
  // texto-curto, email, telefone — input nativo
  const htmlType = f.kind === 'email' ? 'email' : f.kind === 'telefone' ? 'tel' : 'text'
  return (
    <div>
      {label}
      <input type={htmlType} readOnly placeholder={f.placeholder} style={inputStyle} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ — preview no canvas usando <details>/<summary> nativos.
// O accordion funciona DIRETO no editor (browser cuida) — UX limpa,
// igual ao publicado.
// ─────────────────────────────────────────────────────────────────────────────

function FaqRender({ el, style, data }: {
  el: FaqElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  const itemBg     = el.itemBgColor      ?? '#ffffff'
  const itemBorder = el.itemBorderColor  ?? '#e2e8f0'
  const itemRadius = el.itemBorderRadius ?? 12
  const accent     = el.accentColor      ?? '#2563eb'
  const accentW    = el.accentWidth      ?? 4
  const qColor     = el.qColor           ?? '#0f172a'
  const qSize      = el.qFontSize        ?? 16
  const qWeight    = el.qFontWeight      ?? 700
  const qFamily    = el.qFontFamily      ?? 'inherit'
  const aColor     = el.aColor           ?? '#64748b'
  const aSize      = el.aFontSize        ?? 14
  const aLine      = el.aLineHeight      ?? 1.6
  const iconColor  = el.iconColor        ?? accent
  const iconChar   = (el.iconStyle ?? 'plus') === 'chevron' ? '⌄' : '+'
  const spacing    = el.itemSpacing      ?? 12
  const padX       = el.itemPaddingX     ?? 24
  const padY       = el.itemPaddingY     ?? 18

  // Inline styles (sem <style> tag — garante re-render imediato no canvas
  // a cada mudança de prop)
  const itemStyle: React.CSSProperties = {
    background: itemBg,
    border: `1px solid ${itemBorder}`,
    borderRadius: itemRadius,
    borderLeft: accentW > 0 ? `${accentW}px solid ${accent}` : undefined,
    overflow: 'hidden',
    transition: 'box-shadow .2s ease',
  }
  const summaryStyle: React.CSSProperties = {
    listStyle: 'none',
    cursor: 'pointer',
    padding: `${padY}px ${padX}px`,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    fontFamily: qFamily,
    fontSize: qSize,
    fontWeight: qWeight,
    color: qColor,
    lineHeight: 1.4,
    userSelect: 'none',
  }
  const iconStyle: React.CSSProperties = {
    marginLeft: 'auto',
    fontSize: qSize + 6,
    fontWeight: 700,
    color: iconColor,
    lineHeight: 1,
  }
  const answerStyle: React.CSSProperties = {
    padding: `0 ${padX}px ${padY}px ${padX}px`,
    color: aColor,
    fontSize: aSize,
    lineHeight: aLine,
  }

  return (
    <div {...data} className="lp-el lp-faq" style={{ ...style, overflow: 'visible' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }}>
        {(el.items ?? []).length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8',
            border: '2px dashed #cbd5e1', borderRadius: itemRadius, fontSize: 14 }}>
            Nenhuma pergunta. Adicione no painel à direita →
          </div>
        )}
        {(el.items ?? []).map((item, idx) => (
          <details key={item.id || idx} open={item.open} style={itemStyle}>
            <summary style={summaryStyle}>
              <span style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: item.q || 'Nova pergunta' }} />
              <span style={iconStyle}>{iconChar}</span>
            </summary>
            <div style={answerStyle} dangerouslySetInnerHTML={{ __html: item.a || 'Resposta...' }} />
          </details>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer — preview no canvas mostra valores ESTÁTICOS placeholder.
// O JS de countdown só roda no publicado/preview iframe. No canvas,
// queremos UX limpa pra editar: mostra os tamanhos reais sem tick.
// ─────────────────────────────────────────────────────────────────────────────

function TimerRender({ el, style, data }: {
  el: TimerElement
  style: React.CSSProperties
  data: Record<string, string>
}) {
  const units    = (el.units && el.units.length ? el.units : ['days','hours','minutes','seconds'] as TimerUnit[])
  const layout   = el.layout || 'cards'
  const isStrip   = layout === 'strip'
  const isMinimal = layout === 'minimal'
  const showSep  = el.showSeparators ?? false

  const boxBg     = el.boxBgColor      ?? '#ffffff'
  const boxBorder = el.boxBorderColor  ?? 'transparent'
  const boxRad    = el.boxBorderRadius ?? 14
  const numColor  = el.numberColor     ?? '#dc2626'
  const numSize   = el.numberFontSize  ?? 48
  const numWeight = el.numberFontWeight ?? 900
  const numFamily = el.numberFontFamily ?? 'Plus Jakarta Sans, sans-serif'
  const labColor  = el.labelColor      ?? '#7f1d1d'
  const labSize   = el.labelFontSize   ?? 11
  const spacing   = el.unitSpacing     ?? 12
  const labels: Record<TimerUnit, string> = {
    days:    el.labelDays    ?? 'DIAS',
    hours:   el.labelHours   ?? 'HORAS',
    minutes: el.labelMinutes ?? 'MIN',
    seconds: el.labelSeconds ?? 'SEG',
  }
  // Valores placeholder — runtime sobrescreve no publicado
  const placeholders: Record<TimerUnit, string> = {
    days: '00', hours: '23', minutes: '59', seconds: '47',
  }
  const shadow = el.boxShadow && el.boxShadow !== 'none'
    ? (el.boxShadow === 'soft' ? '0 2px 8px rgba(0,0,0,0.12)'
       : el.boxShadow === 'medium' ? '0 4px 16px rgba(0,0,0,0.18)'
       : '0 8px 28px rgba(0,0,0,0.25)')
    : 'none'

  return (
    <div {...data} className="lp-el lp-timer" style={{ ...style, overflow: 'visible' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: spacing, height: '100%', boxSizing: 'border-box', flexWrap: 'wrap',
      }}>
        {units.map((u, i) => (
          <div key={u} style={{ display: 'flex', alignItems: 'center', gap: spacing }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              minWidth: isStrip ? 60 : 80 }}>
              <div style={{
                background: isMinimal ? 'transparent' : boxBg,
                border: isMinimal ? '0' : `1px solid ${boxBorder}`,
                boxShadow: isMinimal ? 'none' : shadow,
                borderRadius: boxRad,
                padding: isStrip ? '8px 12px' : '14px 16px',
                minWidth: isStrip ? 50 : 80,
                textAlign: 'center',
                fontFamily: numFamily,
                fontSize: numSize,
                fontWeight: numWeight,
                color: numColor,
                letterSpacing: -1,
                lineHeight: 1,
                boxSizing: 'border-box',
              }}>{placeholders[u]}</div>
              <div style={{
                marginTop: isStrip ? 6 : 10,
                fontSize: labSize, fontWeight: 800, color: labColor,
                letterSpacing: 2, textTransform: 'uppercase',
              }}>{labels[u]}</div>
            </div>
            {showSep && isStrip && i < units.length - 1 && (
              <span style={{
                fontSize: numSize * 0.75, fontWeight: 900, color: numColor,
                opacity: 0.5, lineHeight: 1, padding: '0 4px',
              }}>:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
