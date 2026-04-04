'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function PaginasError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[/paginas] error:', error)
  }, [error])

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-10 text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle size={24} className="text-red-500" />
      </div>
      <div>
        <h2 className="font-semibold text-foreground mb-1">Algo deu errado</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ocorreu um erro ao carregar suas páginas. Tente novamente.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Ir para dashboard
        </button>
      </div>
    </div>
  )
}
