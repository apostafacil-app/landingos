'use client'

import { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import { updatePage, togglePublish } from './actions'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Monitor, Smartphone, Save, Globe, EyeOff,
  Check, Loader2, ExternalLink,
} from 'lucide-react'

interface Page {
  id: string
  name: string
  slug: string
  status: string
  html: string | null
  meta_title: string | null
  meta_description: string | null
  leads_total: number
  views_total: number
}

export function PageEditor({ page }: { page: Page }) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop')
  const [publishing, startPublish] = useTransition()
  const [state, action, saving] = useActionState(updatePage, undefined)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/paginas" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{page.name}</p>
            <p className="text-xs text-muted-foreground">/{page.slug}</p>
          </div>
          <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className="shrink-0">
            {page.status === 'published' ? 'Publicada' : 'Rascunho'}
          </Badge>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Viewport toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1.5 transition-colors ${viewport === 'desktop' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1.5 transition-colors ${viewport === 'mobile' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Smartphone size={15} />
            </button>
          </div>

          {/* Publish toggle */}
          <button
            onClick={() => startPublish(() => togglePublish(page.id, page.status))}
            disabled={publishing}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium transition-colors ${
              page.status === 'published'
                ? 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {publishing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : page.status === 'published' ? (
              <><EyeOff size={14} /> Despublicar</>
            ) : (
              <><Globe size={14} /> Publicar</>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="flex-1 bg-muted/30 flex items-start justify-center p-6 overflow-auto">
          {page.html ? (
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
              style={{ width: viewport === 'mobile' ? '390px' : '100%', minHeight: '600px' }}
            >
              <iframe
                srcDoc={page.html}
                className="w-full border-0"
                style={{ height: '800px' }}
                title="Preview da página"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-20">
              <p>Sem conteúdo gerado ainda.</p>
            </div>
          )}
        </div>

        {/* Settings panel */}
        <aside className="w-72 border-l border-border bg-background overflow-y-auto shrink-0">
          <div className="p-4 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 text-center">
                <p className="text-xl font-bold text-foreground">{page.views_total}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-xl font-bold text-primary">{page.leads_total}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </Card>
            </div>

            {/* Ver página publicada */}
            {page.status === 'published' && (
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink size={13} />
                Ver página publicada
              </a>
            )}

            {/* Form de configurações */}
            <form action={action} className="space-y-4">
              <input type="hidden" name="pageId" value={page.id} />

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nome da página</Label>
                <Input id="name" name="name" defaultValue={page.name} maxLength={100} className="h-8 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug" className="text-xs">Slug (URL)</Label>
                <div className="flex items-center border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring/50">
                  <span className="px-2 text-xs text-muted-foreground bg-muted border-r border-input h-8 flex items-center shrink-0">/</span>
                  <input
                    id="slug"
                    name="slug"
                    defaultValue={page.slug}
                    maxLength={60}
                    pattern="[a-z0-9-]+"
                    className="flex-1 px-2 h-8 text-sm bg-background text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="metaTitle" className="text-xs">Meta título (SEO)</Label>
                <Input id="metaTitle" name="metaTitle" defaultValue={page.meta_title ?? ''} maxLength={160} className="h-8 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="metaDescription" className="text-xs">Meta descrição (SEO)</Label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  defaultValue={page.meta_description ?? ''}
                  maxLength={320}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                />
              </div>

              {state?.error && (
                <p className="text-xs text-destructive bg-destructive/10 px-2 py-1.5 rounded-lg">
                  {state.error}
                </p>
              )}

              {state?.success && (
                <p className="text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                  <Check size={12} /> Salvo com sucesso
                </p>
              )}

              <Button type="submit" className="w-full h-8 text-sm" disabled={saving}>
                {saving ? (
                  <><Loader2 size={13} className="animate-spin mr-1.5" /> Salvando...</>
                ) : (
                  <><Save size={13} className="mr-1.5" /> Salvar alterações</>
                )}
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  )
}
