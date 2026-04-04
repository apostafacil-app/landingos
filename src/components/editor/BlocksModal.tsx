'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Search } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

interface Block {
  id: string
  label: string
  category: string
  media: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

interface Props {
  editor: AnyEditor | null
  open: boolean
  onClose: () => void
}

export function BlocksModal({ editor, open, onClose }: Props) {
  const [blocks, setBlocks]           = useState<Block[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [activeCategory, setActive]   = useState<string>('')
  const [search, setSearch]           = useState('')
  const overlayRef                    = useRef<HTMLDivElement>(null)

  /* Load blocks from GrapesJS */
  useEffect(() => {
    if (!editor || !open) return

    const load = () => {
      try {
        const bm   = editor.BlockManager
        const coll = bm.getAll()
        // Support both .models (Backbone) and iterable / array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arr: AnyEditor[] = coll.models
          ?? (Array.isArray(coll) ? coll : Array.from(coll as Iterable<AnyEditor>))

        if (!arr || arr.length === 0) return   // not ready yet, retry

        const list: Block[] = arr.map((b) => {
          const cat = b.get('category')
          return {
            id:       b.id as string,
            label:    (b.get('label') as string) || (b.id as string),
            category: typeof cat === 'object' && cat !== null
              ? (cat.label as string)
              : (cat as string) || 'Outros',
            media:   (b.get('media') as string) || '',
            content:  b.get('content'),
          }
        })
        const cats = Array.from(new Set(list.map((b) => b.category)))
        setBlocks(list)
        setCategories(cats)
        setActive((prev) => prev || cats[0] || '')
      } catch {
        // silent
      }
    }

    // Try immediately
    load()

    // Also listen to block:add in case blocks register after init
    editor.on('block:add', load)
    return () => { try { editor.off('block:add', load) } catch { /* */ } }
  }, [editor, open])

  /* Close on overlay click */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const addBlock = (block: Block) => {
    if (!editor) return
    try { editor.addComponents(block.content) } catch { /* silent */ }
    onClose()
  }

  /* Filter by search + category */
  const q = search.toLowerCase()
  const visible = blocks.filter((b) => {
    if (q) return b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    return b.category === activeCategory
  })

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[860px] max-w-[96vw] h-[90vh] max-h-[640px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Blocos</h2>
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-52">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar bloco…"
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Left: category list */}
          {!search && (
            <div className="w-52 shrink-0 border-r border-slate-100 overflow-y-auto py-3">
              <p className="px-4 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Seções
              </p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors rounded-lg mx-1 ${
                    activeCategory === cat
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Right: blocks grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                Nenhum bloco encontrado
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {visible.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => addBlock(block)}
                    className="group text-left border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-150"
                  >
                    {/* Thumbnail area */}
                    <div className="bg-slate-50 h-32 flex items-center justify-center border-b border-slate-100 group-hover:bg-blue-50 transition-colors">
                      {block.media ? (
                        <div
                          className="text-blue-400 [&_svg]:w-10 [&_svg]:h-10"
                          dangerouslySetInnerHTML={{ __html: block.media }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 group-hover:bg-blue-200 transition-colors flex items-center justify-center">
                          <div className="w-5 h-5 rounded bg-slate-300 group-hover:bg-blue-300 transition-colors" />
                        </div>
                      )}
                    </div>
                    {/* Label */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                        {block.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
