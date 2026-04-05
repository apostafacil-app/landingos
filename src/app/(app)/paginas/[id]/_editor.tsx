'use client'

import { useRef, useState, useTransition, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { updatePage, togglePublish, saveHtml } from './actions'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { GrapesEditorHandle } from '@/components/editor/GrapesEditor'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { BlocksModal } from '@/components/editor/BlocksModal'
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Globe,
  EyeOff,
  Undo2,
  Redo2,
  Settings2,
  Pencil,
  X,
  Check,
  Loader2,
  Save,
  ExternalLink,
  LayoutGrid,
  Type,
  Heading1,
  MousePointer2,
  ImageIcon,
  Video,
  Minus,
  Code2,
  ListOrdered,
} from 'lucide-react'

// Dynamic import — GrapesJS is browser-only
const GrapesEditorDynamic = dynamic(
  () => import('@/components/editor/GrapesEditor').then((m) => m.GrapesEditor),
  { ssr: false, loading: () => <EditorSkeleton /> }
)

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

export function PageEditor({ page: initialPage }: { page: Page }) {
  const [page, setPage] = useState(initialPage)
  const [viewport, setViewport] = useState<'Desktop' | 'Mobile'>('Desktop')
  const [publishing, startPublish] = useTransition()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [settingsState, setSettingsState] = useState<{ error?: string; success?: boolean }>()
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [blocksOpen, setBlocksOpen] = useState(false)

  // ── Inline rename state ───────────────────────────────────────────────
  const [editingName, setEditingName]     = useState(false)
  const [nameValue, setNameValue]         = useState(page.name)
  const [nameSaving, setNameSaving]       = useState(false)
  const nameInputRef                      = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingName) nameInputRef.current?.select() }, [editingName])

  const saveName = useCallback(async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === page.name) { setEditingName(false); setNameValue(page.name); return }
    setNameSaving(true)
    const fd = new FormData()
    fd.set('pageId', page.id)
    fd.set('name', trimmed)
    fd.set('slug', page.slug)
    fd.set('metaTitle', page.meta_title ?? '')
    fd.set('metaDescription', page.meta_description ?? '')
    const result = await updatePage(undefined, fd)
    setNameSaving(false)
    if (result?.success || !result?.error) {
      setPage(p => ({ ...p, name: trimmed }))
    } else {
      setNameValue(page.name)
    }
    setEditingName(false)
  }, [nameValue, page])

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  { e.preventDefault(); saveName() }
    if (e.key === 'Escape') { setEditingName(false); setNameValue(page.name) }
  }

  const gjsRef = useRef<GrapesEditorHandle>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gjsEditor, setGjsEditor] = useState<any>(null)

  // Auto-save callback from GrapesJS (debounced 2.5s)
  const handleAutoSave = useCallback(async (html: string) => {
    await saveHtml(page.id, html)
  }, [page.id])

  // Viewport toggle — synced with GrapesJS device manager
  const handleViewport = (v: 'Desktop' | 'Mobile') => {
    setViewport(v)
    gjsRef.current?.setDevice(v)
  }

  // Publish/unpublish
  const handlePublish = () => {
    startPublish(async () => {
      await togglePublish(page.id, page.status)
      setPage(p => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))
    })
  }

  // Settings form submit
  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSettingsSaving(true)
    setSettingsState(undefined)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('pageId', page.id)
    const result = await updatePage(undefined, formData)
    setSettingsSaving(false)
    setSettingsState(result)
    if (result?.success) {
      const newName = formData.get('name') as string
      const newSlug = formData.get('slug') as string
      setPage(p => ({ ...p, name: newName, slug: newSlug }))
    }
  }

  const isPublished = page.status === 'published'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="h-12 border-b border-[#253660] bg-[#1a2744] flex items-center justify-between px-3 shrink-0 gap-2">
        {/* Left: back + name + status */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/paginas"
            className="text-[#94b4d8] hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-white/10"
          >
            <ArrowLeft size={16} />
          </Link>
          {/* ── Inline page name ─────────────────────────────── */}
          <div className="min-w-0 hidden sm:block">
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                onBlur={saveName}
                onKeyDown={handleNameKeyDown}
                disabled={nameSaving}
                maxLength={100}
                className="text-sm font-semibold text-white bg-white/10 border border-[#60a5fa] rounded px-2 py-0.5 outline-none w-[180px] truncate disabled:opacity-60"
              />
            ) : (
              <button
                onClick={() => setEditingName(true)}
                title="Clique para renomear"
                className="group flex items-center gap-1.5 text-sm font-semibold text-white truncate max-w-[200px] hover:text-[#60a5fa] transition-colors"
              >
                <span className="truncate">{page.name}</span>
                <Pencil size={11} className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
            )}
          </div>
          <Badge
            variant={isPublished ? 'default' : 'secondary'}
            className="shrink-0 text-[11px] h-5"
          >
            {isPublished ? 'Publicada' : 'Rascunho'}
          </Badge>
        </div>

        {/* Center: viewport + undo/redo + save status */}
        <div className="flex items-center gap-1">
          {/* Viewport toggle */}
          <div className="flex border border-[#2a3d6b] rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewport('Desktop')}
              title="Desktop"
              className={`px-2 py-1.5 transition-colors ${viewport === 'Desktop' ? 'bg-blue-600 text-white' : 'text-[#94b4d8] hover:text-white'}`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => handleViewport('Mobile')}
              title="Mobile"
              className={`px-2 py-1.5 transition-colors ${viewport === 'Mobile' ? 'bg-blue-600 text-white' : 'text-[#94b4d8] hover:text-white'}`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Undo / Redo */}
          <button
            onClick={() => gjsRef.current?.undo()}
            title="Desfazer (Ctrl+Z)"
            className="p-1.5 rounded text-[#94b4d8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={() => gjsRef.current?.redo()}
            title="Refazer (Ctrl+Y)"
            className="p-1.5 rounded text-[#94b4d8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Redo2 size={14} />
          </button>

          {/* Save status indicator */}
          <span className="text-[11px] px-2 text-[#60a5fa] min-w-[70px] text-center">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Salvando…</span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400"><Check size={10} /> Salvo</span>
            )}
          </span>
        </div>

        {/* Right: settings + preview + publish */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            title="Configurações da página"
            className="p-1.5 rounded text-[#94b4d8] hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings2 size={15} />
          </button>

          {/* View published page */}
          {isPublished && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver página publicada"
              className="p-1.5 rounded text-[#94b4d8] hover:text-white hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}

          {/* Publish button */}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-semibold transition-colors ${
              isPublished
                ? 'bg-white/10 text-[#94b4d8] hover:bg-red-500/20 hover:text-red-300'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {publishing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isPublished ? (
              <><EyeOff size={12} /> Despublicar</>
            ) : (
              <><Globe size={12} /> Publicar</>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor area ────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ── Left: Icon strip (like GreatPages) ───────────────── */}
        <div className="shrink-0 w-12 bg-[#131f38] border-r border-[#1e3050] flex flex-col items-center py-2 gap-0.5">

          {/* Blocks icon — opens modal (disabled until editor ready) */}
          <button
            onClick={() => gjsEditor && setBlocksOpen(true)}
            title={gjsEditor ? 'Blocos e seções' : 'Carregando editor…'}
            disabled={!gjsEditor}
            className={`w-9 h-9 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors ${
              gjsEditor
                ? 'text-[#60a5fa] hover:bg-[#1e3050] hover:text-white cursor-pointer'
                : 'text-[#2d4275] cursor-not-allowed'
            }`}
          >
            <LayoutGrid size={17} />
          </button>

          <div className="w-6 h-px bg-[#1e3050] my-1" />

          {/* Individual elements */}
          {([
            { icon: <Type size={16} />,            label: 'Texto',   fn: () => gjsEditor?.addComponents('<p style="padding:10px 16px;font-size:16px;color:#1e293b;">Clique para editar o texto</p>') },
            { icon: <Heading1 size={16} />,         label: 'Título',  fn: () => gjsEditor?.addComponents('<h2 style="padding:10px 16px;font-size:32px;font-weight:700;color:#0f172a;">Seu Título Aqui</h2>') },
            { icon: <MousePointer2 size={16} />,    label: 'Botão',   fn: () => gjsEditor?.runCommand('core:component-add', { component: { type: 'link', content: 'Clique aqui', attributes: { href: '#' }, style: { display:'inline-block', background:'#2563eb', color:'#fff', padding:'12px 28px', borderRadius:'8px', fontWeight:'700', textDecoration:'none', fontSize:'16px' } } }) },
            { icon: <ImageIcon size={16} />,        label: 'Imagem',  fn: () => gjsEditor?.addComponents('<img src="https://placehold.co/600x300/e2e8f0/94a3b8?text=Sua+Imagem" style="width:100%;max-width:600px;height:auto;display:block;border-radius:8px;" />') },
            { icon: <Video size={16} />,            label: 'Vídeo',   fn: () => gjsEditor?.addComponents('<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;"><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>') },
            { icon: <Minus size={16} />,            label: 'Divisor', fn: () => gjsEditor?.addComponents('<hr style="border:none;border-top:2px solid #e2e8f0;margin:24px 0;" />') },
            { icon: <ListOrdered size={16} />,      label: 'Lista',   fn: () => gjsEditor?.addComponents('<ul style="padding:10px 16px 10px 36px;font-size:15px;color:#334155;line-height:2;"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>') },
            { icon: <Code2 size={16} />,            label: 'HTML',    fn: () => gjsEditor?.addComponents('<div><!-- Insira seu HTML aqui --></div>') },
          ] as { icon: React.ReactNode; label: string; fn: () => void }[]).map(({ icon, label, fn }) => (
            <button
              key={label}
              onClick={fn}
              title={label}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#94b4d8] hover:bg-[#1e3050] hover:text-white transition-colors"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* ── Canvas ───────────────────────────────────────────── */}
        <div className="flex-1 relative min-h-0">
          <GrapesEditorDynamic
            ref={gjsRef}
            initialHtml={page.html}
            onAutoSave={handleAutoSave}
            onSaveStatus={setSaveStatus}
            onEditorReady={setGjsEditor}
          />
        </div>

        {/* ── Right: Properties panel ──────────────────────────── */}
        <PropertiesPanel editor={gjsEditor} />
      </div>

      {/* ── Blocks modal (opens on LayoutGrid click) ──────────── */}
      <BlocksModal
        editor={gjsEditor}
        open={blocksOpen}
        onClose={() => setBlocksOpen(false)}
      />

      {/* ── Settings slide-in panel ──────────────────────────────── */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-80 bg-white shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-sm">Configurações da página</h3>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3 border-b border-border">
              <div className="bg-[#f8fafc] rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-foreground">{page.views_total}</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="bg-[#f8fafc] rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-primary">{page.leads_total}</p>
                <p className="text-xs text-muted-foreground">Leads</p>
              </div>
            </div>

            {isPublished && (
              <div className="px-5 py-3 border-b border-border">
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <ExternalLink size={12} />
                  Ver página publicada
                </a>
              </div>
            )}

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-5">
              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Nome da página</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={page.name}
                    maxLength={100}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slug" className="text-xs">Slug (URL)</Label>
                  <div className="flex items-center border border-input rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring/50">
                    <span className="px-2 text-xs text-muted-foreground bg-muted border-r border-input h-10 flex items-center shrink-0">/</span>
                    <input
                      id="slug"
                      name="slug"
                      defaultValue={page.slug}
                      maxLength={60}
                      pattern="[a-z0-9-]+"
                      className="flex-1 px-2 h-10 text-sm bg-background text-foreground outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="metaTitle" className="text-xs">Meta título (SEO)</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    defaultValue={page.meta_title ?? ''}
                    maxLength={160}
                    className="h-10 text-sm"
                  />
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

                {settingsState?.error && (
                  <p className="text-xs text-destructive bg-destructive/10 px-2 py-1.5 rounded-lg">
                    {settingsState.error}
                  </p>
                )}
                {settingsState?.success && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Check size={12} /> Salvo com sucesso
                  </p>
                )}

                <Button type="submit" className="w-full h-10 text-sm" disabled={settingsSaving}>
                  {settingsSaving ? (
                    <><Loader2 size={13} className="animate-spin mr-1.5" /> Salvando…</>
                  ) : (
                    <><Save size={13} className="mr-1.5" /> Salvar</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditorSkeleton() {
  return (
    <div className="flex h-full bg-[#1a2744] items-center justify-center">
      <div className="text-center text-[#60a5fa]">
        <Loader2 size={32} className="animate-spin mx-auto mb-3" />
        <p className="text-sm">Carregando editor…</p>
      </div>
    </div>
  )
}
