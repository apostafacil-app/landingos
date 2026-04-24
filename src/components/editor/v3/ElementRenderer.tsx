'use client'

/**
 * Renderiza cada tipo de elemento no canvas.
 * Elementos têm position:absolute e são colocados no coord (x, y, w, h).
 */

import { useRef, useEffect } from 'react'
import type {
  Element as Elem, ImagemElement, TextoElement, BotaoElement,
  CaixaElement, CirculoElement, IconeElement, VideoElement,
} from './types'

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
      borderRadius: el.borderRadius,
      overflow: 'hidden',
    }}>
      <img
        src={el.src}
        alt={el.alt ?? ''}
        draggable={false}
        style={{
          width: '100%', height: '100%', display: 'block',
          objectFit: el.objectFit ?? 'cover',
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
        overflow:      'hidden',
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
      borderRadius:    el.borderRadius,
      border:          el.borderWidth
        ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined,
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
      border: el.borderWidth
        ? `${el.borderWidth}px solid ${el.borderColor ?? '#000'}` : undefined,
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
