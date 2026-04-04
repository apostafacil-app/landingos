'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

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
}

export function BlocksDrawer({ editor }: Props) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [search, setSearch]  = useState('')

  useEffect(() => {
    if (!editor) return
    try {
      const models = editor.BlockManager.getAll().models as AnyEditor[]
      const list = models.map((b) => {
        const cat = b.get('category')
        return {
          id: b.id as string,
          label: (b.get('label') as string) || b.id,
          category:
            typeof cat === 'object' && cat !== null
              ? (cat.label as string)
              : (cat as string) || 'Outros',
          media: (b.get('media') as string) || '',
          content: b.get('content'),
        }
      })
      setBlocks(list)
    } catch {
      // editor may not be fully ready
    }
  }, [editor])

  const q = search.toLowerCase()
  const filtered = blocks.filter(
    (b) => !q || b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
  )

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
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-2.5 border-b border-[#253660] shrink-0">
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
              {catBlocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => addBlock(block)}
                  title={block.label}
                  className="bg-[#1e3050] hover:bg-[#2d4275] border border-[#253660] hover:border-[#60a5fa] rounded-lg p-2 text-center transition-all duration-150 cursor-pointer flex flex-col items-center gap-1.5 min-h-[64px] justify-center"
                >
                  {block.media ? (
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
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer tip */}
      <div className="px-3 py-2 border-t border-[#253660] shrink-0">
        <p className="text-[10px] text-[#4a6b9a] text-center">
          Clique para adicionar à página
        </p>
      </div>
    </div>
  )
}
