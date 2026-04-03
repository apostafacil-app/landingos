/* 8.4 — Skeleton para o editor: aparece enquanto page.tsx busca dados no Supabase */
import { Loader2 } from 'lucide-react'

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar skeleton */}
      <div className="h-12 border-b border-[#253660] bg-[#1a2744] flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white/10 animate-pulse" />
          <div className="h-4 w-32 rounded bg-white/10 animate-pulse hidden sm:block" />
          <div className="h-5 w-16 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-7 w-20 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
          <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded bg-white/10 animate-pulse" />
          <div className="h-7 w-20 rounded-lg bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Editor skeleton: imita layout do GrapesJS com painel esquerdo + canvas */}
      <div className="flex-1 flex overflow-hidden bg-[#1a2744]">
        {/* Painel esquerdo de blocos */}
        <div className="w-[220px] bg-[#1e2d4a] border-r border-[#253660] flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-[#253660]">
            {['Blocos', 'Estilos', 'Layers'].map(t => (
              <div key={t} className="flex-1 h-9 flex items-center justify-center">
                <div className="h-2.5 w-10 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
          {/* Block thumbnails */}
          <div className="p-3 grid grid-cols-2 gap-2 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-[#253660] animate-pulse"
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[#e5e7eb]">
          <div className="text-center text-[#1a2744]/40">
            <Loader2 size={28} className="animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium">Carregando editor…</p>
          </div>
        </div>

        {/* Painel direito (style manager) */}
        <div className="w-[240px] bg-[#1e2d4a] border-l border-[#253660] shrink-0 p-3 space-y-3 hidden lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
              <div className="h-8 w-full rounded bg-[#253660] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
