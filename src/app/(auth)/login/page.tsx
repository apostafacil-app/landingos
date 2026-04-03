import { LoginForm } from './_form'

// Regra 2.2 — lê a URL de destino para redirecionar após login
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  return <LoginForm redirectTo={redirect} />
}
