import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'

export async function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  // Buscar plano do workspace
  let plan = 'Trial'
  if (user) {
    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspaces(plan)')
      .eq('user_id', user.id)
      .single()
    const ws = (member?.workspaces as unknown) as { plan: string } | null
    if (ws?.plan) plan = ws.plan.charAt(0).toUpperCase() + ws.plan.slice(1)
  }

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      {/* Avatar com dropdown — regras 3.2 e 3.10 */}
      <UserMenu email={email} initials={initials} plan={plan} />
    </header>
  )
}
