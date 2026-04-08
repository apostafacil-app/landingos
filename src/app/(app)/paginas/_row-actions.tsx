'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MoreHorizontal, Pencil, Globe, EyeOff, Copy, Trash2, Loader2, AlertTriangle, ExternalLink,
} from 'lucide-react'
import { togglePublish } from './[id]/actions'
import { deletePage, duplicatePage } from './actions'

interface PageRow {
  page_id: string
  name: string
  slug: string
  status: string
}

export function RowActions({ page }: { page: PageRow }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [actionError, setActionError] = useState('')
  const [toggling, startToggle] = useTransition()
  const [duplicating, startDuplicate] = useTransition()
  const [deleting, startDelete] = useTransition()
  const menuRef = useRef<HTMLDivElement>(null)
  const isPublished = page.status === 'published'

  // Fechar ao clicar fora do kebab menu
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleToggle() {
    setOpen(false)
    startToggle(() => togglePublish(page.page_id, page.status))
  }

  function handleDuplicate() {
    setOpen(false)
    setActionError('')
    startDuplicate(async () => {
      const result = await duplicatePage(page.page_id)
      if (result.newId) router.push(`/paginas/${result.newId}`)
      else if (result.error) setActionError(result.error)
    })
  }

  function handleDelete() {
    setOpen(false)
    setShowDelete(true)
  }

  function confirmDelete() {
    startDelete(async () => {
      const result = await deletePage(page.page_id)
      if (result?.success) {
        // revalidatePath na action atualiza a lista via RSC automaticamente
        setShowDelete(false)
      } else if (result?.error) {
        setActionError(result.error)
        setShowDelete(false)
      }
    })
  }

  return (
    <>
      {/* Erro de ação inline — regra 7.3 */}
      {actionError && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-destructive text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-sm">
          <span className="flex-1">{actionError}</span>
          <button type="button" onClick={() => setActionError('')} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity text-base leading-none">✕</button>
        </div>
      )}

      {/* Kebab menu — regra 4.4 */}
      {/* stopPropagation garante que cliques aqui não ativem o ClickableRow */}
      <div ref={menuRef} className="relative flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
        {/* Loader rápido para ações em andamento */}
        {(toggling || duplicating) && (
          <Loader2 size={13} className="animate-spin text-muted-foreground" />
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          aria-label="Ações"
        >
          <MoreHorizontal size={15} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.10)] border border-border z-30 overflow-hidden py-1">
            {/* Editar */}
            <Link
              href={`/paginas/${page.page_id}`}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
              onClick={() => setOpen(false)}
            >
              <Pencil size={13} className="text-muted-foreground" />
              Editar
            </Link>

            {/* Visualizar */}
            <button
              onClick={() => { window.open(`/${page.slug}`, '_blank'); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
            >
              <ExternalLink size={13} className="text-muted-foreground" />
              Visualizar
            </button>

            {/* Publicar / Despublicar — regra 4.3 */}
            <button
              onClick={handleToggle}
              disabled={toggling}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
            >
              {isPublished
                ? <><EyeOff size={13} className="text-muted-foreground" /> Despublicar</>
                : <><Globe size={13} className="text-muted-foreground" /> Publicar</>
              }
            </button>

            {/* Duplicar */}
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
            >
              <Copy size={13} className="text-muted-foreground" />
              Duplicar
            </button>

            <div className="border-t border-border my-1" />

            {/* Excluir */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 size={13} />
              Excluir
            </button>
          </div>
        )}
      </div>

      {/* Modal de confirmação — regras 4.10 e 4.14 */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !deleting && setShowDelete(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">Excluir página?</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              Você está prestes a excluir permanentemente:
            </p>
            <p className="text-sm font-medium text-foreground bg-muted px-3 py-2 rounded-lg mb-4 truncate">
              {page.name}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Essa ação é irreversível. Todos os dados de visualizações e leads associados a esta página serão perdidos.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-10 px-4 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting
                  ? <><Loader2 size={13} className="animate-spin" /> Excluindo...</>
                  : 'Excluir permanentemente'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
