'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
})

// Mensagem genérica — nunca diferenciar email/senha (security-checklist A07)
const ERRO_GENERICO = 'Credenciais inválidas. Verifique e tente novamente.'

type ActionState = { error: string } | undefined

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: ERRO_GENERICO }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: ERRO_GENERICO }
  }

  // Regra 2.2 — redirecionar ao destino original (validação anti open-redirect)
  const to = formData.get('redirect') as string | null
  const safeDest = to && to.startsWith('/') && !to.startsWith('//') ? to : '/dashboard'
  redirect(safeDest)
}

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Dados inválidos. E-mail e senha (mín. 8 caracteres) são obrigatórios.' }
  }

  const supabase = await createClient()
  await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  // Sempre redirecionar — nunca expor se o e-mail já existe (evita enumeração)
  redirect('/cadastro/confirmacao')
}

export async function logout() {
  const supabase = await createClient()
  // scope: global invalida todos os dispositivos (security-checklist A07)
  await supabase.auth.signOut({ scope: 'global' })
  redirect('/login')
}
