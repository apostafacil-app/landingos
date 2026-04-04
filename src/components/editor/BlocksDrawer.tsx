'use client'

import { useEffect, useState, useRef } from 'react'
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
  onClose: () => void
}

export function BlocksDrawer({ editor, onClose }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [search, setSearch]  = useState('')
  const drawerRef = useRef<HTMLDivElement>(null)

  // Load blocks once editor is ready
  useEffect(() => {
    if (!editor) return
    try {
      const models = editor.BlockManager.getAll().models as AnyEditor[]
      const list = models.map((b) => {
        const cat = b.get('category')
        return {
          id: b.id as string,
          label: (b.get('label') as string) || b.id,
          category: typeof cat === 'object' && cat !== null ? (cat.label as string) : (cat as string) || 'Outros',
          media: (b.get('media') as string) || '',
          content: b.get('content'),
        }
      })
      setBlocks(list)
    } catch {
      // editor may not be fully ready
    }
  }, [editor])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Close when clicking outside the drawer
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Slight delay to avoid catching the same click that opened the drawer
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler) }
  }, [onClose])

  const q = search.toLowerCase()
  const filtered = blocks.filter(
    (b) => !q || b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
  )

  // Group by category
  const grouped = filtered.reduce<Record<string, Block[]>>((acc, block) => {
    if (!acc[block.category]) acc[block.category] = []
    acc[block.category].push(block)
    return acc
  }, {})

  const addBlock = (block: Block) => {
    if (!editor) return
    try {
      editor.addComponents(block.content)
    } catch {
      // silent
    }
    onClose()
  }

  return (
    <div
      ref={drawerRef}
      className="absolute left-0 top-0 bottom-0 w-72 bg-[#1a2744] border-r border-[#253660] flex flex-col z-30 shadow-2xl animate-in slide-in-from-left duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#253660] shrink-0">
        <p className="text-sm font-semibold text-white">Blocos</p>
        <button
          onClick={onClose}
          className="text-[#94b4d8] hover:text-white transition-colors p-1 rounded hover:bg-white/10"
        >
          <X size={15} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#253660] shrink-0">
        <div className="flex items-center gap-2 bg-[#0f1d36] border border-[#253660] rounded-lg px-3 py-1.5">
          <Search size={12} className="text-[#4a6b9a] shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar bloco…"
            className="flex-1 bg-transparent text-xs text-[#c7d6f0] outline-none placeholder:text-[#4a6b9a]"
          />
        </div>
      </div>

      {/* Block grid — scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <p className="text-sm text-[#4a6b9a]">Nenhum bloco encontrado</p>
          </div>
        )}

        {Object.entries(grouped).map(([cat, catBlocks]) => (
          <div key={cat} className="mb-2">
            <p className="px-4 py-2 text-[10px] font-bold text-[#4a6b9a] uppercase tracking-widest">
              {cat}
            </p>
            <div className="px-3 grid grid-cols-2 gap-2">
              {catBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => addBlock(block)}
                  title={block.label}
                  className="bg-[#253660] hover:bg-[#2d4275] border border-[#2a3d6b] hover:border-[#60a5fa] rounded-lg p-2.5 text-center transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5 min-h-[72px] justify-center"
                >
                  {block.media ? (
                    <div
                      className="text-[#60a5fa] [&_svg]:w-6 [&_svg]:h-6 [&_svg]:mx-auto flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: block.media }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-[#2a3d6b] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-sm bg-[#60a5fa] opacity-60" />
                    </div>
                  )}
                  <p className="text-[10px] text-[#c7d6f0] leading-tight line-clamp-2 text-center">
                    {block.label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="px-4 py-2.5 border-t border-[#253660] shrink-0">
        <p className="text-[10px] text-[#4a6b9a] text-center">
          Clique no bloco para adicionar à página
        </p>
      </div>
    </div>
  )
}
