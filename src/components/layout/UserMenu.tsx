'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Settings, Globe, LogOut, ChevronDown } from 'lucide-react'

interface Props {
  email: string
  initials: string
  plan: string
}

export function UserMenu({ email, initials, plan }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
      >
        <div className="text-right hidden sm:block">
          <p className="text-[13px] font-medium text-foreground leading-none truncate max-w-[160px]">{email}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Plano {plan}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
          {initials}
        </div>
        <ChevronDown
          size={13}
          className={`text-muted-foreground transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] border border-border z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground truncate">{email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Plano {plan}</p>
          </div>

          {/* Nav links */}
          <div className="py-1">
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
            >
              <Settings size={14} className="text-muted-foreground" />
              Configurações
            </Link>
            <Link
              href="/dominios"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-[#f5f6fa] transition-colors"
            >
              <Globe size={14} className="text-muted-foreground" />
              Domínios
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <form action={logout}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut size={14} />
                Sair da conta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
