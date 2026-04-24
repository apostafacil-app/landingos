'use client'

/**
 * Seções de propriedades por tipo de elemento.
 * Cada função retorna um fragmento JSX com as seções relevantes.
 */

import { Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
} from 'lucide-react'
import {
  PropSection, PropSlider, PropColor, PropNumber, PropSelect,
  PropToggle, PropButtonGroup, PropPresetGrid, PropText,
} from './controls'
import type {
  Element as Elem, ImagemElement, TextoElement, BotaoElement,
  CaixaElement, CirculoElement, IconeElement, VideoElement,
} from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Presets compartilhados
// ─────────────────────────────────────────────────────────────────────────────

const SHADOW_PRESETS = [
  { value: 'none',   label: 'Sem efeito', preview: null,   css: '' },
  { value: 'soft',   label: 'Suave',      preview: 'aA',   css: '0 2px 8px rgba(0,0,0,0.12)' },
  { value: 'medium', label: 'Média',      preview: 'aA',   css: '0 4px 16px rgba(0,0,0,0.16)' },
  { value: 'hard',   label: 'Forte',      preview: 'aA',   css: '0 8px 28px rgba(0,0,0,0.22)' },
  { value: 'sharp',  label: 'Crisp',      preview: 'aA',   css: '4px 4px 0 rgba(0,0,0,0.8)' },
  { value: 'neon',   label: 'Neon',       preview: 'aA',   css: '0 0 20px #60a5fa' },
] as const

export type ShadowPreset = typeof SHADOW_PRESETS[number]['value']

const ALIGN_OPTS = [
  { value: 'left',    label: <AlignLeft size={14} />,     title: 'Esquerda' },
  { value: 'center',  label: <AlignCenter size={14} />,   title: 'Centro' },
  { value: 'right',   label: <AlignRight size={14} />,    title: 'Direita' },
  { value: 'justify', label: <AlignJustify size={14} />,  title: 'Justificado' },
] as const

const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif',  label: 'Inter' },
  { value: 'Roboto, sans-serif',            label: 'Roboto' },
  { value: '"Open Sans", sans-serif',       label: 'Open Sans' },
  { value: 'Lato, sans-serif',              label: 'Lato' },
  { value: 'Poppins, sans-serif',           label: 'Poppins' },
  { value: 'Montserrat, sans-serif',        label: 'Montserrat' },
  { value: 'Raleway, sans-serif',           label: 'Raleway' },
  { value: '"Playfair Display", serif',     label: 'Playfair' },
  { value: 'Merriweather, serif',           label: 'Merriweather' },
  { value: '"Source Code Pro", monospace',  label: 'Source Code Pro' },
  { value: 'Georgia, serif',                label: 'Georgia' },
  { value: '"Times New Roman", serif',      label: 'Times New Roman' },
] as const

// ─────────────────────────────────────────────────────────────────────────────
// IMAGEM
// ─────────────────────────────────────────────────────────────────────────────

export function ImagemSections({
  el, onChange,
}: {
  el: ImagemElement
  onChange: (patch: Partial<ImagemElement>) => void
}) {
  return (
    <>
      <PropSection title="Imagem">
        <PropSelect
          label="Ajuste"
          value={el.objectFit ?? 'cover'}
          options={[
            { value: 'cover',      label: 'Preencher (cover)' },
            { value: 'contain',    label: 'Conter (contain)' },
            { value: 'fill',       label: 'Esticar (fill)' },
            { value: 'scale-down', label: 'Reduzir' },
          ]}
          onChange={v => onChange({ objectFit: v as ImagemElement['objectFit'] })}
        />
        <PropText
          label="Alt (acessibilidade)"
          value={el.alt ?? ''}
          maxLength={200}
          onChange={v => onChange({ alt: v })}
        />
        <PropText
          label="Link"
          placeholder="https://…"
          value={el.link ?? ''}
          onChange={v => onChange({ link: v || undefined })}
        />
      </PropSection>

      <BordasSection borderRadius={el.borderRadius} onChange={v => onChange({ borderRadius: v })} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO / TÍTULO
// ─────────────────────────────────────────────────────────────────────────────

export function TextoSections({
  el, onChange,
}: {
  el: TextoElement
  onChange: (patch: Partial<TextoElement>) => void
}) {
  return (
    <>
      <PropSection title="Básicos">
        <PropColor label="Cor do texto" value={el.color ?? '#0f172a'} onChange={v => onChange({ color: v })} />
        <PropNumber label="Tamanho" value={el.fontSize ?? 16} min={8} max={300} unit="px" onChange={v => onChange({ fontSize: v })} />
        <PropButtonGroup<'left'|'center'|'right'|'justify'>
          label="Alinhamento"
          value={(el.textAlign ?? 'left') as 'left'|'center'|'right'|'justify'}
          options={ALIGN_OPTS as unknown as ReadonlyArray<{ value: 'left'|'center'|'right'|'justify'; label: React.ReactNode; title?: string }>}
          onChange={v => onChange({ textAlign: v })}
        />
      </PropSection>

      <PropSection title="Tipografia">
        <PropSelect
          label="Família"
          value={el.fontFamily ?? 'Inter, system-ui, sans-serif'}
          options={FONT_FAMILIES}
          onChange={v => onChange({ fontFamily: v })}
        />
        <PropSlider
          label="Peso"
          value={el.fontWeight ?? (el.type === 'titulo' ? 700 : 400)}
          min={100} max={900} step={100}
          defaultValue={400}
          onChange={v => onChange({ fontWeight: v })}
        />
        <PropSlider
          label="Altura da linha"
          value={(el.lineHeight ?? 1.4) * 10}
          min={8} max={30}
          defaultValue={14}
          onChange={v => onChange({ lineHeight: v / 10 })}
        />
        <PropSlider
          label="Espaço entre letras"
          value={el.letterSpacing ?? 0}
          min={-5} max={20}
          unit="px"
          defaultValue={0}
          onChange={v => onChange({ letterSpacing: v || undefined })}
        />
      </PropSection>

      {el.type === 'texto' && (
        <PropSection title="Tipo do título">
          <PropButtonGroup<'texto'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'>
            value={'texto'}
            options={[
              { value: 'texto', label: 'p' },
              { value: 'h1', label: 'H1' },
              { value: 'h2', label: 'H2' },
              { value: 'h3', label: 'H3' },
              { value: 'h4', label: 'H4' },
              { value: 'h5', label: 'H5' },
              { value: 'h6', label: 'H6' },
            ]}
            onChange={() => { /* TODO: alternar entre texto/titulo futuramente */ }}
          />
        </PropSection>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTÃO
// ─────────────────────────────────────────────────────────────────────────────

export function BotaoSections({
  el, onChange,
}: {
  el: BotaoElement
  onChange: (patch: Partial<BotaoElement>) => void
}) {
  return (
    <>
      <PropSection title="Conteúdo">
        <PropText label="Texto" value={el.text} onChange={v => onChange({ text: v })} maxLength={50} />
        <PropText label="Link" placeholder="https://…" value={el.link ?? ''} onChange={v => onChange({ link: v || undefined })} />
      </PropSection>

      <PropSection title="Cores">
        <PropColor label="Cor de fundo" value={el.bgColor ?? '#2563eb'} onChange={v => onChange({ bgColor: v })} />
        <PropColor label="Cor do texto" value={el.color ?? '#ffffff'} onChange={v => onChange({ color: v })} />
      </PropSection>

      <PropSection title="Tipografia">
        <PropNumber label="Tamanho" value={el.fontSize ?? 15} min={8} max={40} unit="px" onChange={v => onChange({ fontSize: v })} />
        <PropSlider
          label="Peso"
          value={el.fontWeight ?? 600}
          min={100} max={900} step={100}
          defaultValue={400}
          onChange={v => onChange({ fontWeight: v })}
        />
      </PropSection>

      <BordasSection borderRadius={el.borderRadius} onChange={v => onChange({ borderRadius: v })} defaultRadius={8} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CAIXA
// ─────────────────────────────────────────────────────────────────────────────

export function CaixaSections({
  el, onChange,
}: {
  el: CaixaElement
  onChange: (patch: Partial<CaixaElement>) => void
}) {
  return (
    <>
      <PropSection title="Fundo">
        <PropColor label="Cor" value={el.bgColor ?? '#e2e8f0'} onChange={v => onChange({ bgColor: v })} />
        <PropText label="Imagem (URL)" placeholder="https://…" value={el.bgImage ?? ''} onChange={v => onChange({ bgImage: v || undefined })} />
      </PropSection>

      <PropSection title="Borda">
        <PropColor label="Cor" value={el.borderColor ?? '#000000'} onChange={v => onChange({ borderColor: v })} />
        <PropNumber label="Largura" value={el.borderWidth ?? 0} min={0} max={20} unit="px" onChange={v => onChange({ borderWidth: v || undefined })} />
      </PropSection>

      <BordasSection borderRadius={el.borderRadius} onChange={v => onChange({ borderRadius: v })} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CÍRCULO
// ─────────────────────────────────────────────────────────────────────────────

export function CirculoSections({
  el, onChange,
}: {
  el: CirculoElement
  onChange: (patch: Partial<CirculoElement>) => void
}) {
  return (
    <>
      <PropSection title="Fundo">
        <PropColor label="Cor" value={el.bgColor ?? '#3b82f6'} onChange={v => onChange({ bgColor: v })} />
      </PropSection>

      <PropSection title="Borda">
        <PropColor label="Cor" value={el.borderColor ?? '#000000'} onChange={v => onChange({ borderColor: v })} />
        <PropNumber label="Largura" value={el.borderWidth ?? 0} min={0} max={20} unit="px" onChange={v => onChange({ borderWidth: v || undefined })} />
      </PropSection>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ÍCONE
// ─────────────────────────────────────────────────────────────────────────────

export function IconeSections({
  el, onChange,
}: {
  el: IconeElement
  onChange: (patch: Partial<IconeElement>) => void
}) {
  return (
    <>
      <PropSection title="Ícone">
        <PropText label="Emoji / Símbolo" value={el.emoji ?? ''} onChange={v => onChange({ emoji: v })} />
        <PropText label="Link" placeholder="https://…" value={el.link ?? ''} onChange={v => onChange({ link: v || undefined })} />
      </PropSection>

      <PropSection title="Cores">
        <PropColor label="Cor do ícone" value={el.color ?? '#0f172a'} onChange={v => onChange({ color: v })} />
        <PropColor label="Fundo" value={el.bgColor ?? '#000000'} onChange={v => onChange({ bgColor: v })} />
      </PropSection>

      <BordasSection borderRadius={el.borderRadius} onChange={v => onChange({ borderRadius: v })} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VÍDEO
// ─────────────────────────────────────────────────────────────────────────────

export function VideoSections({
  el, onChange,
}: {
  el: VideoElement
  onChange: (patch: Partial<VideoElement>) => void
}) {
  return (
    <>
      <PropSection title="Vídeo">
        <PropText label="URL" placeholder="https://youtube.com/…" value={el.src} onChange={v => onChange({ src: v })} />
      </PropSection>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Seções compartilhadas
// ─────────────────────────────────────────────────────────────────────────────

export function BordasSection({
  borderRadius, onChange, defaultRadius = 0,
}: {
  borderRadius: number | undefined
  onChange:     (v: number | undefined) => void
  defaultRadius?: number
}) {
  return (
    <PropSection title="Bordas">
      <PropSlider
        label="Arredondamento"
        value={borderRadius ?? defaultRadius}
        min={0} max={200}
        unit="px"
        defaultValue={defaultRadius}
        onChange={v => onChange(v || undefined)}
      />
    </PropSection>
  )
}

/** Seção comum a todos os elementos — posição/tamanho/rotação/opacidade */
export function GeometriaSection({
  el, onChange,
}: {
  el: Elem
  onChange: (patch: Partial<Elem>) => void
}) {
  return (
    <PropSection title="Posição e tamanho" collapsible defaultOpen={false}>
      <PropNumber label="X" value={el.x} unit="px" onChange={v => onChange({ x: Math.round(v) } as Partial<Elem>)} />
      <PropNumber label="Y" value={el.y} unit="px" onChange={v => onChange({ y: Math.round(v) } as Partial<Elem>)} />
      <PropNumber label="Largura" value={el.w} min={10} unit="px" onChange={v => onChange({ w: Math.round(v) } as Partial<Elem>)} />
      <PropNumber label="Altura" value={el.h} min={10} unit="px" onChange={v => onChange({ h: Math.round(v) } as Partial<Elem>)} />
      <PropSlider
        label="Rotação"
        value={el.rotation ?? 0}
        min={-180} max={180}
        unit="°"
        defaultValue={0}
        onChange={v => onChange({ rotation: v || undefined } as Partial<Elem>)}
      />
    </PropSection>
  )
}

export function VisibilidadeSection({
  el, onChange,
}: {
  el: Elem
  onChange: (patch: Partial<Elem>) => void
}) {
  return (
    <PropSection title="Visibilidade" collapsible defaultOpen={false}>
      <PropToggle
        label="Mostrar no desktop"
        value={!el.hideDesktop}
        onChange={v => onChange({ hideDesktop: !v || undefined } as Partial<Elem>)}
      />
      <PropToggle
        label="Mostrar no mobile"
        value={!el.hideMobile}
        onChange={v => onChange({ hideMobile: !v || undefined } as Partial<Elem>)}
      />
    </PropSection>
  )
}
