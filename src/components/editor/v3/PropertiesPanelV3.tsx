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
import type { Element as Elem, Block, PageModel } from './types'
import {
  ImagemSections, TextoSections, BotaoSections,
  CaixaSections, CirculoSections, IconeSections, VideoSections,
  GeometriaSection, VisibilidadeSection, BlocoSections, PaginaSections,
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
  const [block, setBlock] = useState<Block | null>(null)
  const [device, setDevice] = useState<'Desktop' | 'Mobile'>(() => editor?.getDevice?.() ?? 'Desktop')
  const pageWidth = editor?.getModel?.()?.width ?? 1200

  // Observe device changes
  useEffect(() => {
    if (!editor) return
    const onDeviceChange = (d: 'Desktop' | 'Mobile') => setDevice(d)
    editor.on?.('change:device', onDeviceChange)
    // Initial
    const d = editor.getDevice?.()
    if (d) setDevice(d)
    return () => { editor.off?.('change:device', onDeviceChange) }
  }, [editor])

  // Subscribe to selection events
  useEffect(() => {
    if (!editor) return

    /** Recarrega elemento atual do modelo (usado após change:any) */
    const refreshCurrent = () => {
      setElement(prev => {
        if (!prev) return prev
        const found = findInModel(editor, prev.id)
        return found ?? null
      })
    }

    const onSelected = (el: Elem | undefined) => {
      // V3 envia o Elem no payload; se vier algo diferente, tenta extrair do DOM como fallback.
      if (el && typeof el === 'object' && 'id' in el && 'type' in el) {
        setElement(el as Elem)
        return
      }
      // Fallback — tenta pegar via DOM + modelo
      const htmlEl = editor.getSelectedElement?.() as HTMLElement | null
      const id = htmlEl?.getAttribute('data-lp-id')
      if (id) setElement(findInModel(editor, id))
    }
    const onDeselected = () => setElement(null)

    editor.on?.('component:selected', onSelected)
    editor.on?.('component:deselected', onDeselected)
    const unsubAny = editor.onAnyChange?.(refreshCurrent)

    // Initial sync (caso o painel monte depois da seleção)
    const htmlEl = editor.getSelectedElement?.() as HTMLElement | null
    const id = htmlEl?.getAttribute('data-lp-id')
    if (id) setElement(findInModel(editor, id))
    else setElement(null)

    return () => {
      editor.off?.('component:selected', onSelected)
      editor.off?.('component:deselected', onDeselected)
      unsubAny?.()
    }
  }, [editor])

  // Subscribe to block selection events
  useEffect(() => {
    if (!editor) return
    const onBlockSelected = (b: Block) => setBlock(b)
    const onBlockDeselected = () => setBlock(null)
    editor.on?.('block:selected', onBlockSelected)
    editor.on?.('block:deselected', onBlockDeselected)
    // Initial sync
    const cur = editor.getSelectedBlock?.()
    if (cur) setBlock(cur)
    // Refresh on any model change
    const unsubAny = editor.onAnyChange?.(() => {
      setBlock(prev => {
        if (!prev) return prev
        const fresh = editor.getModel?.()?.blocks?.find((b: Block) => b.id === prev.id)
        return fresh ?? null
      })
    })
    return () => {
      editor.off?.('block:selected', onBlockSelected)
      editor.off?.('block:deselected', onBlockDeselected)
      unsubAny?.()
    }
  }, [editor])

  const updateBlockProp = useCallback((patch: Partial<Block>) => {
    if (!block) return
    editor?.updateBlock?.(block.id, patch)
    setBlock(prev => prev ? { ...prev, ...patch } : prev)
  }, [block, editor])

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

  // Bloco selecionado mas não elemento → painel de bloco
  if (block && !element) {
    const totalBlocks = (editor?.getModel?.()?.blocks?.length ?? 1) as number
    return (
      <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#1a2744] border-b border-[#253660] px-3 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]">
            ▭ Bloco
          </span>
          {device === 'Mobile' && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/40">
              📱 mobile
            </span>
          )}
        </div>
        <div className="py-2">
          <BlocoSections
            block={block}
            device={device}
            onChange={updateBlockProp}
            onPickImage={editor?.openImagePicker}
            onDelete={() => editor?.deleteBlock?.(block.id)}
            canDelete={totalBlocks > 1}
          />
        </div>
      </aside>
    )
  }

  // Nada selecionado → painel da PÁGINA (configs globais)
  if (!element) {
    const page = editor?.getModel?.() as PageModel | undefined
    if (page) {
      return (
        <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-[#1a2744] border-b border-[#253660] px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]">
              📄 Página
            </span>
          </div>
          <div className="py-2">
            <PaginaSections
              page={page}
              onChange={patch => editor?.updatePageProps?.(patch)}
            />
          </div>
          <div className="px-3 pb-3 pt-2 border-t border-[#253660] text-[10px] text-[#64748b] italic leading-relaxed">
            Clique num elemento ou no fundo de um bloco para editar propriedades específicas.
          </div>
        </aside>
      )
    }
    return (
      <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
        <div className="p-4 text-center text-[12px] text-[#64748b]">
          Selecione um elemento ou clique no fundo de um bloco para editar suas propriedades.
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-64 shrink-0 bg-[#1a2744] border-l border-[#253660] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a2744] border-b border-[#253660] px-3 py-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#60a5fa]">
          {typeLabel(element.type)}
        </span>
        {device === 'Mobile' && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/40"
            title="Alterações afetam apenas o layout Mobile"
          >
            📱 mobile
          </span>
        )}
      </div>

      {/* Tipo-específico */}
      <div className="py-2">
        {renderSections(
          element,
          updateElement,
          () => editor?.previewAnimation?.(element.id),
          editor?.openImagePicker,
        )}
      </div>

      {/* Comum */}
      <div className="border-t border-[#253660]">
        <GeometriaSection el={element} device={device} pageWidth={pageWidth} onChange={updateElement} />
      </div>

      <div className="border-t border-[#253660]">
        <VisibilidadeSection el={element} onChange={updateElement} />
      </div>
    </aside>
  )
}

function renderSections(
  el: Elem,
  onChange: (patch: Partial<Elem>) => void,
  onPreview?: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPickImage?: (cb: (url: string) => void) => void,
) {
  switch (el.type) {
    case 'imagem':
      return <ImagemSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} />
    case 'texto':
    case 'titulo':
      return <TextoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} />
    case 'botao':
      return <BotaoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} />
    case 'caixa':
      return <CaixaSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} onPickImage={onPickImage} />
    case 'circulo':
      return <CirculoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} onPickImage={onPickImage} />
    case 'icone':
      return <IconeSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} />
    case 'video':
      return <VideoSections el={el} onChange={onChange as (p: Partial<Elem>) => void} onPreview={onPreview} />
    default:
      return null
  }
}

function typeLabel(type: Elem['type']): string {
  const labels: Record<Elem['type'], string> = {
    imagem: 'Imagem', texto: 'Texto', titulo: 'Título', botao: 'Botão',
    caixa: 'Caixa', circulo: 'Círculo', icone: 'Ícone', video: 'Vídeo',
    formulario: 'Formulário',
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
