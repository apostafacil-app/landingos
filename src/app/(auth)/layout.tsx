import { Sparkles, LayoutTemplate, BarChart2, Globe, Zap, Star } from 'lucide-react'

const FEATURES = [
  { icon: Sparkles,      text: 'Gere landing pages completas com IA em segundos' },
  { icon: LayoutTemplate, text: 'Editor visual drag-and-drop sem escrever código' },
  { icon: BarChart2,     text: 'Métricas, leads e conversão em tempo real' },
  { icon: Globe,         text: 'Publique com seu domínio personalizado' },
]

const TESTIMONIAL = {
  quote: 'Criei minha primeira landing page em menos de 3 minutos. A IA entendeu exatamente meu negócio e gerou um texto incrível.',
  name: 'Ana Lima',
  role: 'Consultora de Marketing Digital',
  initials: 'AL',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (desktop only) ─────────────────────────────── */}
      <div className="hidden lg:flex w-[460px] shrink-0 bg-[#1a2744] flex-col px-12 py-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[oklch(0.50_0.22_264)] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V7H3V5Z" fill="white"/>
              <path d="M3 7H17V13C17 14.1046 16.1046 15 15 15H5C3.89543 15 3 14.1046 3 13V7Z" fill="white" fillOpacity="0.6"/>
              <rect x="7" y="15" width="6" height="2" fill="white" fillOpacity="0.8"/>
              <rect x="5" y="17" width="10" height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">LandingOS</span>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center py-12 space-y-10">
          {/* Headline */}
          <div>
            <h2 className="text-[26px] font-bold text-white leading-snug mb-3">
              Landing pages que convertem,<br />criadas em minutos
            </h2>
            <p className="text-[#94b4d8] text-sm leading-relaxed">
              Descreva seu negócio, a IA gera a página. Edite com arrastar e soltar. Capture leads e acompanhe métricas em tempo real.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-3.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-blue-300" />
                </div>
                <span className="text-sm text-[#c7d6f0]">{text}</span>
              </li>
            ))}
          </ul>

          {/* Testimonial */}
          <div className="bg-white/6 border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-sm text-[#c7d6f0] leading-relaxed mb-4">
              &ldquo;{TESTIMONIAL.quote}&rdquo;
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[oklch(0.50_0.22_264)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{TESTIMONIAL.name}</p>
                <p className="text-xs text-[#94b4d8]">{TESTIMONIAL.role}</p>
              </div>
            </div>
          </div>

          {/* Novidade */}
          <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 w-fit">
            <Zap size={11} />
            Novo: Editor drag-and-drop disponível
          </div>
        </div>
      </div>

      {/* ── Right panel — Form ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB] p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[oklch(0.50_0.22_264)] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V7H3V5Z" fill="white"/>
                  <path d="M3 7H17V13C17 14.1046 16.1046 15 15 15H5C3.89543 15 3 14.1046 3 13V7Z" fill="white" fillOpacity="0.6"/>
                  <rect x="7" y="15" width="6" height="2" fill="white" fillOpacity="0.8"/>
                  <rect x="5" y="17" width="10" height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-[#1a2744] tracking-tight">LandingOS</span>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
