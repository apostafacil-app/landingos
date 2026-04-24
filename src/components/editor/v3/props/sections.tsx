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
  ImageFilters, ShadowPreset, Borders,
} from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// Presets compartilhados
// ─────────────────────────────────────────────────────────────────────────────

const SHADOW_OPTIONS: ReadonlyArray<{ value: ShadowPreset; label: string; preview: React.ReactNode }> = [
  { value: 'none',   label: 'Sem efeito', preview: null },
  { value: 'soft',   label: 'Suave',      preview: <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>aA</span> },
  { value: 'medium', label: 'Média',      preview: <span style={{ textShadow: '0 3px 6px rgba(0,0,0,0.45)' }}>aA</span> },
  { value: 'hard',   label: 'Forte',      preview: <span style={{ textShadow: '0 5px 10px rgba(0,0,0,0.6)' }}>aA</span> },
  { value: 'sharp',  label: 'Crisp',      preview: <span style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>aA</span> },
  { value: 'neon',   label: 'Neon',       preview: <span style={{ textShadow: '0 0 8px #60a5fa' }}>aA</span> },
]

const ANIM_OPTIONS = [
  { value: 'none',   label: 'Sem efeito', subtitle: '' },
  { value: 'fade',   label: 'Aparece',    subtitle: 'Fade' },
  { value: 'slide',  label: 'Deslizar',   subtitle: 'Slide' },
  { value: 'bounce', label: 'Pular',      subtitle: 'Bounce' },
  { value: 'zoom',   label: 'Ampliar',    subtitle: 'Zoom' },
  { value: 'shake',  label: 'Agitar',     subtitle: 'Shake' },
  { value: 'fold',   label: 'Dobrar',     subtitle: 'Fold' },
  { value: 'roll',   label: 'Rolar',      subtitle: 'Roll' },
] as const

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

      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<ImagemElement>)}
      />
      <FiltrosImagemSection filters={el.filters} onChange={v => onChange({ filters: v })} />
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

      <PropSection title="Efeitos">
        <PropSlider
          label="Opacidade"
          value={Math.round((el.opacity ?? 1) * 100)}
          min={0} max={100}
          unit="%"
          defaultValue={100}
          onChange={v => onChange({ opacity: v / 100 } as Partial<TextoElement>)}
        />
      </PropSection>

      <SombraTextoSection
        textShadow={el.textShadow}
        onChange={v => onChange({ textShadow: v } as Partial<TextoElement>)}
      />
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

      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<BotaoElement>)}
      />
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

      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<CaixaElement>)}
      />
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
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<CirculoElement>)}
      />
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

      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<IconeElement>)}
      />
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
      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<VideoElement>)}
      />
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

/**
 * Bordas avançadas: cor, largura, 4 cantos individuais + toggle "Igualar cantos".
 * Usa o campo `borders: Borders` do modelo.
 */
export function BordasAvancadasSection({
  borders, onChange,
}: {
  borders:  Borders | undefined
  onChange: (b: Borders | undefined) => void
}) {
  const b = borders ?? { equalCorners: true, radius: [0,0,0,0] as [number,number,number,number] }
  const equal = b.equalCorners ?? true
  const radius = b.radius ?? ([0,0,0,0] as [number,number,number,number])

  const update = (patch: Partial<Borders>) => {
    const next = { ...b, ...patch }
    // Limpa borders se tudo zero/default
    const allZero = !next.width && !next.color &&
      (next.radius?.every(r => r === 0) ?? true)
    onChange(allZero ? undefined : next)
  }
  const setRadius = (i: number, v: number) => {
    const r = [...radius] as [number,number,number,number]
    if (equal) { r[0] = r[1] = r[2] = r[3] = v }
    else r[i] = v
    update({ radius: r })
  }
  return (
    <PropSection title="Bordas">
      <PropColor label="Cor da borda" value={b.color ?? '#000000'} onChange={v => update({ color: v })} />
      <PropNumber label="Largura da borda" value={b.width ?? 0} min={0} max={20} unit="px" onChange={v => update({ width: v || undefined })} />
      <PropSlider label="Canto sup. esquerdo"  value={radius[0]} min={0} max={200} unit="px" defaultValue={0} onChange={v => setRadius(0, v)} />
      {!equal && (
        <>
          <PropSlider label="Canto sup. direito"   value={radius[1]} min={0} max={200} unit="px" defaultValue={0} onChange={v => setRadius(1, v)} />
          <PropSlider label="Canto inf. direito"   value={radius[2]} min={0} max={200} unit="px" defaultValue={0} onChange={v => setRadius(2, v)} />
          <PropSlider label="Canto inf. esquerdo"  value={radius[3]} min={0} max={200} unit="px" defaultValue={0} onChange={v => setRadius(3, v)} />
        </>
      )}
      <PropToggle label="Igualar cantos" value={equal} onChange={v => update({ equalCorners: v })} />
    </PropSection>
  )
}

/** Seção de efeitos visuais (opacidade + sombra) — comum a shapes e imagens. */
export function EfeitosSection({
  opacity, shadow, onChange,
}: {
  opacity: number | undefined
  shadow:  ShadowPreset | undefined
  onChange: (patch: { opacity?: number; shadow?: ShadowPreset }) => void
}) {
  return (
    <>
      <PropSection title="Efeitos">
        <PropSlider
          label="Opacidade"
          value={Math.round((opacity ?? 1) * 100)}
          min={0} max={100}
          unit="%"
          defaultValue={100}
          onChange={v => onChange({ opacity: v / 100 })}
        />
      </PropSection>
      <PropSection title="Sombra">
        <PropPresetGrid
          value={shadow ?? 'none'}
          options={SHADOW_OPTIONS}
          onChange={v => onChange({ shadow: v })}
          columns={2}
        />
      </PropSection>
    </>
  )
}

/** Filtros CSS específicos de imagem (tonalidade, saturação, brilho, etc.) */
export function FiltrosImagemSection({
  filters, onChange,
}: {
  filters:  ImageFilters | undefined
  onChange: (f: ImageFilters | undefined) => void
}) {
  const f = filters ?? {}
  const update = (patch: Partial<ImageFilters>) => {
    const next = { ...f, ...patch }
    // Remove zeros/defaults pra manter o modelo limpo
    Object.keys(next).forEach(k => {
      const key = k as keyof ImageFilters
      const defaults: Partial<Record<keyof ImageFilters, number>> = {
        saturate: 100, brightness: 100, contrast: 100,
      }
      if (next[key] === undefined || next[key] === 0 || next[key] === defaults[key]) {
        delete next[key]
      }
    })
    const empty = Object.keys(next).length === 0
    onChange(empty ? undefined : next)
  }

  return (
    <PropSection title="Filtros de imagem" collapsible defaultOpen={false}>
      <PropSlider label="Tonalidade"   value={f.hueRotate  ?? 0}   min={0}   max={360} unit="°"  defaultValue={0}   onChange={v => update({ hueRotate: v })} />
      <PropSlider label="Saturação"    value={f.saturate   ?? 100} min={0}   max={200} unit="%"  defaultValue={100} onChange={v => update({ saturate: v })} />
      <PropSlider label="Brilho"       value={f.brightness ?? 100} min={0}   max={200} unit="%"  defaultValue={100} onChange={v => update({ brightness: v })} />
      <PropSlider label="Contraste"    value={f.contrast   ?? 100} min={0}   max={200} unit="%"  defaultValue={100} onChange={v => update({ contrast: v })} />
      <PropSlider label="Inverter"     value={f.invert     ?? 0}   min={0}   max={100} unit="%"  defaultValue={0}   onChange={v => update({ invert: v })} />
      <PropSlider label="Sépia"        value={f.sepia      ?? 0}   min={0}   max={100} unit="%"  defaultValue={0}   onChange={v => update({ sepia: v })} />
      <PropSlider label="Desfoque"     value={f.blur       ?? 0}   min={0}   max={30}  unit="px" defaultValue={0}   onChange={v => update({ blur: v })} />
      <PropSlider label="Tons de cinza" value={f.grayscale ?? 0}   min={0}   max={100} unit="%"  defaultValue={0}   onChange={v => update({ grayscale: v })} />
    </PropSection>
  )
}

/** Sombra de texto (text-shadow) — para elementos de texto/título. */
export function SombraTextoSection({
  textShadow, onChange,
}: {
  textShadow: ShadowPreset | undefined
  onChange: (v: ShadowPreset | undefined) => void
}) {
  return (
    <PropSection title="Sombra" collapsible defaultOpen={false}>
      <PropPresetGrid
        value={textShadow ?? 'none'}
        options={SHADOW_OPTIONS}
        onChange={v => onChange(v === 'none' ? undefined : v)}
        columns={2}
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
