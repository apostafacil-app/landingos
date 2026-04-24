'use client'

/**
 * Controles reutilizáveis do painel de propriedades.
 * Inspirado no GreatPages — slider compacto com valor + reset,
 * color picker, preset grid, button group, toggle.
 */

import { useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────────────────────

export function PropSection({
  title, children, collapsible = false, defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4 px-3">
      <button
        type="button"
        onClick={() => collapsible && setOpen(o => !o)}
        className={`w-full flex items-center justify-between py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748b] ${collapsible ? 'cursor-pointer hover:text-[#94b4d8]' : 'cursor-default'}`}
      >
        <span>{title}</span>
        {collapsible && (
          <span className="text-[10px]">{open ? '▼' : '▶'}</span>
        )}
      </button>
      {open && <div className="space-y-2.5">{children}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Slider — número com track visual + label + reset
// ─────────────────────────────────────────────────────────────────────────────

export function PropSlider({
  label, value, min = 0, max = 100, step = 1, unit = '',
  defaultValue = 0, onChange,
}: {
  label:        string
  value:        number
  min?:         number
  max?:         number
  step?:        number
  unit?:        string
  defaultValue?: number
  onChange:     (v: number) => void
}) {
  const dirty = value !== defaultValue
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-[12px] text-[#cbd5e1] truncate">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-20 h-1 accent-[#60a5fa]"
      />
      <span className="text-[11px] font-mono text-[#94b4d8] w-12 text-right">
        {value}{unit}
      </span>
      <button
        type="button"
        onClick={() => onChange(defaultValue)}
        disabled={!dirty}
        title="Resetar"
        className={`p-1 rounded text-[#64748b] hover:text-[#94b4d8] transition-colors ${!dirty && 'opacity-40 cursor-default'}`}
      >
        <RotateCcw size={11} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Color picker
// ─────────────────────────────────────────────────────────────────────────────

export function PropColor({
  label, value, onChange,
}: {
  label:    string
  value:    string
  onChange: (hex: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Normaliza — input type=color só aceita #RRGGBB
  const safe = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-[12px] text-[#cbd5e1]">{label}</label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-7 h-7 rounded border border-[#334155] cursor-pointer hover:border-[#60a5fa] transition-colors"
        style={{ background: safe }}
      />
      <input
        ref={inputRef}
        type="color"
        value={safe}
        onChange={e => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0"
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder="#000000"
        className="w-20 px-1.5 py-1 text-[11px] font-mono bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Number input com +/-
// ─────────────────────────────────────────────────────────────────────────────

export function PropNumber({
  label, value, min = 0, max = 1000, step = 1, unit = '',
  onChange,
}: {
  label:    string
  value:    number
  min?:     number
  max?:     number
  step?:    number
  unit?:    string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-[12px] text-[#cbd5e1]">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="w-16 px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none text-right"
        />
        {unit && <span className="text-[11px] text-[#64748b] ml-1">{unit}</span>}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Select
// ─────────────────────────────────────────────────────────────────────────────

export function PropSelect<T extends string>({
  label, value, options, onChange,
}: {
  label:    string
  value:    T
  options:  ReadonlyArray<{ value: T; label: string }>
  onChange: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="flex-1 text-[12px] text-[#cbd5e1]">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="flex-1 px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────────────────────

export function PropToggle({
  label, value, onChange,
}: {
  label:    string
  value:    boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <span className="flex-1 text-[12px] text-[#cbd5e1]">{label}</span>
      <span
        onClick={() => onChange(!value)}
        className={`relative inline-block w-8 h-4 rounded-full transition-colors ${value ? 'bg-[#2563eb]' : 'bg-[#334155]'}`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`}
        />
      </span>
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Button Group
// ─────────────────────────────────────────────────────────────────────────────

export function PropButtonGroup<T extends string>({
  label, value, options, onChange, vertical = false,
}: {
  label?:   string
  value:    T | undefined
  options:  ReadonlyArray<{ value: T; label: React.ReactNode; title?: string }>
  onChange: (v: T) => void
  vertical?: boolean
}) {
  return (
    <div className={`flex ${vertical ? 'flex-col gap-1' : 'items-center gap-2'}`}>
      {label && <label className="flex-1 text-[12px] text-[#cbd5e1]">{label}</label>}
      <div className="flex gap-0.5 flex-wrap">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            title={o.title}
            onClick={() => onChange(o.value)}
            className={`px-2 py-1 min-w-[28px] h-7 text-[11px] font-semibold rounded border transition-all ${
              value === o.value
                ? 'bg-[#2563eb] border-[#2563eb] text-white'
                : 'bg-transparent border-[#334155] text-[#94b4d8] hover:border-[#60a5fa] hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset Grid (pra sombra, animações, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export function PropPresetGrid<T extends string>({
  value, options, onChange, columns = 2,
}: {
  value:    T | undefined
  options:  ReadonlyArray<{ value: T; label: string; preview?: React.ReactNode; subtitle?: string }>
  onChange: (v: T) => void
  columns?: number
}) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex flex-col items-center justify-center px-1.5 py-2 rounded border transition-all ${
            value === o.value
              ? 'bg-[#2563eb]/20 border-[#2563eb] text-white'
              : 'bg-[#0f172a] border-[#334155] text-[#94b4d8] hover:border-[#60a5fa]'
          }`}
        >
          {o.preview && <div className="mb-1 text-base">{o.preview}</div>}
          <span className="text-[11px] font-semibold">{o.label}</span>
          {o.subtitle && <span className="text-[9px] text-[#64748b] uppercase">{o.subtitle}</span>}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Text input (com label)
// ─────────────────────────────────────────────────────────────────────────────

export function PropText({
  label, value, placeholder, onChange, maxLength,
}: {
  label?:     string
  value:      string
  placeholder?: string
  onChange:   (v: string) => void
  maxLength?: number
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <label className="flex-1 text-[12px] text-[#cbd5e1]">{label}</label>}
      <input
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        className="flex-1 min-w-0 px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
      />
    </div>
  )
}
