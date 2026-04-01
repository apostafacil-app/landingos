'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Globe,
  Settings,
  LogOut,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/actions'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/paginas', label: 'Páginas', icon: FileText },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/dominios', label: 'Domínios', icon: Globe },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Monitor size={16} className="text-white" />
        </div>
        <span className="font-bold text-base tracking-tight text-white">LandingOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-white'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-sidebar-border pt-3">
        <Link
          href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white transition-colors"
        >
          <Settings size={17} />
          Configurações
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
