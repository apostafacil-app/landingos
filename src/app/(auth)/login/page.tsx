'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

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
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/recuperar-senha" className="text-xs text-muted-foreground hover:text-primary">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </>
  )
}
