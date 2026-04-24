'use client'

/**
 * Painel de propriedades V3 — inspirado no GreatPages.
 *
 * Abre quando um elemento está selecionado. Mostra:
 * - Seções contextuais por tipo de elemento (imagem, texto, botão, etc.)
 * - Geometria (x/y/w/h/rotação) — comum a todos
 * - Visibilidade (desktop/mobile) — comum a todos
 *
 * Integra com V3 via `editor.on('component:selected'/'deselected')` e
 * `editor.on('change:any')` pra manter sincronizado.
 */

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { Element as Elem } from './types'
import {
  ImagemSections, TextoSections, BotaoSections,
  CaixaSections, CirculoSections, IconeSections, VideoSections,
  GeometriaSection, VisibilidadeSection,
} from './props/sections'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

interface Props {
  editor: AnyEditor
  /** Função do editor V3 para atualizar elemento via id */
  onUpdateElement?: (id: string, patch: Partial<Elem>) => void
}

export function PropertiesPanelV3({ editor, onUpdateElement }: Props) {
  const [element, setElement] = useState<Elem | null>(null)

  // Subscribe to selection events
  useEffect(() => {
    if (!editor) return

    const syncFromSelection = () => {
      const htmlEl = editor.getSelectedElement?.() as HTMLElement | null
      if (!htmlEl) { setElement(null); return }
      const id = htmlEl.getAttribute('data-lp-id')
      if (!id) { setElement(null); return }
      const found = findInModel(editor, id)
      setElement(found)
    }

    const onSelected = () => syncFromSelection()
    const onDeselected = () => setElement(null)
    const onAnyChange = () => syncFromSelection()

    editor.on?.('component:selected', onSelected)
    editor.on?.('component:deselected', onDeselected)
    const unsubAny = editor.onAnyChange?.(onAnyChange)

    // Initial sync
    syncFromSelection()

    return () => {
      editor.off?.('component:selected', onSelected)
      editor.off?.('component:deselected', onDeselected)
      unsubAny?.()
    }
  }, [editor])

  const updateElement = useCallback((patch: Partial<Elem>) => {
    if (!element) return
    if (onUpdateElement) {
      onUpdateElement(element.id, patch)
    } else {
      // Fallback: fire editor event (V3 ouve e aplica)
      editor?.updateElement?.(element.id, patch)
    }
    // Otimista: atualiza UI localmente imediatamente
    setElement(prev => prev ? { ...prev, ...patch } as Elem : prev)
  }, [element, editor, onUpdateElement])

  if (!element) {
    return (
      <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
        <div className="p-4 text-center text-[12px] text-[#64748b]">
          Selecione um elemento no canvas para editar suas propriedades.
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a2744] border-b border-[#253660] px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]">
            {typeLabel(element.type)}
          </span>
        </div>
        <button
          onClick={() => setElement(null)}
          className="text-[#64748b] hover:text-[#94b4d8] p-1 rounded transition-colors"
          title="Fechar"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tipo-específico */}
      <div className="py-2">
        {renderSections(element, updateElement)}
      </div>

      {/* Comum */}
      <div className="border-t border-[#253660]">
        <GeometriaSection el={element} onChange={updateElement} />
      </div>

      <div className="border-t border-[#253660]">
        <VisibilidadeSection el={element} onChange={updateElement} />
      </div>
    </aside>
  )
}

function renderSections(el: Elem, onChange: (patch: Partial<Elem>) => void) {
  switch (el.type) {
    case 'imagem':
      return <ImagemSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'texto':
    case 'titulo':
      return <TextoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'botao':
      return <BotaoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'caixa':
      return <CaixaSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'circulo':
      return <CirculoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'icone':
      return <IconeSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    case 'video':
      return <VideoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} />
    default:
      return null
  }
}

function typeLabel(type: Elem['type']): string {
  const labels: Record<Elem['type'], string> = {
    imagem: 'Imagem', texto: 'Texto', titulo: 'Título', botao: 'Botão',
    caixa: 'Caixa', circulo: 'Círculo', icone: 'Ícone', video: 'Vídeo',
  }
  return labels[type] ?? type
}

function findInModel(editor: AnyEditor, id: string): Elem | null {
  const model = editor?.getModel?.() as { blocks: { elements: Elem[] }[] } | null
  if (!model) return null
  for (const block of model.blocks) {
    const found = block.elements.find(e => e.id === id)
    if (found) return found
  }
  return null
}
