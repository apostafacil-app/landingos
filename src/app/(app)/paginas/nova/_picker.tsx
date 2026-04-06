'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, LayoutTemplate, Loader2, ArrowRight } from 'lucide-react'
import { NovaPageForm } from './_form'

type Mode = 'pick' | 'ai'

export function CreationPicker() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('pick')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleManual() {
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/pages/create-blank', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao criar página'); return }
      router.push(`/paginas/${data.pageId}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }

  if (mode === 'ai') {
    return (
      <div className="p-6 max-w-2xl w-full mx-auto">
        <button
          onClick={() => setMode('pick')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          ← Voltar às opções
        </button>
        <NovaPageForm />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl w-full mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Opção IA */}
        <button
          onClick={() => setMode('ai')}
          className="group bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-2 border-transparent hover:border-primary hover:shadow-md transition-all p-7 text-left flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Sparkles size={24} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base mb-1">Criar com IA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Responda algumas perguntas sobre seu negócio e a IA gera uma landing page completa em segundos.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
            Começar <ArrowRight size={14} />
          </span>
        </button>

        {/* Opção Manual */}
        <button
          onClick={handleManual}
          disabled={creating}
          className="group bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border-2 border-transparent hover:border-violet-500 hover:shadow-md transition-all p-7 text-left flex flex-col gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            {creating ? (
              <Loader2 size={24} className="text-violet-600 animate-spin" />
            ) : (
              <LayoutTemplate size={24} className="text-violet-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base mb-1">Criar do zero</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Página em branco com editor visual drag-and-drop. Arraste blocos prontos e monte sua página livremente.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 group-hover:gap-2 transition-all">
            {creating ? 'Criando…' : 'Abrir editor'} <ArrowRight size={14} />
          </span>
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Info pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-white px-3 py-1.5 rounded-full shadow-sm border border-border">
          <Sparkles size={11} className="text-primary" /> IA gera copy, layout e design
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-white px-3 py-1.5 rounded-full shadow-sm border border-border">
          <LayoutTemplate size={11} className="text-violet-600" /> Blocos prontos: hero, depoimentos, FAQ, CTA…
        </span>
      </div>
    </div>
  )
}
