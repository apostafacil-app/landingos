import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Globe, Plus, ExternalLink, CheckCircle, Clock } from 'lucide-react'

export default async function DominiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()

  const { data: domains } = await supabase
    .from('domains')
    .select('*')
    .eq('workspace_id', member?.workspace_id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Domínios" subtitle="Conecte domínios personalizados às suas páginas" />

      <div className="p-6 max-w-3xl space-y-6">
        {/* Instrução */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Globe size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Como funciona</p>
            <p className="text-blue-700 leading-relaxed">
              Adicione seu domínio abaixo, depois configure um registro <strong>CNAME</strong> no seu provedor de DNS
              apontando para <code className="bg-blue-100 px-1 rounded">cname.landingos.com</code>.
              A verificação e o SSL são ativados automaticamente em até 24h.
            </p>
          </div>
        </div>

        {/* Domínios existentes */}
        {domains && domains.length > 0 && (
          <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[14px] font-semibold text-foreground">Domínios configurados</h2>
            </div>
            <div className="divide-y divide-border">
              {domains.map(domain => (
                <div key={domain.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    {domain.verified ? (
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Clock size={16} className="text-amber-500 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{domain.full_domain}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {domain.verified ? 'Verificado · SSL ativo' : 'Aguardando verificação DNS'}
                      </p>
                    </div>
                  </div>
                  {domain.verified && (
                    <a
                      href={`https://${domain.full_domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      Visitar <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adicionar domínio — em breve */}
        <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Adicionar domínio</h2>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="ex: landing.seusite.com.br"
              disabled
              className="flex-1 h-10 rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
            />
            <button
              disabled
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary/50 text-white text-sm font-medium cursor-not-allowed"
            >
              <Plus size={15} />
              Adicionar
            </button>
          </div>

          <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <Clock size={14} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              <strong>Em breve.</strong> A configuração de domínios customizados estará disponível na próxima versão da plataforma.
              Por enquanto, suas páginas ficam disponíveis no subdomínio padrão do LandingOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
