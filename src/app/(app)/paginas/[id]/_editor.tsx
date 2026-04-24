'use client'

import { useRef, useState, useTransition, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { updatePage, togglePublish, saveHtml } from './actions'
import type { LandingEditorHandle } from '@/components/editor/LandingEditor'
import { PropertiesPanelV3 } from '@/components/editor/v3/PropertiesPanelV3'
import { BlocksModal } from '@/components/editor/BlocksModal'
import { PageSettingsModal, type PageFull } from '@/components/editor/PageSettingsModal'
import { LayersPanel } from '@/components/editor/LayersPanel'
import {
  ArrowLeft, Monitor, Smartphone, Globe, EyeOff,
  Undo2, Redo2, Settings2, Pencil, Loader2,
  ExternalLink, LayoutGrid, Type, Heading1, MousePointer2,
  ImageIcon, Video, Minus, Code2, ListOrdered, Layers,
} from 'lucide-react'

// V3: arquitetura GreatPages-style — sem iframe, canvas direto no documento.
// Blocos empilhados verticalmente, elementos absolutamente posicionados dentro.
// Drag/resize via react-moveable (biblioteca profissional).
const LandingEditorDynamic = dynamic(
  () => import('@/components/editor/v3/LandingEditorV3').then(m => m.LandingEditor),
  { ssr: false, loading: () => <EditorSkeleton /> },
)

export function PageEditor({ page: initialPage }: { page: PageFull }) {
  const [page, setPage]            = useState<PageFull>(initialPage)
  const [viewport, setViewport]    = useState<'Desktop' | 'Mobile'>('Desktop')
  const [publishing, startPublish] = useTransition()
  const [saveStatus, setSaveStatus]= useState<'idle' | 'saving' | 'saved'>('idle')
  const [blocksOpen, setBlocksOpen]   = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [layersOpen, setLayersOpen]   = useState(false)

  const editorRef = useRef<LandingEditorHandle>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editorApi, setEditorApi] = useState<any>(null)

  // Subscribe to 'blocks:open' fired by the canvas toolbar "+ seção" button
  useEffect(() => {
    if (!editorApi) return
    const handler = () => setBlocksOpen(true)
    editorApi.on('blocks:open', handler)
    return () => editorApi.off('blocks:open', handler)
  }, [editorApi])

  // ── Inline rename ──────────────────────────────────────────────────────────
  const [editingName, setEditingName] = useState(false)
  const [nameValue,   setNameValue]   = useState(page.name)
  const [nameSaving,  setNameSaving]  = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editingName) nameInputRef.current?.select() }, [editingName])

  const saveName = useCallback(async () => {
    const trimmed = nameValue.trim()
    if (!trimmed || trimmed === page.name) { setEditingName(false); setNameValue(page.name); return }
    setNameSaving(true)
    const fd = new FormData()
    fd.set('pageId',             page.id)
    fd.set('name',               trimmed)
    fd.set('slug',               page.slug)
    fd.set('metaTitle',          page.meta_title          ?? '')
    fd.set('metaDescription',    page.meta_description    ?? '')
    fd.set('metaKeywords',       page.meta_keywords       ?? '')
    fd.set('faviconUrl',         page.favicon_url         ?? '')
    fd.set('indexable',          page.indexable === false ? 'false' : 'true')
    fd.set('ogTitle',            page.og_title            ?? '')
    fd.set('ogDescription',      page.og_description      ?? '')
    fd.set('ogImageUrl',         page.og_image_url        ?? '')
    fd.set('fbPixelId',          page.fb_pixel_id         ?? '')
    fd.set('fbApiToken',         page.fb_api_token        ?? '')
    fd.set('gaId',               page.ga_id               ?? '')
    fd.set('gtmId',              page.gtm_id              ?? '')
    fd.set('headCode',           page.head_code           ?? '')
    fd.set('bodyCode',           page.body_code           ?? '')
    fd.set('lgpdEnabled',        page.lgpd_enabled        ? 'true' : 'false')
    fd.set('lgpdMessage',        page.lgpd_message        ?? '')
    fd.set('notificationEmails', page.notification_emails ?? '')
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

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const handleAutoSave = useCallback(async (html: string) => {
    await saveHtml(page.id, html)
  }, [page.id])

  // ── Viewport ───────────────────────────────────────────────────────────────
  const handleViewport = (v: 'Desktop' | 'Mobile') => {
    setViewport(v)
    editorRef.current?.setDevice(v)
  }

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = () => {
    startPublish(async () => {
      await togglePublish(page.id, page.status)
      setPage(p => ({ ...p, status: p.status === 'published' ? 'draft' : 'published' }))
    })
  }

  const isPublished = page.status === 'published'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="h-12 border-b border-[#253660] bg-[#1a2744] flex items-center justify-between px-3 shrink-0 gap-2">

        {/* Left: back + name + badge */}
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/paginas" className="text-[#94b4d8] hover:text-white transition-colors shrink-0 p-1 rounded hover:bg-white/10">
            <ArrowLeft size={16} />
          </Link>

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

          <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium ${
            isPublished ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
          }`}>
            {isPublished ? 'Publicada' : 'Rascunho'}
          </span>
        </div>

        {/* Center: viewport + undo/redo + save status */}
        <div className="flex items-center gap-1">
          {(['Desktop', 'Mobile'] as const).map(v => (
            <button
              key={v}
              onClick={() => handleViewport(v)}
              title={v}
              className={`p-2 rounded-lg transition-colors ${viewport === v ? 'bg-[#253660] text-white' : 'text-[#4a6b9a] hover:bg-[#1e3050] hover:text-white'}`}
            >
              {v === 'Desktop' ? <Monitor size={15} /> : <Smartphone size={15} />}
            </button>
          ))}

          <div className="w-px h-5 bg-[#253660] mx-1" />

          <button onClick={() => editorRef.current?.undo()} title="Desfazer (Ctrl+Z)"
            className="p-2 rounded-lg text-[#4a6b9a] hover:bg-[#1e3050] hover:text-white transition-colors">
            <Undo2 size={15} />
          </button>
          <button onClick={() => editorRef.current?.redo()} title="Refazer (Ctrl+Y)"
            className="p-2 rounded-lg text-[#4a6b9a] hover:bg-[#1e3050] hover:text-white transition-colors">
            <Redo2 size={15} />
          </button>

          <div className="w-px h-5 bg-[#253660] mx-1" />

          <span className="text-[11px] text-[#4a6b9a] min-w-[60px] text-center">
            {saveStatus === 'saving' ? 'Salvando…' : saveStatus === 'saved' ? '✓ Salvo' : ''}
          </span>
        </div>

        {/* Right: settings + preview + publish */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettingsOpen(true)}
            title="Configurações da página"
            className="p-2 rounded-lg text-[#4a6b9a] hover:bg-[#1e3050] hover:text-white transition-colors"
          >
            <Settings2 size={16} />
          </button>

          {isPublished && (
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver página publicada"
              className="p-2 rounded-lg text-[#4a6b9a] hover:bg-[#1e3050] hover:text-white transition-colors"
            >
              <ExternalLink size={15} />
            </a>
          )}

          <button
            onClick={handlePublish}
            disabled={publishing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isPublished
                ? 'bg-slate-600 hover:bg-slate-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            } disabled:opacity-60`}
          >
            {publishing ? <Loader2 size={12} className="animate-spin" /> : isPublished ? <EyeOff size={12} /> : <Globe size={12} />}
            {isPublished ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* ── Editor area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* Left icon strip */}
        <div className="w-10 bg-[#1a2744] border-r border-[#253660] flex flex-col items-center py-2 gap-1 shrink-0">
          <button
            onClick={() => setBlocksOpen(true)}
            disabled={!editorApi}
            title={editorApi ? 'Blocos e seções' : 'Carregando editor…'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              editorApi
                ? 'text-[#94b4d8] hover:bg-[#1e3050] hover:text-white cursor-pointer'
                : 'text-[#2d4275] cursor-not-allowed'
            }`}
          >
            <LayoutGrid size={17} />
          </button>

          <button
            onClick={() => setLayersOpen(l => !l)}
            disabled={!editorApi}
            title={editorApi ? 'Camadas da página' : 'Carregando editor…'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
              layersOpen
                ? 'bg-[#253660] text-white'
                : editorApi
                  ? 'text-[#94b4d8] hover:bg-[#1e3050] hover:text-white cursor-pointer'
                  : 'text-[#2d4275] cursor-not-allowed'
            }`}
          >
            <Layers size={16} />
          </button>

          <div className="w-6 h-px bg-[#1e3050] my-1" />

          {([
            { icon: <Heading1 size={16} />,      label: 'Título',  fn: () => editorApi?.insertElement('titulo') },
            { icon: <Type size={16} />,          label: 'Texto',   fn: () => editorApi?.insertElement('texto') },
            { icon: <MousePointer2 size={16} />, label: 'Botão',   fn: () => editorApi?.insertElement('botao') },
            { icon: <ImageIcon size={16} />,     label: 'Imagem',  fn: () => editorApi?.insertElement('imagem') },
            { icon: <Video size={16} />,         label: 'Vídeo',   fn: () => editorApi?.insertElement('video') },
            { icon: <Minus size={16} />,         label: 'Caixa',   fn: () => editorApi?.insertElement('caixa') },
            { icon: <ListOrdered size={16} />,   label: 'Círculo', fn: () => editorApi?.insertElement('circulo') },
            { icon: <Code2 size={16} />,         label: 'Ícone',   fn: () => editorApi?.insertElement('icone') },
          ] as { icon: React.ReactNode; label: string; fn: () => void }[]).map(({ icon, label, fn }) => (
            <button key={label} onClick={fn} title={label}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#94b4d8] hover:bg-[#1e3050] hover:text-white transition-colors">
              {icon}
            </button>
          ))}
        </div>

        {/* Layers panel (slides in between strip and canvas) */}
        {layersOpen && (
          <LayersPanel
            editor={editorApi}
            onClose={() => setLayersOpen(false)}
          />
        )}

        {/* Canvas */}
        <div className="flex-1 relative min-h-0">
          <LandingEditorDynamic
            ref={editorRef}
            initialHtml={page.html}
            onAutoSave={handleAutoSave}
            onSaveStatus={setSaveStatus}
            onEditorReady={setEditorApi}
          />
        </div>

        {/* Right: Properties panel V3 */}
        <PropertiesPanelV3 editor={editorApi} />
      </div>

      {/* ── Blocks modal ─────────────────────────────────────────────────── */}
      <BlocksModal editor={editorApi} open={blocksOpen} onClose={() => setBlocksOpen(false)} />

      {/* ── Settings modal ───────────────────────────────────────────────── */}
      <PageSettingsModal
        page={page}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={(updated) => {
          setPage(p => ({ ...p, ...updated }))
          setNameValue(prev => updated.name ?? prev)
        }}
      />
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
