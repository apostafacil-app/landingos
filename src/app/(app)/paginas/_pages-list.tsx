'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Eye, Users, TrendingUp, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { RowActions } from './_row-actions'
import { ClickableRow } from './_clickable-row'
import { deletePages } from './actions'

interface PageRow {
  page_id: string
  name: string
  slug: string
  status: string
  views_total: number | null
  leads_total: number | null
  conversion_rate_7d: number | null
}

export function PagesList({ pages }: { pages: PageRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [bulkError, setBulkError] = useState('')
  const [bulkDeleting, startBulkDelete] = useTransition()

  const allSelected = pages.length > 0 && selected.size === pages.length
  const someSelected = selected.size > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(pages.map(p => p.page_id)))
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function confirmBulkDelete() {
    startBulkDelete(async () => {
      const result = await deletePages([...selected])
      if (result.success) {
        setSelected(new Set())
        setShowBulkDelete(false)
      } else {
        setBulkError(result.error ?? 'Erro ao excluir.')
        setShowBulkDelete(false)
      }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)]">

      {/* Barra de ações em lote */}
      {someSelected && (
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-border bg-primary/5 rounded-t-xl">
          <span className="text-sm font-medium text-primary">
            {selected.size} {selected.size === 1 ? 'página selecionada' : 'páginas selecionadas'}
          </span>
          <button
            onClick={() => setShowBulkDelete(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-destructive text-white text-xs font-medium hover:bg-destructive/90 transition-colors"
          >
            <Trash2 size={12} />
            Excluir selecionadas
          </button>
        </div>
      )}

      {/* Toast de erro */}
      {bulkError && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-destructive text-white text-sm px-4 py-2.5 rounded-xl shadow-lg max-w-sm">
          <span className="flex-1">{bulkError}</span>
          <button type="button" onClick={() => setBulkError('')} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground bg-[#f9fafb] border-b border-border">
            <th className="pl-5 py-3 rounded-tl-xl w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-primary cursor-pointer"
                aria-label="Selecionar todas"
              />
            </th>
            <th className="text-left px-3 py-3 font-medium">Página</th>
            <th className="text-left px-3 py-3 font-medium">Status</th>
            <th className="text-right px-3 py-3 font-medium">
              <span className="inline-flex items-center gap-1"><Eye size={11} /> Views</span>
            </th>
            <th className="text-right px-3 py-3 font-medium">
              <span className="inline-flex items-center gap-1"><Users size={11} /> Leads</span>
            </th>
            <th className="text-right px-3 py-3 font-medium">
              <span className="inline-flex items-center gap-1"><TrendingUp size={11} /> Conv. 7d</span>
            </th>
            <th className="px-5 py-3 rounded-tr-xl" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {pages.map((page) => (
            <ClickableRow key={page.page_id} pageId={page.page_id}>
              {/* Coluna do checkbox — stopPropagation impede navegação ao clicar */}
              <td
                className="pl-5 py-3.5 w-10"
                onClick={e => { e.stopPropagation(); toggle(page.page_id) }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(page.page_id)}
                  onChange={() => toggle(page.page_id)}
                  className="accent-primary cursor-pointer"
                />
              </td>
              <td className="px-3 py-3.5">
                <p className="font-medium text-foreground">{page.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">/{page.slug}</p>
              </td>
              <td className="px-3 py-3.5">
                <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                  {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                </Badge>
              </td>
              <td className="px-3 py-3.5 text-right text-muted-foreground">{page.views_total ?? 0}</td>
              <td className="px-3 py-3.5 text-right text-muted-foreground">{page.leads_total ?? 0}</td>
              <td className="px-3 py-3.5 text-right font-semibold text-primary">{page.conversion_rate_7d ?? 0}%</td>
              <td className="px-3 py-3.5 text-right">
                <RowActions page={page} />
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </table>

      {/* Modal de confirmação — exclusão em lote */}
      {showBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !bulkDeleting && setShowBulkDelete(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <h3 className="font-semibold text-foreground">
                Excluir {selected.size} {selected.size === 1 ? 'página' : 'páginas'}?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Essa ação é irreversível. Todos os dados de visualizações e leads associados serão perdidos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkDelete(false)}
                disabled={bulkDeleting}
                className="flex-1 h-10 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 h-10 px-4 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bulkDeleting
                  ? <><Loader2 size={13} className="animate-spin" /> Excluindo...</>
                  : 'Excluir permanentemente'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
