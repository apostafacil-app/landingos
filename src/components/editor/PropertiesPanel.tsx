'use client'

import { useEffect, useState, useCallback } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

interface Props {
  editor: AnyEditor | null
}

const ANIMATIONS = [
  { value: 'none',            label: 'Sem efeito' },
  { value: 'gjs-fadeIn',      label: 'Aparecer' },
  { value: 'gjs-fadeInUp',    label: 'Subir' },
  { value: 'gjs-fadeInDown',  label: 'Descer' },
  { value: 'gjs-fadeInLeft',  label: 'Esquerda' },
  { value: 'gjs-fadeInRight', label: 'Direita' },
  { value: 'gjs-zoomIn',      label: 'Zoom In' },
  { value: 'gjs-bounceIn',    label: 'Pular' },
  { value: 'gjs-slideInUp',   label: 'Deslizar' },
]

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'SemiBold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
]

const GOOGLE_FONTS = [
  '', 'Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Poppins', 'Raleway',
  'Nunito', 'Source Sans 3', 'Playfair Display', 'Merriweather', 'Ubuntu',
  'Oswald', 'PT Sans', 'Work Sans', 'Quicksand', 'Josefin Sans',
  'DM Sans', 'Barlow', 'Noto Sans', 'Rubik', 'Mulish', 'Karla',
]

function px(val: string | undefined) {
  if (!val) return '0'
  return val.replace('px', '').replace('em', '').replace('rem', '') || '0'
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[#7bafd4] mb-1.5 font-medium">{children}</p>
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-4 pb-1">
      <span className="text-[10px] font-bold tracking-widest text-[#4a6b9a] uppercase">{label}</span>
    </div>
  )
}

function Divider() {
  return <div className="mx-4 my-1 h-px bg-[#1e3050]" />
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const safeVal = value?.startsWith('#') ? value : '#000000'
  return (
    <div className="px-4 py-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safeVal}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-8 rounded-lg border border-[#2a3d6b] cursor-pointer p-0.5 bg-transparent shrink-0"
        />
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs font-mono"
          maxLength={20}
        />
      </div>
    </div>
  )
}

function NumberField({ label, value, onChange, unit = 'px', min = 0, max = 9999, step = 1 }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; min?: number; max?: number; step?: number
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-1">
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs text-right"
        />
        <span className="text-[10px] text-[#4a6b9a] w-5 shrink-0">{unit}</span>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2">
      <span className="text-xs text-[#94b4d8]">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-[#253660]'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export function PropertiesPanel({ editor }: Props) {
  const [selected, setSelected]         = useState<AnyEditor | null>(null)
  const [styles, setStyles]             = useState<Record<string, string>>({})
  const [attrs, setAttrs]               = useState<Record<string, string>>({})
  const [activeTab, setActiveTab]       = useState<'estilos' | 'acao' | 'animacao'>('estilos')
  const [equalCorners, setEqualCorners] = useState(true)

  const refresh = useCallback((comp: AnyEditor | null) => {
    if (!comp) { setStyles({}); setAttrs({}); return }
    setStyles(comp.getStyle() ?? {})
    setAttrs(comp.get('attributes') ?? {})
  }, [])

  useEffect(() => {
    if (!editor) return
    const onSel   = (comp: AnyEditor) => { setSelected(comp); refresh(comp); setActiveTab('estilos') }
    const onDesel = () => { setSelected(null); setStyles({}); setAttrs({}) }
    const onStyle = () => { if (selected) refresh(selected) }
    editor.on('component:selected', onSel)
    editor.on('component:deselected', onDesel)
    editor.on('component:styleUpdate', onStyle)
    return () => {
      editor.off('component:selected', onSel)
      editor.off('component:deselected', onDesel)
      editor.off('component:styleUpdate', onStyle)
    }
  }, [editor, selected, refresh])

  // Style setter
  const set = useCallback((prop: string, value: string) => {
    if (!selected || !editor) return
    selected.addStyle({ [prop]: value })
    setStyles(p => ({ ...p, [prop]: value }))
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [selected, editor])

  // Attribute setter (for link href, target etc.)
  const setAttr = useCallback((key: string, value: string) => {
    if (!selected || !editor) return
    const current = selected.get('attributes') || {}
    const updated = { ...current, [key]: value }
    selected.set('attributes', updated)
    setAttrs(updated)
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [selected, editor])

  const g  = (prop: string, fallback = '') => styles[prop] ?? fallback
  const ga = (key: string, fallback = '') => attrs[key] ?? fallback

  // Hover CSS injection helper
  const injectHoverStyle = useCallback((cls: string | undefined, bg: string, color: string) => {
    if (!cls || !editor) return
    try {
      const doc = editor.Canvas.getDocument()
      if (!doc) return
      const styleId = `hover-style-${cls}`
      let el = doc.getElementById(styleId)
      if (!el) {
        el = doc.createElement('style')
        el.id = styleId
        doc.head.appendChild(el)
      }
      const rules: string[] = []
      if (bg) rules.push(`background-color:${bg}!important`)
      if (color) rules.push(`color:${color}!important`)
      el.textContent = `.${cls}:hover{${rules.join(';')}}`
    } catch { /* silent */ }
  }, [editor])

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!selected) {
    return (
      <div className="w-[280px] shrink-0 bg-[#131f38] border-l border-[#1e3050] flex flex-col">
        <div className="p-4 border-b border-[#1e3050]">
          <p className="text-[11px] font-bold text-[#7bafd4] uppercase tracking-widest">Propriedades</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1e3050] flex items-center justify-center text-xl opacity-60">✦</div>
          <p className="text-sm text-[#94b4d8] font-medium">Nenhum elemento</p>
          <p className="text-xs text-[#4a6b9a] leading-relaxed">Clique em qualquer elemento da página para editar suas propriedades</p>
        </div>
      </div>
    )
  }

  const compType = selected.get('type') || 'default'
  const isLink   = compType === 'link'

  // ── Tabs to show ─────────────────────────────────────────────────────────
  type Tab = { id: 'estilos' | 'acao' | 'animacao'; label: string }
  const tabs: Tab[] = [
    { id: 'estilos',  label: 'Estilos'  },
    ...(isLink ? [{ id: 'acao' as const, label: 'Ação' }] : []),
    { id: 'animacao', label: 'Animação' },
  ]

  // ── Border radius helpers ────────────────────────────────────────────────
  const brAll = px(g('border-radius', '0px'))
  const brTL  = px(g('border-top-left-radius',     g('border-radius', '0px')))
  const brTR  = px(g('border-top-right-radius',    g('border-radius', '0px')))
  const brBL  = px(g('border-bottom-left-radius',  g('border-radius', '0px')))
  const brBR  = px(g('border-bottom-right-radius', g('border-radius', '0px')))

  const setBR = (corner: string, val: string) => {
    if (equalCorners) {
      set('border-radius', val + 'px')
      set('border-top-left-radius',     val + 'px')
      set('border-top-right-radius',    val + 'px')
      set('border-bottom-left-radius',  val + 'px')
      set('border-bottom-right-radius', val + 'px')
    } else {
      set(corner, val + 'px')
    }
  }

  // ── Hover helpers ────────────────────────────────────────────────────────
  const hoverBg    = g('--hover-bg', '')
  const hoverColor = g('--hover-color', '')
  const cls0       = selected.getClasses?.()[0]

  return (
    <div className="w-[280px] shrink-0 bg-[#131f38] border-l border-[#1e3050] flex flex-col text-[#e2eaf6]">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-b border-[#1e3050] flex items-center justify-between shrink-0">
        <p className="text-[11px] font-bold text-[#7bafd4] uppercase tracking-widest">Propriedades</p>
        <span className="text-[10px] text-[#4a6b9a] bg-[#1e3050] px-2 py-0.5 rounded-full">{compType}</span>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#1e3050] shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-[11px] font-semibold transition-colors border-b-2 ${
              activeTab === t.id
                ? 'text-blue-400 border-blue-400 bg-[#0f1d36]'
                : 'text-[#4a6b9a] border-transparent hover:text-[#94b4d8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {/* ══════════════════ ESTILOS TAB ══════════════════ */}
        {activeTab === 'estilos' && (
          <>
            {/* COR */}
            <SectionHeader label="Cor" />
            <div className="px-4 space-y-1 pb-2">
              <ColorRow label="Cor do texto" value={g('color', '#000000')} onChange={v => set('color', v)} />
              <ColorRow label="Cor de fundo" value={g('background-color', '')} onChange={v => set('background-color', v)} />
              <div className="py-1.5">
                <Label>Opacidade</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range" min={0} max={1} step={0.05}
                    value={parseFloat(g('opacity', '1'))}
                    onChange={e => set('opacity', e.target.value)}
                    className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-[#c7d6f0] w-9 text-right tabular-nums shrink-0">
                    {Math.round(parseFloat(g('opacity', '1')) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <Divider />

            {/* TIPOGRAFIA */}
            <SectionHeader label="Tipografia" />
            <div className="px-4 space-y-2 pb-2">
              <div>
                <Label>Fonte</Label>
                <select
                  value={g('font-family', '').replace(/['"]/g, '').trim()}
                  onChange={e => {
                    const f = e.target.value
                    set('font-family', f ? `'${f}'` : '')
                    try {
                      const doc = editor.Canvas.getDocument()
                      if (doc && f) {
                        const id = `gfont-${f.replace(/\s/g, '-')}`
                        if (!doc.getElementById(id)) {
                          const link = doc.createElement('link')
                          link.id = id; link.rel = 'stylesheet'
                          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f)}:wght@300;400;500;600;700&display=swap`
                          doc.head.appendChild(link)
                        }
                      }
                    } catch { /* silent */ }
                  }}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="">— Padrão do sistema</option>
                  {GOOGLE_FONTS.filter(Boolean).map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Tamanho" value={px(g('font-size', '16px'))} onChange={v => set('font-size', v + 'px')} min={1} max={200} />
                <div>
                  <Label>Peso</Label>
                  <select value={g('font-weight', '400')} onChange={e => set('font-weight', e.target.value)}
                    className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
                  >
                    {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label>Alinhamento</Label>
                <div className="grid grid-cols-4 gap-1">
                  {(['left','center','right','justify'] as const).map((val, i) => {
                    const icons = ['←','↔','→','⬌']
                    const tips  = ['Esquerda','Centro','Direita','Justificado']
                    return (
                      <button key={val} title={tips[i]} onClick={() => set('text-align', val)}
                        className={`h-8 rounded text-sm font-medium transition-all border ${
                          g('text-align') === val
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-[#0f1d36] text-[#94b4d8] border-[#2a3d6b] hover:border-blue-400'
                        }`}
                      >{icons[i]}</button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Altura linha</Label>
                  <input type="number" min={0.5} max={5} step={0.1} value={g('line-height', '1.5')}
                    onChange={e => set('line-height', e.target.value)}
                    className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
                  />
                </div>
                <NumberField label="Espaç. letras" value={px(g('letter-spacing', '0px'))} onChange={v => set('letter-spacing', v + 'px')} min={-10} max={30} step={0.5} />
              </div>
            </div>

            <Divider />

            {/* ESPAÇAMENTO */}
            <SectionHeader label="Espaçamento" />
            <div className="px-4 pb-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Padding" value={px(g('padding', '0px'))} onChange={v => set('padding', v + 'px')} />
                <NumberField label="Margin" value={px(g('margin', '0px'))} onChange={v => set('margin', v + 'px')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Pad. topo" value={px(g('padding-top', '0px'))} onChange={v => set('padding-top', v + 'px')} />
                <NumberField label="Pad. base" value={px(g('padding-bottom', '0px'))} onChange={v => set('padding-bottom', v + 'px')} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Pad. esq." value={px(g('padding-left', '0px'))} onChange={v => set('padding-left', v + 'px')} />
                <NumberField label="Pad. dir." value={px(g('padding-right', '0px'))} onChange={v => set('padding-right', v + 'px')} />
              </div>
              <div>
                <Label>Largura</Label>
                <select value={g('width', 'auto')} onChange={e => set('width', e.target.value)}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="auto">Auto</option>
                  <option value="100%">100%</option>
                  <option value="75%">75%</option>
                  <option value="50%">50%</option>
                  <option value="25%">25%</option>
                </select>
              </div>
            </div>

            <Divider />

            {/* BORDA */}
            <SectionHeader label="Borda e Forma" />
            <div className="px-4 pb-2 space-y-2">
              {/* Border radius */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Arredondamento</Label>
                  <button
                    onClick={() => setEqualCorners(v => !v)}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      equalCorners ? 'bg-blue-500 border-blue-500 text-white' : 'border-[#2a3d6b] text-[#4a6b9a] hover:border-blue-400'
                    }`}
                  >
                    {equalCorners ? '⊞ Igual' : '⊟ Livre'}
                  </button>
                </div>
                {equalCorners ? (
                  <div className="flex items-center gap-1">
                    <input type="number" min={0} max={200} value={brAll}
                      onChange={e => setBR('border-radius', e.target.value)}
                      className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs text-right"
                    />
                    <span className="text-[10px] text-[#4a6b9a] w-5">px</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <NumberField label="↖ Topo esq." value={brTL} onChange={v => setBR('border-top-left-radius', v)} />
                    <NumberField label="↗ Topo dir." value={brTR} onChange={v => setBR('border-top-right-radius', v)} />
                    <NumberField label="↙ Base esq." value={brBL} onChange={v => setBR('border-bottom-left-radius', v)} />
                    <NumberField label="↘ Base dir." value={brBR} onChange={v => setBR('border-bottom-right-radius', v)} />
                  </div>
                )}
              </div>

              {/* Border */}
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Espessura borda" value={px(g('border-width', '0px'))} onChange={v => {
                  set('border-width', v + 'px')
                  if (!g('border-style')) set('border-style', 'solid')
                }} />
                <ColorRow label="Cor da borda" value={g('border-color', '#2563eb')} onChange={v => set('border-color', v)} />
              </div>

              {/* Shadow */}
              <div>
                <Label>Sombra</Label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { v: 'none',                                              l: 'Sem' },
                    { v: '0 2px 8px rgba(0,0,0,0.15)',                       l: 'Leve' },
                    { v: '0 4px 20px rgba(0,0,0,0.25)',                      l: 'Média' },
                    { v: '0 8px 40px rgba(0,0,0,0.4)',                       l: 'Forte' },
                  ].map(({ v, l }) => (
                    <button key={v} onClick={() => set('box-shadow', v)}
                      className={`h-8 rounded text-[10px] font-medium border transition-all ${
                        g('box-shadow', 'none') === v
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-[#0f1d36] text-[#94b4d8] border-[#2a3d6b] hover:border-blue-400'
                      }`}
                    >{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* HOVER */}
            <SectionHeader label="Hover (ao passar o mouse)" />
            <div className="px-4 pb-3 space-y-1">
              <ColorRow label="Fundo hover" value={hoverBg} onChange={v => {
                set('--hover-bg', v)
                injectHoverStyle(cls0, v, hoverColor)
              }} />
              <ColorRow label="Texto hover" value={hoverColor} onChange={v => {
                set('--hover-color', v)
                injectHoverStyle(cls0, hoverBg, v)
              }} />
            </div>
          </>
        )}

        {/* ══════════════════ AÇÃO TAB ══════════════════ */}
        {activeTab === 'acao' && isLink && (
          <>
            <SectionHeader label="Link do botão" />
            <div className="px-4 pb-3 space-y-3">
              {/* Link type */}
              <div>
                <Label>Tipo de link</Label>
                <select
                  value={ga('href', '').startsWith('#') ? 'ancora' : 'externo'}
                  onChange={e => {
                    if (e.target.value === 'ancora') {
                      setAttr('href', '#ancora')
                    } else {
                      setAttr('href', 'https://')
                    }
                  }}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="externo">🔗 Link externo (URL)</option>
                  <option value="ancora">⚓ Âncora (seção da página)</option>
                </select>
              </div>

              {/* URL field */}
              <div>
                <Label>
                  {ga('href', '').startsWith('#') ? 'ID da seção (ex: #contato)' : 'URL do link'}
                </Label>
                <input
                  type="text"
                  value={ga('href', '')}
                  onChange={e => setAttr('href', e.target.value)}
                  placeholder={ga('href', '').startsWith('#') ? '#nome-da-secao' : 'https://...'}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              {/* New tab toggle */}
              <div className="flex items-center justify-between py-1">
                <span className="text-xs text-[#94b4d8]">Abrir em nova aba</span>
                <button
                  onClick={() => setAttr('target', ga('target') === '_blank' ? '' : '_blank')}
                  className={`relative w-10 h-5 rounded-full transition-colors ${ga('target') === '_blank' ? 'bg-blue-500' : 'bg-[#253660]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ga('target') === '_blank' ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Rel noopener */}
              {ga('target') === '_blank' && (
                <p className="text-[10px] text-[#4a6b9a] bg-[#0f1d36] border border-[#1e3050] rounded-lg px-3 py-2 leading-relaxed">
                  💡 Ao abrir em nova aba, adicione <code className="text-blue-400">rel=&quot;noopener noreferrer&quot;</code> por segurança.
                </p>
              )}
            </div>

            <Divider />

            {/* TEXTO do botão (label) */}
            <SectionHeader label="Texto do botão" />
            <div className="px-4 pb-3">
              <Label>Edite o texto clicando duas vezes no botão no canvas</Label>
              <div className="bg-[#0f1d36] border border-[#1e3050] rounded-lg px-3 py-2.5 text-xs text-[#4a6b9a] leading-relaxed">
                💡 Dica: clique duas vezes no botão diretamente na página para editar o texto.
              </div>
            </div>
          </>
        )}

        {/* ══════════════════ ANIMAÇÃO TAB ══════════════════ */}
        {activeTab === 'animacao' && (
          <>
            <SectionHeader label="Tipo de animação" />
            <div className="px-4 pb-2">
              <div className="grid grid-cols-3 gap-1.5">
                {ANIMATIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => {
                    set('animation-name', value)
                    if (value !== 'none') {
                      if (!g('animation-duration')) set('animation-duration', '1s')
                      if (!g('animation-fill-mode')) set('animation-fill-mode', 'both')
                    }
                  }}
                    className={`h-10 rounded text-xs font-medium transition-all border ${
                      g('animation-name', 'none') === value
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-[#0f1d36] text-[#94b4d8] border-[#2a3d6b] hover:border-blue-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {g('animation-name', 'none') !== 'none' && (
              <>
                <Divider />
                <SectionHeader label="Configurações" />
                <div className="px-4 pb-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Velocidade</Label>
                      <span className="text-xs text-[#c7d6f0] tabular-nums">{g('animation-duration', '1s')}</span>
                    </div>
                    <input type="range" min={0.1} max={5} step={0.1}
                      value={parseFloat(g('animation-duration', '1s').replace('s',''))}
                      onChange={e => set('animation-duration', e.target.value + 's')}
                      className="w-full h-1.5 accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Atraso</Label>
                      <span className="text-xs text-[#c7d6f0] tabular-nums">{g('animation-delay', '0s')}</span>
                    </div>
                    <input type="range" min={0} max={3} step={0.1}
                      value={parseFloat(g('animation-delay', '0s').replace('s',''))}
                      onChange={e => set('animation-delay', e.target.value + 's')}
                      className="w-full h-1.5 accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label>Repetição</Label>
                    <select value={g('animation-iteration-count', '1')} onChange={e => set('animation-iteration-count', e.target.value)}
                      className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
                    >
                      <option value="1">1× (uma vez)</option>
                      <option value="2">2× (duas vezes)</option>
                      <option value="3">3× (três vezes)</option>
                      <option value="infinite">Infinito</option>
                    </select>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Bottom padding */}
        <div className="h-6" />
      </div>
    </div>
  )
}
