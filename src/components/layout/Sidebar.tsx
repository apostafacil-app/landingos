'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, Monitor, Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Regra 3.2 — apenas rotas de uso diário na sidebar
// Domínios e Configurações foram movidos para o avatar dropdown (regra 3.10)
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/paginas',   label: 'Páginas',   icon: FileText },
  { href: '/leads',     label: 'Leads',     icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-screen bg-sidebar">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Monitor size={15} className="text-white" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-white">LandingOS</span>
      </div>

      {/* CTA — regra 3.13: ação principal sempre acessível */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/paginas/nova"
          className="flex items-center justify-center gap-2 h-9 w-full bg-primary hover:bg-primary/90 rounded-lg text-white text-[13px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={14} />
          Nova Página
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[10px] font-semibold tracking-widest text-sidebar-foreground/40 px-3 mb-2 mt-1">
          NAVEGAÇÃO
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  // Regra 3.11 — indicador ativo claro: barra colorida à esquerda
                  'group flex items-center gap-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  active
                    ? 'border-l-[2px] border-blue-400 pl-[10px] pr-3 bg-white/10 text-white'
                    : 'px-3 text-sidebar-foreground hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon
                  size={15}
                  className={active ? 'text-blue-300' : 'text-sidebar-foreground/70 group-hover:text-white'}
                />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

    </aside>
  )
}
