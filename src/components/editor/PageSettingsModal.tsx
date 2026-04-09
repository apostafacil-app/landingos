'use client'

import { useState, useTransition, useRef, useCallback } from 'react'
import {
  X, Search, Share2, Zap, Code2, Shield, Bell,
  Check, Loader2, ExternalLink, Upload, Trash2,
} from 'lucide-react'
import { updatePage } from '@/app/(app)/paginas/[id]/actions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

export interface PageFull {
  id: string
  name: string
  slug: string
  status: string
  html: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  favicon_url: string | null
  indexable: boolean | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  fb_pixel_id: string | null
  fb_api_token: string | null
  ga_id: string | null
  gtm_id: string | null
  head_code: string | null
  body_code: string | null
  lgpd_enabled: boolean | null
  lgpd_message: string | null
  notification_emails: string | null
  leads_total: number
  views_total: number
}

interface Props {
  page: PageFull
  open: boolean
  onClose: () => void
  onSaved: (updated: Partial<PageFull>) => void
  editor?: AnyEditor
}

type Section = 'seo' | 'social' | 'integrations' | 'code' | 'lgpd' | 'notifications'

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'seo',           label: 'Informações & SEO',   icon: <Search size={15} /> },
  { id: 'social',        label: 'Redes sociais',        icon: <Share2 size={15} /> },
  { id: 'integrations',  label: 'Integrações',          icon: <Zap size={15} /> },
  { id: 'code',          label: 'Javascript & CSS',     icon: <Code2 size={15} /> },
  { id: 'lgpd',          label: 'LGPD & GDPR',          icon: <Shield size={15} /> },
  { id: 'notifications', label: 'Notificações de leads',icon: <Bell size={15} /> },
]

export function PageSettingsModal({ page, open, onClose, onSaved }: Props) {
  const [section, setSection] = useState<Section>('seo')
  const [saving, startSave]   = useTransition()
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // ── Form state — mirrors all page fields ─────────────────────────────────
  const [name,               setName]               = useState(page.name)
  const [slug,               setSlug]               = useState(page.slug)
  const [metaTitle,          setMetaTitle]           = useState(page.meta_title          ?? '')
  const [metaDesc,           setMetaDesc]            = useState(page.meta_description    ?? '')
  const [metaKeywords,       setMetaKeywords]        = useState(page.meta_keywords       ?? '')
  const [faviconUrl,         setFaviconUrl]          = useState(page.favicon_url         ?? '')
  const [indexable,          setIndexable]           = useState(page.indexable !== false)
  const [ogTitle,            setOgTitle]             = useState(page.og_title            ?? '')
  const [ogDesc,             setOgDesc]              = useState(page.og_description      ?? '')
  const [ogImage,            setOgImage]             = useState(page.og_image_url        ?? '')
  const [fbPixelId,          setFbPixelId]           = useState(page.fb_pixel_id         ?? '')
  const [fbApiToken,         setFbApiToken]          = useState(page.fb_api_token        ?? '')
  const [gaId,               setGaId]                = useState(page.ga_id              ?? '')
  const [gtmId,              setGtmId]               = useState(page.gtm_id             ?? '')
  const [headCode,           setHeadCode]            = useState(page.head_code           ?? '')
  const [bodyCode,           setBodyCode]            = useState(page.body_code           ?? '')
  const [lgpdEnabled,        setLgpdEnabled]         = useState(page.lgpd_enabled        ?? false)
  const [lgpdMessage,        setLgpdMessage]         = useState(page.lgpd_message        ?? '')
  const [notifEmails,        setNotifEmails]         = useState(page.notification_emails ?? '')

  if (!open) return null

  const handleSave = () => {
    setError(null)
    setSaved(false)
    const fd = new FormData()
    fd.set('pageId',             page.id)
    fd.set('name',               name.trim() || page.name)
    fd.set('slug',               slug.trim() || page.slug)
    fd.set('metaTitle',          metaTitle)
    fd.set('metaDescription',    metaDesc)
    fd.set('metaKeywords',       metaKeywords)
    fd.set('faviconUrl',         faviconUrl)
    fd.set('indexable',          indexable ? 'true' : 'false')
    fd.set('ogTitle',            ogTitle)
    fd.set('ogDescription',      ogDesc)
    fd.set('ogImageUrl',         ogImage)
    fd.set('fbPixelId',          fbPixelId)
    fd.set('fbApiToken',         fbApiToken)
    fd.set('gaId',               gaId)
    fd.set('gtmId',              gtmId)
    fd.set('headCode',           headCode)
    fd.set('bodyCode',           bodyCode)
    fd.set('lgpdEnabled',        lgpdEnabled ? 'true' : 'false')
    fd.set('lgpdMessage',        lgpdMessage)
    fd.set('notificationEmails', notifEmails)

    startSave(async () => {
      const result = await updatePage(undefined, fd)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        onSaved({
          name:               name.trim() || page.name,
          slug:               slug.trim() || page.slug,
          meta_title:         metaTitle   || null,
          meta_description:   metaDesc    || null,
          meta_keywords:      metaKeywords || null,
          favicon_url:        faviconUrl  || null,
          indexable,
          og_title:           ogTitle     || null,
          og_description:     ogDesc      || null,
          og_image_url:       ogImage     || null,
          fb_pixel_id:        fbPixelId   || null,
          fb_api_token:       fbApiToken  || null,
          ga_id:              gaId        || null,
          gtm_id:             gtmId       || null,
          head_code:          headCode    || null,
          body_code:          bodyCode    || null,
          lgpd_enabled:       lgpdEnabled,
          lgpd_message:       lgpdMessage || null,
          notification_emails: notifEmails || null,
        })
        setTimeout(() => { setSaved(false); onClose() }, 800)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[820px] max-w-[96vw] h-[90vh] max-h-[640px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-semibold text-slate-800">Configurações da página</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">

          {/* Left nav */}
          <nav className="w-52 shrink-0 border-r border-slate-100 py-3 overflow-y-auto">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  section === s.id
                    ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 border-l-2 border-transparent'
                }`}
              >
                <span className={section === s.id ? 'text-blue-600' : 'text-slate-400'}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">

            {/* ── SEO ──────────────────────────────────────────────────── */}
            {section === 'seo' && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Informações & SEO</h3>
                  <p className="text-xs text-slate-500">Configure como esta página será exibida nos buscadores.</p>
                </div>

                <label className="flex items-center justify-between py-3 border-b border-slate-100 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Habilitar buscadores</p>
                    <p className="text-xs text-slate-500">Permitir que o Google e outros buscadores indexem esta página</p>
                  </div>
                  <Toggle value={indexable} onChange={setIndexable} />
                </label>

                <Field label="Nome da página" required>
                  <input value={name} onChange={e => setName(e.target.value)} maxLength={100}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                </Field>

                <Field label="Slug (URL)" hint={`/${slug}`}>
                  <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} maxLength={60}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-mono" />
                </Field>

                <Field label="Título da página (SEO)">
                  <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={160}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    placeholder="Ex: AposteMais — Automatize seus jogos na Loteria" />
                  <CharCount value={metaTitle} max={160} />
                </Field>

                <Field label="Descrição da página">
                  <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={320} rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                    placeholder="Breve descrição para o Google (até 160 caracteres idealmente)" />
                  <CharCount value={metaDesc} max={320} />
                </Field>

                <Field label="Palavras-chave">
                  <input value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} maxLength={500}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    placeholder="apostas, loteria, mega-sena (separadas por vírgula)" />
                </Field>

                <Field label="Favicon">
                  <FaviconUpload value={faviconUrl} onChange={setFaviconUrl} />
                </Field>
              </div>
            )}

            {/* ── Social ───────────────────────────────────────────────── */}
            {section === 'social' && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Redes sociais</h3>
                  <p className="text-xs text-slate-500">Controle como esta página aparece ao ser compartilhada no WhatsApp, Facebook, Instagram etc.</p>
                </div>

                <Field label="Título para compartilhamento (OG Title)">
                  <input value={ogTitle} onChange={e => setOgTitle(e.target.value)} maxLength={200}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    placeholder={metaTitle || page.name} />
                </Field>

                <Field label="Descrição para compartilhamento (OG Description)">
                  <textarea value={ogDesc} onChange={e => setOgDesc(e.target.value)} maxLength={500} rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                    placeholder={metaDesc || 'Texto exibido ao compartilhar o link nas redes sociais'} />
                </Field>

                <Field label="Imagem de compartilhamento (OG Image — URL)" hint="Ideal: 1200×630px">
                  <input value={ogImage} onChange={e => setOgImage(e.target.value)} maxLength={2000} type="url"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    placeholder="https://..." />
                  {ogImage && (
                    <img src={ogImage} alt="OG preview" className="mt-2 rounded-lg border border-slate-200 w-full max-h-40 object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  )}
                </Field>

                {/* Preview card */}
                {(ogTitle || metaTitle || ogImage) && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    {ogImage && <div className="h-32 bg-slate-200 overflow-hidden"><img src={ogImage} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display='none' }} /></div>}
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Prévia de compartilhamento</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{ogTitle || metaTitle || page.name}</p>
                      {(ogDesc || metaDesc) && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{ogDesc || metaDesc}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Integrations ─────────────────────────────────────────── */}
            {section === 'integrations' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Integrações</h3>
                  <p className="text-xs text-slate-500">Conecte ferramentas de análise e rastreamento de campanha.</p>
                </div>

                <IntegSection title="Facebook" icon="🎯">
                  <Field label="Pixel ID">
                    <input value={fbPixelId} onChange={e => setFbPixelId(e.target.value)} maxLength={100}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                      placeholder="123456789012345" />
                  </Field>
                  <Field label="Token da API de Conversões">
                    <input value={fbApiToken} onChange={e => setFbApiToken(e.target.value)} maxLength={500} type="password"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                      placeholder="EAAxxxxx..." />
                  </Field>
                </IntegSection>

                <IntegSection title="Google Analytics (GA4)" icon="📊">
                  <Field label="ID de Rastreamento">
                    <input value={gaId} onChange={e => setGaId(e.target.value)} maxLength={50}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                      placeholder="G-XXXXXXXXXX" />
                  </Field>
                </IntegSection>

                <IntegSection title="Google Tag Manager" icon="🏷️">
                  <Field label="ID do Contêiner GTM">
                    <input value={gtmId} onChange={e => setGtmId(e.target.value)} maxLength={50}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono"
                      placeholder="GTM-XXXXXXX" />
                  </Field>
                </IntegSection>
              </div>
            )}

            {/* ── Code ─────────────────────────────────────────────────── */}
            {section === 'code' && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Javascript & CSS</h3>
                  <p className="text-xs text-slate-500">Insira código customizado que será injetado na página publicada.</p>
                </div>

                <Field label="Código no &lt;head&gt;" hint="Scripts, meta tags, fontes customizadas">
                  <textarea value={headCode} onChange={e => setHeadCode(e.target.value)} maxLength={50000} rows={8}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none bg-slate-50"
                    placeholder={'<!-- Código inserido antes do </head> -->\n<script>/* seu código aqui */</script>'} />
                </Field>

                <Field label="Código no final do &lt;body&gt;" hint="Scripts de analytics, chat, tracking">
                  <textarea value={bodyCode} onChange={e => setBodyCode(e.target.value)} maxLength={50000} rows={8}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none bg-slate-50"
                    placeholder={'<!-- Código inserido antes do </body> -->\n<script>/* seu código aqui */</script>'} />
                </Field>
              </div>
            )}

            {/* ── LGPD ─────────────────────────────────────────────────── */}
            {section === 'lgpd' && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">LGPD & GDPR</h3>
                  <p className="text-xs text-slate-500">Exiba um banner de consentimento de cookies conforme a Lei Geral de Proteção de Dados.</p>
                </div>

                <label className="flex items-center justify-between py-3 border-b border-slate-100 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Exibir banner de cookies</p>
                    <p className="text-xs text-slate-500">Aparece na primeira visita — o usuário aceita e não vê novamente</p>
                  </div>
                  <Toggle value={lgpdEnabled} onChange={setLgpdEnabled} />
                </label>

                {lgpdEnabled && (
                  <Field label="Mensagem do banner">
                    <textarea value={lgpdMessage} onChange={e => setLgpdMessage(e.target.value)} maxLength={1000} rows={4}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                      placeholder="Este site usa cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade." />
                    <CharCount value={lgpdMessage} max={1000} />
                  </Field>
                )}

                {lgpdEnabled && (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-800 text-white text-sm">
                    <p className="font-medium mb-0.5 text-xs text-slate-400">Prévia do banner</p>
                    <div className="flex items-center justify-between gap-4 mt-2 flex-wrap">
                      <p className="text-xs text-slate-300 flex-1 leading-relaxed">
                        {lgpdMessage || 'Este site usa cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade.'}
                      </p>
                      <button className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shrink-0">
                        Aceitar e continuar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Notifications ─────────────────────────────────────────── */}
            {section === 'notifications' && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Notificações de leads</h3>
                  <p className="text-xs text-slate-500">Receba um e-mail sempre que um novo lead for capturado por esta página.</p>
                </div>

                <Field label="E-mails para notificação" hint="Separe múltiplos e-mails com vírgula">
                  <textarea value={notifEmails} onChange={e => setNotifEmails(e.target.value)} maxLength={2000} rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                    placeholder={'seuemail@exemplo.com, outro@exemplo.com'} />
                </Field>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
                  <p className="font-medium mb-1">📬 Como funciona</p>
                  <p>Ao receber um novo lead, você e os e-mails listados acima receberão uma notificação com nome, e-mail, telefone e fonte do lead.</p>
                </div>

                {page.leads_total > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-2xl font-bold text-blue-600">{page.leads_total}</div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">leads capturados no total</p>
                      <a href="/leads" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                        Ver todos os leads <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <p className="text-xs text-slate-400">
              {SECTIONS.find(s => s.id === section)?.label}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {saving  ? <Loader2 size={14} className="animate-spin" /> : null}
              {saved   ? <Check size={14} />                            : null}
              {saved ? 'Salvo!' : saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        {hint && <span className="font-normal text-slate-400 ml-1.5">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function CharCount({ value, max }: { value: string; max: number }) {
  const n = value.length
  return (
    <p className={`text-[10px] text-right mt-0.5 ${n > max * 0.9 ? 'text-amber-500' : 'text-slate-300'}`}>
      {n}/{max}
    </p>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${value ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function IntegSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <span>{icon}</span>{title}
      </p>
      {children}
    </div>
  )
}

// ── FaviconUpload ─────────────────────────────────────────────────────────────
// Accepts any image → resizes to 32×32 PNG client-side via Canvas → uploads to Storage

function FaviconUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resizeToBlob = useCallback((file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const canvas = document.createElement('canvas')
        canvas.width  = 32
        canvas.height = 32
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas unavailable'))
        // Fill transparent background white (optional)
        ctx.clearRect(0, 0, 32, 32)
        // Draw scaled image maintaining aspect ratio centered
        const scale = Math.min(32 / img.naturalWidth, 32 / img.naturalHeight)
        const w = img.naturalWidth  * scale
        const h = img.naturalHeight * scale
        const x = (32 - w) / 2
        const y = (32 - h) / 2
        ctx.drawImage(img, x, y, w, h)
        canvas.toBlob(blob => {
          if (blob) resolve(blob)
          else reject(new Error('Conversão falhou'))
        }, 'image/png', 1.0)
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')) }
      img.src = url
    })
  }, [])

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      // SVG: skip resize, upload as-is
      let blob: Blob
      let filename: string
      if (file.type === 'image/svg+xml') {
        blob     = file
        filename = 'favicon.svg'
      } else {
        blob     = await resizeToBlob(file)
        filename = 'favicon.png'
      }

      const fd = new FormData()
      fd.append('file', blob, filename)
      const res = await fetch('/api/upload/favicon', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Erro no upload')
      onChange(json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setUploading(false)
    }
  }, [resizeToBlob, onChange])

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 shrink-0 overflow-hidden">
        {value ? (
          <img src={value} alt="favicon" className="w-8 h-8 object-contain" />
        ) : (
          <span className="text-[10px] text-slate-400 text-center leading-tight px-1">sem ícone</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/x-icon"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
          >
            {uploading
              ? <Loader2 size={12} className="animate-spin" />
              : <Upload size={12} />}
            {uploading ? 'Enviando…' : 'Escolher imagem'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={12} /> Remover
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-400">
          PNG, JPG, SVG ou WebP — redimensionado automaticamente para 32×32 px
        </p>
        <p className="text-[10px] text-amber-500">
          ⚠ O favicon aparece na aba do navegador somente após a página ser publicada
        </p>
        {error && <p className="text-[10px] text-red-500">{error}</p>}
      </div>
    </div>
  )
}
