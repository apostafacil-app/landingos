import Link from 'next/link'

export default function ConfirmacaoPage() {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          <path d="m16 19 2 2 4-4"/>
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-2">Verifique seu e-mail</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Enviamos um link de confirmação para o seu e-mail.
        Clique no link para ativar sua conta e começar a usar o LandingOS.
      </p>

      <p className="text-xs text-muted-foreground mb-6">
        Não recebeu? Verifique a pasta de spam.
      </p>

      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 h-8 text-sm font-medium hover:bg-muted transition-colors"
      >
        Voltar para o login
      </Link>
    </div>
  )
}
