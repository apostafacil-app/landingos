'use client'

/**
 * Renderiza cada tipo de elemento no canvas.
 * Elementos têm position:absolute e são colocados no coord (x, y, w, h).
 */

import { useRef, useEffect } from 'react'
import type {
  Element as Elem, ImagemElement, TextoElement, BotaoElement,
  CaixaElement, CirculoElement, IconeElement, VideoElement,
  BaseElement, ImageFilters, ShadowPreset,
} from './types'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers para converter propriedades do modelo em CSS
// ─────────────────────────────────────────────────────────────────────────────

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
  onEditChange:  (patch: Partial<Elem>) => void
  onEditCommit:  (patch: Partial<Elem>) => void
  onStopEditing: () => void
}

export function ElementRenderer({
  element, isSelected, isEditing,
  onEditChange, onEditCommit, onStopEditing,
}: Props) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left:     element.x,
    top:      element.y,
    width:    element.w,
    height:   element.h,
    zIndex:   element.zIndex ?? (isSelected ? 10 : 1),
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    transformOrigin: 'center center',
    boxSizing: 'border-box',
    opacity:  element.opacity !== undefined ? element.opacity : undefined,
    boxShadow: element.shadow && element.shadow !== 'none' ? SHADOW_PRESETS_CSS[element.shadow] : undefined,
    outline: isSelected && !isEditing ? '2px solid transparent' : undefined, // real outline via Moveable
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

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus()
      // Seleciona todo o conteúdo na entrada de edição
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isEditing])

  const handleBlur = () => {
    if (!ref.current) return
    const html = ref.current.innerHTML
    onEditCommit({ html } as Partial<TextoElement>)
    onStopEditing()
  }

  return (
    <div
      {...data}
      ref={ref}
      className={`lp-el lp-${el.type}`}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); ref.current?.blur() }
      }}
      dangerouslySetInnerHTML={isEditing ? undefined : { __html: el.html }}
      style={{
        ...style,
        // Texto tem altura automática — deixa o conteúdo fluir em múltiplas linhas
        height:        'auto',
        minHeight:     el.h,
        maxHeight:     'none',
        fontSize:      el.fontSize ?? 16,
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
        // Quebra palavras longas / overflow-wrap para wrapping natural
        wordBreak:     'break-word',
        overflowWrap:  'break-word',
        whiteSpace:    'normal',
        // text-shadow (diferente de box-shadow do baseStyle para shapes)
        textShadow:    el.textShadow && el.textShadow !== 'none'
          ? TEXT_SHADOW_PRESETS_CSS[el.textShadow]
          : undefined,
      }}
    >
      {isEditing ? <span dangerouslySetInnerHTML={{ __html: el.html }} /> : null}
    </div>
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

  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isEditing])

  const handleBlur = () => {
    if (!ref.current) return
    onEditCommit({ text: ref.current.textContent ?? '' })
    onStopEditing()
  }

  return (
    <div {...data} className="lp-el lp-botao" style={style}>
      <div
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Escape') { e.preventDefault(); ref.current?.blur() }
          if (e.key === 'Enter')  { e.preventDefault(); ref.current?.blur() }
        }}
        style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: el.bgColor ?? '#2563eb',
          color:           el.color   ?? '#ffffff',
          borderRadius:    el.borderRadius ?? 8,
          fontSize:        el.fontSize ?? 15,
          fontWeight:      el.fontWeight ?? 600,
          padding:         el.padding ? `${el.padding[0]}px ${el.padding[1]}px` : undefined,
          outline:         isEditing ? '2px solid #f59e0b' : undefined,
          outlineOffset:   isEditing ? 2 : undefined,
          cursor:          isEditing ? 'text' : 'pointer',
          userSelect:      isEditing ? 'text' : 'none',
          textAlign:       'center',
        }}
      >
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
      backgroundColor: el.bgColor ?? '#e2e8f0',
      backgroundImage: el.bgImage ? `url("${el.bgImage}")` : undefined,
      backgroundSize:  'cover',
      backgroundPosition: 'center',
      // Prioriza el.borders; fallback para campos legacy
      borderRadius:    buildBorderRadius(el, el.borderRadius),
      border:          buildBorder(el) ?? (el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined),
    }} />
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
      backgroundColor: el.bgColor ?? '#3b82f6',
      border: buildBorder(el) ?? (el.borderWidth ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined),
    }} />
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
  const content = el.emoji ?? '★'
  return (
    <div {...data} className="lp-el lp-icone" style={style}>
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40,
        backgroundColor: el.bgColor,
        color:           el.color,
        borderRadius:    el.borderRadius,
      }}>
        {content}
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
  return (
    <div {...data} className="lp-el lp-video" style={style}>
      <iframe
        src={url}
        style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
        allowFullScreen
      />
    </div>
  )
}
