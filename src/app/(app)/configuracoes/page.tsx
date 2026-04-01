import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Header } from '@/components/layout/Header'
import { z } from 'zod'
import { User, Building2, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function saveWorkspaceName(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = z.string().min(1).max(100).safeParse(formData.get('workspaceName'))
  if (!name.success) return

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single()
  if (!member) return

  await supabaseAdmin
    .from('workspaces')
    .update({ name: name.data })
    .eq('id', member.workspace_id)

  revalidatePath('/configuracoes')
}

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(name, plan, slug)')
    .eq('user_id', user.id)
    .single()

  const workspace = (member?.workspaces as unknown) as { name: string; plan: string; slug: string } | null

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Configurações" subtitle="Gerencie sua conta e workspace" />

      <div className="p-6 max-w-2xl space-y-5">

        {/* Conta */}
        <Section icon={<User size={16} className="text-primary" />} title="Minha conta">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">E-mail</Label>
              <Input value={user.email ?? ''} disabled className="bg-muted text-muted-foreground h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Senha</Label>
              <div className="flex gap-2">
                <Input type="password" value="••••••••••" disabled className="bg-muted text-muted-foreground h-9 text-sm flex-1" />
                <button className="h-9 px-3 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors">
                  Alterar
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Use o link "Esqueceu a senha?" na tela de login para redefinir.</p>
            </div>
          </div>
        </Section>

        {/* Workspace */}
        <Section icon={<Building2 size={16} className="text-primary" />} title="Workspace">
          <form action={saveWorkspaceName} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="workspaceName" className="text-xs text-muted-foreground">Nome do workspace</Label>
              <div className="flex gap-2">
                <Input
                  id="workspaceName"
                  name="workspaceName"
                  defaultValue={workspace?.name ?? ''}
                  maxLength={100}
                  className="h-9 text-sm flex-1"
                />
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Slug (identificador)</Label>
              <Input value={workspace?.slug ?? ''} disabled className="bg-muted text-muted-foreground h-9 text-sm" />
            </div>
          </form>
        </Section>

        {/* Plano */}
        <Section icon={<Shield size={16} className="text-primary" />} title="Plano atual">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground capitalize">{workspace?.plan ?? 'Trial'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {workspace?.plan === 'trial'
                  ? 'Plano gratuito com recursos limitados'
                  : 'Acesso completo à plataforma'}
              </p>
            </div>
            {workspace?.plan === 'trial' && (
              <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Fazer upgrade
              </button>
            )}
          </div>
        </Section>

      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        {icon}
        <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  )
}
