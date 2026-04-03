export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a2744] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H15C16.1046 3 17 3.89543 17 5V7H3V5Z" fill="white"/>
                <path d="M3 7H17V13C17 14.1046 16.1046 15 15 15H5C3.89543 15 3 14.1046 3 13V7Z" fill="white" fillOpacity="0.6"/>
                <rect x="7" y="15" width="6" height="2" fill="white" fillOpacity="0.8"/>
                <rect x="5" y="17" width="10" height="1.5" rx="0.75" fill="white" fillOpacity="0.5"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LandingOS</span>
          </div>
          <p className="text-[oklch(0.72_0.06_264)] text-sm mt-2">
            Plataforma de landing pages com IA
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
