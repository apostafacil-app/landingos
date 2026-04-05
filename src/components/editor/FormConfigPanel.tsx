'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = any

interface FormField {
  id: string
  type: string
  name: string
  label: string
  placeholder: string
  /** GrapesJS input/select/textarea component */
  inputComp: AnyComp
  /** Wrapping <div> (or same as inputComp when there's no wrapper) */
  wrapComp: AnyComp
}

interface Props {
  component: AnyComp
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
  comp.components?.()?.each?.((c: AnyComp) => { if (!found) found = findFormElDown(c) })
  return found
}

function findFormEl(comp: AnyComp): AnyComp | null {
  const down = findFormElDown(comp)
  if (down) return down
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
    const tag   = c.get?.('tagName') ?? ''
    const attrs = c.get?.('attributes') ?? {}
    if (['input', 'select', 'textarea'].includes(tag)) {
      const type = attrs.type ?? (tag === 'select' ? 'select' : tag === 'textarea' ? 'textarea' : 'text')
      if (['submit', 'button', 'hidden'].includes(type)) return
      const name = attrs.name ?? ''
      if (!name) return

      // Try to find label text from sibling or parent
      let label = ''
      try {
        const parentComp = c.parent?.()
        parentComp?.components?.()?.each?.((sibling: AnyComp) => {
          if (sibling.get?.('tagName') === 'label') {
            sibling.components?.()?.each?.((ch: AnyComp) => {
              const txt = ch.get?.('content') ?? ''
              if (txt) label = txt
            })
          }
        })
      } catch { /* ignore */ }

      // wrapComp = parent <div> if direct child of form is a div containing this input
      const parent = c.parent?.()
      const grandparent = parent?.parent?.()
      const wrapComp = (parent?.get?.('tagName') === 'div' && grandparent === formComp)
        ? parent
        : c

      fields.push({
        id:          `${name}-${Math.random().toString(36).slice(2)}`,
        type,
        name,
        label:       label || name,
        placeholder: attrs.placeholder ?? '',
        inputComp:   c,
        wrapComp,
      })
    } else {
      c.components?.()?.each?.((child: AnyComp) => walk(child))
    }
  }

  walk(formComp)
  return fields
}

// ── FieldRow ──────────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: FormField
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onSaveLabel: (label: string, placeholder: string) => void
}

function FieldRow({ field, index, total, onMoveUp, onMoveDown, onRemove, onSaveLabel }: FieldRowProps) {
  const [editing,    setEditing]    = useState(false)
  const [editLabel,  setEditLabel]  = useState(field.label)
  const [editPlaceholder, setEditPlaceholder] = useState(field.placeholder)

  const save = () => {
    onSaveLabel(editLabel, editPlaceholder)
    setEditing(false)
  }
  const cancel = () => {
    setEditLabel(field.label)
    setEditPlaceholder(field.placeholder)
    setEditing(false)
  }

  return (
    <div className="bg-[#0f1d36] border border-[#1e3050] rounded-lg overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-1.5 px-2 py-2">
        {/* Up/Down */}
        <div className="flex flex-col shrink-0">
          <button onClick={onMoveUp}   disabled={index === 0}          title="Mover para cima"
            className="p-0.5 rounded text-[#4a6b9a] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1}  title="Mover para baixo"
            className="p-0.5 rounded text-[#4a6b9a] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#c7d6f0] font-medium truncate">{field.label}</p>
          <p className="text-[10px] text-[#4a6b9a]">{TYPE_LABELS[field.type] ?? field.type} · <span className="font-mono">{field.name}</span></p>
        </div>

        {/* Edit + Delete */}
        <button onClick={() => setEditing(e => !e)} title="Editar campo"
          className="shrink-0 p-1 rounded text-[#4a6b9a] hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
          <Pencil size={13} />
        </button>
        <button onClick={onRemove} title="Remover campo"
          className="shrink-0 p-1 rounded text-[#4a6b9a] hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div className="border-t border-[#1e3050] px-3 py-2.5 flex flex-col gap-2 bg-[#0a1628]">
          <div>
            <p className="text-[10px] text-[#4a6b9a] mb-1">Label visível</p>
            <input
              type="text"
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
            />
          </div>
          <div>
            <p className="text-[10px] text-[#4a6b9a] mb-1">Placeholder</p>
            <input
              type="text"
              value={editPlaceholder}
              onChange={e => setEditPlaceholder(e.target.value)}
              className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors">
              <Check size={12} /> Salvar
            </button>
            <button onClick={cancel}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#1e3050] hover:bg-[#253660] text-[#94b4d8] text-xs font-semibold rounded-lg transition-colors">
              <X size={12} /> Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function FormConfigPanel({ component, editor }: Props) {
  const [formComp, setFormComp] = useState<AnyComp | null>(null)
  const [fields,   setFields]   = useState<FormField[]>([])
  const [redirect, setRedirect] = useState('')

  // Add-field form state
  const [addType,        setAddType]        = useState<string>('text')
  const [addName,        setAddName]        = useState('')
  const [addLabel,       setAddLabel]       = useState('')
  const [addPlaceholder, setAddPlaceholder] = useState('')

  const reloadFields = useCallback((fc: AnyComp) => {
    setFields(readFields(fc))
  }, [])

  useEffect(() => {
    const fc = findFormEl(component)
    if (!fc) return
    setFormComp(fc)
    reloadFields(fc)
    const formAttrs = fc.get('attributes') ?? {}
    setRedirect(formAttrs['data-redirect'] ?? '')
  }, [component, reloadFields])

  const trigger = useCallback(() => {
    if (editor) setTimeout(() => editor.trigger('change:changesCount'), 50)
  }, [editor])

  // ── Persist redirect ──────────────────────────────────────────────────────
  const applyRedirect = useCallback((val: string) => {
    if (!formComp) return
    const current = formComp.get('attributes') ?? {}
    formComp.set('attributes', { ...current, 'data-redirect': val })
    trigger()
  }, [formComp, trigger])

  // ── Move field up / down ──────────────────────────────────────────────────
  const moveField = useCallback((index: number, dir: -1 | 1) => {
    if (!formComp) return
    const field    = fields[index]
    const target   = fields[index + dir]
    if (!field || !target) return

    const formChildren = formComp.components()
    let fieldIdx  = -1
    let targetIdx = -1
    formChildren.each((c: AnyComp, i: number) => {
      if (c === field.wrapComp)  fieldIdx  = i
      if (c === target.wrapComp) targetIdx = i
    })
    if (fieldIdx === -1 || targetIdx === -1) return

    // Move: remove the component and re-add at the other's index
    const movingComp = field.wrapComp
    movingComp.move(formComp, { at: targetIdx })
    trigger()

    // Re-read fields from DOM
    reloadFields(formComp)
  }, [fields, formComp, trigger, reloadFields])

  // ── Remove field ──────────────────────────────────────────────────────────
  const removeField = useCallback((field: FormField) => {
    field.wrapComp.remove()
    trigger()
    if (formComp) reloadFields(formComp)
  }, [formComp, trigger, reloadFields])

  // ── Edit field label / placeholder ────────────────────────────────────────
  const saveFieldEdit = useCallback((field: FormField, newLabel: string, newPlaceholder: string) => {
    // Update input placeholder attribute
    const inputAttrs = field.inputComp.get('attributes') ?? {}
    field.inputComp.set('attributes', { ...inputAttrs, placeholder: newPlaceholder })

    // Update label text if there's a label sibling
    try {
      const parentComp = field.inputComp.parent?.()
      parentComp?.components?.()?.each?.((sibling: AnyComp) => {
        if (sibling.get?.('tagName') === 'label') {
          sibling.components?.()?.each?.((ch: AnyComp) => {
            if (ch.get?.('content') !== undefined) ch.set('content', newLabel)
          })
        }
      })
    } catch { /* ignore */ }

    trigger()
    // Update local state label
    setFields(prev => prev.map(f =>
      f.id === field.id ? { ...f, label: newLabel || f.name, placeholder: newPlaceholder } : f
    ))
  }, [trigger])

  // ── Add field ─────────────────────────────────────────────────────────────
  const addField = useCallback(() => {
    if (!formComp || !addName.trim()) return
    const nameClean = addName.trim().toLowerCase().replace(/\s+/g, '_')

    const style = 'width:100%;padding:14px 16px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:15px;box-sizing:border-box;'
    let inputHtml = ''
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

    // Insert before the submit button
    const comps = formComp.components()
    let btnIndex = comps.length
    comps.each((c: AnyComp, i: number) => {
      const tag   = c.get?.('tagName') ?? ''
      const attrs = c.get?.('attributes') ?? {}
      if (tag === 'button' && (!attrs.type || attrs.type === 'submit')) btnIndex = Math.min(btnIndex, i)
    })

    formComp.components().add(wrapHtml, { at: btnIndex })
    trigger()
    reloadFields(formComp)
    setAddName(''); setAddLabel(''); setAddPlaceholder(''); setAddType('text')
  }, [formComp, addType, addName, addLabel, addPlaceholder, trigger, reloadFields])

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
      <div className="px-4 pt-4 pb-2">
        <span className="text-[10px] font-bold tracking-widest text-[#4a6b9a] uppercase">Campos do formulário</span>
      </div>

      <div className="px-4 pb-3 flex flex-col gap-2">
        {fields.length === 0 && (
          <p className="text-xs text-[#4a6b9a] py-2">Nenhum campo encontrado.</p>
        )}
        {fields.map((f, i) => (
          <FieldRow
            key={f.id}
            field={f}
            index={i}
            total={fields.length}
            onMoveUp={()   => moveField(i, -1)}
            onMoveDown={()  => moveField(i, +1)}
            onRemove={() => removeField(f)}
            onSaveLabel={(label, ph) => saveFieldEdit(f, label, ph)}
          />
        ))}
      </div>

      {/* Add field form */}
      <div className="mx-4 mb-3 p-3 bg-[#0a1628] border border-dashed border-[#253660] rounded-xl flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#4a6b9a] uppercase tracking-wider">Adicionar campo</p>

        <div>
          <p className="text-[10px] text-[#4a6b9a] mb-1">Tipo</p>
          <select
            value={addType}
            onChange={e => setAddType(e.target.value)}
            className="w-full bg-[#0f1d36] text-[#c7d6f0] border border-[#2a3d6b] rounded-lg px-2 py-1.5 text-xs"
          >
            {Object.entries(TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
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
          Deixe em branco para exibir mensagem de sucesso.
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
