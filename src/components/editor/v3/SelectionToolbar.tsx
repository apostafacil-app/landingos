'use client'

/**
 * Toolbar flutuante contextual — aparece em cima do elemento selecionado.
 * Ações variam por tipo de elemento (imagem tem "Alterar imagem", etc.).
 * Posicionada via position: fixed (viewport coords).
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Copy, Trash2, Pencil, Link2, Image as ImageIcon, Palette, Video,
} from 'lucide-react'
import type { Element as Elem } from './types'

interface Props {
  element:         Elem
  targetEl:        HTMLElement
  onDelete:        () => void
  onDuplicate:     () => void
  onUpdateElement: (patch: Partial<Elem>) => void
  onPickImage?:    (cb: (url: string) => void) => void
}

const TOOLBAR_H = 36
const GAP       = 8

export function SelectionToolbar({
  element, targetEl, onDelete, onDuplicate, onUpdateElement, onPickImage,
}: Props) {
  // Posição em viewport (fixed)
  const [pos, setPos] = useState({ top: 0, left: 0, showBelow: false })

  useEffect(() => {
    const sync = () => {
      const r = targetEl.getBoundingClientRect()
      const showBelow = r.top < TOOLBAR_H + GAP + 16
      setPos({
        top:  showBelow ? r.bottom + GAP : r.top - TOOLBAR_H - GAP,
        left: Math.max(8, r.left + r.width / 2),
        showBelow,
      })
    }
    sync()
    // raf-based sync on scroll/resize (simples e eficiente)
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { raf = 0; sync() })
    }
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('resize', onScroll, { passive: true })
    // Observa tamanho do elemento também
    const ro = new ResizeObserver(sync)
    ro.observe(targetEl)
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true } as EventListenerOptions)
      window.removeEventListener('resize', onScroll)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [targetEl, element.x, element.y, element.w, element.h])

  if (typeof window === 'undefined') return null

  return createPortal(
    <div
      style={{
        position:      'fixed',
        top:           pos.top,
        left:          pos.left,
        transform:     'translateX(-50%)',
        zIndex:        2147483646,
        display:       'flex',
        alignItems:    'center',
        height:        TOOLBAR_H,
        padding:       '0 4px',
        gap:           2,
        background:    'rgba(17, 24, 39, 0.96)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:        '1px solid rgba(71, 85, 105, 0.6)',
        borderRadius:  9,
        boxShadow:     '0 8px 24px rgba(0,0,0,0.45)',
        userSelect:    'none',
        pointerEvents: 'auto',
        fontFamily:    'system-ui, -apple-system, sans-serif',
      }}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      {/* Tag badge */}
      <span style={{
        fontSize:   11,
        fontWeight: 700,
        color:      '#60a5fa',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        padding:    '0 8px',
      }}>
        {typeLabel(element.type)}
      </span>

      <Sep />

      {/* Editar texto (se aplicável) */}
      {(element.type === 'texto' || element.type === 'titulo' || element.type === 'botao') && (
        <>
          <TBtn title="Editar texto" onClick={() => {
            // aciona double-click simulado — vai pro modo edição
            const el = document.querySelector<HTMLElement>(`[data-lp-id="${element.id}"]`)
            if (!el) return
            const ev = new MouseEvent('dblclick', { bubbles: true, cancelable: true })
            el.dispatchEvent(ev)
          }}>
            <Pencil size={14} />
          </TBtn>
          <Sep />
        </>
      )}

      {/* Alterar imagem */}
      {element.type === 'imagem' && (
        <>
          <TBtn title="Alterar imagem" onClick={() => {
            if (onPickImage) {
              onPickImage((url) => onUpdateElement({ src: url } as unknown as Partial<Elem>))
            } else {
              // Fallback se o picker não estiver disponível
              const url = prompt('URL da imagem:', (element as { src?: string }).src || '')
              if (url) onUpdateElement({ src: url } as unknown as Partial<Elem>)
            }
          }}>
            <ImageIcon size={14} />
          </TBtn>
          <Sep />
        </>
      )}

      {/* Alterar vídeo (URL YouTube / Vimeo / embed direto) */}
      {element.type === 'video' && (
        <>
          <TBtn title="Alterar vídeo (URL)" onClick={() => {
            const cur = (element as { src?: string }).src || ''
            const url = prompt('URL do vídeo (YouTube, Vimeo ou embed):', cur)
            if (url) onUpdateElement({ src: url } as unknown as Partial<Elem>)
          }}>
            <Video size={14} />
          </TBtn>
          <Sep />
        </>
      )}

      {/* Link (botão, imagem, ícone) */}
      {(element.type === 'botao' || element.type === 'imagem' || element.type === 'icone') && (
        <>
          <TBtn title="Definir link" onClick={() => {
            const cur = (element as { link?: string }).link || ''
            const url = prompt('Link:', cur)
            if (url != null) onUpdateElement({ link: url } as unknown as Partial<Elem>)
          }}>
            <Link2 size={14} />
          </TBtn>
          <Sep />
        </>
      )}

      {/* Cor (caixa, círculo, botão) */}
      {(element.type === 'caixa' || element.type === 'circulo' || element.type === 'botao') && (
        <>
          <TBtn title="Cor de fundo" onClick={() => {
            const cur = (element as { bgColor?: string }).bgColor || '#3b82f6'
            const color = prompt('Cor (hex):', cur)
            if (color) onUpdateElement({ bgColor: color } as unknown as Partial<Elem>)
          }}>
            <Palette size={14} />
          </TBtn>
          <Sep />
        </>
      )}

      {/* Duplicar */}
      <TBtn title="Duplicar (Ctrl+D)" onClick={onDuplicate}>
        <Copy size={14} />
      </TBtn>

      <Sep />

      {/* Deletar */}
      <TBtn title="Deletar (Delete)" danger onClick={onDelete}>
        <Trash2 size={14} />
      </TBtn>
    </div>,
    document.body,
  )
}

function Sep() {
  return <div style={{ width: 1, height: 16, background: 'rgba(71,85,105,0.6)', margin: '0 2px', flexShrink: 0 }} />
}

function TBtn({
  children, title, onClick, disabled, danger,
}: {
  children: React.ReactNode
  title:    string
  onClick:  () => void
  disabled?: boolean
  danger?:   boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={e => { e.stopPropagation(); onClick() }}
      style={{
        display:     'flex',
        alignItems:  'center',
        justifyContent: 'center',
        width:       28,
        height:      28,
        border:      'none',
        background:  'transparent',
        color:       disabled ? '#475569' : (danger ? '#f87171' : '#cbd5e1'),
        borderRadius:5,
        cursor:      disabled ? 'not-allowed' : 'pointer',
        transition:  'background 0.12s, color 0.12s',
        opacity:     disabled ? 0.45 : 1,
      }}
      onMouseEnter={e => {
        if (disabled) return
        const btn = e.currentTarget
        btn.style.background = danger ? 'rgba(239,68,68,0.14)' : 'rgba(96,165,250,0.14)'
        btn.style.color      = danger ? '#ef4444' : '#e2e8f0'
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget
        btn.style.background = 'transparent'
        btn.style.color      = disabled ? '#475569' : (danger ? '#f87171' : '#cbd5e1')
      }}
    >
      {children}
    </button>
  )
}

function typeLabel(type: Elem['type']): string {
  const labels: Record<Elem['type'], string> = {
    imagem:  '🖼 imagem',
    texto:   '📝 texto',
    titulo:  '🔠 título',
    botao:   '🔘 botão',
    caixa:   '▭ caixa',
    circulo: '⬤ círculo',
    icone:   '😀 ícone',
    video:   '▶ vídeo',
  }
  return labels[type] ?? type
}
