'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { EditorAPI, LPComp } from './LandingEditor'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLabel(el: HTMLElement): string {
  // First heading inside the element
  const h = el.querySelector('h1,h2,h3,h4,h5,h6')
  if (h?.textContent?.trim()) return h.textContent.trim().slice(0, 48)
  // ID or class hint
  if (el.id) return `#${el.id}`
  // First non-empty text content (collapsed whitespace)
  const text = el.textContent?.trim().replace(/\s+/g, ' ').slice(0, 48)
  if (text) return text
  return `<${el.tagName.toLowerCase()}>`
}

function getTagLabel(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const labels: Record<string, string> = {
    section: 'section',
    header:  'header',
    footer:  'footer',
    nav:     'nav',
    main:    'main',
    article: 'article',
    aside:   'aside',
    form:    'form',
    div:     'div',
  }
  return labels[tag] ?? tag
}

function getTagColor(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'section')  return '#818cf8' // indigo
  if (tag === 'header')   return '#34d399' // emerald
  if (tag === 'footer')   return '#94a3b8' // slate
  if (tag === 'nav')      return '#fb923c' // orange
  if (tag === 'form')     return '#f472b6' // pink
  if (tag === 'main')     return '#60a5fa' // blue
  if (tag === 'article')  return '#a78bfa' // violet
  if (tag === 'div')      return '#4a6b9a' // muted blue
  return '#64748b'
}

// ── LayersPanel ───────────────────────────────────────────────────────────────

export function LayersPanel({
  editor,
  onClose,
}: {
  editor: EditorAPI | null
  onClose: () => void
}) {
  const [children, setChildren]     = useState<HTMLElement[]>([])
  const [activeIdx, setActiveIdx]   = useState<number>(-1)
  const [hoveredIdx, setHoveredIdx] = useState<number>(-1)
  const listRef = useRef<HTMLDivElement>(null)

  // ── Refresh the body-children list ────────────────────────────────────────
  const refresh = useCallback(() => {
    if (!editor?.getBodyChildren) return
    setChildren(editor.getBodyChildren())
  }, [editor])

  // ── Sync active index with canvas selection ────────────────────────────────
  const syncActive = useCallback((selected: HTMLElement | null) => {
    if (!editor?.getBodyChildren) { setActiveIdx(-1); return }
    const kids = editor.getBodyChildren()
    if (!selected) { setActiveIdx(-1); return }
    const idx = kids.findIndex(c => c === selected || c.contains(selected))
    setActiveIdx(idx)
  }, [editor])

  // ── Subscribe to change events ────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return
    refresh()

    // Initial selection sync
    syncActive(editor.getSelectedElement?.() ?? null)

    const handleChange = () => refresh()
    const handleSelect = (comp: LPComp) => syncActive(comp._el)
    const handleDeselect = () => setActiveIdx(-1)

    const unsub = editor.onAnyChange?.(handleChange)
    editor.on('component:selected',   handleSelect)
    editor.on('component:deselected', handleDeselect)

    return () => {
      unsub?.()
      editor.off('component:selected',   handleSelect)
      editor.off('component:deselected', handleDeselect)
    }
  }, [editor, refresh, syncActive])

  // ── Move a body child up or down ──────────────────────────────────────────
  const moveChild = (el: HTMLElement, dir: 'up' | 'down') => {
    const parent = el.parentElement
    if (!parent) return
    if (dir === 'up') {
      const prev = el.previousElementSibling
      if (prev) parent.insertBefore(el, prev)
    } else {
      const next = el.nextElementSibling
      if (next) parent.insertBefore(next, el)
    }
    editor?.trigger('change:changesCount')
    // Re-sync active after move
    setTimeout(() => syncActive(editor?.getSelectedElement?.() ?? null), 20)
  }

  // ── Click a row → select that element in canvas ───────────────────────────
  const handleRowClick = (el: HTMLElement) => {
    editor?.selectElement?.(el)
  }

  return (
    <div
      style={{
        width: 228,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#111827',
        borderRight: '1px solid #1e3050',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', height: 38, borderBottom: '1px solid #1e3050',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#94b4d8', fontSize: 11, fontWeight: 700,
          letterSpacing: '.07em', textTransform: 'uppercase',
        }}>
          Camadas
        </span>
        <button
          onClick={onClose}
          title="Fechar painel"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4a6b9a', fontSize: 17, lineHeight: 1, padding: '2px 4px',
            borderRadius: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94b4d8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a6b9a')}
        >
          ×
        </button>
      </div>

      {/* ── Body count ──────────────────────────────────────────────────── */}
      <div style={{
        padding: '6px 12px 4px',
        fontSize: 10, color: '#4a6b9a', flexShrink: 0,
      }}>
        {children.length} {children.length === 1 ? 'seção' : 'seções'}
      </div>

      {/* ── List ────────────────────────────────────────────────────────── */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '2px 0 8px' }}>
        {children.length === 0 ? (
          <p style={{
            color: '#4a6b9a', fontSize: 12, textAlign: 'center',
            padding: '28px 14px', lineHeight: 1.6,
          }}>
            Adicione blocos para<br />ver a estrutura aqui.
          </p>
        ) : (
          children.map((el, i) => {
            const isActive  = i === activeIdx
            const isHovered = i === hoveredIdx
            const tagColor  = getTagColor(el)

            return (
              <div
                key={i}
                onClick={() => handleRowClick(el)}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(-1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  padding: '0 8px 0 0',
                  height: 36,
                  background: isActive
                    ? 'rgba(59,130,246,0.12)'
                    : isHovered
                      ? 'rgba(255,255,255,0.04)'
                      : 'transparent',
                  borderLeft: isActive ? `2px solid ${tagColor}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                  userSelect: 'none',
                }}
              >
                {/* Layer index */}
                <span style={{
                  fontSize: 10, color: '#334155', fontFamily: 'monospace',
                  width: 26, textAlign: 'center', flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                {/* Tag badge */}
                <span style={{
                  fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
                  color: tagColor,
                  background: `${tagColor}18`,
                  border: `1px solid ${tagColor}40`,
                  borderRadius: 3,
                  padding: '1px 5px',
                  flexShrink: 0,
                  letterSpacing: '.02em',
                }}>
                  {getTagLabel(el)}
                </span>

                {/* Label */}
                <span style={{
                  fontSize: 11,
                  color: isActive ? '#e2e8f0' : '#64748b',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginLeft: 7,
                  lineHeight: 1.3,
                }}>
                  {getLabel(el)}
                </span>

                {/* Move buttons — visible on hover or active */}
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 0,
                  opacity: isActive || isHovered ? 1 : 0,
                  transition: 'opacity 0.15s',
                  flexShrink: 0,
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); moveChild(el, 'up') }}
                    disabled={i === 0}
                    title="Mover para cima"
                    style={{
                      background: 'none', border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer',
                      color: '#60a5fa', fontSize: 9, lineHeight: 1,
                      padding: '1px 3px',
                      opacity: i === 0 ? 0.25 : 1,
                    }}
                  >▲</button>
                  <button
                    onClick={e => { e.stopPropagation(); moveChild(el, 'down') }}
                    disabled={i === children.length - 1}
                    title="Mover para baixo"
                    style={{
                      background: 'none', border: 'none',
                      cursor: i === children.length - 1 ? 'not-allowed' : 'pointer',
                      color: '#60a5fa', fontSize: 9, lineHeight: 1,
                      padding: '1px 3px',
                      opacity: i === children.length - 1 ? 0.25 : 1,
                    }}
                  >▼</button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
