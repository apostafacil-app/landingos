import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/avatar'

export async function Header({ title }: { title: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background shrink-0">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground leading-none">{email}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Trial</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initials}
        </div>
      </div>
    </header>
  )
}
