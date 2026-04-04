'use client'

import { useEffect, useState, useCallback } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

interface Props {
  editor: AnyEditor | null
}

const ANIMATIONS = [
  { value: 'none', label: 'Sem efeito' },
  { value: 'gjs-fadeIn', label: 'Aparecer' },
  { value: 'gjs-fadeInUp', label: 'Subir' },
  { value: 'gjs-fadeInDown', label: 'Descer' },
  { value: 'gjs-fadeInLeft', label: 'Da esquerda' },
  { value: 'gjs-fadeInRight', label: 'Da direita' },
  { value: 'gjs-zoomIn', label: 'Zoom In' },
  { value: 'gjs-bounceIn', label: 'Pular' },
  { value: 'gjs-slideInUp', label: 'Deslizar' },
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
  'Oswald', 'PT Sans', 'Mukta', 'Work Sans', 'Quicksand', 'Josefin Sans',
  'DM Sans', 'Barlow', 'Noto Sans', 'Rubik', 'Mulish', 'Karla',
]

function px(val: string | undefined) {
  if (!val) return '0'
  return val.replace('px', '').replace('em', '').replace('rem', '') || '0'
}

function SectionHeader({ label, collapsed, onToggle }: { label: string; collapsed?: boolean; onToggle?: () => void }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border-b border-[#253660] ${onToggle ? 'cursor-pointer select-none' : ''}`}
      onClick={onToggle}
    >
      <span className="text-[11px] font-semibold tracking-wider text-[#7bafd4] uppercase">{label}</span>
      {onToggle && (
        <span className="text-[#4a6b9a] text-xs">{collapsed ? '▸' : '▾'}</span>
      )}
    </div>
  )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const safeVal = value || '#000000'
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-xs text-[#94b4d8] w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <div className="relative">
          <input
            type="color"
            value={safeVal.startsWith('#') ? safeVal : '#000000'}
            onChange={e => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border-2 border-[#2a3d6b] cursor-pointer p-0.5 bg-transparent"
            style={{ appearance: 'none' }}
          />
        </div>
        <input
          type="text"
          value={safeVal}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs font-mono"
          maxLength={20}
        />
      </div>
    </div>
  )
}

function NumberRow({ label, value, onChange, unit = 'px', min = 0, max = 9999, step = 1 }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; min?: number; max?: number; step?: number
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="text-xs text-[#94b4d8] w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 flex-1">
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs text-right"
        />
        <span className="text-xs text-[#4a6b9a] w-6">{unit}</span>
      </div>
    </div>
  )
}

export function PropertiesPanel({ editor }: Props) {
  const [selected, setSelected] = useState<AnyEditor | null>(null)
  const [styles, setStyles] = useState<Record<string, string>>({})
  const [animOpen, setAnimOpen] = useState(false)
  const [fontOpen, setFontOpen] = useState(true)

  const refresh = useCallback((comp: AnyEditor | null) => {
    if (!comp) { setStyles({}); return }
    setStyles(comp.getStyle() ?? {})
  }, [])

  useEffect(() => {
    if (!editor) return
    const onSel = (comp: AnyEditor) => { setSelected(comp); refresh(comp) }
    const onDesel = () => { setSelected(null); setStyles({}) }
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

  const set = useCallback((prop: string, value: string) => {
    if (!selected || !editor) return
    selected.addStyle({ [prop]: value })
    setStyles(p => ({ ...p, [prop]: value }))
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [selected, editor])

  const g = (prop: string, fallback = '') => styles[prop] ?? fallback

  if (!selected) {
    return (
      <div className="w-[280px] shrink-0 bg-[#1a2744] border-l border-[#253660] flex flex-col">
        <div className="p-4 border-b border-[#253660]">
          <p className="text-xs font-semibold text-[#7bafd4] uppercase tracking-wider">Propriedades</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#253660] flex items-center justify-center text-lg">✦</div>
          <p className="text-sm text-[#94b4d8] font-medium">Nenhum elemento</p>
          <p className="text-xs text-[#4a6b9a]">Clique em qualquer elemento da página para editar suas propriedades</p>
        </div>
      </div>
    )
  }

  const compType = selected.get('type') || 'default'

  return (
    <div className="w-[280px] shrink-0 bg-[#1a2744] border-l border-[#253660] flex flex-col overflow-y-auto text-[#e2eaf6]">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#253660] flex items-center justify-between">
        <p className="text-xs font-semibold text-[#7bafd4] uppercase tracking-wider">Propriedades</p>
        <span className="text-[10px] text-[#4a6b9a] bg-[#253660] px-2 py-0.5 rounded-full">
          {compType}
        </span>
      </div>

      {/* COR */}
      <SectionHeader label="Cor" />
      <ColorRow label="Cor do texto" value={g('color', '#000000')} onChange={v => set('color', v)} />
      <ColorRow label="Cor de fundo" value={g('background-color', '#ffffff')} onChange={v => set('background-color', v)} />
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-xs text-[#94b4d8] w-28 shrink-0">Opacidade</span>
        <input
          type="range" min={0} max={1} step={0.05}
          value={parseFloat(g('opacity', '1'))}
          onChange={e => set('opacity', e.target.value)}
          className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
        />
        <span className="text-xs text-[#c7d6f0] w-8 text-right tabular-nums">
          {Math.round(parseFloat(g('opacity', '1')) * 100)}%
        </span>
      </div>

      <div className="h-px bg-[#253660]" />

      {/* TIPOGRAFIA */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#253660] cursor-pointer select-none" onClick={() => setFontOpen(v => !v)}>
        <span className="text-[11px] font-semibold tracking-wider text-[#7bafd4] uppercase">Tipografia</span>
        <span className="text-[#4a6b9a] text-xs">{fontOpen ? '▾' : '▸'}</span>
      </div>

      {fontOpen && (
        <>
          {/* Font family */}
          <div className="px-4 py-2">
            <p className="text-xs text-[#94b4d8] mb-1.5">Fonte</p>
            <select
              value={g('font-family', '').replace(/['"]/g, '').trim()}
              onChange={e => {
                const f = e.target.value
                set('font-family', f ? `'${f}'` : '')
                // Load font in canvas
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

          <div className="grid grid-cols-2 gap-0 px-4 pb-2">
            <div>
              <p className="text-xs text-[#94b4d8] mb-1.5">Tamanho</p>
              <div className="flex items-center gap-1">
                <input type="number" min={1} max={999} value={px(g('font-size', '16px'))}
                  onChange={e => set('font-size', e.target.value + 'px')}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs text-right"
                />
                <span className="text-xs text-[#4a6b9a]">px</span>
              </div>
            </div>
            <div className="pl-3">
              <p className="text-xs text-[#94b4d8] mb-1.5">Peso</p>
              <select value={g('font-weight', '400')} onChange={e => set('font-weight', e.target.value)}
                className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
              >
                {FONT_WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
              </select>
            </div>
          </div>

          {/* Alignment */}
          <div className="px-4 pb-2">
            <p className="text-xs text-[#94b4d8] mb-1.5">Alinhamento</p>
            <div className="grid grid-cols-4 gap-1">
              {([['left','Esq.','←'], ['center','Centro','↔'], ['right','Dir.','→'], ['justify','Justif.','⬌']] as [string, string, string][]).map(([val, title, icon]) => (
                <button key={val} title={title} onClick={() => set('text-align', val)}
                  className={`h-8 rounded text-sm transition-all ${g('text-align') === val ? 'bg-blue-500 text-white' : 'bg-[#0f1d36] text-[#94b4d8] border border-[#2a3d6b] hover:border-blue-400 hover:text-white'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Line height + letter spacing */}
          <div className="grid grid-cols-2 gap-0 px-4 pb-3">
            <div>
              <p className="text-xs text-[#94b4d8] mb-1.5">Altura linha</p>
              <input type="number" min={0.5} max={5} step={0.1} value={g('line-height', '1.5')}
                onChange={e => set('line-height', e.target.value)}
                className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
              />
            </div>
            <div className="pl-3">
              <p className="text-xs text-[#94b4d8] mb-1.5">Espaç. letras</p>
              <div className="flex items-center gap-1">
                <input type="number" min={-10} max={30} step={0.5} value={px(g('letter-spacing', '0px'))}
                  onChange={e => set('letter-spacing', e.target.value + 'px')}
                  className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs text-right"
                />
                <span className="text-xs text-[#4a6b9a]">px</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-[#253660]" />

      {/* ESPAÇAMENTO */}
      <SectionHeader label="Espaçamento e Forma" />
      <NumberRow label="Padding" value={px(g('padding', '0px'))} onChange={v => set('padding', v + 'px')} />
      <NumberRow label="Padding top" value={px(g('padding-top', '0px'))} onChange={v => set('padding-top', v + 'px')} />
      <NumberRow label="Padding bottom" value={px(g('padding-bottom', '0px'))} onChange={v => set('padding-bottom', v + 'px')} />
      <NumberRow label="Borda arredond." value={px(g('border-radius', '0px'))} onChange={v => set('border-radius', v + 'px')} />
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-xs text-[#94b4d8] w-28 shrink-0">Largura</span>
        <select value={g('width', 'auto')} onChange={e => set('width', e.target.value)}
          className="flex-1 bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
        >
          <option value="auto">Auto</option>
          <option value="100%">100%</option>
          <option value="75%">75%</option>
          <option value="50%">50%</option>
          <option value="25%">25%</option>
        </select>
      </div>

      <div className="h-px bg-[#253660]" />

      {/* ANIMAÇÕES */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#253660] cursor-pointer select-none" onClick={() => setAnimOpen(v => !v)}>
        <span className="text-[11px] font-semibold tracking-wider text-[#7bafd4] uppercase">Animações</span>
        <span className="text-[#4a6b9a] text-xs">{animOpen ? '▾' : '▸'}</span>
      </div>

      {animOpen && (
        <>
          <div className="grid grid-cols-3 gap-1.5 p-3">
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

          {g('animation-name', 'none') !== 'none' && (
            <div className="px-4 pb-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94b4d8] w-24 shrink-0">Velocidade</span>
                <input type="range" min={0.1} max={5} step={0.1}
                  value={parseFloat(g('animation-duration', '1s').replace('s',''))}
                  onChange={e => set('animation-duration', e.target.value + 's')}
                  className="flex-1 h-1.5 accent-blue-500"
                />
                <span className="text-xs text-[#c7d6f0] w-10 text-right tabular-nums">
                  {g('animation-duration', '1s')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94b4d8] w-24 shrink-0">Atraso</span>
                <input type="range" min={0} max={3} step={0.1}
                  value={parseFloat(g('animation-delay', '0s').replace('s',''))}
                  onChange={e => set('animation-delay', e.target.value + 's')}
                  className="flex-1 h-1.5 accent-blue-500"
                />
                <span className="text-xs text-[#c7d6f0] w-10 text-right tabular-nums">
                  {g('animation-delay', '0s')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#94b4d8] w-24 shrink-0">Repetição</span>
                <select value={g('animation-iteration-count', '1')} onChange={e => set('animation-iteration-count', e.target.value)}
                  className="flex-1 bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1 text-xs"
                >
                  <option value="1">1×</option>
                  <option value="2">2×</option>
                  <option value="3">3×</option>
                  <option value="infinite">Infinito</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      <div className="h-px bg-[#253660]" />

      {/* HOVER */}
      <SectionHeader label="Hover (ao passar o mouse)" />
      <ColorRow label="Cor de fundo hover" value={g('--hover-bg', '#2563eb')} onChange={v => {
        set('--hover-bg', v)
        // inject hover CSS via a style tag in canvas
        try {
          const cls = selected.getClasses()?.[0]
          if (cls) {
            const doc = editor.Canvas.getDocument()
            const styleId = `hover-style-${cls}`
            let styleEl = doc?.getElementById(styleId)
            if (!styleEl && doc) {
              styleEl = doc.createElement('style')
              styleEl.id = styleId
              doc.head.appendChild(styleEl)
            }
            if (styleEl) styleEl.textContent = `.${cls}:hover { background-color: ${v} !important; }`
          }
        } catch { /* silent */ }
      }} />
    </div>
  )
}
