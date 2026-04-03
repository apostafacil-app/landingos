'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Check } from 'lucide-react'

/* ── Regras de senha — regra 7.2 ── */
const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres',       test: (v: string) => v.length >= 8 },
  { label: 'Ao menos uma letra maiúscula', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Ao menos um número',         test: (v: string) => /[0-9]/.test(v) },
]

export default function CadastroPage() {
  const [state, action, pending] = useActionState(signup, undefined)
  const [showPass, setShowPass] = useState(false)

  /* Controle de e-mail — regra 7.1 */
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const emailInvalid = emailTouched && email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  /* Controle de senha — regras 7.1 + 7.2 */
  const [password, setPassword] = useState('')
  const [passwordFocused, setPasswordFocused] = useState(false)
  const showChecklist = password.length > 0 || passwordFocused

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
        {/* E-mail com validação onBlur — regra 7.1 */}
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
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            className={`h-10 transition-colors ${emailInvalid ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
          />
          {emailInvalid && (
            <p className="text-xs text-destructive">E-mail inválido. Verifique o formato.</p>
          )}
        </div>

        {/* Senha com checklist ao vivo — regras 7.1 + 7.2 */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
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

          {/* Checklist visual — regra 7.2 */}
          {showChecklist && (
            <div className="space-y-1 pt-0.5">
              {PASSWORD_RULES.map(rule => {
                const ok = rule.test(password)
                return (
                  <p
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all ${ok ? 'bg-emerald-100' : 'bg-muted'}`}>
                      {ok
                        ? <Check size={9} strokeWidth={3} />
                        : <span className="w-1 h-1 rounded-full bg-muted-foreground/40 block" />
                      }
                    </span>
                    {rule.label}
                  </p>
                )
              })}
            </div>
          )}
        </div>

        {state?.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full h-10" disabled={pending}>
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
