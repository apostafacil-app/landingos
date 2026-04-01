'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, Globe,
  Settings, LogOut, Monitor, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/(auth)/actions'

const navGroups = [
  {
    label: 'PRINCIPAL',
    items: [
      { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/paginas',   label: 'Páginas',    icon: FileText },
      { href: '/leads',     label: 'Leads',      icon: Users },
    ],
  },
  {
    label: 'CONFIGURAR',
    items: [
      { href: '/dominios',       label: 'Domínios',      icon: Globe },
      { href: '/configuracoes',  label: 'Configurações', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Monitor size={15} className="text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-white">LandingOS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {navGroups.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'group flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={15} className={active ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-white'} />
                      {label}
                    </div>
                    {active && <ChevronRight size={13} className="text-white/50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10 shrink-0">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-sidebar-foreground/70 hover:bg-white/5 hover:text-white transition-all duration-150"
          >
            <LogOut size={15} />
            Sair da conta
          </button>
        </form>
      </div>
    </aside>
  )
}
