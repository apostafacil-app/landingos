'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-1">Criar conta grátis</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entrar
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
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Criando conta...' : 'Criar conta grátis'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Ao criar sua conta, você concorda com os{' '}
          <Link href="/termos" className="underline hover:text-primary">Termos de Uso</Link>
          {' '}e a{' '}
          <Link href="/privacidade" className="underline hover:text-primary">Política de Privacidade</Link>.
        </p>
      </form>
    </>
  )
}
