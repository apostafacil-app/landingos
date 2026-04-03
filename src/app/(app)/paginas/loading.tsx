/* 8.4 — Skeleton Loading: renderiza enquanto page.tsx busca dados no Supabase */
export default function PaginasLoading() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      {/* Header skeleton */}
      <div className="h-16 border-b border-border bg-white px-6 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-48 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>

      <div className="p-6 max-w-5xl space-y-5">
        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="h-9 w-40 rounded-lg bg-muted animate-pulse" />
        </div>

        {/* Tabela skeleton */}
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4 px-5 py-3 bg-[#f9fafb] border-b border-border">
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            <div className="ml-auto flex gap-6">
              <div className="h-3 w-10 rounded bg-muted animate-pulse" />
              <div className="h-3 w-10 rounded bg-muted animate-pulse" />
              <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            </div>
          </div>

          {/* Linhas */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-28 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
              <div className="ml-auto flex gap-8">
                <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                <div className="h-3 w-10 rounded bg-muted animate-pulse" />
                <div className="h-6 w-6 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
