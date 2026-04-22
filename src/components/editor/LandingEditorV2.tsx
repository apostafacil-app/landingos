'use client'

/**
 * LandingEditor V2 — Arquitetura limpa
 *
 * Princípios:
 * 1. Toda UI de edição (hover, seleção) vive DENTRO do iframe via atributos
 *    data-* + CSS `outline`. Zero eventos cruzando fronteira de documento.
 * 2. Toolbar flutuante no host com `position: fixed` + coordenadas viewport.
 * 3. Posição do toolbar acompanha scroll do iframe e resize da janela via
 *    ResizeObserver + scroll listeners, com update agendado em rAF.
 * 4. Undo/redo via snapshots de innerHTML do body.
 * 5. API pública (EditorAPI / LPComp) idêntica à V1 — painéis externos
 *    (PropertiesPanel, LayersPanel, BlocksDrawer) não precisam mudar.
 */

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

// ─────────────────────────────────────────────────────────────────────────────
// Public API (compatível com V1)
// ─────────────────────────────────────────────────────────────────────────────

export interface LandingEditorHandle {
  getHtml: () => string
  undo: () => void
  redo: () => void
  setDevice: (device: 'Desktop' | 'Mobile') => void
}

interface Props {
  initialHtml: string | null
  onAutoSave:    (html: string) => void
  onSaveStatus?: (status: 'saving' | 'saved' | 'idle') => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorReady?: (api: any) => void
}

export interface LPComp {
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
    length: number
    each:   (fn: (c: LPComp, i: number) => void) => void
    add:    (html: string, opts?: { at?: number }) => void
  }
}

export interface EditorAPI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on:           (event: string, cb: (...a: any[]) => void) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  off:          (event: string, cb: (...a: any[]) => void) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger:      (event: string, ...a: any[]) => void
  addComponents:(html: string) => void
  Canvas: { getDocument: () => Document | null }
  BlockManager: { getAll: () => { models: [] } }
  openImagePicker?:    (cb: (url: string) => void) => void
  getBodyChildren?:    () => HTMLElement[]
  selectElement?:      (el: HTMLElement) => void
  getSelectedElement?: () => HTMLElement | null
  onAnyChange?:        (cb: () => void) => () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const MAX_UNDO = 60
const AUTOSAVE_MS = 1200
const TOOLBAR_H = 34
const TOOLBAR_GAP = 8

// ─────────────────────────────────────────────────────────────────────────────
// CSS injetado dentro do iframe — hover, seleção, edição
// ─────────────────────────────────────────────────────────────────────────────

const IFRAME_CSS = `
/* Hover — outline tracejado azul */
[data-lp-hover]:not([data-lp-sel]) {
  outline: 2px dashed rgba(96, 165, 250, 0.55) !important;
  outline-offset: 2px !important;
  cursor: pointer !important;
}

/* Selecionado — outline sólido azul */
[data-lp-sel] {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

/* Editando texto — outline âmbar */
[data-lp-sel][contenteditable="true"] {
  outline: 2px solid #f59e0b !important;
  cursor: text !important;
  min-height: 1em;
}

/* Prevenir seleção de texto ao arrastar */
body { -webkit-user-select: text; user-select: text; }

/* Iframes/vídeos aninhados: não capturam clique (permite selecionar o wrapper) */
iframe:not([data-lp-editor-root]), video { pointer-events: none !important; }
`

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildIframeDoc(raw: string | null): string {
  const html = raw?.trim() ?? ''

  if (/^<!doctype/i.test(html) || /^<html/i.test(html)) {
    return html
  }

  // Optional leading <style>…</style> + body HTML (formato antigo)
  let headExtra = ''
  let bodyHtml = html
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
${headExtra}
</head>
<body>${bodyHtml || PLACEHOLDER}</body>
</html>`
}

const PLACEHOLDER = `
<div style="display:flex;align-items:center;justify-content:center;min-height:400px;color:#94a3b8;font-size:14px;text-align:center;padding:40px;">
  <div>
    <p style="font-size:28px;margin-bottom:12px;">✦</p>
    <p style="font-weight:600;margin-bottom:6px;color:#64748b;">Página em branco</p>
    <p>Use o painel esquerdo para adicionar blocos<br>ou gere a página com IA.</p>
  </div>
</div>`

function extractSaveHtml(doc: Document): string {
  // Limpa artefatos do editor antes de salvar
  doc.querySelectorAll('[data-lp-hover]').forEach(el => el.removeAttribute('data-lp-hover'))
  doc.querySelectorAll('[data-lp-sel]').forEach(el => el.removeAttribute('data-lp-sel'))

  const extraStyles = Array.from(doc.head.querySelectorAll('style'))
    .filter(s => s.id !== 'lp-editor-css')
    .map(s => s.outerHTML).join('\n')
  const body = doc.body.innerHTML
  return extraStyles ? `${extraStyles}\n${body}` : body
}

function detectType(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  if (tag === 'img')                       return 'image'
  if (tag === 'a')                         return 'link'
  if (tag === 'iframe' || tag === 'video') return 'video'
  if (tag === 'form')                      return 'form'
  if (['p','span','h1','h2','h3','h4','h5','h6','strong','em','li','b','i','u'].includes(tag))
    return 'text'
  return 'default'
}

function parseInlineStyles(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  const attr = el.getAttribute('style') ?? ''
  attr.split(';').forEach(rule => {
    const i = rule.indexOf(':')
    if (i === -1) return
    const k = rule.slice(0, i).trim()
    const v = rule.slice(i + 1).trim()
    if (k) out[k] = v
  })
  return out
}

function applyInlineStyles(el: HTMLElement, styles: Record<string, string>) {
  const parts: string[] = []
  for (const [k, v] of Object.entries(styles)) {
    if (v !== '' && v !== undefined) parts.push(`${k}: ${v}`)
  }
  el.setAttribute('style', parts.join('; '))
}

function getAttrs(el: HTMLElement): Record<string, string> {
  const out: Record<string, string> = {}
  for (const a of Array.from(el.attributes)) out[a.name] = a.value
  return out
}

/** WeakMap: mesmo HTMLElement → mesmo LPComp (===) */
const compCache = new WeakMap<HTMLElement, LPComp>()

function getComp(el: HTMLElement, notify: () => void): LPComp {
  if (compCache.has(el)) return compCache.get(el)!

  const comp: LPComp = {
    _el: el,
    getStyle: () => parseInlineStyles(el),
    setStyle: (s) => { applyInlineStyles(el, s); notify() },
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
        for (const [attr, val] of Object.entries(v as Record<string, string>)) {
          el.setAttribute(attr, val)
        }
      }
      if (k === 'src')     el.setAttribute('src', String(v))
      if (k === 'content') el.textContent = String(v)
    },
    getClasses: () => Array.from(el.classList),
    parent: () => el.parentElement ? getComp(el.parentElement, notify) : null,
    move: (newParent, { at }) => {
      const refChild = newParent._el.children[at] ?? null
      newParent._el.insertBefore(el, refChild)
    },
    remove: () => { compCache.delete(el); el.parentElement?.removeChild(el) },
    components: () => ({
      get length() { return el.childNodes.length },
      each: (fn) => {
        Array.from(el.childNodes).forEach((child, i) => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            fn(getComp(child as HTMLElement, notify), i)
          }
        })
      },
      add: (html, opts) => {
        const doc = el.ownerDocument
        const tmp = doc.createElement('div')
        tmp.innerHTML = html
        const at = opts?.at ?? el.children.length
        const ref = el.children[at] ?? null
        while (tmp.firstChild) el.insertBefore(tmp.firstChild, ref)
        notify()
      },
    }),
  }
  compCache.set(el, comp)
  return comp
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating Toolbar (React, position: fixed no host)
// ─────────────────────────────────────────────────────────────────────────────

interface SelectionInfo {
  tag:   string
  rect:  { top: number; left: number; width: number; height: number }  // viewport-relative
  canSelectParent: boolean
  canMoveUp:       boolean
  canMoveDown:     boolean
}

function FloatingToolbar({
  info,
  editing,
  onSelectParent,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  info: SelectionInfo
  editing: boolean
  onSelectParent: () => void
  onMoveUp:       () => void
  onMoveDown:     () => void
  onDuplicate:    () => void
  onDelete:       () => void
}) {
  // Posiciona acima (ou abaixo, se não couber no topo)
  const showBelow = info.rect.top < TOOLBAR_H + TOOLBAR_GAP + 8
  const top  = showBelow
    ? info.rect.top + info.rect.height + TOOLBAR_GAP
    : info.rect.top - TOOLBAR_H - TOOLBAR_GAP
  const left = Math.max(8, info.rect.left)

  return (
    <div
      style={{
        position:      'fixed',
        top,
        left,
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
    >
      {/* Tag badge */}
      <span style={{
        fontSize:   11,
        fontWeight: 700,
        color:      editing ? '#fbbf24' : '#60a5fa',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        padding:    '0 8px',
        letterSpacing: '0.02em',
      }}>
        {editing ? '✎ ' : ''}{'<'}{info.tag}{'>'}
      </span>

      <Sep />

      {/* Select parent */}
      <TBtn
        title="Selecionar elemento pai"
        disabled={!info.canSelectParent}
        onClick={onSelectParent}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 11V3M3 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </TBtn>

      <Sep />

      {/* Move up/down */}
      <TBtn title="Mover para cima (Alt+↑)"   disabled={!info.canMoveUp}   onClick={onMoveUp}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 11V3M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </TBtn>
      <TBtn title="Mover para baixo (Alt+↓)" disabled={!info.canMoveDown} onClick={onMoveDown}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </TBtn>

      <Sep />

      <TBtn title="Duplicar (Ctrl+D)" onClick={onDuplicate}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2.5" y="2.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="5.5" y="5.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" fill="#111827"/>
        </svg>
      </TBtn>

      <Sep />

      <TBtn title="Deletar (Delete)" danger onClick={onDelete}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 4h8M5.5 4V2.5h3V4M4 4l.5 8h5L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </TBtn>
    </div>
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
        width:       26,
        height:      26,
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

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const LandingEditor = forwardRef<LandingEditorHandle, Props>(
  function LandingEditorV2({ initialHtml, onAutoSave, onSaveStatus, onEditorReady }, ref) {
    const iframeRef    = useRef<HTMLIFrameElement>(null)
    const selectedRef  = useRef<HTMLElement | null>(null)
    const notifyRef    = useRef<() => void>(() => {})
    const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
    const rafRef       = useRef<number | null>(null)
    const undoStack    = useRef<string[]>([])
    const redoStack    = useRef<string[]>([])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listenersRef = useRef<Map<string, Set<(...a: any[]) => void>>>(new Map())

    const [info, setInfo]       = useState<SelectionInfo | null>(null)
    const [editing, setEditing] = useState(false)
    const [device, setDevice]   = useState<'Desktop' | 'Mobile'>('Desktop')
    const [ready, setReady]     = useState(false)

    // image picker
    const [pickerOpen, setPickerOpen] = useState(false)
    const pickerCbRef = useRef<((url: string) => void) | null>(null)

    // ── Helpers ──────────────────────────────────────────────────────────────

    const getDoc = useCallback((): Document | null => {
      try { return iframeRef.current?.contentDocument ?? null } catch { return null }
    }, [])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trigger = useCallback((event: string, ...args: any[]) => {
      listenersRef.current.get(event)?.forEach(cb => {
        try { cb(...args) } catch { /* ignore */ }
      })
    }, [])

    const scheduleSave = useCallback(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      onSaveStatus?.('saving')
      saveTimer.current = setTimeout(async () => {
        const doc = getDoc()
        if (!doc) return
        await onAutoSave(extractSaveHtml(doc))
        onSaveStatus?.('saved')
        setTimeout(() => onSaveStatus?.('idle'), 1500)
      }, AUTOSAVE_MS)
    }, [getDoc, onAutoSave, onSaveStatus])

    const takeSnapshot = useCallback(() => {
      const doc = getDoc()
      if (!doc) return
      undoStack.current.push(doc.body.innerHTML)
      if (undoStack.current.length > MAX_UNDO) undoStack.current.shift()
      redoStack.current = []
    }, [getDoc])

    // ── Atualização da info de seleção (posição do toolbar) ──────────────────

    const computeInfo = useCallback((el: HTMLElement | null): SelectionInfo | null => {
      if (!el || !iframeRef.current) return null
      const iframeRect = iframeRef.current.getBoundingClientRect()
      const elRect     = el.getBoundingClientRect()
      const doc = el.ownerDocument
      const parent = el.parentElement
      return {
        tag:  el.tagName.toLowerCase(),
        rect: {
          // viewport-relative (para position: fixed)
          top:    iframeRect.top  + elRect.top,
          left:   iframeRect.left + elRect.left,
          width:  elRect.width,
          height: elRect.height,
        },
        canSelectParent: !!parent && parent !== doc.body && parent !== doc.documentElement,
        canMoveUp:       !!el.previousElementSibling,
        canMoveDown:     !!el.nextElementSibling,
      }
    }, [])

    const syncInfo = useCallback(() => {
      const el = selectedRef.current
      if (!el) { setInfo(null); return }
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        setInfo(computeInfo(selectedRef.current))
      })
    }, [computeInfo])

    // ── Seleção ──────────────────────────────────────────────────────────────

    const select = useCallback((el: HTMLElement | null) => {
      const doc = getDoc()
      if (!doc) return

      const prev = selectedRef.current
      if (prev && prev !== el) {
        prev.removeAttribute('data-lp-sel')
        if (prev.hasAttribute('contenteditable')) {
          prev.removeAttribute('contenteditable')
          setEditing(false)
        }
      }

      selectedRef.current = el

      if (!el) {
        setInfo(null)
        trigger('component:deselected')
        return
      }

      el.removeAttribute('data-lp-hover')
      el.setAttribute('data-lp-sel', '')
      setInfo(computeInfo(el))
      const comp = getComp(el, () => notifyRef.current())
      trigger('component:selected', comp)
    }, [getDoc, trigger, computeInfo])

    // ── Ações ────────────────────────────────────────────────────────────────

    const deleteSelected = useCallback(() => {
      const el = selectedRef.current
      const parent = el?.parentElement
      if (!el || !parent) return
      select(null)
      parent.removeChild(el)
      takeSnapshot()
      scheduleSave()
      trigger('change:any')
    }, [select, takeSnapshot, scheduleSave, trigger])

    const duplicateSelected = useCallback(() => {
      const el = selectedRef.current
      const parent = el?.parentElement
      if (!el || !parent) return
      const clone = el.cloneNode(true) as HTMLElement
      clone.removeAttribute('data-lp-sel')
      clone.removeAttribute('data-lp-hover')
      parent.insertBefore(clone, el.nextSibling)
      select(clone)
      takeSnapshot()
      scheduleSave()
      trigger('change:any')
    }, [select, takeSnapshot, scheduleSave, trigger])

    const moveSelected = useCallback((dir: 'up' | 'down') => {
      const el = selectedRef.current
      const parent = el?.parentElement
      if (!el || !parent) return
      if (dir === 'up') {
        const prev = el.previousElementSibling
        if (prev) parent.insertBefore(el, prev)
      } else {
        const next = el.nextElementSibling
        if (next) parent.insertBefore(next, el)
      }
      syncInfo()
      takeSnapshot()
      scheduleSave()
      trigger('change:any')
    }, [syncInfo, takeSnapshot, scheduleSave, trigger])

    const selectParent = useCallback(() => {
      const el = selectedRef.current
      const doc = getDoc()
      if (!el || !doc) return
      const parent = el.parentElement
      if (!parent || parent === doc.body || parent === doc.documentElement) return
      select(parent)
    }, [getDoc, select])

    const undo = useCallback(() => {
      const doc = getDoc()
      if (!doc || undoStack.current.length < 2) return
      const cur = undoStack.current.pop()!
      redoStack.current.push(cur)
      const prev = undoStack.current[undoStack.current.length - 1]
      select(null)
      doc.body.innerHTML = prev
      setEditing(false)
      scheduleSave()
      trigger('change:any')
    }, [getDoc, select, scheduleSave, trigger])

    const redo = useCallback(() => {
      const doc = getDoc()
      if (!doc || redoStack.current.length === 0) return
      const next = redoStack.current.pop()!
      undoStack.current.push(next)
      select(null)
      doc.body.innerHTML = next
      setEditing(false)
      scheduleSave()
      trigger('change:any')
    }, [getDoc, select, scheduleSave, trigger])

    // ── notify: chamado quando algum estilo/conteúdo muda ────────────────────

    useEffect(() => {
      notifyRef.current = () => {
        syncInfo()
        trigger('component:styleUpdate')
        trigger('change:any')
        scheduleSave()
      }
    }, [syncInfo, trigger, scheduleSave])

    // ── Bootstrap do iframe ──────────────────────────────────────────────────

    useEffect(() => {
      const iframe = iframeRef.current
      if (!iframe) return

      const onLoad = () => {
        const doc = iframe.contentDocument
        if (!doc) return

        // Escreve o documento completo
        doc.open()
        doc.write(buildIframeDoc(initialHtml))
        doc.close()

        // Injeta CSS do editor
        if (!doc.getElementById('lp-editor-css')) {
          const style = doc.createElement('style')
          style.id = 'lp-editor-css'
          style.textContent = IFRAME_CSS
          doc.head.appendChild(style)
        }

        // Listeners no iframe document
        attachIframeListeners(doc)

        // Snapshot inicial
        setTimeout(() => {
          undoStack.current.push(doc.body.innerHTML)
          setReady(true)
        }, 30)
      }

      iframe.addEventListener('load', onLoad, { once: true })
      iframe.src = 'about:blank'

      return () => {
        iframe.removeEventListener('load', onLoad)
        if (saveTimer.current) clearTimeout(saveTimer.current)
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Listeners do iframe ──────────────────────────────────────────────────

    const attachIframeListeners = useCallback((doc: Document) => {
      let hoverEl: HTMLElement | null = null

      // Hover
      doc.body.addEventListener('mouseover', (e) => {
        const t = e.target as HTMLElement
        if (!t || t === doc.body || t === doc.documentElement) return
        if (t === selectedRef.current) {
          if (hoverEl) { hoverEl.removeAttribute('data-lp-hover'); hoverEl = null }
          return
        }
        if (hoverEl !== t) {
          if (hoverEl) hoverEl.removeAttribute('data-lp-hover')
          t.setAttribute('data-lp-hover', '')
          hoverEl = t
        }
      })
      doc.body.addEventListener('mouseleave', () => {
        if (hoverEl) { hoverEl.removeAttribute('data-lp-hover'); hoverEl = null }
      })

      // Click → seleciona
      doc.body.addEventListener('click', (e) => {
        const t = e.target as HTMLElement
        if (!t) return

        // Prevenir navegação de links
        const anchor = t.closest('a')
        if (anchor) { e.preventDefault(); e.stopPropagation() }

        // Body/html → desseleciona
        if (t === doc.body || t === doc.documentElement) { select(null); return }

        select(t)
      }, true)

      // Double-click → edita texto (somente em elementos "folha")
      doc.body.addEventListener('dblclick', (e) => {
        const t = e.target as HTMLElement
        if (!t) return
        const type = detectType(t)
        const isLeaf = t.children.length === 0
        if (type === 'text' || (type === 'default' && isLeaf)) {
          t.setAttribute('contenteditable', 'true')
          t.focus()
          select(t)
          setEditing(true)

          const onBlur = () => {
            t.removeAttribute('contenteditable')
            setEditing(false)
            takeSnapshot()
            scheduleSave()
            trigger('change:any')
            t.removeEventListener('blur', onBlur)
          }
          t.addEventListener('blur', onBlur)
        }
      }, true)

      // Esc → desseleciona (ou sai do modo edição)
      doc.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const sel = selectedRef.current
          if (sel?.hasAttribute('contenteditable')) {
            ;(sel as HTMLElement).blur()
          } else {
            select(null)
          }
        }
      })

      // Sync posição do toolbar em scroll do iframe
      doc.addEventListener('scroll', syncInfo, { passive: true })
      // Scroll pode acontecer no documentElement também
      doc.defaultView?.addEventListener('scroll', syncInfo, { passive: true, capture: true })
    }, [select, takeSnapshot, scheduleSave, trigger, syncInfo])

    // ── Resize do host → reposiciona toolbar ─────────────────────────────────

    useEffect(() => {
      const onResize = () => syncInfo()
      window.addEventListener('resize', onResize, { passive: true })
      window.addEventListener('scroll',  onResize, { passive: true })
      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('scroll', onResize)
      }
    }, [syncInfo])

    // ── Keyboard shortcuts (host + iframe) ───────────────────────────────────

    useEffect(() => {
      if (!ready) return
      const doc = getDoc()
      if (!doc) return

      const handler = (e: KeyboardEvent) => {
        // Em modo edição de texto, deixa o browser lidar
        const active = doc.activeElement as HTMLElement | null
        const ce = active?.getAttribute('contenteditable')
        const isEditing = ce === 'true' || ce === ''
        if (isEditing) return

        // Ctrl/Cmd+Z → undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault(); undo(); return
        }
        // Ctrl/Cmd+Y ou Ctrl+Shift+Z → redo
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault(); redo(); return
        }
        // Ctrl/Cmd+D → duplicate
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault(); duplicateSelected(); return
        }
        // Delete/Backspace
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (selectedRef.current && selectedRef.current !== doc.body) {
            e.preventDefault(); deleteSelected()
          }
        }
        // Alt+↑/↓ → move
        if (e.altKey && e.key === 'ArrowUp')   { e.preventDefault(); moveSelected('up')   }
        if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); moveSelected('down') }
      }

      doc.addEventListener('keydown', handler)
      window.addEventListener('keydown', handler)
      return () => {
        doc.removeEventListener('keydown', handler)
        window.removeEventListener('keydown', handler)
      }
    }, [ready, getDoc, undo, redo, duplicateSelected, deleteSelected, moveSelected])

    // ── Click fora da toolbar/iframe desseleciona ────────────────────────────

    const onHostMouseDown = useCallback((e: React.MouseEvent) => {
      // Se clicou em algo fora do iframe e fora do toolbar, desseleciona
      const t = e.target as HTMLElement
      if (t.closest('iframe') || t.closest('[data-lp-toolbar]')) return
      // Fundo do container
      if (t === e.currentTarget) select(null)
    }, [select])

    // ── EditorAPI pública ────────────────────────────────────────────────────

    useEffect(() => {
      if (!ready) return

      const api: EditorAPI = {
        on: (event, cb) => {
          if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set())
          listenersRef.current.get(event)!.add(cb)
        },
        off: (event, cb) => {
          listenersRef.current.get(event)?.delete(cb)
        },
        trigger: (event, ...args) => {
          trigger(event, ...args)
          if (event === 'change:changesCount') {
            takeSnapshot()
            scheduleSave()
            trigger('change:any')
          }
        },
        addComponents: (html: string) => {
          const doc = getDoc()
          if (!doc) return
          const tmp = doc.createElement('div')
          tmp.innerHTML = html

          // Insere após o ancestor top-level da seleção (se houver)
          let insertAfter: Element | null = null
          const sel = selectedRef.current
          if (sel && doc.body.contains(sel)) {
            let el: HTMLElement = sel
            while (el.parentElement && el.parentElement !== doc.body) {
              el = el.parentElement
            }
            if (el.parentElement === doc.body) insertAfter = el
          }

          let first: Element | null = null
          while (tmp.firstChild) {
            const node = tmp.firstChild as Element
            if (insertAfter) { insertAfter.after(node); insertAfter = node }
            else             { doc.body.appendChild(node) }
            if (!first) first = node
          }

          setTimeout(() => first?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
          takeSnapshot()
          scheduleSave()
          trigger('change:any')
        },
        Canvas:       { getDocument: getDoc },
        BlockManager: { getAll: () => ({ models: [] }) },
        openImagePicker: (cb) => { pickerCbRef.current = cb; setPickerOpen(true) },
        getBodyChildren: () => {
          const doc = getDoc()
          return doc ? Array.from(doc.body.children) as HTMLElement[] : []
        },
        selectElement:      (el: HTMLElement) => select(el),
        getSelectedElement: () => selectedRef.current,
        onAnyChange: (cb) => {
          if (!listenersRef.current.has('change:any')) listenersRef.current.set('change:any', new Set())
          listenersRef.current.get('change:any')!.add(cb)
          return () => listenersRef.current.get('change:any')?.delete(cb)
        },
      }

      onEditorReady?.(api)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready])

    // ── Image picker callback ────────────────────────────────────────────────

    const handleImageSelect = useCallback((url: string) => {
      setPickerOpen(false)
      const cb = pickerCbRef.current
      pickerCbRef.current = null

      const el = selectedRef.current
      if (el) {
        if (el.tagName.toLowerCase() === 'img') el.setAttribute('src', url)
        else el.style.backgroundImage = `url("${url}")`
        takeSnapshot()
        notifyRef.current()
      } else {
        const doc = getDoc()
        if (doc) {
          const img = doc.createElement('img')
          img.setAttribute('src', url)
          img.style.cssText = 'max-width:100%;height:auto;display:block'
          doc.body.appendChild(img)
          takeSnapshot()
          scheduleSave()
        }
      }
      cb?.(url)
    }, [getDoc, takeSnapshot, scheduleSave])

    // ── Imperative handle ────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      getHtml: () => {
        const doc = getDoc()
        return doc ? extractSaveHtml(doc) : ''
      },
      undo,
      redo,
      setDevice: (d) => setDevice(d),
    }))

    // ── Render ───────────────────────────────────────────────────────────────

    const wrapStyle: React.CSSProperties = device === 'Mobile'
      ? { width: 390, height: '100%', margin: '0 auto' }
      : { width: '100%', height: '100%' }

    return (
      <div
        className="relative w-full h-full bg-[#0f1827]"
        onMouseDown={onHostMouseDown}
      >
        <div style={{ ...wrapStyle, transition: 'width 0.25s ease', overflow: 'hidden' }}>
          <iframe
            ref={iframeRef}
            data-lp-editor-root
            title="landing-editor-canvas"
            className="w-full h-full border-0 bg-white block"
            sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
          />
        </div>

        {/* Floating toolbar — rendered in a portal to escape any ancestor overflow */}
        {info && typeof window !== 'undefined' && createPortal(
          <div data-lp-toolbar>
            <FloatingToolbar
              info={info}
              editing={editing}
              onSelectParent={selectParent}
              onMoveUp={()   => moveSelected('up')}
              onMoveDown={() => moveSelected('down')}
              onDuplicate={duplicateSelected}
              onDelete={deleteSelected}
            />
          </div>,
          document.body,
        )}

        {/* Image picker */}
        {pickerOpen && typeof window !== 'undefined' &&
          createPortal(
            <ImagePickerModal
              onSelect={handleImageSelect}
              onClose={() => { setPickerOpen(false); pickerCbRef.current = null }}
            />,
            document.body,
          )
        }
      </div>
    )
  },
)
