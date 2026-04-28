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
  FormularioElement, FormFieldConfig, FormFieldKind, FormFieldMask,
  FaqElement, FaqItem,
  TimerElement, TimerUnit, TimerLayout, TimerExpiredAction, TimerMode,
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
// FORMULÁRIO
// ─────────────────────────────────────────────────────────────────────────────

const FIELD_KIND_OPTS: ReadonlyArray<{ value: FormFieldKind; label: string }> = [
  { value: 'texto-curto',    label: 'Texto curto' },
  { value: 'texto-longo',    label: 'Texto longo (textarea)' },
  { value: 'email',          label: 'E-mail' },
  { value: 'telefone',       label: 'Telefone' },
  { value: 'select',         label: 'Lista (dropdown)' },
  { value: 'radio',          label: 'Escolha única (radio)' },
  { value: 'checkbox-grupo', label: 'Múltipla escolha' },
  { value: 'lgpd',           label: 'Consentimento LGPD' },
  { value: 'hidden',         label: 'Campo oculto (UTM)' },
]

const MASK_OPTS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '',         label: 'Sem máscara' },
  { value: 'phone-br', label: 'Telefone (BR)' },
  { value: 'cpf',      label: 'CPF' },
  { value: 'cnpj',     label: 'CNPJ' },
  { value: 'cep',      label: 'CEP' },
]

const WEBHOOK_METHOD_OPTS: ReadonlyArray<{ value: 'POST_JSON' | 'POST_FORM' | 'GET'; label: string }> = [
  { value: 'POST_JSON', label: 'POST (JSON)' },
  { value: 'POST_FORM', label: 'POST (form-urlencoded)' },
  { value: 'GET',       label: 'GET (querystring)' },
]

export function FormularioSections({
  el, onChange,
}: {
  el: FormularioElement
  onChange: (patch: Partial<FormularioElement>) => void
}) {
  const fields = el.fields ?? []

  const updateField = (idx: number, patch: Partial<FormFieldConfig>) => {
    const next = fields.map((f, i) => i === idx ? { ...f, ...patch } : f)
    onChange({ fields: next })
  }
  const addField = () => {
    const id = `f-${Math.random().toString(36).slice(2, 6)}`
    const next: FormFieldConfig[] = [
      ...fields,
      { id, kind: 'texto-curto', name: `campo_${fields.length + 1}`,
        label: 'Novo campo', placeholder: '' },
    ]
    onChange({ fields: next })
  }
  const removeField = (idx: number) => {
    onChange({ fields: fields.filter((_, i) => i !== idx) })
  }
  const moveField = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= fields.length) return
    const next = [...fields]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    onChange({ fields: next })
  }

  return (
    <>
      <PropSection title="Botão de envio">
        <PropText label="Texto" value={el.submitText ?? 'Enviar'}
          onChange={v => onChange({ submitText: v })} />
        <PropColor label="Cor de fundo" value={el.submitBg ?? '#2563eb'}
          onChange={v => onChange({ submitBg: v })} />
        <PropColor label="Cor do texto" value={el.submitColor ?? '#ffffff'}
          onChange={v => onChange({ submitColor: v })} />
        <PropSlider label="Arredondamento" value={el.submitRadius ?? 8}
          min={0} max={40} unit="px"
          onChange={v => onChange({ submitRadius: v })} />
      </PropSection>

      <PropSection title={`Campos (${fields.length})`}>
        {fields.map((f, i) => (
          <FieldEditor
            key={f.id}
            field={f}
            index={i}
            total={fields.length}
            onUpdate={patch => updateField(i, patch)}
            onRemove={() => removeField(i)}
            onMove={dir => moveField(i, dir)}
          />
        ))}
        <button
          type="button"
          onClick={addField}
          className="mt-2 w-full px-3 py-2 text-[12px] font-semibold rounded bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] border border-[#334155]"
        >
          + Adicionar campo
        </button>
      </PropSection>

      <PropSection title="Após envio">
        <PropText
          label="Mensagem de sucesso"
          placeholder="✓ Recebido! Em breve entraremos em contato."
          value={el.successMessage ?? ''}
          onChange={v => onChange({ successMessage: v || undefined })}
        />
        <PropText
          label="URL de redirect"
          placeholder="https://… (opcional, sobrepõe a mensagem)"
          value={el.redirectUrl ?? ''}
          onChange={v => onChange({ redirectUrl: v || undefined })}
        />
      </PropSection>

      <PropSection title="Integrações">
        <PropText
          label="Webhook URL"
          placeholder="https://hooks.zapier.com/…"
          value={el.webhookUrl ?? ''}
          onChange={v => onChange({ webhookUrl: v || undefined })}
        />
        {el.webhookUrl && (
          <>
            <PropSelect<'POST_JSON' | 'POST_FORM' | 'GET'>
              label="Método"
              value={el.webhookMethod ?? 'POST_JSON'}
              options={WEBHOOK_METHOD_OPTS}
              onChange={v => onChange({ webhookMethod: v })}
            />
            <PropText
              label="Token (Bearer)"
              placeholder="opcional"
              value={el.webhookToken ?? ''}
              onChange={v => onChange({ webhookToken: v || undefined })}
            />
          </>
        )}
        <PropText
          label="Evento Facebook Pixel"
          placeholder="Lead, CompleteRegistration…"
          value={el.fbPixelEvent ?? ''}
          onChange={v => onChange({ fbPixelEvent: v || undefined })}
        />
      </PropSection>

      <PropSection title="Estilo do formulário">
        <PropColor label="Fundo" value={el.bgColor ?? '#ffffff'}
          onChange={v => onChange({ bgColor: v })} />
        <PropSlider label="Espaçamento entre campos" value={el.fieldGap ?? 12}
          min={4} max={32} unit="px"
          onChange={v => onChange({ fieldGap: v })} />
      </PropSection>

      <PropSection title="Estilo dos inputs">
        <PropColor label="Fundo do input" value={el.inputBg ?? '#ffffff'}
          onChange={v => onChange({ inputBg: v })} />
        <PropColor label="Cor do texto" value={el.inputColor ?? '#0f172a'}
          onChange={v => onChange({ inputColor: v })} />
        <PropColor label="Cor da borda" value={el.inputBorderColor ?? '#e2e8f0'}
          onChange={v => onChange({ inputBorderColor: v })} />
        <PropSlider label="Arredondamento" value={el.inputRadius ?? 8}
          min={0} max={40} unit="px"
          onChange={v => onChange({ inputRadius: v })} />
      </PropSection>

      <BordasAvancadasSection borders={el.borders} onChange={v => onChange({ borders: v })} />
      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<FormularioElement>)}
      />
    </>
  )
}

/** Editor de um campo individual do formulário. */
function FieldEditor({
  field, index, total, onUpdate, onRemove, onMove,
}: {
  field: FormFieldConfig
  index: number
  total: number
  onUpdate: (patch: Partial<FormFieldConfig>) => void
  onRemove: () => void
  onMove:   (dir: -1 | 1) => void
}) {
  const optionsText = (field.options ?? []).join('\n')
  const showOptions  = field.kind === 'select' || field.kind === 'radio' || field.kind === 'checkbox-grupo'
  const showMask     = field.kind === 'texto-curto' || field.kind === 'telefone'
  const isHidden     = field.kind === 'hidden'
  const isLgpd       = field.kind === 'lgpd'

  return (
    <div className="mb-3 p-2 rounded bg-[#0b1220] border border-[#1e293b]">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[10px] font-semibold text-[#64748b] uppercase">#{index + 1}</span>
        <div className="flex-1" />
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          className="px-2 py-0.5 text-[11px] rounded text-[#94a3b8] hover:bg-[#1e293b] disabled:opacity-30"
          title="Mover acima">↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          className="px-2 py-0.5 text-[11px] rounded text-[#94a3b8] hover:bg-[#1e293b] disabled:opacity-30"
          title="Mover abaixo">↓</button>
        <button type="button" onClick={onRemove}
          className="px-2 py-0.5 text-[11px] rounded text-[#ef4444] hover:bg-[#1e293b]"
          title="Remover">✕</button>
      </div>
      <div className="flex flex-col gap-1.5">
        <PropSelect<FormFieldKind>
          label="Tipo"
          value={field.kind}
          options={FIELD_KIND_OPTS}
          onChange={v => onUpdate({ kind: v })}
        />
        <PropText
          label="Nome (key)"
          value={field.name}
          placeholder="email, name, phone…"
          onChange={v => onUpdate({ name: v })}
        />
        {!isHidden && (
          <PropText
            label="Label"
            value={field.label ?? ''}
            placeholder="Texto acima do campo"
            onChange={v => onUpdate({ label: v || undefined })}
          />
        )}
        {!isHidden && !isLgpd && (
          <PropText
            label="Placeholder"
            value={field.placeholder ?? ''}
            onChange={v => onUpdate({ placeholder: v || undefined })}
          />
        )}
        {showOptions && (
          <div>
            <label className="block text-[12px] text-[#cbd5e1] mb-1">Opções (uma por linha)</label>
            <textarea
              value={optionsText}
              onChange={e => onUpdate({ options: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
              className="w-full px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
              rows={3}
              placeholder={'Opção 1\nOpção 2\nOpção 3'}
            />
          </div>
        )}
        {showMask && (
          <PropSelect<string>
            label="Máscara"
            value={field.mask ?? ''}
            options={MASK_OPTS}
            onChange={v => onUpdate({ mask: (v || null) as FormFieldMask })}
          />
        )}
        {isHidden && (
          <PropText
            label="Valor padrão"
            value={field.defaultValue ?? ''}
            placeholder="Pré-preenchido via UTM"
            onChange={v => onUpdate({ defaultValue: v || undefined })}
          />
        )}
        {!isHidden && !isLgpd && (
          <PropToggle
            label="Obrigatório"
            value={field.required ?? false}
            onChange={v => onUpdate({ required: v })}
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_ICON_OPTS: ReadonlyArray<{ value: 'plus' | 'chevron'; label: string }> = [
  { value: 'plus', label: '+ / x' },
  { value: 'chevron', label: '⌄' },
]

export function FaqSections({
  el, onChange,
}: {
  el: FaqElement
  onChange: (patch: Partial<FaqElement>) => void
}) {
  const items = el.items ?? []

  const updateItem = (idx: number, patch: Partial<FaqItem>) => {
    onChange({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) })
  }
  const addItem = () => {
    const id = `f-${Math.random().toString(36).slice(2, 6)}`
    onChange({ items: [...items, { id, q: 'Nova pergunta?', a: 'Sua resposta aqui.' }] })
  }
  const removeItem = (idx: number) => {
    onChange({ items: items.filter((_, i) => i !== idx) })
  }
  const moveItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= items.length) return
    const next = [...items]
    ;[next[idx], next[newIdx]] = [next[newIdx], next[idx]]
    onChange({ items: next })
  }
  const toggleOpen = (idx: number) => {
    onChange({ items: items.map((it, i) => i === idx ? { ...it, open: !it.open } : it) })
  }

  return (
    <>
      <PropSection title={`Perguntas (${items.length})`}>
        {items.map((item, i) => (
          <FaqItemEditor
            key={item.id}
            item={item}
            index={i}
            total={items.length}
            onUpdate={p => updateItem(i, p)}
            onRemove={() => removeItem(i)}
            onMove={d => moveItem(i, d)}
            onToggleOpen={() => toggleOpen(i)}
          />
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 w-full px-3 py-2 text-[12px] font-semibold rounded bg-[#1e293b] hover:bg-[#334155] text-[#cbd5e1] border border-[#334155]"
        >
          + Adicionar pergunta
        </button>
      </PropSection>

      <PropSection title="Estilo dos itens">
        <PropColor label="Fundo" value={el.itemBgColor ?? '#ffffff'}
          onChange={v => onChange({ itemBgColor: v })} />
        <PropColor label="Borda" value={el.itemBorderColor ?? '#e2e8f0'}
          onChange={v => onChange({ itemBorderColor: v })} />
        <PropSlider label="Arredondamento" value={el.itemBorderRadius ?? 12}
          min={0} max={32} unit="px"
          onChange={v => onChange({ itemBorderRadius: v })} />
        <PropSlider label="Espaçamento entre itens" value={el.itemSpacing ?? 12}
          min={0} max={32} unit="px"
          onChange={v => onChange({ itemSpacing: v })} />
        <PropSlider label="Padding horizontal" value={el.itemPaddingX ?? 24}
          min={8} max={48} unit="px"
          onChange={v => onChange({ itemPaddingX: v })} />
        <PropSlider label="Padding vertical" value={el.itemPaddingY ?? 18}
          min={8} max={36} unit="px"
          onChange={v => onChange({ itemPaddingY: v })} />
      </PropSection>

      <PropSection title="Faixa de destaque (esquerda)">
        <PropColor label="Cor" value={el.accentColor ?? '#2563eb'}
          onChange={v => onChange({ accentColor: v })} />
        <PropSlider label="Largura" value={el.accentWidth ?? 4}
          min={0} max={12} unit="px"
          onChange={v => onChange({ accentWidth: v })} />
      </PropSection>

      <PropSection title="Estilo da pergunta">
        <PropColor label="Cor" value={el.qColor ?? '#0f172a'}
          onChange={v => onChange({ qColor: v })} />
        <PropSlider label="Tamanho" value={el.qFontSize ?? 16}
          min={12} max={28} unit="px"
          onChange={v => onChange({ qFontSize: v })} />
        <PropSlider label="Peso" value={el.qFontWeight ?? 700}
          min={400} max={900} step={100}
          onChange={v => onChange({ qFontWeight: v })} />
        <PropSelect<'h2' | 'h3' | 'h4' | 'h5' | 'h6'>
          label="Tag semântica"
          value={('h' + (el.qHeadingLevel ?? 3)) as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}
          options={[
            { value: 'h2', label: 'h2' },
            { value: 'h3', label: 'h3' },
            { value: 'h4', label: 'h4' },
            { value: 'h5', label: 'h5' },
            { value: 'h6', label: 'h6' },
          ]}
          onChange={v => onChange({ qHeadingLevel: parseInt(v.replace('h',''),10) as 2|3|4|5|6 })}
        />
      </PropSection>

      <PropSection title="Estilo da resposta">
        <PropColor label="Cor" value={el.aColor ?? '#64748b'}
          onChange={v => onChange({ aColor: v })} />
        <PropSlider label="Tamanho" value={el.aFontSize ?? 14}
          min={11} max={20} unit="px"
          onChange={v => onChange({ aFontSize: v })} />
      </PropSection>

      <PropSection title="Ícone">
        <PropSelect<'plus' | 'chevron'>
          label="Estilo"
          value={el.iconStyle ?? 'plus'}
          options={FAQ_ICON_OPTS}
          onChange={v => onChange({ iconStyle: v })}
        />
        <PropColor label="Cor" value={el.iconColor ?? (el.accentColor ?? '#2563eb')}
          onChange={v => onChange({ iconColor: v })} />
      </PropSection>

      <PropSection title="Comportamento">
        <PropToggle
          label="Permitir múltiplos abertos"
          value={el.allowMultipleOpen ?? false}
          onChange={v => onChange({ allowMultipleOpen: v })}
        />
      </PropSection>

      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<FaqElement>)}
      />
    </>
  )
}

function FaqItemEditor({
  item, index, total, onUpdate, onRemove, onMove, onToggleOpen,
}: {
  item: FaqItem
  index: number
  total: number
  onUpdate:     (patch: Partial<FaqItem>) => void
  onRemove:     () => void
  onMove:       (dir: -1 | 1) => void
  onToggleOpen: () => void
}) {
  return (
    <div className="mb-3 p-2 rounded bg-[#0b1220] border border-[#1e293b]">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[10px] font-semibold text-[#64748b] uppercase">#{index + 1}</span>
        <div className="flex-1" />
        <button type="button" onClick={onToggleOpen}
          className={`px-2 py-0.5 text-[10px] rounded ${item.open ? 'bg-[#1e3a8a] text-[#bfdbfe]' : 'text-[#94a3b8] hover:bg-[#1e293b]'}`}
          title="Começar aberto">{item.open ? '◉' : '○'}</button>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
          className="px-2 py-0.5 text-[11px] rounded text-[#94a3b8] hover:bg-[#1e293b] disabled:opacity-30"
          title="Mover acima">↑</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
          className="px-2 py-0.5 text-[11px] rounded text-[#94a3b8] hover:bg-[#1e293b] disabled:opacity-30"
          title="Mover abaixo">↓</button>
        <button type="button" onClick={onRemove}
          className="px-2 py-0.5 text-[11px] rounded text-[#ef4444] hover:bg-[#1e293b]"
          title="Remover">✕</button>
      </div>
      <div className="flex flex-col gap-1.5">
        <PropText
          label="Pergunta"
          value={item.q}
          onChange={v => onUpdate({ q: v })}
        />
        <div>
          <label className="block text-[12px] text-[#cbd5e1] mb-1">Resposta</label>
          <textarea
            value={item.a}
            onChange={e => onUpdate({ a: e.target.value })}
            className="w-full px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
            rows={3}
          />
          <div className="text-[10px] text-[#64748b] mt-1">
            HTML inline permitido (&lt;b&gt;, &lt;em&gt;, &lt;br&gt;, &lt;a&gt;)
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────────────────────────────────────────

const TIMER_MODE_OPTS: ReadonlyArray<{ value: TimerMode; label: string }> = [
  { value: 'relative', label: 'Relativo (a partir do 1º acesso)' },
  { value: 'fixed',    label: 'Data fixa absoluta' },
]

const TIMER_LAYOUT_OPTS: ReadonlyArray<{ value: TimerLayout; label: string }> = [
  { value: 'cards',   label: 'Cards (separados)' },
  { value: 'strip',   label: 'Strip (compacto)' },
  { value: 'minimal', label: 'Minimalista (sem caixa)' },
]

const TIMER_EXPIRED_OPTS: ReadonlyArray<{ value: TimerExpiredAction; label: string }> = [
  { value: 'stay',     label: 'Ficar em 00:00:00' },
  { value: 'message',  label: 'Mostrar mensagem' },
  { value: 'redirect', label: 'Redirecionar pra URL' },
  { value: 'hide',     label: 'Esconder o timer' },
]

const TIMER_DURATION_PRESETS: ReadonlyArray<{ value: number; label: string }> = [
  { value: 60,    label: '1 hora' },
  { value: 360,   label: '6 horas' },
  { value: 720,   label: '12 horas' },
  { value: 1440,  label: '24 horas' },
  { value: 2880,  label: '2 dias' },
  { value: 4320,  label: '3 dias' },
  { value: 10080, label: '7 dias' },
  { value: 43200, label: '30 dias' },
]

export function TimerSections({
  el, onChange,
}: {
  el: TimerElement
  onChange: (patch: Partial<TimerElement>) => void
}) {
  const units = el.units && el.units.length ? el.units : (['days','hours','minutes','seconds'] as TimerUnit[])
  const toggleUnit = (u: TimerUnit) => {
    const has = units.includes(u)
    const order: TimerUnit[] = ['days', 'hours', 'minutes', 'seconds']
    const next = has
      ? units.filter(x => x !== u)
      : order.filter(x => units.includes(x) || x === u)
    if (next.length === 0) return // pelo menos uma unidade visível
    onChange({ units: next })
  }
  const mode = el.mode || 'relative'

  return (
    <>
      <PropSection title="Modo">
        <PropSelect<TimerMode>
          label="Tipo"
          value={mode}
          options={TIMER_MODE_OPTS}
          onChange={v => onChange({ mode: v })}
        />
        {mode === 'relative' && (
          <>
            <PropSelect<string>
              label="Duração (preset)"
              value={String(el.relativeMinutes ?? 1440)}
              options={[
                ...TIMER_DURATION_PRESETS.map(p => ({ value: String(p.value), label: p.label })),
                { value: 'custom', label: '— Custom —' },
              ]}
              onChange={v => {
                if (v === 'custom') return
                onChange({ relativeMinutes: parseInt(v, 10) })
              }}
            />
            <PropNumber
              label="Duração custom (min)"
              value={el.relativeMinutes ?? 1440}
              min={1} max={525600}
              onChange={v => onChange({ relativeMinutes: v })}
            />
            <div className="text-[10px] text-[#64748b] -mt-1 leading-tight">
              Persistência por visitante: o tempo começa quando ele acessa
              a página pela 1ª vez. Refresh não reseta.
            </div>
          </>
        )}
        {mode === 'fixed' && (
          <>
            <div>
              <label className="block text-[12px] text-[#cbd5e1] mb-1">Data alvo</label>
              <input
                type="datetime-local"
                value={el.fixedDate ?? ''}
                onChange={e => onChange({ fixedDate: e.target.value || undefined })}
                className="w-full px-2 py-1 text-[12px] bg-[#0f172a] border border-[#334155] rounded text-[#cbd5e1] focus:border-[#60a5fa] outline-none"
              />
              <div className="text-[10px] text-[#64748b] mt-1">
                Mesma data pra todos os visitantes (ex: lançamento, BlackFriday).
              </div>
            </div>
          </>
        )}
      </PropSection>

      <PropSection title="Unidades exibidas">
        {(['days', 'hours', 'minutes', 'seconds'] as TimerUnit[]).map(u => (
          <PropToggle
            key={u}
            label={u === 'days' ? 'Dias' : u === 'hours' ? 'Horas' : u === 'minutes' ? 'Minutos' : 'Segundos'}
            value={units.includes(u)}
            onChange={() => toggleUnit(u)}
          />
        ))}
      </PropSection>

      <PropSection title="Layout">
        <PropSelect<TimerLayout>
          label="Estilo"
          value={el.layout ?? 'cards'}
          options={TIMER_LAYOUT_OPTS}
          onChange={v => onChange({ layout: v })}
        />
        <PropSlider label="Espaçamento entre" value={el.unitSpacing ?? 12}
          min={0} max={48} unit="px"
          onChange={v => onChange({ unitSpacing: v })} />
        {el.layout === 'strip' && (
          <PropToggle
            label='Mostrar separadores ":"'
            value={el.showSeparators ?? false}
            onChange={v => onChange({ showSeparators: v })}
          />
        )}
      </PropSection>

      <PropSection title="Caixinhas">
        <PropColor label="Fundo" value={el.boxBgColor ?? '#ffffff'}
          onChange={v => onChange({ boxBgColor: v })} />
        <PropColor label="Borda" value={el.boxBorderColor ?? 'transparent'}
          onChange={v => onChange({ boxBorderColor: v })} />
        <PropSlider label="Arredondamento" value={el.boxBorderRadius ?? 14}
          min={0} max={32} unit="px"
          onChange={v => onChange({ boxBorderRadius: v })} />
      </PropSection>

      <PropSection title="Números">
        <PropColor label="Cor" value={el.numberColor ?? '#dc2626'}
          onChange={v => onChange({ numberColor: v })} />
        <PropSlider label="Tamanho" value={el.numberFontSize ?? 48}
          min={20} max={96} unit="px"
          onChange={v => onChange({ numberFontSize: v })} />
        <PropSlider label="Peso" value={el.numberFontWeight ?? 900}
          min={400} max={900} step={100}
          onChange={v => onChange({ numberFontWeight: v })} />
      </PropSection>

      <PropSection title="Labels">
        <PropColor label="Cor" value={el.labelColor ?? '#7f1d1d'}
          onChange={v => onChange({ labelColor: v })} />
        <PropSlider label="Tamanho" value={el.labelFontSize ?? 11}
          min={8} max={20} unit="px"
          onChange={v => onChange({ labelFontSize: v })} />
        <PropText label="Dias" value={el.labelDays ?? 'DIAS'}
          onChange={v => onChange({ labelDays: v })} />
        <PropText label="Horas" value={el.labelHours ?? 'HORAS'}
          onChange={v => onChange({ labelHours: v })} />
        <PropText label="Minutos" value={el.labelMinutes ?? 'MIN'}
          onChange={v => onChange({ labelMinutes: v })} />
        <PropText label="Segundos" value={el.labelSeconds ?? 'SEG'}
          onChange={v => onChange({ labelSeconds: v })} />
      </PropSection>

      <PropSection title="Quando expirar">
        <PropSelect<TimerExpiredAction>
          label="Ação"
          value={el.expiredAction ?? 'stay'}
          options={TIMER_EXPIRED_OPTS}
          onChange={v => onChange({ expiredAction: v })}
        />
        {el.expiredAction === 'message' && (
          <PropText
            label="Mensagem"
            value={el.expiredMessage ?? 'Esta oferta encerrou.'}
            onChange={v => onChange({ expiredMessage: v })}
          />
        )}
        {el.expiredAction === 'redirect' && (
          <PropText
            label="URL de redirect"
            placeholder="https://…"
            value={el.expiredRedirect ?? ''}
            onChange={v => onChange({ expiredRedirect: v || undefined })}
          />
        )}
      </PropSection>

      <EfeitosSection
        opacity={el.opacity}
        shadow={el.shadow}
        onChange={p => onChange(p as Partial<TimerElement>)}
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
