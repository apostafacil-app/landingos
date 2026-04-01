import { createClient } from '@/lib/supabase/server'

export async function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div>
        <h1 className="text-[15px] font-semibold text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium text-foreground leading-none">{email}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Plano Trial</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  )
}
