'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = any

interface FormField {
  id: string
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea'
  name: string
  label: string
  placeholder: string
  required: boolean
}

interface Props {
  component: AnyComp // the GrapesJS component that contains the form
  editor: AnyComp
}

const TYPE_LABELS: Record<string, string> = {
  text:     'Texto',
  email:    'E-mail',
  tel:      'Telefone',
  number:   'Número',
  select:   'Seleção',
  textarea: 'Área de texto',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function findFormElDown(comp: AnyComp): AnyComp | null {
  if (!comp) return null
  const tag   = comp.get?.('tagName') ?? ''
  const attrs = comp.get?.('attributes') ?? {}
  if (tag === 'form' && attrs['data-lp-form'] !== undefined) return comp
  let found: AnyComp | null = null
  comp.components?.()?.each?.((c: AnyComp) => {
    if (!found) found = findFormElDown(c)
  })
  return found
}

function findFormEl(comp: AnyComp): AnyComp | null {
  // First search downward
  const down = findFormElDown(comp)
  if (down) return down
  // Then walk up to find an ancestor form
  let parent = comp?.parent?.()
  while (parent) {
    const tag   = parent.get?.('tagName') ?? ''
    const attrs = parent.get?.('attributes') ?? {}
    if (tag === 'form' && attrs['data-lp-form'] !== undefined) return parent
    parent = parent.parent?.()
  }
  return null
}

function readFields(formComp: AnyComp): FormField[] {
  const fields: FormField[] = []
  function walk(c: AnyComp) {
    const tag = c.get?.('tagName') ?? ''
    if (['input', 'select', 'textarea'].includes(tag)) {
      const attrs = c.get('attributes') ?? {}
      const type  = attrs.type ?? (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text')
      if (type === 'submit' || type === 'button' || type === 'hidden') return
      const name = attrs.name ?? ''
      if (!name) return
      // Try to read associated label text from parent node sibling
      let label = ''
      try {
        const parentComps = c.parent?.()?.components?.()
        parentComps?.each?.((sibling: AnyComp) => {
          if (sibling.get?.('tagName') === 'label') {
            const txt = sibling.components?.()?.at?.(0)?.get?.('content') ?? ''
            if (txt) label = txt
          }
        })
      } catch { /* ignore */ }
      fields.push({
        id:          Math.random().toString(36).slice(2),
        type:        type as FormField['type'],
        name,
        label:       label || name,
        placeholder: attrs.placeholder ?? '',
        required:    attrs.required === 'required' || attrs.required === true,
      })
    }
    c.components?.()?.each?.((child: AnyComp) => walk(child))
  }
  walk(formComp)
  return fields
}

// ── Field row style helpers (inline form in dark sidebar) ─────────────────────
function FieldRow({ field, onRemove, index }: { field: FormField; onRemove: () => void; index: number }) {
  return (
    <div className="flex items-center gap-2 bg-[#0f1d36] border border-[#1e3050] rounded-lg px-2 py-2">
      <span className="text-[#4a6b9a] cursor-grab shrink-0"><GripVertical size={14} /></span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#c7d6f0] font-medium truncate">{field.label || field.name}</p>
        <p className="text-[10px] text-[#4a6b9a]">{TYPE_LABELS[field.type] ?? field.type} · <span className="font-mono">{field.name}</span></p>
      </div>
      <button
        onClick={onRemove}
        title="Remover campo"
        className="shrink-0 p-1 rounded text-[#4a6b9a] hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FormConfigPanel({ component, editor }: Props) {
  const [formComp, setFormComp]     = useState<AnyComp | null>(null)
  const [fields,   setFields]       = useState<FormField[]>([])
  const [redirect, setRedirect]     = useState('')
  const [addType,  setAddType]      = useState<FormField['type']>('text')
  const [addName,  setAddName]      = useState('')
  const [addLabel, setAddLabel]     = useState('')
  const [addPlaceholder, setAddPlaceholder] = useState('')

  // Load form data from GrapesJS component tree
  useEffect(() => {
    const fc = findFormEl(component)
    if (!fc) return
    setFormComp(fc)
    setFields(readFields(fc))
    const formAttrs = fc.get('attributes') ?? {}
    setRedirect(formAttrs['data-redirect'] ?? '')
  }, [component])

  // Persist redirect URL to the form component
  const applyRedirect = useCallback((val: string) => {
    if (!formComp || !editor) return
    const current = formComp.get('attributes') ?? {}
    formComp.set('attributes', { ...current, 'data-redirect': val })
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [formComp, editor])

  // Remove a field from the DOM (GrapesJS component tree)
  const removeField = useCallback((field: FormField) => {
    if (!formComp || !editor) return
    let removed = false
    function walkRemove(c: AnyComp) {
      if (removed) return
      const tag   = c.get?.('tagName') ?? ''
      const attrs = c.get?.('attributes') ?? {}
      if (['input', 'select', 'textarea'].includes(tag) && attrs.name === field.name) {
        // Remove the wrapping container (usually a <div>) if the input is the only meaningful child
        const parent = c.parent?.()
        if (parent && parent.get?.('tagName') === 'div') {
          parent.remove()
        } else {
          c.remove()
        }
        removed = true
        return
      }
      c.components?.()?.each?.((child: AnyComp) => walkRemove(child))
    }
    walkRemove(formComp)
    setFields(prev => prev.filter(f => f.name !== field.name))
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [formComp, editor])

  // Add a new field before the submit button
  const addField = useCallback(() => {
    if (!formComp || !editor || !addName.trim()) return
    const nameClean = addName.trim().toLowerCase().replace(/\s+/g, '_')

    // Build HTML snippet
    let inputHtml = ''
    const style   = 'width:100%;padding:14px 16px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:15px;box-sizing:border-box;'
    if (addType === 'textarea') {
      inputHtml = `<textarea name="${nameClean}" placeholder="${addPlaceholder || addLabel || addName}" rows="3" style="${style}"></textarea>`
    } else if (addType === 'select') {
      inputHtml = `<select name="${nameClean}" style="${style}"><option value="">Selecione…</option></select>`
    } else {
      inputHtml = `<input type="${addType}" name="${nameClean}" placeholder="${addPlaceholder || addLabel || addName}" style="${style}" />`
    }

    const wrapHtml = addLabel.trim()
      ? `<div><label style="font-size:13px;font-weight:600;color:#94a3b8;display:block;margin-bottom:6px;">${addLabel}</label>${inputHtml}</div>`
      : `<div>${inputHtml}</div>`

    // Find submit button index to insert before it
    const comps = formComp.components()
    let btnIndex = comps.length // default: append
    comps.each((c: AnyComp, i: number) => {
      const tag   = c.get?.('tagName') ?? ''
      const attrs = c.get?.('attributes') ?? {}
      if (tag === 'button' && (attrs.type === 'submit' || !attrs.type)) btnIndex = Math.min(btnIndex, i)
    })

    formComp.components().add(wrapHtml, { at: btnIndex })

    const newField: FormField = {
      id:          Math.random().toString(36).slice(2),
      type:        addType,
      name:        nameClean,
      label:       addLabel || addName,
      placeholder: addPlaceholder,
      required:    false,
    }
    setFields(prev => [...prev, newField])
    setAddName(''); setAddLabel(''); setAddPlaceholder(''); setAddType('text')
    setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [formComp, editor, addType, addName, addLabel, addPlaceholder])

  if (!formComp) {
    return (
      <div className="px-4 py-6 text-center">
        <p className="text-xs text-[#4a6b9a]">Nenhum formulário detectado neste bloco.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">

      {/* ── CAMPOS DO FORMULÁRIO ── */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[10px] font-bold tracking-widest text-[#4a6b9a] uppercase">Campos do formulário</span>
      </div>

      <div className="px-4 pb-3 flex flex-col gap-2">
        {fields.length === 0 && (
          <p className="text-xs text-[#4a6b9a] py-2">Nenhum campo encontrado.</p>
        )}
        {fields.map((f, i) => (
          <FieldRow key={f.id} field={f} index={i} onRemove={() => removeField(f)} />
        ))}
      </div>

      {/* Add field */}
      <div className="mx-4 mb-3 p-3 bg-[#0a1628] border border-dashed border-[#253660] rounded-xl flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#4a6b9a] uppercase tracking-wider">Adicionar campo</p>

        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-[#4a6b9a] mb-1">Tipo</p>
            <select
              value={addType}
              onChange={e => setAddType(e.target.value as FormField['type'])}
              className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
            >
              {Object.entries(TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-[#4a6b9a] mb-1">Nome interno <span className="text-[#2a3d6b]">(sem espaços)</span></p>
          <input
            type="text"
            value={addName}
            onChange={e => setAddName(e.target.value)}
            placeholder="ex: whatsapp"
            className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
          />
        </div>

        <div>
          <p className="text-[10px] text-[#4a6b9a] mb-1">Label visível</p>
          <input
            type="text"
            value={addLabel}
            onChange={e => setAddLabel(e.target.value)}
            placeholder="ex: WhatsApp"
            className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
          />
        </div>

        <div>
          <p className="text-[10px] text-[#4a6b9a] mb-1">Placeholder</p>
          <input
            type="text"
            value={addPlaceholder}
            onChange={e => setAddPlaceholder(e.target.value)}
            placeholder="ex: (11) 99999-9999"
            className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
          />
        </div>

        <button
          onClick={addField}
          disabled={!addName.trim()}
          className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus size={13} />
          Adicionar campo
        </button>
      </div>

      {/* ── ENVIO DO FORMULÁRIO ── */}
      <div className="mx-4 my-1 h-px bg-[#1e3050]" />
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold tracking-widest text-[#4a6b9a] uppercase">Envio do formulário</span>
      </div>
      <div className="px-4 pb-3">
        <p className="text-[11px] text-[#7bafd4] mb-1.5 font-medium">URL de redirecionamento</p>
        <input
          type="url"
          value={redirect}
          onChange={e => setRedirect(e.target.value)}
          onBlur={e => applyRedirect(e.target.value)}
          placeholder="https://obrigado.com/pagina"
          className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
        />
        <p className="text-[10px] text-[#4a6b9a] mt-1.5 leading-relaxed">
          Após o envio, o visitante será redirecionado para essa URL. Deixe em branco para exibir mensagem de sucesso.
        </p>
      </div>

      {/* ── INTEGRAÇÕES ── */}
      <div className="mx-4 my-1 h-px bg-[#1e3050]" />
      <div className="px-4 pt-3 pb-1">
        <span className="text-[10px] font-bold tracking-widest text-[#4a6b9a] uppercase">Integrações</span>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-[#0a1628] border border-[#1e3050] rounded-xl p-4 text-center">
          <p className="text-xs text-[#4a6b9a] leading-relaxed">
            Você não configurou nenhuma integração para este formulário.
          </p>
          <p className="text-[10px] text-[#2a3d6b] mt-1">Webhooks e CRM — em breve</p>
        </div>
      </div>

    </div>
  )
}
