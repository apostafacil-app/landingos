'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sparkles, Loader2, HelpCircle, ChevronRight, ChevronLeft, Check, Pencil,
} from 'lucide-react'

/* ── Configuração dos passos ───────────────────────────── */
const STEPS = [
  {
    title: 'Seu negócio',
    subtitle: 'Informações básicas sobre o que você faz',
    fields: ['pageName', 'businessName', 'segment'],
  },
  {
    title: 'Seu cliente',
    subtitle: 'Quem você quer alcançar e qual problema você resolve',
    fields: ['targetAudience', 'painPoint', 'desire'],
  },
  {
    title: 'Sua oferta',
    subtitle: 'O que você oferece e como o cliente pode acessar',
    fields: ['offer', 'websiteUrl'],
  },
]

/* ── Configuração dos campos ───────────────────────────── */
type FieldConfig = {
  label: string
  placeholder: string
  maxLength: number
  multiline?: boolean
  rows?: number
  optional?: boolean
  tooltip?: string
}

const FIELDS: Record<string, FieldConfig> = {
  pageName: {
    label: 'Nome da página',
    placeholder: 'Ex: Consultoria de Marketing Digital',
    maxLength: 100,
  },
  businessName: {
    label: 'Nome do negócio',
    placeholder: 'Ex: Agência Impulso',
    maxLength: 100,
  },
  segment: {
    label: 'Segmento / nicho',
    placeholder: 'Ex: Marketing digital para pequenas empresas',
    maxLength: 100,
  },
  targetAudience: {
    label: 'Público-alvo',
    placeholder: 'Ex: Donos de pequenas empresas que querem mais clientes online',
    maxLength: 500, multiline: true, rows: 4,
    tooltip: 'Descreva quem é seu cliente ideal: cargo, tamanho de empresa, fase de vida ou qualquer característica que o define. Quanto mais específico, melhor a copy gerada.',
  },
  painPoint: {
    label: 'Principal dor / problema',
    placeholder: 'Ex: Gastam em anúncios mas não veem retorno no faturamento',
    maxLength: 500, multiline: true, rows: 4,
    tooltip: 'Qual é o maior problema ou frustração que seu cliente enfrenta hoje? A IA usa isso para criar um texto que ressoa emocionalmente com ele.',
  },
  desire: {
    label: 'Desejo / transformação',
    placeholder: 'Ex: Ter um fluxo previsível de clientes todo mês sem depender de indicações',
    maxLength: 500, multiline: true, rows: 4,
    tooltip: 'Qual é o resultado que seu cliente sonha alcançar? Descreva a transformação concreta que seu produto ou serviço entrega.',
  },
  offer: {
    label: 'Sua oferta',
    placeholder: 'Ex: Gestão completa de anúncios no Google e Meta por R$997/mês',
    maxLength: 500, multiline: true, rows: 4,
  },
  websiteUrl: {
    label: 'URL do site (opcional)',
    placeholder: 'https://seusite.com.br',
    maxLength: 2000, optional: true,
  },
}

/* ── Componente principal ──────────────────────────────── */
export function NovaPageForm() {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isReview = stepIdx === STEPS.length

  function change(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  function stepValid(idx: number) {
    return STEPS[idx].fields.every(f => FIELDS[f].optional || values[f]?.trim())
  }

  async function generate() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao gerar. Tente novamente.'); return }
      router.push(`/paginas/${data.pageId}`)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl w-full mx-auto">
      <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">

        {/* ── Indicador de passos ── regras 5.1, 5.5, 5.6 */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex items-center gap-1 flex-1 min-w-0">
                {i > 0 && (
                  <div className={`h-px flex-1 transition-colors ${i <= stepIdx ? 'bg-primary' : 'bg-border'}`} />
                )}
                <button
                  type="button"
                  onClick={() => i < stepIdx && setStepIdx(i)}
                  className={`flex items-center gap-1.5 shrink-0 text-xs font-medium transition-colors ${
                    i === stepIdx ? 'text-primary' :
                    i < stepIdx ? 'text-muted-foreground hover:text-foreground cursor-pointer' :
                    'text-muted-foreground/40 cursor-default'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                    i < stepIdx  ? 'bg-primary text-white' :
                    i === stepIdx ? 'bg-primary/10 text-primary border border-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {i < stepIdx ? <Check size={10} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline truncate">{s.title}</span>
                </button>
              </div>
            ))}
            {/* Passo de revisão */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <div className={`h-px flex-1 transition-colors ${isReview ? 'bg-primary' : 'bg-border'}`} />
              <div className={`flex items-center gap-1.5 shrink-0 text-xs font-medium ${isReview ? 'text-primary' : 'text-muted-foreground/40'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isReview ? 'bg-primary/10 text-primary border border-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {STEPS.length + 1}
                </div>
                <span className="hidden sm:inline">Revisar</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Formulário por etapa ── */}
        {!isReview ? (
          <div className="px-6 py-5">
            <div className="mb-5">
              <h2 className="text-[14px] font-semibold text-foreground">{STEPS[stepIdx].title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{STEPS[stepIdx].subtitle}</p>
            </div>

            <div className="space-y-4">
              {STEPS[stepIdx].fields.map(name => {
                const cfg = FIELDS[name]
                return (
                  <div key={name} className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Label htmlFor={name}>
                        {cfg.label}
                        {cfg.optional && <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>}
                      </Label>
                      {cfg.tooltip && <TooltipIcon text={cfg.tooltip} />}
                    </div>
                    {cfg.multiline ? (
                      <textarea
                        id={name}
                        placeholder={cfg.placeholder}
                        maxLength={cfg.maxLength}
                        rows={cfg.rows ?? 4}
                        value={values[name] ?? ''}
                        onChange={e => change(name, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                        required={!cfg.optional}
                      />
                    ) : (
                      <Input
                        id={name}
                        type={name === 'websiteUrl' ? 'url' : 'text'}
                        placeholder={cfg.placeholder}
                        maxLength={cfg.maxLength}
                        value={values[name] ?? ''}
                        onChange={e => change(name, e.target.value)}
                        onBlur={name === 'websiteUrl' ? e => {
                          /* 7.5 — auto-corrige URL: seusite.com → https://seusite.com */
                          const v = e.target.value.trim()
                          if (v && !v.startsWith('http://') && !v.startsWith('https://')) {
                            change(name, `https://${v}`)
                          }
                        } : undefined}
                        className="h-10"
                        required={!cfg.optional}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStepIdx(s => s - 1)}
                className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${stepIdx === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft size={15} /> Voltar
              </button>
              <button
                type="button"
                onClick={() => setStepIdx(s => s + 1)}
                disabled={!stepValid(stepIdx)}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {stepIdx === STEPS.length - 1 ? 'Revisar' : 'Continuar'}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* ── Revisão — regra 5.8 ── */
          <div className="px-6 py-5">
            <div className="mb-5">
              <h2 className="text-[14px] font-semibold text-foreground">Revise as informações</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Confira tudo antes de consumir um crédito de IA</p>
            </div>

            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s.title} className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#f9fafb] border-b border-border">
                    <span className="text-xs font-semibold text-foreground">{s.title}</span>
                    <button
                      type="button"
                      onClick={() => setStepIdx(i)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                    >
                      <Pencil size={11} /> Editar
                    </button>
                  </div>
                  <div className="px-4 py-3 space-y-2.5">
                    {s.fields.map(name => {
                      const val = values[name]
                      if (!val) return null
                      return (
                        <div key={name}>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                            {FIELDS[name].label}
                          </p>
                          <p className="text-sm text-foreground line-clamp-3">{val}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setStepIdx(STEPS.length - 1)}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft size={15} /> Voltar
              </button>

              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                  : <><Sparkles size={15} /> Gerar página com IA</>
                }
              </button>
            </div>

            {loading && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Aguarde, isso pode levar até 30 segundos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Tooltip com ? ── regra 5.4 */
function TooltipIcon({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="Ajuda"
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors ml-0.5"
      >
        <HelpCircle size={13} />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-[#1a2744] text-white text-xs rounded-lg p-3 shadow-xl z-20 leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#1a2744]" />
        </div>
      )}
    </div>
  )
}
