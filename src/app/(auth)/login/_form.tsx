'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPass, setShowPass] = useState(false)

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-1">Entrar na conta</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-primary font-medium hover:underline">
          Criar gratuitamente
        </Link>
      </p>

      <form action={action} className="space-y-4">
        {/* Redirect param — regra 2.2 */}
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            maxLength={254}
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/recuperar-senha" className="text-xs text-muted-foreground hover:text-primary">
              Esqueceu a senha?
            </Link>
          </div>
          {/* Show/hide password — regra 2.7 */}
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              maxLength={128}
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full h-10" disabled={pending}>
          {pending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </>
  )
}
