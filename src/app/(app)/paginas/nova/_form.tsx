'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface Field {
  name: string
  label: string
  placeholder: string
  maxLength: number
  multiline?: boolean
  optional?: boolean
}

const FIELDS: Field[] = [
  { name: 'pageName',       label: 'Nome da página',         placeholder: 'Ex: Consultoria de Marketing Digital',  maxLength: 100 },
  { name: 'businessName',   label: 'Nome do negócio',         placeholder: 'Ex: Agência Impulso',                  maxLength: 100 },
  { name: 'segment',        label: 'Segmento / nicho',        placeholder: 'Ex: Marketing digital para pequenas empresas', maxLength: 100 },
  { name: 'targetAudience', label: 'Público-alvo',           placeholder: 'Ex: Donos de pequenas empresas que querem mais clientes', maxLength: 500, multiline: true },
  { name: 'painPoint',      label: 'Principal dor / problema', placeholder: 'Ex: Gastam em anúncios mas não veem retorno', maxLength: 500, multiline: true },
  { name: 'desire',         label: 'Desejo / transformação',  placeholder: 'Ex: Ter um fluxo previsível de clientes todo mês', maxLength: 500, multiline: true },
  { name: 'offer',          label: 'Sua oferta',             placeholder: 'Ex: Gestão completa de anúncios no Google e Meta por R$997/mês', maxLength: 500, multiline: true },
  { name: 'websiteUrl',     label: 'URL do site (opcional)', placeholder: 'https://seusite.com.br',                maxLength: 2000, optional: true },
]

export function NovaPageForm() {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(name: string, value: string) {
    setValues(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erro ao gerar a página. Tente novamente.')
        return
      }

      router.push(`/paginas/${data.pageId}`)
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const filled = FIELDS.filter(f => !f.optional).every(f => values[f.name]?.trim())

  return (
    <div className="p-6 max-w-2xl w-full">
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-semibold text-foreground">Conte sobre seu negócio</h2>
              <p className="text-xs text-muted-foreground">A IA vai criar uma landing page personalizada com base nas suas respostas</p>
            </div>
          </div>
          <div className="px-6 py-5">

          <form onSubmit={handleSubmit} className="space-y-5">
            {FIELDS.map(field => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.optional && (
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">(opcional)</span>
                  )}
                </Label>
                {field.multiline ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    rows={3}
                    value={values[field.name] ?? ''}
                    onChange={e => handleChange(field.name, e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                    required={!field.optional}
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.name === 'websiteUrl' ? 'url' : 'text'}
                    placeholder={field.placeholder}
                    maxLength={field.maxLength}
                    value={values[field.name] ?? ''}
                    onChange={e => handleChange(field.name, e.target.value)}
                    required={!field.optional}
                  />
                )}
              </div>
            ))}

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-10"
              disabled={loading || !filled}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Gerando sua página com IA...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Gerar página com IA
                </>
              )}
            </Button>

            {loading && (
              <p className="text-xs text-muted-foreground text-center">
                Aguarde... A IA está criando o conteúdo da sua página. Isso pode levar até 30 segundos.
              </p>
            )}
          </form>
        </div>
        </div>
    </div>
  )
}
