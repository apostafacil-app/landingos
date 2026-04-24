'use client'

/**
 * LandingEditor V3 — Arquitetura GreatPages-style
 *
 * - SEM iframe. Canvas é div direto.
 * - Blocos empilhados verticalmente (flow).
 * - Dentro de cada bloco: elementos com position: absolute.
 * - Drag/resize via react-moveable (8 alças + snap + guias).
 * - Toolbar contextual flutuante por tipo de elemento.
 * - Model JSON serializado como HTML compatível com publicação.
 */

import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useMemo,
  useRef, useState,
} from 'react'
import Moveable from 'react-moveable'
import type {
  PageModel, Block, Element as Elem, ElementType,
  ImagemElement, TextoElement, BotaoElement,
  CaixaElement, CirculoElement, IconeElement, VideoElement,
} from './types'
import { genId } from './types'
import { createPortal } from 'react-dom'
import { parsePage, serializePage } from './serializer'
import { ElementRenderer } from './ElementRenderer'
import { SelectionToolbar } from './SelectionToolbar'
import { ImagePickerModal } from '../ImagePickerModal'

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface LandingEditorHandle {
  getHtml:   () => string
  undo:      () => void
  redo:      () => void
  setDevice: (device: 'Desktop' | 'Mobile') => void
}

interface Props {
  initialHtml:   string | null
  onAutoSave:    (html: string) => void
  onSaveStatus?: (s: 'saving' | 'saved' | 'idle') => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditorReady?: (api: any) => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const MAX_UNDO     = 80
const AUTOSAVE_MS  = 1000

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export const LandingEditor = forwardRef<LandingEditorHandle, Props>(
  function LandingEditorV3({ initialHtml, onAutoSave, onSaveStatus, onEditorReady }, ref) {
    // Model
    const [page, setPage] = useState<PageModel>(() => parsePage(initialHtml))
    const pageRef = useRef(page)
    pageRef.current = page

    // Selection
    const [selectedId, setSelectedId]  = useState<string | null>(null)
    const [editingId,  setEditingId]   = useState<string | null>(null)   // texto em contenteditable
    const [device,     setDevice]      = useState<'Desktop' | 'Mobile'>('Desktop')

    // DOM refs
    const canvasRef   = useRef<HTMLDivElement>(null)
    const selectedElRef = useRef<HTMLElement | null>(null)

    // Undo/redo
    const undoStack = useRef<PageModel[]>([])
    const redoStack = useRef<PageModel[]>([])

    // Auto-save
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Event bus (compat com EditorAPI)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const listenersRef = useRef<Map<string, Set<(...a: any[]) => void>>>(new Map())

    // Moveable ref
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const moveableRef = useRef<any>(null)
    const [moveableTarget, setMoveableTarget] = useState<HTMLElement | null>(null)

    // Image picker
    const [pickerOpen, setPickerOpen] = useState(false)
    const pickerCbRef = useRef<((url: string) => void) | null>(null)

    const openImagePicker = useCallback((cb: (url: string) => void) => {
      pickerCbRef.current = cb
      setPickerOpen(true)
    }, [])

    // ── Helpers ──────────────────────────────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trigger = useCallback((event: string, ...args: any[]) => {
      listenersRef.current.get(event)?.forEach(cb => { try { cb(...args) } catch {} })
    }, [])

    const scheduleSave = useCallback(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      onSaveStatus?.('saving')
      saveTimer.current = setTimeout(() => {
        const html = serializePage(pageRef.current)
        onAutoSave(html)
        onSaveStatus?.('saved')
        setTimeout(() => onSaveStatus?.('idle'), 1500)
      }, AUTOSAVE_MS)
    }, [onAutoSave, onSaveStatus])

    const snapshot = useCallback(() => {
      undoStack.current.push(structuredClone(pageRef.current))
      if (undoStack.current.length > MAX_UNDO) undoStack.current.shift()
      redoStack.current = []
    }, [])

    /** Atualiza a página inteira e reflete UI; notifica mudança */
    const updatePage = useCallback((updater: (p: PageModel) => PageModel, takeSnapshot = true) => {
      if (takeSnapshot) snapshot()
      setPage(prev => {
        const next = updater(structuredClone(prev))
        pageRef.current = next
        return next
      })
      scheduleSave()
      trigger('change:any')
    }, [snapshot, scheduleSave, trigger])

    /** Encontra elemento + bloco por id */
    const findElement = useCallback((id: string): { block: Block; el: Elem; bi: number; ei: number } | null => {
      const p = pageRef.current
      for (let bi = 0; bi < p.blocks.length; bi++) {
        const block = p.blocks[bi]
        const ei = block.elements.findIndex(e => e.id === id)
        if (ei !== -1) return { block, el: block.elements[ei], bi, ei }
      }
      return null
    }, [])

    // ── Atualiza elemento ────────────────────────────────────────────────────

    const updateElement = useCallback((id: string, patch: Partial<Elem>, takeSnap = true) => {
      updatePage(p => {
        for (const block of p.blocks) {
          const i = block.elements.findIndex(e => e.id === id)
          if (i !== -1) {
            block.elements[i] = { ...block.elements[i], ...patch } as Elem
            break
          }
        }
        return p
      }, takeSnap)
    }, [updatePage])

    const deleteElement = useCallback((id: string) => {
      updatePage(p => {
        for (const block of p.blocks) {
          const i = block.elements.findIndex(e => e.id === id)
          if (i !== -1) { block.elements.splice(i, 1); break }
        }
        return p
      })
      if (selectedId === id) setSelectedId(null)
    }, [updatePage, selectedId])

    const duplicateElement = useCallback((id: string) => {
      let newId: string | null = null
      updatePage(p => {
        for (const block of p.blocks) {
          const i = block.elements.findIndex(e => e.id === id)
          if (i !== -1) {
            const clone = structuredClone(block.elements[i])
            clone.id = genId()
            clone.x += 20
            clone.y += 20
            block.elements.splice(i + 1, 0, clone)
            newId = clone.id
            break
          }
        }
        return p
      })
      if (newId) setSelectedId(newId)
    }, [updatePage])

    const addElement = useCallback((el: Elem, blockIndex = 0) => {
      updatePage(p => {
        if (p.blocks[blockIndex]) p.blocks[blockIndex].elements.push(el)
        return p
      })
      setSelectedId(el.id)
    }, [updatePage])

    // ── Undo/Redo ────────────────────────────────────────────────────────────

    const undo = useCallback(() => {
      const prev = undoStack.current.pop()
      if (!prev) return
      redoStack.current.push(structuredClone(pageRef.current))
      pageRef.current = prev
      setPage(prev)
      setSelectedId(null)
      scheduleSave()
      trigger('change:any')
    }, [scheduleSave, trigger])

    const redo = useCallback(() => {
      const next = redoStack.current.pop()
      if (!next) return
      undoStack.current.push(structuredClone(pageRef.current))
      pageRef.current = next
      setPage(next)
      setSelectedId(null)
      scheduleSave()
      trigger('change:any')
    }, [scheduleSave, trigger])

    // Snapshot inicial
    useEffect(() => { snapshot() /* eslint-disable-next-line */ }, [])

    // ── Selection DOM sync ───────────────────────────────────────────────────

    useEffect(() => {
      if (!selectedId || !canvasRef.current) {
        selectedElRef.current = null
        setMoveableTarget(null)
        return
      }
      const el = canvasRef.current.querySelector<HTMLElement>(`[data-lp-id="${selectedId}"]`)
      selectedElRef.current = el
      setMoveableTarget(el)
    }, [selectedId, page])

    // Força Moveable a recalcular bounds quando a posição/tamanho muda via state.
    // Sem isso, a moldura das alças fica no lugar antigo após drag/resize/undo/nudge.
    const selectedElForRect = selectedId ? findElement(selectedId)?.el : null
    useEffect(() => {
      if (moveableRef.current && moveableTarget) {
        // rAF dupla para garantir que o DOM renderizou com os novos estilos antes
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            moveableRef.current?.updateRect()
          })
        })
      }
    }, [moveableTarget, selectedElForRect?.x, selectedElForRect?.y, selectedElForRect?.w, selectedElForRect?.h])

    // ── Click handlers ───────────────────────────────────────────────────────

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-lp-id]') as HTMLElement | null
      if (!target) { setSelectedId(null); return }
      const id = target.getAttribute('data-lp-id')
      // Ignora clique no bloco (só seleciona elementos)
      if (target.classList.contains('lp-block')) { setSelectedId(null); return }
      if (id && id !== selectedId) setSelectedId(id)
    }, [selectedId])

    const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-lp-id][data-lp-type]') as HTMLElement | null
      if (!target) return
      const type = target.getAttribute('data-lp-type')
      const id = target.getAttribute('data-lp-id')
      if (!id) return
      if (type === 'texto' || type === 'titulo' || type === 'botao') {
        setEditingId(id)
      }
    }, [])

    // ── Keyboard shortcuts ───────────────────────────────────────────────────

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement
        if (target?.isContentEditable) return
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return

        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
          e.preventDefault(); undo(); return
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
          e.preventDefault(); redo(); return
        }
        if (selectedId && (e.ctrlKey || e.metaKey) && e.key === 'd') {
          e.preventDefault(); duplicateElement(selectedId); return
        }
        if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
          e.preventDefault(); deleteElement(selectedId); return
        }
        if (e.key === 'Escape') {
          if (editingId) setEditingId(null)
          else setSelectedId(null)
        }
        // Seta: nudge 1px (shift+seta: 10px)
        if (selectedId && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
          e.preventDefault()
          const step = e.shiftKey ? 10 : 1
          const found = findElement(selectedId)
          if (!found) return
          const patch: Partial<Elem> = {}
          if (e.key === 'ArrowUp')    patch.y = Math.max(0, found.el.y - step)
          if (e.key === 'ArrowDown')  patch.y = found.el.y + step
          if (e.key === 'ArrowLeft')  patch.x = Math.max(0, found.el.x - step)
          if (e.key === 'ArrowRight') patch.x = found.el.x + step
          updateElement(selectedId, patch as Partial<Elem>, false)
        }
      }
      window.addEventListener('keydown', handler)
      return () => window.removeEventListener('keydown', handler)
    }, [selectedId, editingId, undo, redo, duplicateElement, deleteElement, findElement, updateElement])

    // ── Add block ───────────────────────────────────────────────────────────

    const addBlock = useCallback(() => {
      updatePage(p => {
        p.blocks.push({
          id: `blk-${Date.now()}`,
          height: 400,
          bgColor: '#ffffff',
          elements: [],
        })
        return p
      })
    }, [updatePage])

    // ── Imperative handle ────────────────────────────────────────────────────

    useImperativeHandle(ref, () => ({
      getHtml: () => serializePage(pageRef.current),
      undo, redo,
      setDevice,
    }))

    // ── Expose EditorAPI (compat com painéis externos) ───────────────────────

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const api: any = {
        on: (event: string, cb: (...a: unknown[]) => void) => {
          if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set())
          listenersRef.current.get(event)!.add(cb)
        },
        off: (event: string, cb: (...a: unknown[]) => void) => {
          listenersRef.current.get(event)?.delete(cb)
        },
        trigger,
        addComponents: (html: string) => {
          // V3: quick & dirty — parse do HTML e adiciona como bloco novo.
          // (Usado pelos blocos-modelo; fase 2 melhora.)
          try {
            const parsed = parsePage(html)
            updatePage(p => {
              parsed.blocks.forEach(b => p.blocks.push(b))
              return p
            })
          } catch { /* ignore */ }
        },
        /** V3: adiciona um novo elemento ao primeiro bloco (ou ao bloco específico). */
        insertElement: (type: ElementType, blockIndex = 0) => {
          const id = genId()
          const newEl: Elem = (() => {
            switch (type) {
              case 'imagem':  return { id, type, x: 40, y: 40, w: 320, h: 200, src: 'https://placehold.co/600x400/e2e8f0/94a3b8?text=Imagem' } as ImagemElement
              case 'texto':   return { id, type, x: 40, y: 40, w: 360, h: 48,  html: 'Clique duplo para editar', fontSize: 16, color: '#0f172a' } as TextoElement
              case 'titulo':  return { id, type, x: 40, y: 40, w: 500, h: 56,  html: 'Seu Título Aqui', fontSize: 36, fontWeight: 700, color: '#0f172a' } as TextoElement
              case 'botao':   return { id, type, x: 40, y: 40, w: 180, h: 48,  text: 'Clique aqui', bgColor: '#2563eb', color: '#ffffff', borderRadius: 8 } as BotaoElement
              case 'caixa':   return { id, type, x: 40, y: 40, w: 300, h: 200, bgColor: '#e2e8f0', borderRadius: 8 } as CaixaElement
              case 'circulo': return { id, type, x: 40, y: 40, w: 160, h: 160, bgColor: '#3b82f6' } as CirculoElement
              case 'icone':   return { id, type, x: 40, y: 40, w: 80,  h: 80,  emoji: '⭐' } as IconeElement
              case 'video':   return { id, type, x: 40, y: 40, w: 480, h: 270, src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } as VideoElement
            }
          })()
          addElement(newEl, blockIndex)
        },
        insertBlock: () => addBlock(),
        Canvas: { getDocument: () => document },
        BlockManager: { getAll: () => ({ models: [] }) },
        getBodyChildren: () => {
          return canvasRef.current
            ? Array.from(canvasRef.current.querySelectorAll('.lp-block')) as HTMLElement[]
            : []
        },
        getSelectedElement: () => selectedElRef.current,
        selectElement: (el: HTMLElement) => {
          const id = el.getAttribute('data-lp-id')
          if (id) setSelectedId(id)
        },
        onAnyChange: (cb: () => void) => {
          if (!listenersRef.current.has('change:any')) listenersRef.current.set('change:any', new Set())
          listenersRef.current.get('change:any')!.add(cb)
          return () => listenersRef.current.get('change:any')?.delete(cb)
        },
      }
      onEditorReady?.(api)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── Device viewport style ────────────────────────────────────────────────

    const contentMaxWidth = device === 'Mobile' ? 390 : page.width

    // ── Moveable handles (por tipo) ──────────────────────────────────────────

    const selected = selectedId ? findElement(selectedId)?.el ?? null : null
    const handleDirections = useMemo((): ReadonlyArray<string> => {
      if (!selected) return []
      if (selected.type === 'texto' || selected.type === 'titulo') return ['w', 'e']
      return ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    }, [selected])

    // ── Render ───────────────────────────────────────────────────────────────

    return (
      <div
        className="relative w-full h-full overflow-auto bg-[#e5e7eb]"
        style={{ padding: '24px 0' }}
      >
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="lp-canvas mx-auto bg-white shadow-lg"
          style={{
            width: contentMaxWidth,
            maxWidth: '100%',
            transition: 'width 0.25s ease',
          }}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
        >
          {page.blocks.map((block, blockIdx) => (
            <section
              key={block.id}
              className="lp-block"
              data-lp-id={block.id}
              style={{
                position: 'relative',
                height: block.height,
                backgroundColor: block.bgColor,
                backgroundImage: block.bgImage ? `url("${block.bgImage}")` : undefined,
                backgroundSize: block.bgSize ?? 'cover',
                backgroundPosition: block.bgPosition ?? 'center',
              }}
            >
              {block.elements.map(el => (
                <ElementRenderer
                  key={el.id}
                  element={el}
                  isSelected={el.id === selectedId}
                  isEditing={el.id === editingId}
                  onEditChange={(patch) => updateElement(el.id, patch, false)}
                  onEditCommit={(patch) => updateElement(el.id, patch, true)}
                  onStopEditing={() => setEditingId(null)}
                />
              ))}
              {/* Badge indicador do bloco */}
              {blockIdx === page.blocks.length - 1 && (
                <button
                  onClick={addBlock}
                  className="lp-add-block"
                  style={{
                    position: 'absolute',
                    bottom: -36,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    padding: '6px 14px',
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  + adicionar bloco
                </button>
              )}
            </section>
          ))}
        </div>

        {/* Moveable handles */}
        {moveableTarget && selected && !editingId && (
          <Moveable
            ref={moveableRef}
            target={moveableTarget}
            draggable
            resizable
            origin={false}
            keepRatio={false}
            throttleDrag={0}
            throttleResize={0}
            snappable
            snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
            elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
            snapThreshold={5}
            renderDirections={handleDirections as string[]}
            edge={false}
            onDragStart={() => { /* moveable gerencia */ }}
            onDrag={(e) => {
              // Atualiza DOM diretamente durante drag (sem React re-render)
              e.target.style.transform = `translate(${e.translate[0]}px, ${e.translate[1]}px)`
            }}
            onDragEnd={(e) => {
              if (!e.lastEvent) return
              const { translate } = e.lastEvent
              e.target.style.transform = ''
              if (selectedId && selected) {
                updateElement(selectedId, {
                  x: Math.round(selected.x + translate[0]),
                  y: Math.round(selected.y + translate[1]),
                } as Partial<Elem>, true)
              }
            }}
            onResize={(e) => {
              const isText = selected?.type === 'texto' || selected?.type === 'titulo'
              e.target.style.width  = `${e.width}px`
              // Texto: mantém height auto durante o drag (deixa o conteúdo quebrar linha)
              if (!isText) {
                e.target.style.height = `${e.height}px`
              }
              e.target.style.transform = `translate(${e.drag.translate[0]}px, ${e.drag.translate[1]}px)`
            }}
            onResizeEnd={(e) => {
              if (!e.lastEvent) return
              const last = e.lastEvent
              e.target.style.transform = ''
              if (selectedId && selected) {
                const isText = selected.type === 'texto' || selected.type === 'titulo'
                // Para texto: altura final vem do DOM (já reflow com a nova largura)
                const finalH = isText
                  ? (e.target as HTMLElement).offsetHeight
                  : Math.round(last.height)
                updateElement(selectedId, {
                  x: Math.round(selected.x + last.drag.translate[0]),
                  y: Math.round(selected.y + last.drag.translate[1]),
                  w: Math.round(last.width),
                  h: finalH,
                } as Partial<Elem>, true)
              }
            }}
          />
        )}

        {/* Selection toolbar */}
        {selected && selectedElRef.current && !editingId && (
          <SelectionToolbar
            element={selected}
            targetEl={selectedElRef.current}
            onDelete={() => deleteElement(selected.id)}
            onDuplicate={() => duplicateElement(selected.id)}
            onUpdateElement={(patch) => updateElement(selected.id, patch, true)}
            onPickImage={(cb) => openImagePicker(cb)}
          />
        )}

        {/* Image picker modal (portal) */}
        {pickerOpen && typeof window !== 'undefined' &&
          createPortal(
            <ImagePickerModal
              onSelect={(url) => {
                pickerCbRef.current?.(url)
                pickerCbRef.current = null
                setPickerOpen(false)
              }}
              onClose={() => { pickerCbRef.current = null; setPickerOpen(false) }}
            />,
            document.body,
          )
        }
      </div>
    )
  },
)
