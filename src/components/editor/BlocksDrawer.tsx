'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, CheckCircle2 } from 'lucide-react'
import { LANDING_BLOCKS } from './blocks'
import type { EditorAPI } from './LandingEditor'

interface Props {
  editor: EditorAPI | null
  /** Called after a block is successfully added (e.g. to close the modal) */
  onBlockAdded?: () => void
}

export function BlocksDrawer({ editor, onBlockAdded }: Props) {
  const [search, setSearch]   = useState('')
  const [adding, setAdding]   = useState<string | null>(null)
  const [toast, setToast]     = useState<string | null>(null)

  const toastTimer  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const addingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Build list directly from LANDING_BLOCKS (no GrapesJS dependency)
  const blocks = LANDING_BLOCKS

  const q        = search.toLowerCase()
  const filtered = blocks.filter(
    b => !q || b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q),
  )

  const grouped = filtered.reduce<Record<string, typeof blocks>>((acc, block) => {
    if (!acc[block.category]) acc[block.category] = []
    acc[block.category].push(block)
    return acc
  }, {})

  const addBlock = useCallback(
    (block: (typeof LANDING_BLOCKS)[number]) => {
      if (!editor || adding) return
      setAdding(block.id)

      let success = false
      try {
        editor.addComponents(block.content)
        success = true
      } catch {
        // addComponents failed — clear adding state immediately
        setAdding(null)
        return
      }

      if (success) {
        clearTimeout(toastTimer.current)
        setToast(`"${block.label}" adicionado`)
        toastTimer.current = setTimeout(() => setToast(null), 2500)
        onBlockAdded?.()
      }

      clearTimeout(addingTimer.current)
      addingTimer.current = setTimeout(() => setAdding(null), 800)
    },
    [editor, adding, onBlockAdded],
  )

  // Cleanup timers on unmount
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current)
      clearTimeout(addingTimer.current)
    },
    [],
  )

  return (
    <div className="flex flex-col h-full relative">
      {/* ── Toast notification ───────────────────────────────────────────── */}
      <div
        className={`
          absolute top-2 inset-x-2 z-50
          bg-green-600 text-white text-xs rounded-lg px-3 py-2
          flex items-center gap-2 shadow-lg
          transition-all duration-300
          ${toast ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}
        `}
      >
        <CheckCircle2 size={12} className="shrink-0" />
        <span className="truncate">{toast}</span>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <div className="px-3 py-2.5 border-b border-[#253660] shrink-0">
        <div className="flex items-center gap-2 bg-[#0f1d36] border border-[#253660] rounded-lg px-3 py-1.5">
          <Search size={12} className="text-[#4a6b9a] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar bloco…"
            className="flex-1 bg-transparent text-xs text-[#c7d6f0] outline-none placeholder:text-[#4a6b9a]"
          />
        </div>
      </div>

      {/* ── Block grid — scrollable ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-xs text-[#4a6b9a]">Nenhum bloco encontrado</p>
          </div>
        )}

        {Object.entries(grouped).map(([cat, catBlocks]) => (
          <div key={cat} className="mb-2">
            <p className="px-3 py-1.5 text-[10px] font-bold text-[#4a6b9a] uppercase tracking-widest">
              {cat}
            </p>
            <div className="px-2 grid grid-cols-2 gap-1.5">
              {catBlocks.map(block => {
                const isAdding = adding === block.id
                return (
                  <button
                    key={block.id}
                    onClick={() => addBlock(block)}
                    disabled={!!adding || !editor}
                    title={block.label}
                    className={`
                      relative bg-[#1e3050] border border-[#253660] rounded-lg p-2 text-center
                      transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5
                      min-h-[64px] justify-center
                      ${adding
                        ? isAdding
                          ? 'border-green-500 bg-[#1a3a28]'
                          : 'opacity-50 cursor-not-allowed'
                        : editor
                          ? 'hover:bg-[#2d4275] hover:border-[#60a5fa]'
                          : 'opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    {isAdding ? (
                      <CheckCircle2 size={18} className="text-green-400" />
                    ) : block.media ? (
                      <div
                        className="text-[#60a5fa] [&_svg]:w-5 [&_svg]:h-5 [&_svg]:mx-auto flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: block.media }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded bg-[#2a3d6b] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-[#60a5fa] opacity-60" />
                      </div>
                    )}
                    <p className="text-[10px] text-[#c7d6f0] leading-tight line-clamp-2 text-center">
                      {block.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer tip ───────────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-[#253660] shrink-0">
        <p className="text-[10px] text-[#4a6b9a] text-center">
          Clique para adicionar à página
        </p>
      </div>
    </div>
  )
}
