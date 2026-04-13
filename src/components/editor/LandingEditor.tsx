'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { createPortal } from 'react-dom'
import { ImagePickerModal } from './ImagePickerModal'

// ── Public handle ─────────────────────────────────────────────────────────────

export interface LandingEditorHandle {
  getHtml: () => string
  undo: () => void
  redo: () => void
  setDevice: (device: 'Desktop' | 'Mobile') => void
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  initialHtml: string | null
  onAutoSave:    (html: string) => void
  onSaveStatus?: (status: 'saving' | 'saved' | 'idle') => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorReady?: (api: any) => void
}

// ── LPComp — GrapesJS-compatible component wrapper around HTMLElement ─────────

export interface LPComp {
  /** The real DOM element. Used for identity comparisons. */
  _el: HTMLElement
  getStyle:   () => Record<string, string>
  setStyle:   (s: Record<string, string>) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get:        (key: string) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set:        (key: string, val: any) => void
  getClasses: () => string[]
  parent:     () => LPComp | null
  move:       (newParent: LPComp, opts: { at: number }) => void
  remove:     () => void
  components: () => {
    length:   number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    each:     (fn: (c: LPComp, i: number) => void) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    add:      (html: string, opts?: { at?: number }) => void
  }
}

// ── EditorAPI — GrapesJS-compatible editor surface ────────────────────────────

export interface EditorAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on:           (event: string, cb: (...a: any[]) => void) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off:          (event: string, cb: (...a: any[]) => void) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger:      (event: string, ...a: any[]) => void
  addComponents:(html: string) => void
  Canvas: {
    getDocument: () => Document | null
  }
  BlockManager: {
    getAll: () => { models: [] }
  }
  /** Open the image picker dialog; calls cb with the selected URL */
  openImagePicker?: (cb: (url: string) => void) => void
  /** Get all direct children of the page body (top-level sections/blocks) */
  getBodyChildren?: () => HTMLElement[]
  /** Programmatically select an element in the canvas */
  selectElement?: (el: HTMLElement) => void
  /** Get the currently selected element (if any) */
  getSelectedElement?: () => HTMLElement | null
  /** Subscribe to any DOM or selection change; returns unsubscribe function */
  onAnyChange?: (cb: () => void) => () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseInlineStyles(el: HTMLElement): Record<string, string> {
  const result: Record<string, string> = {}
  const attr = el.getAttribute('style') ?? ''
  attr.split(';').forEach(rule => {
    const colon = rule.indexOf(':')
    if (colon === -1) return
    const k = rule.slice(0, colon).trim()
    const v = rule.slice(colon + 1).trim()
    if (k) result[k] = v
  })
  return result
}

function applyInlineStyles(el: HTMLElement, styles: Record<string, string>) {
  // Build the style string from scratch so removed properties are cleaned up
  const parts: string[] = []
  Object.entries(styles).forEach(([k, v]) => {
    if (v !== '' && v !== undefined) parts.push(`${k}: ${v}`)
  })
  el.setAttribute('style', parts.join('; '))
}

function detectType(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'img')    return 'image'
  if (tag === 'a')      return 'link'
  if (tag === 'iframe' || tag === 'video') return 'video'
  if (tag === 'form')   return 'form'
  if (['p','span','h1','h2','h3','h4','h5','h6','strong','em','li','b','i','u'].includes(tag))
    return 'text'
  return 'default'
}

function getAttrs(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  Array.from(el.attributes).forEach(a => { out[a.name] = a.value })
  return out
}

/** WeakMap ensures the same HTMLElement always returns the same LPComp object (===) */
const compCache = new WeakMap<HTMLElement, LPComp>()

function getComp(el: HTMLElement, notifyRef: React.MutableRefObject<() => void>): LPComp {
  if (compCache.has(el)) return compCache.get(el)!

  // For text nodes we create a lightweight wrapper (no caching needed)
  if (el.nodeType !== Node.ELEMENT_NODE) {
    const textNode = el as unknown as Text
    return {
      _el: el,
      getStyle: () => ({}),
      setStyle: () => {},
      get: (k) => {
        if (k === 'content')  return textNode.textContent ?? ''
        if (k === 'tagName')  return '#text'
        if (k === 'type')     return 'text'
        if (k === 'attributes') return {}
        return undefined
      },
      set: (k, v) => { if (k === 'content') textNode.textContent = String(v) },
      getClasses: () => [],
      parent: () => el.parentElement ? getComp(el.parentElement, notifyRef) : null,
      move: () => {},
      remove: () => el.parentElement?.removeChild(el),
      components: () => ({ length: 0, each: () => {}, add: () => {} }),
    }
  }

  const comp: LPComp = {
    _el: el,
    getStyle: () => parseInlineStyles(el),
    setStyle: (s) => {
      applyInlineStyles(el, s)
      notifyRef.current()
    },
    get: (k) => {
      if (k === 'type')       return detectType(el)
      if (k === 'tagName')    return el.tagName.toLowerCase()
      if (k === 'attributes') return getAttrs(el)
      if (k === 'src')        return el.getAttribute('src') ?? ''
      if (k === 'content')    return el.textContent ?? ''
      return undefined
    },
    set: (k, v) => {
      if (k === 'attributes' && typeof v === 'object' && v !== null) {
        Object.entries(v as Record<string, string>).forEach(([attr, val]) => {
          el.setAttribute(attr, val)
        })
      }
      if (k === 'src') el.setAttribute('src', String(v))
      if (k === 'content') el.textContent = String(v)
    },
    getClasses: () => Array.from(el.classList),
    parent: () => el.parentElement ? getComp(el.parentElement, notifyRef) : null,
    move: (newParent, { at }) => {
      const refChild = newParent._el.children[at] ?? null
      newParent._el.insertBefore(el, refChild)
    },
    remove: () => {
      compCache.delete(el)
      el.parentElement?.removeChild(el)
    },
    components: () => ({
      get length() { return el.childNodes.length },
      each: (fn) => {
        Array.from(el.childNodes).forEach((child, i) => {
          fn(getComp(child as HTMLElement, notifyRef), i)
        })
      },
      add: (html, opts) => {
        const doc = el.ownerDocument
        const tmp = doc.createElement('div')
        tmp.innerHTML = html
        const at = opts?.at ?? el.children.length
        const refEl = el.children[at] ?? null
        while (tmp.firstChild) el.insertBefore(tmp.firstChild, refEl)
        notifyRef.current()
      },
    }),
  }
  compCache.set(el, comp)
  return comp
}

// ── Animation CSS ─────────────────────────────────────────────────────────────

const ANIMATION_CSS = `
@keyframes gjs-fadeIn{from{opacity:0}to{opacity:1}}
@keyframes gjs-fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes gjs-fadeInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
@keyframes gjs-fadeInLeft{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes gjs-fadeInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes gjs-zoomIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes gjs-bounceIn{0%{opacity:0;transform:scale(0.3)}50%{opacity:1;transform:scale(1.05)}70%{transform:scale(0.9)}100%{transform:scale(1)}}
@keyframes gjs-slideInUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.gjs-fadeIn{animation:gjs-fadeIn 0.5s ease both}
.gjs-fadeInUp{animation:gjs-fadeInUp 0.5s ease both}
.gjs-fadeInDown{animation:gjs-fadeInDown 0.5s ease both}
.gjs-fadeInLeft{animation:gjs-fadeInLeft 0.5s ease both}
.gjs-fadeInRight{animation:gjs-fadeInRight 0.5s ease both}
.gjs-zoomIn{animation:gjs-zoomIn 0.5s ease both}
.gjs-bounceIn{animation:gjs-bounceIn 0.6s ease both}
.gjs-slideInUp{animation:gjs-slideInUp 0.5s ease both}
`

const PLACEHOLDER_CONTENT = `
<div style="display:flex;align-items:center;justify-content:center;height:400px;color:#94a3b8;font-size:14px;text-align:center;padding:40px;">
  <div>
    <p style="font-size:28px;margin-bottom:12px;">✦</p>
    <p style="font-weight:600;margin-bottom:6px;color:#64748b;">Página em branco</p>
    <p>Use o painel esquerdo para adicionar blocos<br>ou gere a página com IA.</p>
  </div>
</div>`

// ── Build full iframe HTML document ──────────────────────────────────────────

function buildIframeDoc(rawHtml: string | null): string {
  const html = rawHtml?.trim() ?? ''

  // Already a full HTML document (AI-generated or stored as full doc)
  if (/^<!doctype/i.test(html) || /^<html/i.test(html)) {
    // Ensure animation CSS is present
    if (!html.includes('gjs-fadeIn')) {
      const styleTag = `<style id="lp-anim">${ANIMATION_CSS}</style>`
      return html.replace('</head>', `${styleTag}\n</head>`)
    }
    return html
  }

  // GrapesJS format: optional leading <style>…</style> + body HTML
  let headExtra = ''
  let bodyHtml   = html

  if (html.startsWith('<style')) {
    const end = html.indexOf('</style>')
    if (end !== -1) {
      headExtra = html.slice(0, end + 8)
      bodyHtml  = html.slice(end + 8).trim()
    }
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>*{box-sizing:border-box}body{margin:0;padding:0;font-family:Inter,system-ui,sans-serif}</style>
<style id="lp-anim">${ANIMATION_CSS}</style>
${headExtra}
</head>
<body>
${bodyHtml || PLACEHOLDER_CONTENT}
</body>
</html>`
}

// ── Extract saveable HTML from iframe doc ─────────────────────────────────────

function extractSaveHtml(doc: Document): string {
  // Collect non-animation extra styles from head
  const extraStyles = Array.from(doc.head.querySelectorAll('style'))
    .filter(s => s.id !== 'lp-anim' && s.id !== 'lp-editor-sel')
    .map(s => s.outerHTML)
    .join('\n')
  const body = doc.body.innerHTML
  return extraStyles ? `${extraStyles}\n${body}` : body
}

// ── Resize handle directions ──────────────────────────────────────────────────

type ResizeDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const HANDLE_STYLE: Record<ResizeDir, React.CSSProperties> = {
  n:  { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' },
  ne: { top: -5, right: -5,                                   cursor: 'ne-resize' },
  e:  { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' },
  se: { bottom: -5, right: -5,                                 cursor: 'se-resize' },
  s:  { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' },
  sw: { bottom: -5, left: -5,                                  cursor: 'sw-resize' },
  w:  { top: '50%', left: -5, transform: 'translateY(-50%)',  cursor: 'w-resize' },
  nw: { top: -5, left: -5,                                     cursor: 'nw-resize' },
}

// ── Selection Toolbar ─────────────────────────────────────────────────────────

function SelectionToolbar({
  selRect,
  el,
  onDelete,
  onSelectParent,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onAddSection,
}: {
  selRect: { top: number; left: number; width: number; height: number }
  el: HTMLElement
  onDelete: () => void
  onSelectParent: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onAddSection?: () => void
}) {
  const TOOLBAR_H = 32
  const GAP = 4

  // Position above the selection; if too close to top, show below
  const showBelow = selRect.top < TOOLBAR_H + GAP + 8
  const toolbarTop = showBelow
    ? selRect.top + selRect.height + GAP
    : selRect.top - TOOLBAR_H - GAP

  const tag = el.tagName.toLowerCase()

  // Is this element moveable up/down?
  const hasPrevSibling = !!el.previousElementSibling
  const hasNextSibling = !!el.nextElementSibling

  // Is the parent selectable (not body/html)?
  const parent = el.parentElement
  const doc = el.ownerDocument
  const canSelectParent = !!parent && parent !== doc?.body && parent !== doc?.documentElement

  // Is this a top-level section (direct child of body)? Show "add section" button
  const isTopLevel = !!parent && parent === doc?.body

  return (
    <div
      style={{
        position:  'absolute',
        top:       toolbarTop,
        left:      Math.max(4, selRect.left),
        zIndex:    101,
        display:   'flex',
        alignItems: 'center',
        gap:        2,
        background: '#1e293b',
        border:     '1px solid #334155',
        borderRadius: 8,
        padding:    '0 4px',
        height:     TOOLBAR_H,
        boxShadow:  '0 4px 16px rgba(0,0,0,0.4)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      {/* Tag badge */}
      <span style={{
        fontSize: 10, fontWeight: 700, color: '#60a5fa',
        fontFamily: 'monospace', padding: '0 6px',
        borderRight: '1px solid #334155', marginRight: 2,
      }}>
        {'<'}{tag}{'>'}
      </span>

      {/* Select parent */}
      {canSelectParent && (
        <ToolbarBtn title="Selecionar elemento pai" onClick={onSelectParent}>
          ↑ pai
        </ToolbarBtn>
      )}

      {/* Separator */}
      {canSelectParent && <ToolbarSep />}

      {/* Move up */}
      <ToolbarBtn title="Mover para cima" onClick={onMoveUp} disabled={!hasPrevSibling}>
        ▲
      </ToolbarBtn>

      {/* Move down */}
      <ToolbarBtn title="Mover para baixo" onClick={onMoveDown} disabled={!hasNextSibling}>
        ▼
      </ToolbarBtn>

      <ToolbarSep />

      {/* Duplicate */}
      <ToolbarBtn title="Duplicar elemento (Ctrl+D)" onClick={onDuplicate}>
        ⧉
      </ToolbarBtn>

      {/* Add section after — only on top-level elements */}
      {isTopLevel && onAddSection && (
        <>
          <ToolbarSep />
          <ToolbarBtn title="Adicionar seção após esta (abre blocos)" onClick={onAddSection}>
            + seção
          </ToolbarBtn>
        </>
      )}

      <ToolbarSep />

      {/* Delete */}
      <ToolbarBtn title="Deletar elemento (Delete)" onClick={onDelete} danger>
        🗑
      </ToolbarBtn>
    </div>
  )
}

function ToolbarBtn({
  children,
  title,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      title={title}
      onClick={e => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: danger ? '#f87171' : disabled ? '#475569' : '#94a3b8',
        fontSize: 11,
        fontWeight: 600,
        padding: '0 6px',
        height: 24,
        display: 'flex',
        alignItems: 'center',
        transition: 'color 0.15s, background 0.15s',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)'
          ;(e.currentTarget as HTMLElement).style.color = danger ? '#ef4444' : '#e2e8f6'
        }
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'transparent'
        ;(e.currentTarget as HTMLElement).style.color = danger ? '#f87171' : disabled ? '#475569' : '#94a3b8'
      }}
    >
      {children}
    </button>
  )
}

function ToolbarSep() {
  return (
    <div style={{
      width: 1, height: 16, background: '#334155', margin: '0 2px', flexShrink: 0,
    }} />
  )
}

// ── Resize Handle ─────────────────────────────────────────────────────────────

function ResizeHandle({
  dir,
  onMouseDown,
}: {
  dir: ResizeDir
  onMouseDown: (e: React.MouseEvent) => void
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position:        'absolute',
        width:           10,
        height:          10,
        background:      '#3b82f6',
        border:          '2px solid #fff',
        borderRadius:    2,
        pointerEvents:   'auto',
        boxShadow:       '0 1px 4px rgba(0,0,0,0.3)',
        ...HANDLE_STYLE[dir],
      }}
    />
  )
}

// ── MAX undo snapshots ────────────────────────────────────────────────────────

const MAX_SNAPS = 60

// ── Module-level clipboard (persists across selections, no re-render needed) ──
let _clipboard: string | null = null

// ── Context Menu ──────────────────────────────────────────────────────────────

type CtxMenuItem =
  | { kind: 'action'; label: string; shortcut?: string; icon: string; onClick: () => void; disabled?: boolean; danger?: boolean }
  | { kind: 'sep' }

function ContextMenu({
  x, y,
  items,
  onClose,
}: {
  x: number
  y: number
  items: CtxMenuItem[]
  onClose: () => void
}) {
  const menuRef    = useRef<HTMLDivElement>(null)
  // Keep onClose in a ref so effects don't need it as a dep (prevents re-registering listeners every render)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Close on outside mousedown — registered once, reads onCloseRef to stay fresh
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onCloseRef.current()
      }
    }
    document.addEventListener('mousedown', handle, true)
    return () => document.removeEventListener('mousedown', handle, true)
  }, []) // stable — never re-registers

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onCloseRef.current() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, []) // stable

  // Ensure menu stays within viewport
  const [pos, setPos] = useState({ top: y, left: x })
  useEffect(() => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    setPos({
      top:  y + rect.height > vh ? Math.max(0, y - rect.height) : y,
      left: x + rect.width  > vw ? Math.max(0, x - rect.width)  : x,
    })
  }, [x, y])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        zIndex: 200,
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: 200,
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {items.map((item, i) =>
        item.kind === 'sep' ? (
          <div key={i} style={{ height: 1, background: '#334155', margin: '4px 0' }} />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { onClose(); item.onClick() }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '7px 14px',
              background: 'transparent',
              border: 'none',
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              color: item.danger ? '#f87171' : item.disabled ? '#475569' : '#e2e8f0',
              fontSize: 13,
              fontWeight: 500,
              textAlign: 'left',
              opacity: item.disabled ? 0.45 : 1,
            }}
            onMouseEnter={e => {
              if (!item.disabled) {
                (e.currentTarget as HTMLElement).style.background =
                  item.danger ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            <span style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>{item.shortcut}</span>
            )}
          </button>
        ),
      )}
    </div>
  )
}

// ── Edit HTML Modal ───────────────────────────────────────────────────────────

function EditHtmlModal({
  initialHtml,
  onApply,
  onClose,
}: {
  initialHtml: string
  onApply: (html: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(initialHtml)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }, [])

  const handleApply = () => {
    if (value.trim()) onApply(value)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#1e293b', border: '1px solid #334155', borderRadius: 14,
        width: 'min(92vw, 700px)', maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #334155',
        }}>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15 }}>
            Editar HTML do elemento
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 20, lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1, minHeight: 300, padding: '16px 20px',
            background: '#0f172a', color: '#e2e8f0',
            border: 'none', outline: 'none', resize: 'none',
            fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
            fontSize: 13, lineHeight: 1.7,
            overflowY: 'auto',
          }}
        />

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 20px', borderTop: '1px solid #334155',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid #334155',
              background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: 13,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Text Format Bar (shows when double-clicking to edit text) ────────────────

function FmtBtn({
  label, title, onMouseDown: handleMouseDown, active,
}: {
  label: React.ReactNode
  title: string
  onMouseDown: (e: React.MouseEvent) => void
  active?: boolean
}) {
  return (
    <button
      title={title}
      onMouseDown={handleMouseDown}
      style={{
        background: active ? 'rgba(59,130,246,0.2)' : 'transparent',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        color: active ? '#60a5fa' : '#94a3b8',
        fontSize: 12, fontWeight: 600,
        padding: '0 7px', height: 26,
        display: 'flex', alignItems: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {label}
    </button>
  )
}

function TextFormatBar({
  selRect,
  onFormat,
}: {
  selRect: { top: number; left: number; width: number; height: number }
  onFormat: (cmd: string, val?: string) => void
}) {
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl]   = useState('https://')
  const linkInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (linkMode) setTimeout(() => linkInputRef.current?.focus(), 30) }, [linkMode])

  const TOOLBAR_H = 36
  const GAP = 6
  const showBelow = selRect.top < TOOLBAR_H + GAP + 8
  const top  = showBelow ? selRect.top + selRect.height + GAP : selRect.top - TOOLBAR_H - GAP
  const left = Math.max(4, selRect.left)

  const fmt = (cmd: string, val?: string) => (e: React.MouseEvent) => {
    e.preventDefault() // keep selection/focus in iframe
    onFormat(cmd, val)
  }

  return (
    <div
      style={{
        position: 'absolute', top, left, zIndex: 102,
        display: 'flex', alignItems: 'center', gap: 1,
        background: '#0f172a', border: '1px solid #334155',
        borderRadius: 8, padding: '0 4px', height: TOOLBAR_H,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        pointerEvents: 'auto', userSelect: 'none',
      }}
    >
      <FmtBtn label={<b>N</b>}   title="Negrito (Ctrl+B)"     onMouseDown={fmt('bold')} />
      <FmtBtn label={<i>I</i>}   title="Itálico (Ctrl+I)"     onMouseDown={fmt('italic')} />
      <FmtBtn label={<u>S</u>}   title="Sublinhado (Ctrl+U)"  onMouseDown={fmt('underline')} />
      <FmtBtn label={<s>T</s>}   title="Tachado"              onMouseDown={fmt('strikeThrough')} />

      <div style={{ width: 1, height: 16, background: '#334155', margin: '0 3px', flexShrink: 0 }} />

      <FmtBtn label="≪" title="Remover formatação" onMouseDown={fmt('removeFormat')} />

      <div style={{ width: 1, height: 16, background: '#334155', margin: '0 3px', flexShrink: 0 }} />

      {linkMode ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <input
            ref={linkInputRef}
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation()
              if (e.key === 'Enter') { onFormat('createLink', linkUrl); setLinkMode(false) }
              if (e.key === 'Escape') setLinkMode(false)
            }}
            placeholder="https://..."
            style={{
              background: '#1e293b', border: '1px solid #3b82f6', borderRadius: 4,
              color: '#e2e8f0', fontSize: 11, padding: '2px 8px', outline: 'none', width: 170,
            }}
          />
          <button
            onMouseDown={e => { e.preventDefault(); onFormat('createLink', linkUrl); setLinkMode(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontSize: 11, fontWeight: 600 }}
          >
            OK
          </button>
          <button
            onMouseDown={e => { e.preventDefault(); setLinkMode(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14 }}
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <FmtBtn label="🔗" title="Inserir link"   onMouseDown={e => { e.preventDefault(); setLinkMode(true) }} />
          <FmtBtn label="✂"  title="Remover link"   onMouseDown={fmt('unlink')} />
        </>
      )}

      <div style={{ width: 1, height: 16, background: '#334155', margin: '0 3px', flexShrink: 0 }} />

      <span style={{ fontSize: 10, color: '#475569', padding: '0 4px', fontFamily: 'monospace' }}>
        texto
      </span>
    </div>
  )
}

// ── LandingEditor ─────────────────────────────────────────────────────────────

export const LandingEditor = forwardRef<LandingEditorHandle, Props>(
  function LandingEditor({ initialHtml, onAutoSave, onSaveStatus, onEditorReady }, ref) {
    const iframeRef     = useRef<HTMLIFrameElement>(null)
    const containerRef  = useRef<HTMLDivElement>(null)

    // Undo / redo stacks (body HTML snapshots)
    const undoStack = useRef<string[]>([])
    const redoStack = useRef<string[]>([])

    // Listeners map (event → Set of callbacks)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listenersRef = useRef<Map<string, Set<(...a: any[]) => void>>>(new Map())

    // Stable ref for notifyChange (so closures inside iframe can call it)
    const notifyRef  = useRef<() => void>(() => {})
    const saveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Image picker
    const [imagePickerOpen, setImagePickerOpen] = useState(false)
    const imagePickerCbRef = useRef<((url: string) => void) | null>(null)

    // Selection state
    const selectedElRef = useRef<HTMLElement | null>(null)
    const [selRect, setSelRect] = useState<{
      top: number; left: number; width: number; height: number
    } | null>(null)

    // Context menu
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; el: HTMLElement } | null>(null)
    const closeContextMenuRef = useRef<() => void>(() => {})

    // Edit HTML modal
    const [editHtml, setEditHtml] = useState<{ el: HTMLElement; html: string } | null>(null)

    // Text editing mode (after double-click on text element)
    const [editingEl, setEditingEl] = useState<HTMLElement | null>(null)
    // Stable ref so iframe handlers (closures) can always call the latest setter
    const setEditingElRef = useRef<(el: HTMLElement | null) => void>(() => {})

    // Device
    const [device, setDeviceState] = useState<'Desktop' | 'Mobile'>('Desktop')

    // Whether iframe is ready
    const [ready, setReady] = useState(false)

    // ── Get iframe document ──────────────────────────────────────────────────
    const getDoc = useCallback((): Document | null => {
      try { return iframeRef.current?.contentDocument ?? null } catch { return null }
    }, [])

    // ── Fire event listeners ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const triggerEvent = useCallback((event: string, ...args: any[]) => {
      listenersRef.current.get(event)?.forEach(cb => {
        try { cb(...args) } catch { /* ignore */ }
      })
    }, [])

    // ── Schedule auto-save (debounced) ───────────────────────────────────────
    const scheduleAutoSave = useCallback(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      onSaveStatus?.('saving')
      saveTimer.current = setTimeout(async () => {
        const doc = getDoc()
        if (!doc) return
        const html = extractSaveHtml(doc)
        await onAutoSave(html)
        onSaveStatus?.('saved')
        setTimeout(() => onSaveStatus?.('idle'), 1500)
      }, 1200)
    }, [getDoc, onAutoSave, onSaveStatus])

    // ── Take body snapshot for undo ──────────────────────────────────────────
    const takeSnapshot = useCallback(() => {
      const doc = getDoc()
      if (!doc) return
      const snap = doc.body.innerHTML
      undoStack.current.push(snap)
      if (undoStack.current.length > MAX_SNAPS) undoStack.current.shift()
      redoStack.current = []
    }, [getDoc])

    // ── Calculate selection rect (relative to container) ────────────────────
    const recalcSelRect = useCallback((el: HTMLElement | null) => {
      if (!el || !containerRef.current || !iframeRef.current) {
        setSelRect(null)
        return
      }
      const containerRect = containerRef.current.getBoundingClientRect()
      const iframeRect    = iframeRef.current.getBoundingClientRect()
      const elRect        = el.getBoundingClientRect()
      setSelRect({
        top:    iframeRect.top  - containerRect.top  + elRect.top,
        left:   iframeRect.left - containerRect.left + elRect.left,
        width:  elRect.width,
        height: elRect.height,
      })
    }, [])

    // ── Select element ───────────────────────────────────────────────────────
    const selectElement = useCallback((el: HTMLElement | null) => {
      // If the previous element was in contenteditable mode, clean it up
      const prev = selectedElRef.current
      if (prev && prev !== el && prev.hasAttribute('contenteditable')) {
        prev.removeAttribute('contenteditable')
        setEditingElRef.current(null)
        // Snapshot is taken by the blur handler; don't double-snapshot here
      }

      selectedElRef.current = el

      if (!el) {
        setSelRect(null)
        triggerEvent('component:deselected')
        return
      }

      // Clear hover highlight from the element being selected
      el.removeAttribute('data-lp-hover')

      recalcSelRect(el)
      const comp = getComp(el, notifyRef)
      triggerEvent('component:selected', comp)
    }, [triggerEvent, recalcSelRect])

    // ── Inject handlers into iframe ──────────────────────────────────────────
    // We keep refs to all handlers so they can be removed before re-adding (prevents leaks on undo/redo)
    const iframeClickHandlerRef      = useRef<((e: Event) => void) | null>(null)
    const iframeScrollHandlerRef     = useRef<(() => void) | null>(null)
    const iframeEscHandlerRef        = useRef<((e: KeyboardEvent) => void) | null>(null)
    const iframeDblClickHandlerRef   = useRef<((e: Event) => void) | null>(null)
    const iframeCtxMenuHandlerRef    = useRef<((e: MouseEvent) => void) | null>(null)
    const iframeMouseOverHandlerRef  = useRef<((e: Event) => void) | null>(null)
    const iframeMouseOutHandlerRef   = useRef<(() => void) | null>(null)

    const injectIframeHandlers = useCallback(() => {
      const doc = getDoc()
      if (!doc) return

      // Remove stale handlers before re-attaching (prevents duplicate handlers on undo/redo)
      if (iframeClickHandlerRef.current) {
        doc.body.removeEventListener('click', iframeClickHandlerRef.current, true)
      }
      if (iframeScrollHandlerRef.current) {
        doc.removeEventListener('scroll', iframeScrollHandlerRef.current)
      }
      if (iframeEscHandlerRef.current) {
        doc.removeEventListener('keydown', iframeEscHandlerRef.current)
      }
      if (iframeDblClickHandlerRef.current) {
        doc.body.removeEventListener('dblclick', iframeDblClickHandlerRef.current, true)
      }
      if (iframeCtxMenuHandlerRef.current) {
        doc.body.removeEventListener('contextmenu', iframeCtxMenuHandlerRef.current, true)
      }
      if (iframeMouseOverHandlerRef.current) {
        doc.body.removeEventListener('mouseover', iframeMouseOverHandlerRef.current)
      }
      if (iframeMouseOutHandlerRef.current) {
        doc.body.removeEventListener('mouseleave', iframeMouseOutHandlerRef.current)
      }

      // Inject hover highlight + media pointer-events CSS
      // (only once — head survives body innerHTML replacement)
      if (!doc.getElementById('lp-hover-style')) {
        const hoverStyle = doc.createElement('style')
        hoverStyle.id = 'lp-hover-style'
        hoverStyle.textContent =
          '[data-lp-hover]{outline:2px dashed rgba(96,165,250,0.55)!important;outline-offset:2px;cursor:pointer}' +
          // Make iframe/video elements non-interactive so clicks reach the canvas document.
          // The click handler below detects which media element was at the cursor position.
          'iframe,video{pointer-events:none}'
        doc.head.appendChild(hoverStyle)
      }

      // Click → select (also closes any open context menu)
      const clickHandler = (e: Event) => {
        // Close context menu on any click inside iframe
        closeContextMenuRef.current()
        const me = e as MouseEvent
        const target = me.target as HTMLElement
        if (!target) return
        const tag = target.tagName?.toLowerCase()

        // Prevent link navigation
        const anchor = target.closest?.('a') as HTMLAnchorElement | null
        if (anchor) {
          e.preventDefault()
          e.stopPropagation()
        }

        // Deselect if clicking on body/html
        if (tag === 'body' || tag === 'html') {
          selectElement(null)
          return
        }

        // iframe/video elements have pointer-events:none so clicks land on their parent.
        // Find if the actual click position overlaps a nested media element and select it.
        const nestedMedia = Array.from(
          target.querySelectorAll<HTMLElement>('iframe, video'),
        ).find(v => {
          const r = v.getBoundingClientRect()
          return me.clientX >= r.left && me.clientX <= r.right &&
                 me.clientY >= r.top  && me.clientY <= r.bottom
        })

        selectElement(nestedMedia ?? target)
      }
      iframeClickHandlerRef.current = clickHandler
      doc.body.addEventListener('click', clickHandler, true)

      // Scroll → recalc selection rect
      const scrollHandler = () => {
        if (selectedElRef.current) recalcSelRect(selectedElRef.current)
      }
      iframeScrollHandlerRef.current = scrollHandler
      doc.addEventListener('scroll', scrollHandler, { passive: true })

      // Escape → deselect (tracked in ref so it can be cleaned up)
      const keyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') selectElement(null)
      }
      iframeEscHandlerRef.current = keyHandler
      doc.addEventListener('keydown', keyHandler)

      // Double-click → enable contenteditable on editable elements (tracked in ref)
      // Only leaf elements (no child *elements*) or explicit text tags become editable.
      // Prevents accidentally making a <section> or <div> with nested HTML contenteditable,
      // which would let the user Delete-key the entire section structure.
      const dblClickHandler = (e: Event) => {
        const target = e.target as HTMLElement
        if (!target) return
        const type = detectType(target)
        // Allow text tags always; allow generic containers ONLY if they have no element children
        const isLeaf = target.children.length === 0
        if (type === 'text' || (type === 'default' && isLeaf)) {
          target.contentEditable = 'true'
          target.focus()
          setEditingElRef.current(target)

          // Remove contenteditable when focus leaves (e.g. user clicks outside canvas)
          const onBlur = () => {
            // Guard: may have already been removed by selectElement when user clicked elsewhere
            if (!target.hasAttribute('contenteditable')) {
              target.removeEventListener('blur', onBlur)
              return
            }
            target.removeAttribute('contenteditable')
            setEditingElRef.current(null)
            takeSnapshot()
            notifyRef.current()
            target.removeEventListener('blur', onBlur)
          }
          target.addEventListener('blur', onBlur)
        }
      }
      iframeDblClickHandlerRef.current = dblClickHandler
      doc.body.addEventListener('dblclick', dblClickHandler, true)

      // Hover highlight — pure DOM manipulation (no React state = no re-renders)
      let hoverEl: HTMLElement | null = null
      const mouseOverHandler = (e: Event) => {
        const target = e.target as HTMLElement
        if (!target) return
        const tag = target.tagName?.toLowerCase()
        if (tag === 'body' || tag === 'html') return
        // Don't show hover on the already-selected element (it has the blue outline)
        if (target === selectedElRef.current) {
          if (hoverEl && hoverEl !== target) { hoverEl.removeAttribute('data-lp-hover'); hoverEl = null }
          return
        }
        if (hoverEl !== target) {
          if (hoverEl) hoverEl.removeAttribute('data-lp-hover')
          target.setAttribute('data-lp-hover', '')
          hoverEl = target
        }
      }
      const mouseLeaveHandler = () => {
        if (hoverEl) { hoverEl.removeAttribute('data-lp-hover'); hoverEl = null }
      }
      iframeMouseOverHandlerRef.current = mouseOverHandler
      iframeMouseOutHandlerRef.current  = mouseLeaveHandler
      doc.body.addEventListener('mouseover',  mouseOverHandler)
      doc.body.addEventListener('mouseleave', mouseLeaveHandler)

      // Right-click → custom context menu
      const contextMenuHandler = (e: MouseEvent) => {
        e.preventDefault()
        const target = e.target as HTMLElement
        if (!target) return
        const tag = target.tagName?.toLowerCase()
        if (tag === 'body' || tag === 'html') return

        // Select the target element first
        selectElement(target)

        // Translate iframe-local coordinates to container coordinates
        const containerRect = containerRef.current?.getBoundingClientRect()
        const iframeRect    = iframeRef.current?.getBoundingClientRect()
        if (!containerRect || !iframeRect) return

        setContextMenu({
          x: iframeRect.left - containerRect.left + e.clientX,
          y: iframeRect.top  - containerRect.top  + e.clientY,
          el: target,
        })
      }
      iframeCtxMenuHandlerRef.current = contextMenuHandler
      doc.body.addEventListener('contextmenu', contextMenuHandler, true)
    }, [getDoc, selectElement, recalcSelRect, takeSnapshot])

    // ── Load HTML into iframe ─────────────────────────────────────────────────
    const loadIntoIframe = useCallback((rawHtml: string | null) => {
      const doc = getDoc()
      if (!doc) return

      // Clear comp cache since DOM is replaced
      // (WeakMap GCs automatically, but selection must be cleared)
      selectElement(null)

      const fullDoc = buildIframeDoc(rawHtml)
      doc.open()
      doc.write(fullDoc)
      doc.close()

      injectIframeHandlers()
    }, [getDoc, selectElement, injectIframeHandlers])

    // ── Initialize iframe on mount ───────────────────────────────────────────
    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const onLoad = () => {
        loadIntoIframe(initialHtml)
        setTimeout(() => {
          takeSnapshot()
          setReady(true)
        }, 50)
      }

      iframe.addEventListener('load', onLoad, { once: true })
      iframe.src = 'about:blank'

      return () => {
        iframe.removeEventListener('load', onLoad)
        if (saveTimer.current) clearTimeout(saveTimer.current)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount

    // Keep these refs fresh every render (same pattern as keyActionsRef)
    const closeOverlaysRef = useRef<() => void>(() => {})
    useEffect(() => {
      closeContextMenuRef.current = () => setContextMenu(null)
      setEditingElRef.current     = setEditingEl
      closeOverlaysRef.current    = () => { setContextMenu(null); setEditHtml(null) }
    })

    // ── Notify change (called by LPComp.setStyle, etc.) ─────────────────────
    useEffect(() => {
      notifyRef.current = () => {
        // Recalc selection overlay
        if (selectedElRef.current) recalcSelRect(selectedElRef.current)
        triggerEvent('component:styleUpdate')
        triggerEvent('change:any')
        scheduleAutoSave()
      }
    }, [recalcSelRect, triggerEvent, scheduleAutoSave])

    // ── Create and expose EditorAPI ──────────────────────────────────────────
    useEffect(() => {
      if (!ready) return

      const api: EditorAPI = {
        on: (event, cb) => {
          if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, new Set())
          }
          listenersRef.current.get(event)!.add(cb)
        },
        off: (event, cb) => {
          listenersRef.current.get(event)?.delete(cb)
        },
        trigger: (event, ...args) => {
          triggerEvent(event, ...args)
          // Wire change:changesCount to auto-save + layers refresh
          if (event === 'change:changesCount') {
            takeSnapshot()
            scheduleAutoSave()
            triggerEvent('change:any')
          }
        },
        addComponents: (html: string) => {
          const doc = getDoc()
          if (!doc) return
          const tmp = doc.createElement('div')
          tmp.innerHTML = html

          // Smart insertion: after the selected element's top-level ancestor
          // (direct child of body), rather than always appending to end
          let insertAfter: Element | null = null
          const sel = selectedElRef.current
          if (sel && doc.body.contains(sel)) {
            let el: HTMLElement = sel
            while (el.parentElement && el.parentElement !== doc.body) {
              el = el.parentElement
            }
            if (el.parentElement === doc.body) insertAfter = el
          }

          let firstInserted: Element | null = null
          while (tmp.firstChild) {
            const node = tmp.firstChild as Element
            if (insertAfter) {
              insertAfter.after(node)
              if (!firstInserted) firstInserted = node
              insertAfter = node // next block goes after this one
            } else {
              doc.body.appendChild(node)
              if (!firstInserted) firstInserted = node
            }
          }

          setTimeout(() => {
            firstInserted?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 80)
          takeSnapshot()
          scheduleAutoSave()
          triggerEvent('change:any')
        },
        Canvas: {
          getDocument: getDoc,
        },
        BlockManager: {
          getAll: () => ({ models: [] }),
        },
        openImagePicker: (cb) => {
          imagePickerCbRef.current = cb
          setImagePickerOpen(true)
        },
        getBodyChildren: () => {
          const doc = getDoc()
          if (!doc) return []
          return Array.from(doc.body.children) as HTMLElement[]
        },
        selectElement: (el: HTMLElement) => selectElement(el),
        getSelectedElement: () => selectedElRef.current,
        onAnyChange: (cb) => {
          if (!listenersRef.current.has('change:any')) {
            listenersRef.current.set('change:any', new Set())
          }
          listenersRef.current.get('change:any')!.add(cb)
          return () => listenersRef.current.get('change:any')?.delete(cb)
        },
      }

      onEditorReady?.(api)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready]) // Fire once when editor is ready

    // ── Imperative handle ────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      getHtml: () => {
        const doc = getDoc()
        if (!doc) return ''
        return extractSaveHtml(doc)
      },
      undo: () => keyActionsRef.current.undo(),
      redo: () => keyActionsRef.current.redo(),
      setDevice: (d) => setDeviceState(d),
    }))

    // ── Resize handle drag ───────────────────────────────────────────────────
    const resizeDragRef = useRef<{
      dir:     ResizeDir
      startX:  number
      startY:  number
      startW:  number
      startH:  number
      startML: number   // computed margin-left at drag start (for W/NW/SW handles)
      startMT: number   // computed margin-top  at drag start (for N/NE/NW handles)
      el:      HTMLElement
    } | null>(null)

    const startResize = useCallback((e: React.MouseEvent, dir: ResizeDir) => {
      const el = selectedElRef.current
      if (!el) return
      e.preventDefault()
      e.stopPropagation()

      const elRect = el.getBoundingClientRect()
      const cs     = el.ownerDocument?.defaultView?.getComputedStyle(el)
      const startML = parseFloat(cs?.marginLeft ?? '0') || 0
      const startMT = parseFloat(cs?.marginTop  ?? '0') || 0

      resizeDragRef.current = {
        dir,
        startX:  e.clientX,
        startY:  e.clientY,
        startW:  elRect.width,
        startH:  elRect.height,
        startML,
        startMT,
        el,
      }

      // Disable pointer events on the canvas iframe so mousemove events during drag
      // are never swallowed by the iframe document when the cursor moves over it.
      if (iframeRef.current) iframeRef.current.style.pointerEvents = 'none'

      const onMove = (ev: MouseEvent) => {
        const ds = resizeDragRef.current
        if (!ds) return
        const dx = ev.clientX - ds.startX
        const dy = ev.clientY - ds.startY

        const hasE = ds.dir.includes('e')
        const hasW = ds.dir.includes('w')
        const hasS = ds.dir.includes('s')
        const hasN = ds.dir.includes('n')

        let w = ds.startW
        let h = ds.startH

        // ── Width ────────────────────────────────────────────────────────────
        if (hasE) w = Math.max(50, ds.startW + dx)
        if (hasW) {
          w = Math.max(50, ds.startW - dx)
          // Shift the element so the RIGHT edge stays fixed while the left moves
          ds.el.style.marginLeft = `${ds.startML + dx}px`
        }

        // ── Height ───────────────────────────────────────────────────────────
        if (hasS) h = Math.max(20, ds.startH + dy)
        if (hasN) {
          h = Math.max(20, ds.startH - dy)
          // Shift the element so the BOTTOM edge stays fixed while the top moves
          ds.el.style.marginTop = `${ds.startMT + dy}px`
        }

        // Only write properties this handle actually controls
        if (hasE || hasW) ds.el.style.width  = `${w}px`
        if (hasS || hasN) ds.el.style.height = `${h}px`

        // Update overlay via delta math (no getBoundingClientRect = no layout reflow)
        setSelRect(prev => {
          if (!prev) return prev
          return {
            top:    hasN ? prev.top  + dy : prev.top,
            left:   hasW ? prev.left + dx : prev.left,
            width:  (hasE || hasW) ? w : prev.width,
            height: (hasS || hasN) ? h : prev.height,
          }
        })
      }

      const onUp = () => {
        if (resizeDragRef.current) {
          takeSnapshot()
          notifyRef.current()
          resizeDragRef.current = null
        }
        // Restore canvas interactivity
        if (iframeRef.current) iframeRef.current.style.pointerEvents = ''
        // One final DOM-accurate recalc after drag ends
        if (selectedElRef.current) recalcSelRect(selectedElRef.current)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }

      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    }, [recalcSelRect, takeSnapshot])

    // ── Image picker callback ────────────────────────────────────────────────
    const handleImageSelect = useCallback((url: string) => {
      setImagePickerOpen(false)
      const cb = imagePickerCbRef.current
      imagePickerCbRef.current = null

      const el = selectedElRef.current
      if (el) {
        const tag = el.tagName.toLowerCase()
        if (tag === 'img') {
          el.setAttribute('src', url)
          const comp = getComp(el, notifyRef)
          triggerEvent('component:selected', comp)
        } else {
          el.style.backgroundImage = `url("${url}")`
        }
        takeSnapshot()
        notifyRef.current()
      } else {
        // No element selected — insert a new image
        const doc = getDoc()
        if (doc) {
          const img = doc.createElement('img')
          img.setAttribute('src', url)
          img.setAttribute('alt', '')
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.display = 'block'
          doc.body.appendChild(img)
          takeSnapshot()
          scheduleAutoSave()
        }
      }
      cb?.(url)
    }, [triggerEvent, getDoc, takeSnapshot, scheduleAutoSave])

    // ── Delete selected element ──────────────────────────────────────────────
    const deleteSelectedElement = useCallback(() => {
      const el = selectedElRef.current
      if (!el) return
      const parent = el.parentElement
      if (!parent) return
      selectElement(null)
      parent.removeChild(el)
      takeSnapshot()
      notifyRef.current()
    }, [selectElement, takeSnapshot])

    // ── Select parent element ─────────────────────────────────────────────────
    const selectParent = useCallback(() => {
      const el = selectedElRef.current
      if (!el) return
      const doc = getDoc()
      const parent = el.parentElement
      if (!parent || parent === doc?.body || parent === doc?.documentElement) return
      selectElement(parent)
    }, [getDoc, selectElement])

    // ── Move element up/down (swap with previous/next sibling) ────────────────
    const moveElement = useCallback((dir: 'up' | 'down') => {
      const el = selectedElRef.current
      if (!el) return
      const parent = el.parentElement
      if (!parent) return

      if (dir === 'up') {
        const prev = el.previousElementSibling
        if (prev) {
          parent.insertBefore(el, prev)
          takeSnapshot()
          notifyRef.current()
          setTimeout(() => recalcSelRect(el), 50)
        }
      } else {
        const next = el.nextElementSibling
        if (next) {
          parent.insertBefore(next, el)
          takeSnapshot()
          notifyRef.current()
          setTimeout(() => recalcSelRect(el), 50)
        }
      }
    }, [takeSnapshot, recalcSelRect])

    // ── Apply edited HTML (from EditHtmlModal) ────────────────────────────────
    const applyEditedHtml = useCallback((html: string) => {
      const el = editHtml?.el
      if (!el) return
      const doc = getDoc()
      if (!doc) return
      const tmp = doc.createElement('div')
      tmp.innerHTML = html.trim()
      const newEl = tmp.firstElementChild as HTMLElement | null
      if (newEl && el.parentElement) {
        el.parentElement.replaceChild(newEl, el)
        selectElement(newEl)
        takeSnapshot()
        notifyRef.current()
      } else if (!tmp.firstElementChild && tmp.textContent) {
        // Pure text replacement — just update innerHTML
        el.innerHTML = html
        takeSnapshot()
        notifyRef.current()
      }
      setEditHtml(null)
    }, [editHtml, getDoc, selectElement, takeSnapshot])

    // ── Text formatting (execCommand on iframe document) ─────────────────────
    const handleFormat = useCallback((cmd: string, val?: string) => {
      const doc = getDoc()
      if (!doc) return
      try {
        doc.execCommand(cmd, false, val ?? undefined)
      } catch { /* execCommand may throw in some edge cases */ }
      // Slight delay so the DOM update settles before notifying/saving
      setTimeout(() => notifyRef.current(), 30)
    }, [getDoc])

    // ── Duplicate selected element ────────────────────────────────────────────
    const duplicateElement = useCallback(() => {
      const el = selectedElRef.current
      if (!el) return
      const parent = el.parentElement
      if (!parent) return
      const clone = el.cloneNode(true) as HTMLElement
      // Insert clone immediately after the original
      parent.insertBefore(clone, el.nextSibling)
      // Select the clone
      selectElement(clone)
      takeSnapshot()
      notifyRef.current()
    }, [selectElement, takeSnapshot])

    // ── Keyboard shortcuts inside iframe ────────────────────────────────────────
    // Store latest callbacks in a ref so the keydown handler never goes stale
    const keyActionsRef = useRef({
      delete:    () => {},
      undo:      () => {},
      redo:      () => {},
      moveUp:    () => {},
      moveDown:  () => {},
      duplicate: () => {},
      copy:      () => {},
      paste:     () => {},
    })

    useEffect(() => {
      keyActionsRef.current = {
        delete:    deleteSelectedElement,
        duplicate: duplicateElement,
        undo: () => {
          const doc = getDoc()
          if (!doc || undoStack.current.length < 2) return
          // Close any open overlays that hold element refs (they become stale after innerHTML replace)
          closeOverlaysRef.current()
          const current = undoStack.current.pop()!
          redoStack.current.push(current)
          const prev = undoStack.current[undoStack.current.length - 1]
          doc.body.innerHTML = prev
          setEditingElRef.current(null)
          injectIframeHandlers()
          selectElement(null)
          scheduleAutoSave()
          triggerEvent('change:any')
        },
        redo: () => {
          const doc = getDoc()
          if (!doc || redoStack.current.length === 0) return
          // Close any open overlays that hold element refs (they become stale after innerHTML replace)
          closeOverlaysRef.current()
          const next = redoStack.current.pop()!
          undoStack.current.push(next)
          doc.body.innerHTML = next
          setEditingElRef.current(null)
          injectIframeHandlers()
          selectElement(null)
          scheduleAutoSave()
          triggerEvent('change:any')
        },
        moveUp:   () => moveElement('up'),
        moveDown: () => moveElement('down'),
        copy: () => {
          const el = selectedElRef.current
          if (!el) return
          _clipboard = el.outerHTML
        },
        paste: () => {
          if (!_clipboard) return
          const doc = getDoc()
          if (!doc) return
          const tmp = doc.createElement('div')
          tmp.innerHTML = _clipboard
          const clone = tmp.firstElementChild as HTMLElement | null
          if (!clone) return
          const el = selectedElRef.current
          if (el?.parentElement) {
            el.parentElement.insertBefore(clone, el.nextSibling)
          } else {
            doc.body.appendChild(clone)
          }
          selectElement(clone)
          takeSnapshot()
          notifyRef.current()
        },
      }
    }) // no deps — updates every render to keep callbacks fresh

    useEffect(() => {
      const doc = getDoc()
      if (!doc || !ready) return

      const onKeyDown = (e: KeyboardEvent) => {
        const active = doc.activeElement as HTMLElement | null
        const ceAttr = active?.getAttribute('contenteditable')
        const isEditing = ceAttr === 'true' || ceAttr === ''

        if (isEditing) {
          // While contenteditable is active, let the browser handle ALL shortcuts
          // (Ctrl+Z = native text undo, Ctrl+B/I/U = formatting via browser, etc.)
          // Only exception: Escape to exit edit mode is handled by the keyHandler in injectIframeHandlers
          return
        }

        // Ctrl/Cmd+Z = undo (snapshot-level — only outside text editing)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          keyActionsRef.current.undo()
          return
        }
        // Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z = redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault()
          keyActionsRef.current.redo()
          return
        }

        // Ctrl/Cmd+D = duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault()
          keyActionsRef.current.duplicate()
          return
        }

        // Ctrl/Cmd+C = copy element (only when not editing text)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          keyActionsRef.current.copy()
          return
        }
        // Ctrl/Cmd+V = paste element (only when not editing text)
        if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
          e.preventDefault()
          keyActionsRef.current.paste()
          return
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          const el = selectedElRef.current
          if (el && el !== doc.body) {
            e.preventDefault()
            keyActionsRef.current.delete()
          }
        }
        if (e.key === 'ArrowUp'   && e.altKey) { e.preventDefault(); keyActionsRef.current.moveUp()   }
        if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); keyActionsRef.current.moveDown() }
      }

      doc.addEventListener('keydown', onKeyDown)
      return () => doc.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, getDoc])

    // ── Handle deselect when clicking outside the iframe ─────────────────────
    const handleOuterMouseDown = useCallback((e: React.MouseEvent) => {
      // If clicking on the overlay container but not on a handle or selection box,
      // deselect. The selection div has pointer-events: none so this only fires on
      // clicks that reach the container background.
      const target = e.target as HTMLElement
      if (target === containerRef.current) {
        selectElement(null)
      }
    }, [selectElement])

    // ── iframe width for device ───────────────────────────────────────────────
    const iframeWrapStyle: React.CSSProperties =
      device === 'Mobile'
        ? { width: '390px', height: '100%', margin: '0 auto' }
        : { width: '100%',  height: '100%' }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-[#0f1827]"
        onMouseDown={handleOuterMouseDown}
      >
        {/* Device wrapper */}
        <div style={{ ...iframeWrapStyle, transition: 'width 0.3s' }}>
          <iframe
            ref={iframeRef}
            title="landing-editor-canvas"
            className="w-full h-full border-0 bg-white block"
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
          />
        </div>

        {/* Selection overlay + toolbar */}
        {selRect && selectedElRef.current && (
          <>
            {/* Text formatting bar (while in contenteditable mode) */}
            {editingEl ? (
              <TextFormatBar selRect={selRect} onFormat={handleFormat} />
            ) : (
              /* Normal selection toolbar */
              <SelectionToolbar
                selRect={selRect}
                el={selectedElRef.current}
                onDelete={deleteSelectedElement}
                onSelectParent={selectParent}
                onMoveUp={() => moveElement('up')}
                onMoveDown={() => moveElement('down')}
                onDuplicate={duplicateElement}
                onAddSection={() => triggerEvent('blocks:open')}
              />
            )}

            {/* Selection box with resize handles */}
            <div
              className="absolute pointer-events-none"
              style={{
                top:     selRect.top,
                left:    selRect.left,
                width:   selRect.width,
                height:  selRect.height,
                outline: '2px solid #3b82f6',
                outlineOffset: '1px',
                zIndex:  100,
              }}
            >
              {(['n','ne','e','se','s','sw','w','nw'] as ResizeDir[]).map(dir => (
                <ResizeHandle key={dir} dir={dir} onMouseDown={e => startResize(e, dir)} />
              ))}
            </div>
          </>
        )}

        {/* Right-click context menu */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            items={[
              {
                kind: 'action', icon: '📋', label: 'Copiar', shortcut: 'Ctrl+C',
                onClick: () => { _clipboard = contextMenu.el.outerHTML },
              },
              {
                kind: 'action', icon: '📄', label: 'Colar', shortcut: 'Ctrl+V',
                disabled: !_clipboard,
                onClick: () => keyActionsRef.current.paste(),
              },
              { kind: 'sep' },
              {
                kind: 'action', icon: '⧉', label: 'Duplicar', shortcut: 'Ctrl+D',
                onClick: duplicateElement,
              },
              { kind: 'sep' },
              {
                kind: 'action', icon: '▲', label: 'Mover para cima', shortcut: 'Alt+↑',
                disabled: !contextMenu.el.previousElementSibling,
                onClick: () => moveElement('up'),
              },
              {
                kind: 'action', icon: '▼', label: 'Mover para baixo', shortcut: 'Alt+↓',
                disabled: !contextMenu.el.nextElementSibling,
                onClick: () => moveElement('down'),
              },
              { kind: 'sep' },
              ...((() => {
                const p = contextMenu.el.parentElement
                const doc2 = contextMenu.el.ownerDocument
                const canParent = !!p && p !== doc2?.body && p !== doc2?.documentElement
                return canParent
                  ? [{ kind: 'action' as const, icon: '↑', label: 'Selecionar pai', onClick: selectParent }]
                  : []
              })()),
              { kind: 'sep' },
              {
                kind: 'action', icon: '</>', label: 'Editar HTML',
                onClick: () => setEditHtml({ el: contextMenu.el, html: contextMenu.el.outerHTML }),
              },
              { kind: 'sep' },
              {
                kind: 'action', icon: '🗑', label: 'Deletar', shortcut: 'Delete',
                danger: true,
                onClick: deleteSelectedElement,
              },
            ]}
          />
        )}

        {/* Edit HTML modal */}
        {editHtml && (
          <EditHtmlModal
            initialHtml={editHtml.html}
            onApply={applyEditedHtml}
            onClose={() => setEditHtml(null)}
          />
        )}

        {/* Image picker (portal to body) */}
        {imagePickerOpen && typeof window !== 'undefined' &&
          createPortal(
            <ImagePickerModal
              onSelect={handleImageSelect}
              onClose={() => {
                setImagePickerOpen(false)
                imagePickerCbRef.current = null
              }}
            />,
            document.body,
          )
        }
      </div>
    )
  },
)
