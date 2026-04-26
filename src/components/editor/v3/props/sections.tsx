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
  ImageFilters, ShadowPreset, Borders, Animation, AnimType, AnimDirection,
  Block, BlockGradient, PageModel,
} from '../types'
import { getActiveCoords } from '../types'
import { Trash2 } from 'lucide-react'

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
  el, onChange, onPreview,
}: {
  el: ImagemElement
  onChange: (patch: Partial<ImagemElement>) => void
  onPreview?: () => void
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<ImagemElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TEXTO / TÍTULO
// ─────────────────────────────────────────────────────────────────────────────

export function TextoSections({
  el, onChange, onPreview,
}: {
  el: TextoElement
  onChange: (patch: Partial<TextoElement>) => void
  onPreview?: () => void
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

      <PropSection title="Tipo semântico">
        <PropButtonGroup<'p'|'h1'|'h2'|'h3'|'h4'|'h5'|'h6'>
          value={el.type === 'titulo' ? (`h${el.headingLevel ?? 1}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6') : 'p'}
          options={[
            { value: 'p',  label: 'p',  title: 'Parágrafo' },
            { value: 'h1', label: 'H1', title: 'Título principal' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
            { value: 'h5', label: 'H5' },
            { value: 'h6', label: 'H6' },
          ]}
          onChange={v => {
            if (v === 'p') {
              onChange({ type: 'texto', headingLevel: undefined } as Partial<TextoElement>)
            } else {
              const level = parseInt(v.slice(1), 10) as 1|2|3|4|5|6
              onChange({ type: 'titulo', headingLevel: level } as Partial<TextoElement>)
            }
          }}
        />
      </PropSection>

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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<TextoElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BOTÃO
// ─────────────────────────────────────────────────────────────────────────────

export function BotaoSections({
  el, onChange, onPreview,
}: {
  el: BotaoElement
  onChange: (patch: Partial<BotaoElement>) => void
  onPreview?: () => void
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<BotaoElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CAIXA
// ─────────────────────────────────────────────────────────────────────────────

export function CaixaSections({
  el, onChange, onPreview, onPickImage,
}: {
  el: CaixaElement
  onChange: (patch: Partial<CaixaElement>) => void
  onPreview?: () => void
  onPickImage?: (cb: (url: string) => void) => void
}) {
  return (
    <>
      <PropSection title="Fundo">
        <PropColor label="Cor" value={el.bgColor ?? '#e2e8f0'} onChange={v => onChange({ bgColor: v })} />
        <ImageBgPicker
          label="Imagem"
          value={el.bgImage}
          onPickImage={onPickImage}
          onChange={url => onChange({ bgImage: url })}
        />
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<CaixaElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CÍRCULO
// ─────────────────────────────────────────────────────────────────────────────

export function CirculoSections({
  el, onChange, onPreview, onPickImage,
}: {
  el: CirculoElement
  onChange: (patch: Partial<CirculoElement>) => void
  onPreview?: () => void
  onPickImage?: (cb: (url: string) => void) => void
}) {
  return (
    <>
      <PropSection title="Fundo">
        <PropColor label="Cor" value={el.bgColor ?? '#3b82f6'} onChange={v => onChange({ bgColor: v })} />
        <ImageBgPicker
          label="Imagem"
          value={el.bgImage}
          onPickImage={onPickImage}
          onChange={url => onChange({ bgImage: url })}
        />
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<CirculoElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ÍCONE
// ─────────────────────────────────────────────────────────────────────────────

export function IconeSections({
  el, onChange, onPreview,
}: {
  el: IconeElement
  onChange: (patch: Partial<IconeElement>) => void
  onPreview?: () => void
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<IconeElement>)} onPreview={onPreview} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VÍDEO
// ─────────────────────────────────────────────────────────────────────────────

export function VideoSections({
  el, onChange, onPreview,
}: {
  el: VideoElement
  onChange: (patch: Partial<VideoElement>) => void
  onPreview?: () => void
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
      <AnimacaoSection animation={el.animation} onChange={a => onChange({ animation: a } as Partial<VideoElement>)} onPreview={onPreview} />
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

/** Animações de entrada — presets + direção + velocidade + atraso + repetir */
export function AnimacaoSection({
  animation, onChange, onPreview,
}: {
  animation: Animation | undefined
  onChange: (a: Animation | undefined) => void
  onPreview?: () => void
}) {
  const a = animation ?? {}
  const type = (a.type ?? 'none') as AnimType
  const update = (patch: Partial<Animation>) => {
    const next = { ...a, ...patch }
    if ((next.type ?? 'none') === 'none') { onChange(undefined); return }
    onChange(next)
  }
  return (
    <PropSection title="Animação de entrada" collapsible defaultOpen={false}>
      <PropPresetGrid
        value={type}
        options={ANIM_OPTIONS}
        onChange={v => update({ type: v as AnimType })}
        columns={2}
      />
      {type !== 'none' && (
        <>
          {type === 'slide' && (
            <PropSelect
              label="Direção"
              value={a.direction ?? 'up'}
              options={[
                { value: 'up',    label: 'Para cima' },
                { value: 'down',  label: 'Para baixo' },
                { value: 'left',  label: 'Para esquerda' },
                { value: 'right', label: 'Para direita' },
              ]}
              onChange={v => update({ direction: v as AnimDirection })}
            />
          )}
          <PropNumber
            label="Duração"
            value={a.duration ?? 800}
            min={100} max={5000} step={100} unit="ms"
            onChange={v => update({ duration: v })}
          />
          <PropNumber
            label="Atraso"
            value={a.delay ?? 0}
            min={0} max={5000} step={100} unit="ms"
            onChange={v => update({ delay: v })}
          />
          <PropSelect
            label="Repetir"
            value={a.repeat ?? 'once'}
            options={[
              { value: 'once', label: 'Apenas uma vez' },
              { value: 'loop', label: 'Continuamente' },
            ]}
            onChange={v => update({ repeat: v as 'once' | 'loop' })}
          />
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="w-full text-[11px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4fc1] py-1.5 rounded transition-colors"
            >
              ▶ Pré-visualizar animação
            </button>
          )}
        </>
      )}
    </PropSection>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GradientPresets — paleta de gradientes prontos pra fundo do bloco
// (mesma abordagem da GreatPages: clique 1 vez, fundo vira premium)
// ─────────────────────────────────────────────────────────────────────────────

const GRADIENT_PRESETS: { id: string; label: string; gradient: BlockGradient }[] = [
  { id: 'royal', label: 'Royal', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#1e3a8a' }, { color: '#4338ca' }, { color: '#7c3aed' }] } },
  { id: 'sunset', label: 'Sunset', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#ea580c' }, { color: '#dc2626' }, { color: '#9333ea' }] } },
  { id: 'ocean', label: 'Ocean', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0ea5e9' }, { color: '#06b6d4' }, { color: '#10b981' }] } },
  { id: 'midnight', label: 'Midnight', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e293b' }] } },
  { id: 'mint', label: 'Mint', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#10b981' }, { color: '#06b6d4' }] } },
  { id: 'rose', label: 'Rose', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#f43f5e' }, { color: '#ec4899' }, { color: '#8b5cf6' }] } },
  { id: 'gold', label: 'Gold', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#fbbf24' }, { color: '#f97316' }] } },
  { id: 'lavender', label: 'Lavender', gradient: { type: 'linear', angle: 135,
      stops: [{ color: '#c084fc' }, { color: '#818cf8' }] } },
]

function GradientPresets({
  value, onChange,
}: {
  value: BlockGradient | undefined
  onChange: (g: BlockGradient | undefined) => void
}) {
  const cssOf = (g: BlockGradient) => {
    const stops = g.stops.map(s => s.pos != null ? `${s.color} ${s.pos}%` : s.color).join(', ')
    return g.type === 'radial' ? `radial-gradient(circle, ${stops})` : `linear-gradient(${g.angle ?? 135}deg, ${stops})`
  }
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[12px] text-[#cbd5e1]">Gradiente</label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[10px] text-[#94b4d8] hover:text-white transition-colors"
          >
            Remover
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {GRADIENT_PRESETS.map(p => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            onClick={() => onChange(p.gradient)}
            className="h-12 rounded border border-[#334155] hover:border-[#60a5fa] transition-all"
            style={{ background: cssOf(p.gradient) }}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ImageBgPicker — preview + botão "Galeria" pra escolher imagem de fundo
// (substitui input de URL bruto, dando UX mais profissional)
// ─────────────────────────────────────────────────────────────────────────────

function ImageBgPicker({
  label, value, onChange, onPickImage,
}: {
  label: string
  value: string | undefined
  onChange: (url: string | undefined) => void
  onPickImage?: (cb: (url: string) => void) => void
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] text-[#cbd5e1]">{label}</label>
      {value ? (
        <div className="relative group rounded overflow-hidden border border-[#334155]">
          <div
            className="w-full h-20 bg-cover bg-center"
            style={{ backgroundImage: `url("${value}")` }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/60 transition-colors">
            {onPickImage && (
              <button
                type="button"
                onClick={() => onPickImage(url => onChange(url))}
                className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4fc1] rounded transition-all"
              >
                Trocar
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[10px] font-semibold text-white bg-[#dc2626] hover:bg-[#b91c1c] rounded transition-all"
            >
              Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onPickImage?.(url => onChange(url))}
          disabled={!onPickImage}
          className="w-full h-20 flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-[#94b4d8] hover:text-white border-2 border-dashed border-[#334155] hover:border-[#60a5fa] hover:bg-[#1e3050] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🖼</span>
          <span>Escolher da galeria</span>
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PositionPicker — preview da imagem com 9 pontos (3×3) clicáveis
// para escolher a background-position (igual GreatPages)
// ─────────────────────────────────────────────────────────────────────────────

const POSITION_GRID: ReadonlyArray<{ value: string; row: 0|1|2; col: 0|1|2 }> = [
  { value: 'left top',       row: 0, col: 0 },
  { value: 'center top',     row: 0, col: 1 },
  { value: 'right top',      row: 0, col: 2 },
  { value: 'left center',    row: 1, col: 0 },
  { value: 'center center',  row: 1, col: 1 },
  { value: 'right center',   row: 1, col: 2 },
  { value: 'left bottom',    row: 2, col: 0 },
  { value: 'center bottom',  row: 2, col: 1 },
  { value: 'right bottom',   row: 2, col: 2 },
]

function isSamePosition(a: string | undefined, b: string): boolean {
  if (!a) return false
  // Normaliza variações: "center" === "center center", "top" === "center top", etc.
  const norm = (s: string) =>
    s.trim().toLowerCase()
     .replace(/^center$/, 'center center')
     .replace(/^top$/, 'center top')
     .replace(/^bottom$/, 'center bottom')
     .replace(/^left$/, 'left center')
     .replace(/^right$/, 'right center')
  return norm(a) === norm(b)
}

function PositionPicker({
  url, value, onChange,
}: {
  url: string
  value: string
  onChange: (pos: string) => void
}) {
  return (
    <div
      className="relative w-full rounded overflow-hidden border border-[#334155]"
      style={{
        aspectRatio: '16 / 9',
        backgroundImage: `url("${url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1 gap-0.5">
        {POSITION_GRID.map(p => {
          const selected = isSamePosition(value, p.value)
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className="flex items-center justify-center cursor-pointer"
              title={p.value}
            >
              <span
                className={`block rounded-full border-2 transition-all ${
                  selected
                    ? 'w-3.5 h-3.5 bg-[#2563eb] border-white shadow-md'
                    : 'w-2.5 h-2.5 bg-white/80 border-white/0 hover:bg-white hover:border-[#2563eb] hover:scale-110'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BgFitRadio — comportamento da imagem de fundo (5 opções igual GreatPages)
// ─────────────────────────────────────────────────────────────────────────────

type BgFit = 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | 'cover'

function blockBgFit(block: { bgSize?: string; bgRepeat?: string }): BgFit {
  if (block.bgSize === 'cover') return 'cover'
  switch (block.bgRepeat) {
    case 'repeat':   return 'repeat'
    case 'repeat-x': return 'repeat-x'
    case 'repeat-y': return 'repeat-y'
    default:         return 'no-repeat'
  }
}

function applyBgFit(fit: BgFit): { bgSize?: 'cover' | 'auto'; bgRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' } {
  if (fit === 'cover') return { bgSize: 'cover',  bgRepeat: 'no-repeat' }
  return { bgSize: 'auto', bgRepeat: fit }
}

function BgFitRadio({
  value, onChange,
}: {
  value: BgFit
  onChange: (v: BgFit) => void
}) {
  const opts: ReadonlyArray<{ value: BgFit; label: string }> = [
    { value: 'no-repeat', label: 'Não repetir' },
    { value: 'repeat',    label: 'Repetir vertical e horizontal' },
    { value: 'repeat-x',  label: 'Repetir na horizontal' },
    { value: 'repeat-y',  label: 'Repetir na vertical' },
    { value: 'cover',     label: 'Esticar imagem' },
  ]
  return (
    <div className="space-y-1">
      {opts.map(o => (
        <label
          key={o.value}
          className="flex items-center gap-2 cursor-pointer text-[12px] text-[#cbd5e1] hover:text-white transition-colors py-0.5"
        >
          <input
            type="radio"
            name="bg-fit"
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="accent-[#2563eb]"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA — configurações globais (largura, cor de fundo, fonte padrão)
// ─────────────────────────────────────────────────────────────────────────────

export function PaginaSections({
  page, onChange,
}: {
  page: PageModel
  onChange: (patch: Partial<PageModel>) => void
}) {
  return (
    <>
      <PropSection title="Tamanho da página">
        <PropNumber
          label="Largura"
          value={page.width}
          min={400} max={1920} step={10} unit="px"
          onChange={v => onChange({ width: Math.round(v) })}
        />
        <div className="px-3 pt-1 text-[10px] text-[#64748b] italic">
          Padrão Desktop: 1200px. Mobile usa sempre 390px.
        </div>
      </PropSection>

      <PropSection title="Aparência">
        <PropColor
          label="Cor de fundo"
          value={page.bgColor ?? '#ffffff'}
          onChange={v => onChange({ bgColor: v })}
        />
        <PropSelect
          label="Fonte padrão"
          value={page.fontFamily ?? 'Inter, system-ui, sans-serif'}
          options={FONT_FAMILIES}
          onChange={v => onChange({ fontFamily: v })}
        />
      </PropSection>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCO — propriedades da seção (cor/imagem de fundo, altura, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export function BlocoSections({
  block, device, onChange, onPickImage, onDelete, canDelete,
}: {
  block: Block
  device: 'Desktop' | 'Mobile'
  onChange: (patch: Partial<Block>) => void
  onPickImage?: (cb: (url: string) => void) => void
  onDelete?: () => void
  canDelete?: boolean
}) {
  return (
    <>
      <PropSection title="Fundo">
        <PropColor
          label="Cor de fundo"
          value={block.bgColor ?? '#ffffff'}
          onChange={v => onChange({ bgColor: v })}
        />
        <GradientPresets
          value={block.bgGradient}
          onChange={g => onChange({ bgGradient: g })}
        />
        <ImageBgPicker
          label="Imagem de fundo"
          value={block.bgImage}
          onPickImage={onPickImage}
          onChange={url => onChange({ bgImage: url })}
        />
      </PropSection>

      {block.bgImage && (
        <PropSection title="Posição da imagem">
          <PositionPicker
            url={block.bgImage}
            value={block.bgPosition ?? 'center center'}
            onChange={v => onChange({ bgPosition: v })}
          />
          <BgFitRadio
            value={blockBgFit(block)}
            onChange={fit => onChange(applyBgFit(fit))}
          />
        </PropSection>
      )}

      {block.bgImage && (
        <PropSection title="Sobreposição">
          <PropColor
            label="Cor"
            value={block.bgOverlayColor ?? '#000000'}
            onChange={v => onChange({ bgOverlayColor: v })}
          />
          <PropSlider
            label="Sobrepor"
            value={Math.round((block.bgOverlayOpacity ?? 0) * 100)}
            min={0} max={100} unit="%"
            defaultValue={0}
            onChange={v => onChange({ bgOverlayOpacity: v / 100 })}
          />
          <PropToggle
            label="Efeito Parallax"
            value={block.bgAttachment === 'fixed'}
            onChange={v => onChange({ bgAttachment: v ? 'fixed' : 'scroll' })}
          />
        </PropSection>
      )}

      <PropSection title="Tamanho">
        <PropNumber
          label="Altura desktop"
          value={block.height}
          min={80} max={3000} unit="px"
          onChange={v => onChange({ height: Math.round(v) })}
        />
        <PropNumber
          label="Altura mobile"
          value={block.heightMobile ?? block.height}
          min={80} max={3000} unit="px"
          onChange={v => onChange({ heightMobile: Math.round(v) })}
        />
        {block.heightMobile != null && (
          <button
            type="button"
            onClick={() => onChange({ heightMobile: undefined })}
            className="w-full text-[10px] text-[#94b4d8] hover:text-white bg-[#1e3050] hover:bg-[#253660] py-1 rounded transition-colors"
            title="Volta a usar altura desktop também no mobile"
          >
            Resetar mobile → desktop
          </button>
        )}
      </PropSection>

      {onDelete && (
        <PropSection title="Ações">
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => {
              if (confirm('Remover este bloco e todos os elementos dentro dele?')) onDelete()
            }}
            className={`w-full flex items-center justify-center gap-2 text-[11px] font-semibold py-2 rounded transition-colors ${
              canDelete
                ? 'text-white bg-[#dc2626] hover:bg-[#b91c1c]'
                : 'text-[#475569] bg-[#1e3050] cursor-not-allowed'
            }`}
            title={canDelete ? 'Excluir bloco' : 'Não é possível excluir o último bloco'}
          >
            <Trash2 size={12} /> Excluir bloco
          </button>
        </PropSection>
      )}

      {/* Indicador device atual */}
      <div className="px-3 pb-2 text-[10px] text-[#64748b] italic">
        Editando em modo {device}
      </div>
    </>
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
  el, device = 'Desktop', pageWidth = 1200, onChange,
}: {
  el: Elem
  device?: 'Desktop' | 'Mobile'
  pageWidth?: number
  onChange: (patch: Partial<Elem>) => void
}) {
  // Coords ativos (usa mobile se existir, senão escala de desktop).
  const active = getActiveCoords(el, device, pageWidth)

  const update = (patch: { x?: number; y?: number; w?: number; h?: number }) => {
    if (device === 'Mobile') {
      const cur = getActiveCoords(el, 'Mobile', pageWidth)
      onChange({ mobile: { ...cur, ...patch } } as Partial<Elem>)
    } else {
      onChange(patch as Partial<Elem>)
    }
  }

  return (
    <PropSection title="Posição e tamanho" collapsible defaultOpen={false}>
      <PropNumber label="X" value={active.x} unit="px" onChange={v => update({ x: Math.round(v) })} />
      <PropNumber label="Y" value={active.y} unit="px" onChange={v => update({ y: Math.round(v) })} />
      <PropNumber label="Largura" value={active.w} min={10} unit="px" onChange={v => update({ w: Math.round(v) })} />
      <PropNumber label="Altura" value={active.h} min={10} unit="px" onChange={v => update({ h: Math.round(v) })} />
      <PropSlider
        label="Rotação"
        value={el.rotation ?? 0}
        min={-180} max={180}
        unit="°"
        defaultValue={0}
        onChange={v => onChange({ rotation: v || undefined } as Partial<Elem>)}
      />
      {device === 'Mobile' && el.mobile && (
        <button
          type="button"
          onClick={() => onChange({ mobile: undefined } as Partial<Elem>)}
          className="w-full text-[10px] text-[#94b4d8] hover:text-white bg-[#1e3050] hover:bg-[#253660] py-1.5 rounded transition-colors"
          title="Descarta coords mobile; volta a usar os coords desktop"
        >
          Resetar mobile → desktop
        </button>
      )}
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
