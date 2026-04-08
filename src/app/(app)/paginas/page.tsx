import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { PagesList } from './_pages-list'

const PAGE_SIZE = 20

export default async function PaginasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Middleware já garante que o usuário está autenticado nesta rota
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Usar notFound() em vez de redirect() — não quebra o re-render pós server action
  if (!member?.workspace_id) notFound()

  /* 8.2 — Paginação server-side: só busca 20 registros por vez */
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  const [{ count: total }, { data: pages }] = await Promise.all([
    supabase
      .from('page_metrics')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', member?.workspace_id),
    supabase
      .from('page_metrics')
      .select('*')
      .eq('workspace_id', member?.workspace_id)
      .order('leads_total', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
  ])

  const totalCount = total ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Páginas" subtitle="Gerencie e acompanhe suas landing pages" />

      <div className="p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} página{totalCount !== 1 ? 's' : ''} criada{totalCount !== 1 ? 's' : ''}
          </p>
          <Link
            href="/paginas/nova"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nova página
          </Link>
        </div>

        {!pages || pages.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
              <FileText size={30} className="text-primary/50" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Nenhuma página ainda</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Crie sua primeira landing page com IA em menos de 2 minutos.
            </p>
            <Link
              href="/paginas/nova"
              className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={15} />
              Criar com IA
            </Link>
          </div>
        ) : (
          <>
            <PagesList pages={pages ?? []} />

            {/* 8.2 — Paginação: só aparece se houver mais de uma página */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-[#f9fafb]">
                <p className="text-xs text-muted-foreground">
                  Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, totalCount)} de {totalCount}
                </p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`?page=${page - 1}`}
                    aria-disabled={!hasPrev}
                    className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                      hasPrev
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground/40 pointer-events-none'
                    }`}
                  >
                    <ChevronLeft size={13} /> Anterior
                  </Link>

                  <span className="text-xs text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>

                  <Link
                    href={`?page=${page + 1}`}
                    aria-disabled={!hasNext}
                    className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                      hasNext
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground/40 pointer-events-none'
                    }`}
                  >
                    Próxima <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
