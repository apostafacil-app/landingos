// Landing page blocks for GrapesJS
// Inspired by GreatPages block library analysis
// Categories: Hero, Benefícios, Depoimentos, Formulários, CTA, FAQ, Vídeo,
//             Garantia, Timer, Planos, Sobre, Estatísticas, Timeline, Galeria, Rodapé, Elementos

export interface LandingBlock {
  id: string
  label: string
  category: string
  content: string
  media?: string // SVG icon
}

export const LANDING_BLOCKS: LandingBlock[] = [

  // ─── HERO ───────────────────────────────────────────────────────────────────
  {
    id: 'hero-simples',
    label: 'Hero Gradiente',
    category: 'Hero',
    content: `
<section style="background:linear-gradient(135deg,#1a2e5a 0%,#2563eb 100%);padding:100px 24px;text-align:center;color:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:700px;margin:0 auto;">
    <h1 style="font-size:52px;font-weight:800;margin:0 0 20px;line-height:1.15;letter-spacing:-1px;">Transforme seu negócio com nossa solução</h1>
    <p style="font-size:20px;margin:0 0 36px;opacity:.85;line-height:1.6;">Descubra como centenas de empresas já conseguiram resultados extraordinários.</p>
    <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#1a1a1a;font-size:18px;font-weight:700;padding:18px 48px;border-radius:10px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,.4);">Quero começar agora →</a>
    <p style="font-size:13px;margin:16px 0 0;opacity:.55;">Sem compromisso · Cancele quando quiser</p>
  </div>
</section>
`,
  },
  {
    id: 'hero-dois-col',
    label: 'Hero com Imagem',
    category: 'Hero',
    content: `
<section style="background:#0f172a;padding:80px 24px;font-family:system-ui,sans-serif;">
  <div style="max-width:1000px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex:1;min-width:280px;color:#fff;">
      <span style="display:inline-block;background:#3b82f6;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase;">Novidade 2025</span>
      <h1 style="font-size:44px;font-weight:800;margin:0 0 20px;line-height:1.15;">O resultado que você sempre quis está aqui</h1>
      <p style="font-size:18px;margin:0 0 32px;color:#94a3b8;line-height:1.7;">Solução completa para quem quer crescer sem complicação e com resultado garantido.</p>
      <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#000;font-size:16px;font-weight:700;padding:16px 40px;border-radius:10px;text-decoration:none;">Garantir minha vaga →</a>
    </div>
    <div style="flex:1;min-width:280px;border-radius:20px;overflow:hidden;height:300px;">
      <img src="https://placehold.co/600x300/1e293b/475569?text=Clique+2x+para+trocar+imagem" style="width:100%;height:100%;object-fit:cover;display:block;" alt="Imagem" />
    </div>
  </div>
</section>
`,
  },
  {
    id: 'hero-claro',
    label: 'Hero Claro',
    category: 'Hero',
    content: `
<section style="background:#fff;padding:100px 24px;text-align:center;font-family:system-ui,sans-serif;border-bottom:1px solid #e2e8f0;">
  <div style="max-width:720px;margin:0 auto;">
    <p style="color:#2563eb;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">A solução que você precisava</p>
    <h1 style="font-size:56px;font-weight:900;color:#0f172a;margin:0 0 24px;line-height:1.1;letter-spacing:-2px;">Alcance resultados reais em tempo recorde</h1>
    <p style="font-size:20px;color:#64748b;margin:0 0 40px;line-height:1.7;">Método comprovado por mais de 2.000 pessoas que saíram do zero e chegaram ao topo.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#formulario" style="display:inline-block;background:#2563eb;color:#fff;font-size:17px;font-weight:700;padding:16px 40px;border-radius:10px;text-decoration:none;">Começar agora →</a>
      <a href="#video" style="display:inline-block;background:#f1f5f9;color:#0f172a;font-size:17px;font-weight:600;padding:16px 40px;border-radius:10px;text-decoration:none;">▶ Ver demonstração</a>
    </div>
    <p style="font-size:13px;color:#94a3b8;margin:20px 0 0;">✓ Acesso imediato &nbsp; ✓ Garantia de 7 dias &nbsp; ✓ Suporte incluso</p>
  </div>
</section>
`,
  },
  {
    id: 'hero-captura',
    label: 'Hero + Formulário',
    category: 'Hero',
    content: `
<section style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:80px 24px;font-family:system-ui,sans-serif;">
  <div style="max-width:1000px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex:1;min-width:300px;color:#fff;">
      <h1 style="font-size:42px;font-weight:800;margin:0 0 20px;line-height:1.2;">Descubra como [resultado] em apenas [tempo]</h1>
      <p style="font-size:18px;color:#94a3b8;margin:0 0 28px;line-height:1.7;">Mais de 1.000 pessoas já alcançaram liberdade usando nosso método exclusivo.</p>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
        <li style="color:#86efac;font-size:16px;">✓ Sem experiência necessária</li>
        <li style="color:#86efac;font-size:16px;">✓ Resultado em 30 dias</li>
        <li style="color:#86efac;font-size:16px;">✓ Garantia incondicional</li>
      </ul>
    </div>
    <div style="flex:1;min-width:300px;background:#fff;border-radius:16px;padding:36px;">
      <h3 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 8px;text-align:center;">Quero minha vaga gratuita</h3>
      <p style="color:#64748b;font-size:14px;text-align:center;margin:0 0 24px;">Preencha e receba acesso imediato</p>
      <form style="display:flex;flex-direction:column;gap:12px;">
        <input type="text" placeholder="Seu nome completo" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;box-sizing:border-box;" />
        <input type="email" placeholder="Seu melhor e-mail" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid #e2e8f0;font-size:15px;box-sizing:border-box;" />
        <button type="submit" style="width:100%;padding:16px;background:#f59e0b;color:#000;font-size:17px;font-weight:700;border:none;border-radius:8px;cursor:pointer;">GARANTIR MINHA VAGA →</button>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">🔒 100% seguro. Sem spam.</p>
      </form>
    </div>
  </div>
</section>
`,
  },

  // ─── BENEFÍCIOS ─────────────────────────────────────────────────────────────
  {
    id: 'beneficios-3col',
    label: 'Benefícios 3 colunas',
    category: 'Benefícios',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:36px;font-weight:800;color:#0f172a;margin:0 0 12px;">Por que escolher nossa solução?</h2>
    <p style="text-align:center;color:#64748b;font-size:18px;margin:0 0 56px;">Tudo que você precisa para alcançar seus objetivos</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:28px;">
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 8px rgba(0,0,0,.06);text-align:center;">
        <div style="font-size:44px;margin-bottom:16px;">⚡</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;">Rápido e eficiente</h3>
        <p style="color:#64748b;line-height:1.7;margin:0;font-size:15px;">Economia de tempo e recursos com nossa tecnologia de ponta.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 8px rgba(0,0,0,.06);text-align:center;">
        <div style="font-size:44px;margin-bottom:16px;">🎯</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;">Resultados comprovados</h3>
        <p style="color:#64748b;line-height:1.7;margin:0;font-size:15px;">Metodologia testada com centenas de casos de sucesso reais.</p>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 8px rgba(0,0,0,.06);text-align:center;">
        <div style="font-size:44px;margin-bottom:16px;">🛡️</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;">Suporte especializado</h3>
        <p style="color:#64748b;line-height:1.7;margin:0;font-size:15px;">Equipe dedicada para garantir o seu sucesso total.</p>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'beneficios-lista',
    label: 'Benefícios em lista',
    category: 'Benefícios',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:800px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 12px;">O que você vai conquistar</h2>
    <p style="color:#64748b;font-size:18px;margin:0 0 40px;">Resultados reais para quem decide agir hoje</p>
    <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:20px;">
      <li style="display:flex;align-items:flex-start;gap:16px;">
        <span style="width:28px;height:28px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;margin-top:2px;">✓</span>
        <div><strong style="color:#0f172a;font-size:18px;">Mais clientes todos os meses</strong><p style="color:#64748b;margin:4px 0 0;font-size:15px;line-height:1.6;">Fluxo previsível de novos clientes chegando sem depender de indicações.</p></div>
      </li>
      <li style="display:flex;align-items:flex-start;gap:16px;">
        <span style="width:28px;height:28px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;margin-top:2px;">✓</span>
        <div><strong style="color:#0f172a;font-size:18px;">Tempo livre para o que importa</strong><p style="color:#64748b;margin:4px 0 0;font-size:15px;line-height:1.6;">Processo automatizado para você focar no crescimento do negócio.</p></div>
      </li>
      <li style="display:flex;align-items:flex-start;gap:16px;">
        <span style="width:28px;height:28px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;margin-top:2px;">✓</span>
        <div><strong style="color:#0f172a;font-size:18px;">Autoridade no seu mercado</strong><p style="color:#64748b;margin:4px 0 0;font-size:15px;line-height:1.6;">Posicionamento sólido que atrai os melhores clientes do seu nicho.</p></div>
      </li>
    </ul>
  </div>
</section>
`,
  },
  {
    id: 'beneficios-dark',
    label: 'Benefícios Dark',
    category: 'Benefícios',
    content: `
<section style="padding:80px 24px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:36px;font-weight:800;color:#fff;margin:0 0 12px;">Vantagens exclusivas</h2>
    <p style="text-align:center;color:#94a3b8;font-size:18px;margin:0 0 56px;">Diferenciais que fazem toda a diferença</p>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;">
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start;">
        <div style="font-size:32px;flex-shrink:0;">🚀</div>
        <div><h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">Implementação imediata</h3><p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;">Comece a usar em minutos, sem curva de aprendizado.</p></div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start;">
        <div style="font-size:32px;flex-shrink:0;">💰</div>
        <div><h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">ROI comprovado</h3><p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;">Clientes recuperam o investimento em menos de 30 dias.</p></div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start;">
        <div style="font-size:32px;flex-shrink:0;">🔐</div>
        <div><h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">100% seguro</h3><p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;">Seus dados e os do seu cliente sempre protegidos.</p></div>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px 24px;display:flex;gap:16px;align-items:flex-start;">
        <div style="font-size:32px;flex-shrink:0;">📈</div>
        <div><h3 style="font-size:18px;font-weight:700;color:#fff;margin:0 0 8px;">Escalável</h3><p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0;">Cresce junto com o seu negócio sem custo adicional.</p></div>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'beneficios-horizontal',
    label: 'Benefícios Horizontal',
    category: 'Benefícios',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:1000px;margin:0 auto;">
    <h2 style="text-align:center;font-size:34px;font-weight:800;color:#0f172a;margin:0 0 56px;">Como funciona nosso método</h2>
    <div style="display:flex;gap:0;flex-wrap:wrap;">
      <div style="flex:1;min-width:200px;padding:24px;text-align:center;border-right:1px solid #e2e8f0;">
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">1️⃣</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Acesse</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">Faça login e acesse todo o conteúdo imediatamente.</p>
      </div>
      <div style="flex:1;min-width:200px;padding:24px;text-align:center;border-right:1px solid #e2e8f0;">
        <div style="width:56px;height:56px;background:#f0fdf4;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">2️⃣</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Aplique</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">Siga o passo a passo e coloque em prática hoje.</p>
      </div>
      <div style="flex:1;min-width:200px;padding:24px;text-align:center;border-right:1px solid #e2e8f0;">
        <div style="width:56px;height:56px;background:#fff7ed;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">3️⃣</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Evolua</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">Acompanhe seu progresso e acelere os resultados.</p>
      </div>
      <div style="flex:1;min-width:200px;padding:24px;text-align:center;">
        <div style="width:56px;height:56px;background:#fdf4ff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">4️⃣</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Conquiste</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0;">Alcance o resultado que você sempre quis.</p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── DEPOIMENTOS ────────────────────────────────────────────────────────────
  {
    id: 'depoimentos-cards',
    label: 'Depoimentos em cards',
    category: 'Depoimentos',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:36px;font-weight:800;color:#0f172a;margin:0 0 12px;">O que nossos clientes dizem</h2>
    <p style="text-align:center;color:#64748b;font-size:17px;margin:0 0 52px;">Mais de 500 pessoas já transformaram sua realidade</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
        <p style="color:#f59e0b;font-size:18px;margin:0 0 12px;">★★★★★</p>
        <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">"Resultado incrível! Em apenas 30 dias já percebi a diferença. Recomendo muito para todo mundo!"</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:#e2e8f0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#475569;">M</div>
          <div><p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">Maria Silva</p><p style="margin:0;color:#94a3b8;font-size:12px;">Empreendedora</p></div>
        </div>
      </div>
      <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
        <p style="color:#f59e0b;font-size:18px;margin:0 0 12px;">★★★★★</p>
        <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">"Finalmente encontrei algo que realmente funciona. Meu faturamento cresceu 3x em 60 dias!"</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#1d4ed8;">J</div>
          <div><p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">João Mendes</p><p style="margin:0;color:#94a3b8;font-size:12px;">Consultor</p></div>
        </div>
      </div>
      <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
        <p style="color:#f59e0b;font-size:18px;margin:0 0 12px;">★★★★★</p>
        <p style="color:#334155;font-size:15px;line-height:1.7;margin:0 0 20px;">"Vale cada centavo. Suporte excelente e resultado acima das expectativas. Não me arrependo!"</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:#d1fae5;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#059669;">A</div>
          <div><p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">Ana Costa</p><p style="margin:0;color:#94a3b8;font-size:12px;">Nutricionista</p></div>
        </div>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'depoimento-destaque',
    label: 'Depoimento em destaque',
    category: 'Depoimentos',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:760px;margin:0 auto;text-align:center;">
    <p style="color:#f59e0b;font-size:28px;margin:0 0 8px;">★★★★★</p>
    <blockquote style="font-size:26px;font-weight:700;color:#0f172a;line-height:1.4;margin:0 0 32px;font-style:italic;">"Este método mudou completamente minha vida. Saí do zero para faturar R$ 30.000 por mês em apenas 4 meses."</blockquote>
    <div style="display:flex;align-items:center;justify-content:center;gap:16px;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:800;">C</div>
      <div style="text-align:left;">
        <p style="margin:0;font-weight:700;color:#0f172a;font-size:18px;">Carlos Oliveira</p>
        <p style="margin:0;color:#64748b;font-size:14px;">Empresário · São Paulo, SP</p>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'depoimentos-lista',
    label: 'Depoimentos lista vertical',
    category: 'Depoimentos',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:700px;margin:0 auto;">
    <h2 style="font-size:34px;font-weight:800;color:#0f172a;margin:0 0 8px;text-align:center;">Histórias reais de sucesso</h2>
    <p style="color:#64748b;font-size:17px;text-align:center;margin:0 0 48px;">Veja o que nossos clientes alcançaram</p>
    <div style="display:flex;flex-direction:column;gap:20px;">
      <div style="background:#fff;border-left:4px solid #2563eb;border-radius:0 12px 12px 0;padding:24px;box-shadow:0 1px 6px rgba(0,0,0,.05);">
        <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 16px;font-style:italic;">"Em 3 semanas já vi resultados que não achei possíveis. Esse método é absurdo!"</p>
        <p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">Lucas Ferreira <span style="color:#64748b;font-weight:400;">— Coach</span></p>
      </div>
      <div style="background:#fff;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:24px;box-shadow:0 1px 6px rgba(0,0,0,.05);">
        <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 16px;font-style:italic;">"Consegui meu primeiro cliente em 7 dias. Melhor investimento que já fiz na vida!"</p>
        <p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">Fernanda Lima <span style="color:#64748b;font-weight:400;">— Designer</span></p>
      </div>
      <div style="background:#fff;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:24px;box-shadow:0 1px 6px rgba(0,0,0,.05);">
        <p style="color:#334155;font-size:16px;line-height:1.7;margin:0 0 16px;font-style:italic;">"Tripliquei meu faturamento em 60 dias. Recomendo de olhos fechados para todo mundo!"</p>
        <p style="margin:0;font-weight:700;color:#0f172a;font-size:14px;">Roberto Santos <span style="color:#64748b;font-weight:400;">— Consultor</span></p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── ESTATÍSTICAS / NÚMEROS ──────────────────────────────────────────────────
  {
    id: 'estatisticas-3col',
    label: 'Estatísticas 3 números',
    category: 'Estatísticas',
    content: `
<section style="padding:70px 24px;background:#2563eb;font-family:system-ui,sans-serif;">
  <div style="max-width:800px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:center;">
      <div>
        <p style="font-size:56px;font-weight:900;color:#fff;margin:0;line-height:1;">2.000+</p>
        <p style="font-size:16px;color:rgba(255,255,255,.8);margin:8px 0 0;">Alunos satisfeitos</p>
      </div>
      <div style="border-left:1px solid rgba(255,255,255,.2);border-right:1px solid rgba(255,255,255,.2);">
        <p style="font-size:56px;font-weight:900;color:#fff;margin:0;line-height:1;">97%</p>
        <p style="font-size:16px;color:rgba(255,255,255,.8);margin:8px 0 0;">Taxa de satisfação</p>
      </div>
      <div>
        <p style="font-size:56px;font-weight:900;color:#fff;margin:0;line-height:1;">30 dias</p>
        <p style="font-size:16px;color:rgba(255,255,255,.8);margin:8px 0 0;">Para ver resultados</p>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'estatisticas-dark',
    label: 'Estatísticas Dark',
    category: 'Estatísticas',
    content: `
<section style="padding:80px 24px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:34px;font-weight:800;color:#fff;margin:0 0 12px;">Números que comprovam</h2>
    <p style="text-align:center;color:#64748b;font-size:17px;margin:0 0 56px;">Resultados reais de quem confia em nós</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center;">
      <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:32px 16px;">
        <p style="font-size:48px;font-weight:900;color:#60a5fa;margin:0;line-height:1;">5K+</p>
        <p style="font-size:14px;color:#94a3b8;margin:10px 0 0;">Clientes atendidos</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:32px 16px;">
        <p style="font-size:48px;font-weight:900;color:#4ade80;margin:0;line-height:1;">98%</p>
        <p style="font-size:14px;color:#94a3b8;margin:10px 0 0;">Satisfação garantida</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:32px 16px;">
        <p style="font-size:48px;font-weight:900;color:#fb923c;margin:0;line-height:1;">4.9★</p>
        <p style="font-size:14px;color:#94a3b8;margin:10px 0 0;">Avaliação média</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border-radius:16px;padding:32px 16px;">
        <p style="font-size:48px;font-weight:900;color:#c084fc;margin:0;line-height:1;">7 anos</p>
        <p style="font-size:14px;color:#94a3b8;margin:10px 0 0;">De experiência</p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── FORMULÁRIO DE CAPTURA ──────────────────────────────────────────────────
  {
    id: 'formulario-captura',
    label: 'Formulário Dark',
    category: 'Formulários',
    content: `
<section id="formulario" style="padding:80px 24px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;text-align:center;">
    <h2 style="font-size:36px;font-weight:800;color:#fff;margin:0 0 12px;">Garanta sua vaga agora</h2>
    <p style="color:#94a3b8;font-size:17px;margin:0 0 36px;">Preencha seus dados e receba acesso imediato</p>
    <form style="display:flex;flex-direction:column;gap:14px;">
      <input type="text" name="name" placeholder="Seu nome completo" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <input type="email" name="email" placeholder="Seu melhor e-mail" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <input type="tel" name="phone" placeholder="WhatsApp (opcional)" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <button type="submit" style="width:100%;padding:18px;background:#f59e0b;color:#000;font-size:18px;font-weight:700;border:none;border-radius:10px;cursor:pointer;">QUERO GARANTIR MINHA VAGA →</button>
      <p style="color:#475569;font-size:13px;margin:0;">🔒 Seus dados estão 100% seguros. Sem spam.</p>
    </form>
  </div>
</section>
`,
  },
  {
    id: 'formulario-claro',
    label: 'Formulário Claro',
    category: 'Formulários',
    content: `
<section id="formulario" style="padding:80px 24px;background:#f0f9ff;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="background:#fff;border-radius:20px;padding:48px;box-shadow:0 4px 32px rgba(0,0,0,.08);">
      <h2 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px;text-align:center;">Quero minha vaga gratuita</h2>
      <p style="color:#64748b;font-size:16px;margin:0 0 32px;text-align:center;">Acesso liberado para os primeiros 50 inscritos</p>
      <form style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">Nome completo</label>
          <input type="text" placeholder="João da Silva" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid #d1d5db;font-size:15px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:13px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">E-mail</label>
          <input type="email" placeholder="joao@email.com" style="width:100%;padding:14px 16px;border-radius:8px;border:1px solid #d1d5db;font-size:15px;box-sizing:border-box;" />
        </div>
        <button type="submit" style="width:100%;padding:16px;background:#2563eb;color:#fff;font-size:17px;font-weight:700;border:none;border-radius:8px;cursor:pointer;margin-top:4px;">GARANTIR MINHA VAGA →</button>
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">Ao se cadastrar você concorda com nossa política de privacidade</p>
      </form>
    </div>
  </div>
</section>
`,
  },

  // ─── CTA ────────────────────────────────────────────────────────────────────
  {
    id: 'cta-simples',
    label: 'CTA Azul',
    category: 'CTA',
    content: `
<section style="padding:80px 24px;background:#2563eb;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <h2 style="font-size:40px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2;">Pronto para transformar sua realidade?</h2>
    <p style="font-size:18px;color:rgba(255,255,255,.85);margin:0 0 36px;line-height:1.6;">Não perca mais tempo. Comece hoje e veja os resultados em poucas semanas.</p>
    <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#1a1a1a;font-size:18px;font-weight:700;padding:18px 52px;border-radius:10px;text-decoration:none;box-shadow:0 4px 20px rgba(0,0,0,.2);">COMEÇAR AGORA →</a>
    <p style="margin:16px 0 0;color:rgba(255,255,255,.6);font-size:13px;">Satisfação garantida ou seu dinheiro de volta em 7 dias</p>
  </div>
</section>
`,
  },
  {
    id: 'cta-urgencia',
    label: 'CTA Urgência',
    category: 'CTA',
    content: `
<section style="padding:64px 24px;background:#991b1b;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <p style="display:inline-block;background:#ef4444;color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:2px;text-transform:uppercase;margin:0 0 20px;">⚠️ Últimas vagas disponíveis</p>
    <h2 style="font-size:38px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2;">Esta oferta encerra em breve</h2>
    <p style="font-size:17px;color:rgba(255,255,255,.8);margin:0 0 32px;line-height:1.6;">Não deixe para depois. Quem age agora garante o melhor preço e condições exclusivas.</p>
    <a href="#formulario" style="display:inline-block;background:#fff;color:#991b1b;font-size:18px;font-weight:800;padding:18px 52px;border-radius:10px;text-decoration:none;">GARANTIR MINHA VAGA AGORA →</a>
  </div>
</section>
`,
  },
  {
    id: 'cta-duplo',
    label: 'CTA Duas colunas',
    category: 'CTA',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex:1;min-width:280px;">
      <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 16px;line-height:1.2;">Não fique de fora dessa oportunidade</h2>
      <p style="font-size:17px;color:#64748b;margin:0 0 28px;line-height:1.7;">Centenas de pessoas já estão colhendo os resultados. A próxima história de sucesso pode ser a sua.</p>
      <ul style="list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:10px;">
        <li style="color:#0f172a;font-size:16px;">✅ Garantia de 7 dias</li>
        <li style="color:#0f172a;font-size:16px;">✅ Suporte especializado</li>
        <li style="color:#0f172a;font-size:16px;">✅ Acesso vitalício</li>
      </ul>
      <a href="#formulario" style="display:inline-block;background:#2563eb;color:#fff;font-size:17px;font-weight:700;padding:16px 40px;border-radius:10px;text-decoration:none;">Quero participar →</a>
    </div>
    <div style="flex:1;min-width:280px;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:20px;padding:40px;color:#fff;text-align:center;">
      <p style="font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.8;margin:0 0 8px;">Oferta especial</p>
      <p style="font-size:20px;text-decoration:line-through;opacity:.6;margin:0;">De R$ 497</p>
      <p style="font-size:56px;font-weight:900;margin:0 0 4px;line-height:1;">R$ 197</p>
      <p style="font-size:14px;opacity:.8;margin:0 0 28px;">em 12x de R$ 18,25</p>
      <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#000;font-size:16px;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;width:100%;box-sizing:border-box;">COMPRAR AGORA →</a>
    </div>
  </div>
</section>
`,
  },

  // ─── FAQ ────────────────────────────────────────────────────────────────────
  {
    id: 'faq',
    label: 'FAQ Simples',
    category: 'FAQ',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:720px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 8px;">Perguntas frequentes</h2>
    <p style="color:#64748b;font-size:17px;margin:0 0 48px;">Tudo que você precisa saber antes de começar</p>
    <div style="display:flex;flex-direction:column;gap:0;">
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Para quem é essa solução?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Para qualquer pessoa que queira alcançar [resultado] sem precisar de experiência prévia.</p>
      </div>
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Em quanto tempo verei resultados?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">A maioria começa a ver resultados em 30 dias. Com dedicação, chegam ainda mais rápido.</p>
      </div>
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Há garantia?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Sim! Garantia incondicional de 7 dias. Se não ficar satisfeito, devolvemos 100%.</p>
      </div>
      <div style="padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Como funciona o suporte?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Equipe disponível de seg a sex para garantir o seu melhor resultado possível.</p>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'faq-dark',
    label: 'FAQ Dark',
    category: 'FAQ',
    content: `
<section style="padding:80px 24px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:720px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#fff;margin:0 0 8px;text-align:center;">Dúvidas frequentes</h2>
    <p style="color:#64748b;font-size:17px;margin:0 0 48px;text-align:center;">Respondemos tudo antes de você decidir</p>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin:0 0 10px;">🤔 Preciso ter experiência prévia?</h3>
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">Não! O método foi criado para iniciantes e funciona igualmente bem para quem já tem experiência.</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin:0 0 10px;">⏱️ Quanto tempo preciso dedicar?</h3>
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">Apenas 1 a 2 horas por dia são suficientes para seguir o método e ver resultados.</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin:0 0 10px;">💳 Quais formas de pagamento?</h3>
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">Cartão de crédito em até 12x, PIX com desconto ou boleto bancário.</p>
      </div>
      <div style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin:0 0 10px;">🔒 E se eu não gostar?</h3>
        <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0;">Garantia de 7 dias sem questionamentos. Basta solicitar e devolvemos tudo.</p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── VÍDEO ──────────────────────────────────────────────────────────────────
  {
    id: 'video-youtube',
    label: 'Seção de Vídeo',
    category: 'Vídeo',
    content: `
<section style="padding:80px 24px;background:#0f172a;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:800px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#fff;margin:0 0 12px;">Veja como funciona na prática</h2>
    <p style="color:#94a3b8;font-size:17px;margin:0 0 40px;">Assista ao vídeo e entenda tudo em menos de 5 minutos</p>
    <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;">
      <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:16px;"></iframe>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'video-com-texto',
    label: 'Vídeo com Texto',
    category: 'Vídeo',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:1000px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex:1;min-width:280px;">
      <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 16px;line-height:1.2;">Assista e entenda como funciona</h2>
      <p style="font-size:17px;color:#64748b;margin:0 0 24px;line-height:1.7;">Neste vídeo você vai descobrir exatamente como nosso método pode transformar seus resultados.</p>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
        <li style="color:#0f172a;font-size:15px;">▶ Como o método funciona passo a passo</li>
        <li style="color:#0f172a;font-size:15px;">▶ Por que é diferente de tudo que você já viu</li>
        <li style="color:#0f172a;font-size:15px;">▶ Resultados reais de quem já aplicou</li>
      </ul>
    </div>
    <div style="flex:1.4;min-width:320px;">
      <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,.12);">
        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── TIMER / COUNTDOWN ──────────────────────────────────────────────────────
  {
    id: 'timer-urgencia',
    label: 'Timer de Urgência',
    category: 'Timer',
    content: `
<section style="padding:60px 24px;background:#1a1a2e;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <p style="color:#ef4444;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">⚠️ OFERTA POR TEMPO LIMITADO</p>
    <h2 style="font-size:32px;font-weight:800;color:#fff;margin:0 0 32px;">Esta oferta expira em:</h2>
    <div style="display:flex;gap:16px;justify-content:center;margin-bottom:36px;">
      <div style="background:#1e293b;border:2px solid #334155;border-radius:12px;padding:20px 24px;min-width:80px;">
        <p style="font-size:48px;font-weight:900;color:#f59e0b;margin:0;line-height:1;">23</p>
        <p style="font-size:12px;color:#64748b;margin:6px 0 0;text-transform:uppercase;letter-spacing:1px;">Horas</p>
      </div>
      <div style="background:#1e293b;border:2px solid #334155;border-radius:12px;padding:20px 24px;min-width:80px;">
        <p style="font-size:48px;font-weight:900;color:#f59e0b;margin:0;line-height:1;">47</p>
        <p style="font-size:12px;color:#64748b;margin:6px 0 0;text-transform:uppercase;letter-spacing:1px;">Minutos</p>
      </div>
      <div style="background:#1e293b;border:2px solid #334155;border-radius:12px;padding:20px 24px;min-width:80px;">
        <p style="font-size:48px;font-weight:900;color:#f59e0b;margin:0;line-height:1;">59</p>
        <p style="font-size:12px;color:#64748b;margin:6px 0 0;text-transform:uppercase;letter-spacing:1px;">Segundos</p>
      </div>
    </div>
    <a href="#formulario" style="display:inline-block;background:#ef4444;color:#fff;font-size:18px;font-weight:700;padding:18px 52px;border-radius:10px;text-decoration:none;box-shadow:0 4px 20px rgba(239,68,68,.4);">APROVEITAR AGORA →</a>
    <p style="color:#475569;font-size:13px;margin:12px 0 0;">Após o prazo o preço volta ao normal</p>
  </div>
</section>
`,
  },
  {
    id: 'timer-simples',
    label: 'Timer Simples',
    category: 'Timer',
    content: `
<section style="padding:48px 24px;background:#fef3c7;border-top:4px solid #f59e0b;border-bottom:4px solid #f59e0b;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <p style="font-size:16px;font-weight:700;color:#92400e;margin:0 0 16px;">🔥 Promoção termina em:</p>
    <div style="display:flex;gap:12px;justify-content:center;align-items:center;margin-bottom:20px;">
      <div style="text-align:center;">
        <span style="font-size:44px;font-weight:900;color:#92400e;display:block;line-height:1;">23</span>
        <span style="font-size:11px;color:#b45309;text-transform:uppercase;letter-spacing:1px;">h</span>
      </div>
      <span style="font-size:36px;font-weight:900;color:#d97706;">:</span>
      <div style="text-align:center;">
        <span style="font-size:44px;font-weight:900;color:#92400e;display:block;line-height:1;">59</span>
        <span style="font-size:11px;color:#b45309;text-transform:uppercase;letter-spacing:1px;">min</span>
      </div>
      <span style="font-size:36px;font-weight:900;color:#d97706;">:</span>
      <div style="text-align:center;">
        <span style="font-size:44px;font-weight:900;color:#92400e;display:block;line-height:1;">30</span>
        <span style="font-size:11px;color:#b45309;text-transform:uppercase;letter-spacing:1px;">seg</span>
      </div>
    </div>
    <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#1a1a1a;font-size:16px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;">Aproveitar oferta →</a>
  </div>
</section>
`,
  },

  // ─── PLANOS / PREÇOS ─────────────────────────────────────────────────────────
  {
    id: 'planos-3cols',
    label: 'Planos 3 opções',
    category: 'Planos',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:36px;font-weight:800;color:#0f172a;margin:0 0 12px;">Escolha seu plano</h2>
    <p style="text-align:center;color:#64748b;font-size:17px;margin:0 0 52px;">Sem taxas ocultas. Cancele quando quiser.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start;">
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
        <p style="font-size:14px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Básico</p>
        <p style="font-size:40px;font-weight:900;color:#0f172a;margin:0 0 4px;"><span style="font-size:20px;">R$</span>97</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">por mês</p>
        <ul style="list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:10px;">
          <li style="color:#374151;font-size:14px;">✓ Recurso 1</li>
          <li style="color:#374151;font-size:14px;">✓ Recurso 2</li>
          <li style="color:#374151;font-size:14px;">✓ Suporte por e-mail</li>
        </ul>
        <a href="#formulario" style="display:block;text-align:center;background:#f1f5f9;color:#0f172a;font-size:15px;font-weight:700;padding:14px;border-radius:8px;text-decoration:none;">Começar →</a>
      </div>
      <div style="background:#2563eb;border-radius:16px;padding:32px 24px;box-shadow:0 8px 40px rgba(37,99,235,.3);position:relative;">
        <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#000;font-size:11px;font-weight:700;padding:4px 16px;border-radius:100px;white-space:nowrap;">MAIS POPULAR</span>
        <p style="font-size:14px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Pro</p>
        <p style="font-size:40px;font-weight:900;color:#fff;margin:0 0 4px;"><span style="font-size:20px;">R$</span>197</p>
        <p style="color:rgba(255,255,255,.7);font-size:14px;margin:0 0 24px;">por mês</p>
        <ul style="list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:10px;">
          <li style="color:#fff;font-size:14px;">✓ Tudo do Básico</li>
          <li style="color:#fff;font-size:14px;">✓ Recurso Premium</li>
          <li style="color:#fff;font-size:14px;">✓ Suporte prioritário</li>
          <li style="color:#fff;font-size:14px;">✓ Acesso vitalício</li>
        </ul>
        <a href="#formulario" style="display:block;text-align:center;background:#f59e0b;color:#000;font-size:15px;font-weight:700;padding:14px;border-radius:8px;text-decoration:none;">Escolher Pro →</a>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
        <p style="font-size:14px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Enterprise</p>
        <p style="font-size:40px;font-weight:900;color:#0f172a;margin:0 0 4px;"><span style="font-size:20px;">R$</span>497</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px;">por mês</p>
        <ul style="list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:10px;">
          <li style="color:#374151;font-size:14px;">✓ Tudo do Pro</li>
          <li style="color:#374151;font-size:14px;">✓ Usuários ilimitados</li>
          <li style="color:#374151;font-size:14px;">✓ Gerente dedicado</li>
          <li style="color:#374151;font-size:14px;">✓ SLA garantido</li>
        </ul>
        <a href="#formulario" style="display:block;text-align:center;background:#f1f5f9;color:#0f172a;font-size:15px;font-weight:700;padding:14px;border-radius:8px;text-decoration:none;">Falar com vendas →</a>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'planos-simples',
    label: 'Preço único',
    category: 'Planos',
    content: `
<section style="padding:80px 24px;background:#fff;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:520px;margin:0 auto;">
    <h2 style="font-size:34px;font-weight:800;color:#0f172a;margin:0 0 12px;">Investimento único</h2>
    <p style="color:#64748b;font-size:17px;margin:0 0 40px;">Acesso completo por um valor justo</p>
    <div style="background:#f8fafc;border-radius:20px;padding:48px;border:2px solid #e2e8f0;">
      <p style="font-size:16px;color:#64748b;text-decoration:line-through;margin:0 0 4px;">De R$ 497,00</p>
      <p style="font-size:72px;font-weight:900;color:#0f172a;margin:0;line-height:1;">R$ 197</p>
      <p style="color:#64748b;font-size:14px;margin:4px 0 0;">ou 12x de R$ 18,25 sem juros</p>
      <div style="height:1px;background:#e2e8f0;margin:32px 0;"></div>
      <ul style="list-style:none;padding:0;margin:0 0 32px;text-align:left;display:flex;flex-direction:column;gap:12px;">
        <li style="color:#0f172a;font-size:15px;">✅ Acesso a todo o conteúdo</li>
        <li style="color:#0f172a;font-size:15px;">✅ Suporte por 12 meses</li>
        <li style="color:#0f172a;font-size:15px;">✅ Atualizações gratuitas</li>
        <li style="color:#0f172a;font-size:15px;">✅ Garantia de 7 dias</li>
      </ul>
      <a href="#formulario" style="display:block;background:#2563eb;color:#fff;font-size:18px;font-weight:700;padding:18px;border-radius:10px;text-decoration:none;">QUERO GARANTIR MINHA VAGA →</a>
    </div>
  </div>
</section>
`,
  },

  // ─── SOBRE / BIO ─────────────────────────────────────────────────────────────
  {
    id: 'sobre-bio',
    label: 'Sobre o especialista',
    category: 'Sobre',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:900px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex-shrink:0;text-align:center;">
      <div style="width:180px;height:180px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:64px;font-weight:900;margin:0 auto 16px;">J</div>
      <p style="font-weight:700;color:#0f172a;font-size:18px;margin:0 0 4px;">João Especialista</p>
      <p style="color:#64748b;font-size:14px;margin:0;">Coach & Mentor</p>
    </div>
    <div style="flex:1;min-width:280px;">
      <p style="color:#2563eb;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Quem vai te guiar</p>
      <h2 style="font-size:34px;font-weight:800;color:#0f172a;margin:0 0 16px;line-height:1.2;">Olá, eu sou [seu nome]</h2>
      <p style="color:#64748b;font-size:16px;line-height:1.8;margin:0 0 20px;">Há mais de [X] anos ajudo pessoas como você a alcançar [resultado]. Já trabalhei com +[número] clientes e desenvolvi um método exclusivo que gera resultados reais e duradouros.</p>
      <p style="color:#64748b;font-size:16px;line-height:1.8;margin:0 0 28px;">Minha missão é simplificar o caminho para que você chegue ao seu objetivo mais rápido e com menos erros.</p>
      <div style="display:flex;gap:24px;flex-wrap:wrap;">
        <div><p style="font-size:28px;font-weight:900;color:#2563eb;margin:0;">+2.000</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Alunos formados</p></div>
        <div><p style="font-size:28px;font-weight:900;color:#2563eb;margin:0;">10 anos</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">de experiência</p></div>
        <div><p style="font-size:28px;font-weight:900;color:#2563eb;margin:0;">4.9★</p><p style="font-size:13px;color:#64748b;margin:4px 0 0;">Avaliação média</p></div>
      </div>
    </div>
  </div>
</section>
`,
  },
  {
    id: 'sobre-empresa',
    label: 'Sobre a empresa',
    category: 'Sobre',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:900px;margin:0 auto;text-align:center;">
    <p style="color:#2563eb;font-size:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Nossa história</p>
    <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 20px;">Quem somos</h2>
    <p style="color:#64748b;font-size:18px;line-height:1.8;margin:0 0 56px;max-width:680px;margin-left:auto;margin-right:auto;">Somos uma empresa fundada em [ano] com a missão de transformar a vida de [público] através de [solução]. Acreditamos que todo mundo merece acesso a ferramentas de qualidade.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      <div>
        <div style="width:56px;height:56px;background:#eff6ff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">🏆</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Nossa missão</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">Democratizar o acesso a [solução] para qualquer pessoa.</p>
      </div>
      <div>
        <div style="width:56px;height:56px;background:#f0fdf4;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">💡</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Nossa visão</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">Ser referência em [nicho] no Brasil e na América Latina.</p>
      </div>
      <div>
        <div style="width:56px;height:56px;background:#fdf4ff;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;">❤️</div>
        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 8px;">Nossos valores</h3>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">Ética, resultados e relacionamento de longo prazo.</p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── TIMELINE ────────────────────────────────────────────────────────────────
  {
    id: 'timeline',
    label: 'Timeline / Passo a passo',
    category: 'Timeline',
    content: `
<section style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:720px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 8px;text-align:center;">Como funciona</h2>
    <p style="color:#64748b;font-size:17px;margin:0 0 56px;text-align:center;">Sua jornada de transformação em 4 etapas</p>
    <div style="position:relative;padding-left:40px;">
      <div style="position:absolute;left:16px;top:0;bottom:0;width:2px;background:#e2e8f0;"></div>
      <div style="margin-bottom:40px;position:relative;">
        <div style="position:absolute;left:-32px;top:0;width:32px;height:32px;background:#2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">1</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Inscreva-se</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Preencha o formulário e garanta seu acesso imediato à plataforma.</p>
      </div>
      <div style="margin-bottom:40px;position:relative;">
        <div style="position:absolute;left:-32px;top:0;width:32px;height:32px;background:#7c3aed;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">2</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Receba o material</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Acesse todo o conteúdo e comece seu processo de transformação.</p>
      </div>
      <div style="margin-bottom:40px;position:relative;">
        <div style="position:absolute;left:-32px;top:0;width:32px;height:32px;background:#059669;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">3</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Aplique o método</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Siga o passo a passo e coloque tudo em prática com suporte da nossa equipe.</p>
      </div>
      <div style="position:relative;">
        <div style="position:absolute;left:-32px;top:0;width:32px;height:32px;background:#f59e0b;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">4</div>
        <h3 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Conquiste resultados</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Alcance seus objetivos e compartilhe sua história de sucesso com a nossa comunidade.</p>
      </div>
    </div>
  </div>
</section>
`,
  },

  // ─── GALERIA ─────────────────────────────────────────────────────────────────
  {
    id: 'galeria',
    label: 'Galeria de fotos',
    category: 'Galeria',
    content: `
<section style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:34px;font-weight:800;color:#0f172a;margin:0 0 8px;">Galeria</h2>
    <p style="text-align:center;color:#64748b;font-size:17px;margin:0 0 48px;">Confira nossos resultados e entregas</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
      <img src="https://placehold.co/400x180/e2e8f0/94a3b8?text=Foto+1" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 1" />
      <img src="https://placehold.co/400x180/dbeafe/94a3b8?text=Foto+2" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 2" />
      <img src="https://placehold.co/400x180/d1fae5/94a3b8?text=Foto+3" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 3" />
      <img src="https://placehold.co/400x180/fdf4ff/94a3b8?text=Foto+4" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 4" />
      <img src="https://placehold.co/400x180/fff7ed/94a3b8?text=Foto+5" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 5" />
      <img src="https://placehold.co/400x180/fef3c7/94a3b8?text=Foto+6" style="border-radius:12px;width:100%;height:180px;object-fit:cover;display:block;" alt="Foto 6" />
    </div>
  </div>
</section>
`,
  },

  // ─── GARANTIA ───────────────────────────────────────────────────────────────
  {
    id: 'garantia',
    label: 'Garantia 7 dias',
    category: 'Garantia',
    content: `
<section style="padding:60px 24px;background:#f0fdf4;text-align:center;font-family:system-ui,sans-serif;border-top:4px solid #22c55e;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="font-size:60px;margin-bottom:16px;">🛡️</div>
    <h2 style="font-size:32px;font-weight:800;color:#14532d;margin:0 0 12px;">Garantia incondicional de 7 dias</h2>
    <p style="color:#166534;font-size:17px;line-height:1.7;margin:0;">Se por qualquer motivo você não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu investimento. Sem burocracia, sem perguntas.</p>
  </div>
</section>
`,
  },
  {
    id: 'garantia-30dias',
    label: 'Garantia 30 dias',
    category: 'Garantia',
    content: `
<section style="padding:60px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:860px;margin:0 auto;display:flex;align-items:center;gap:40px;flex-wrap:wrap;background:#f8fafc;border-radius:20px;padding:48px;border:2px solid #e2e8f0;">
    <div style="text-align:center;flex-shrink:0;">
      <div style="width:120px;height:120px;background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto;box-shadow:0 8px 32px rgba(34,197,94,.3);">
        <span style="font-size:52px;">🛡️</span>
      </div>
      <p style="font-size:14px;font-weight:800;color:#15803d;margin:12px 0 0;text-transform:uppercase;letter-spacing:1px;">Garantia Total</p>
    </div>
    <div style="flex:1;min-width:260px;">
      <h2 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 12px;">30 dias de garantia incondicional</h2>
      <p style="color:#64748b;font-size:16px;line-height:1.7;margin:0 0 16px;">Você tem 30 dias para testar nosso método sem nenhum risco. Se não ficar 100% satisfeito, devolvemos cada centavo do seu investimento.</p>
      <p style="color:#15803d;font-size:15px;font-weight:600;margin:0;">✓ Devolução imediata · ✓ Sem perguntas · ✓ Sem burocracia</p>
    </div>
  </div>
</section>
`,
  },

  // ─── LOGOS / PARCEIROS ───────────────────────────────────────────────────────
  {
    id: 'logos',
    label: 'Logos / Parceiros',
    category: 'Credibilidade',
    content: `
<section style="padding:48px 24px;background:#fff;font-family:system-ui,sans-serif;border-top:1px solid #f1f5f9;border-bottom:1px solid #f1f5f9;">
  <div style="max-width:860px;margin:0 auto;text-align:center;">
    <p style="color:#94a3b8;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin:0 0 28px;">Como visto em / Parceiros</p>
    <div style="display:flex;gap:32px;justify-content:center;align-items:center;flex-wrap:wrap;">
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 24px;color:#94a3b8;font-size:16px;font-weight:700;">Logo 1</div>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 24px;color:#94a3b8;font-size:16px;font-weight:700;">Logo 2</div>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 24px;color:#94a3b8;font-size:16px;font-weight:700;">Logo 3</div>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 24px;color:#94a3b8;font-size:16px;font-weight:700;">Logo 4</div>
      <div style="background:#f1f5f9;border-radius:8px;padding:12px 24px;color:#94a3b8;font-size:16px;font-weight:700;">Logo 5</div>
    </div>
  </div>
</section>
`,
  },

  // ─── RODAPÉ ─────────────────────────────────────────────────────────────────
  {
    id: 'rodape',
    label: 'Rodapé simples',
    category: 'Rodapé',
    content: `
<footer style="padding:40px 24px;background:#0f172a;text-align:center;font-family:system-ui,sans-serif;">
  <p style="color:#475569;font-size:14px;margin:0 0 8px;">© 2025 Sua Empresa. Todos os direitos reservados.</p>
  <div style="display:flex;gap:20px;justify-content:center;">
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Política de Privacidade</a>
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Termos de Uso</a>
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Contato</a>
  </div>
</footer>
`,
  },
  {
    id: 'rodape-completo',
    label: 'Rodapé completo',
    category: 'Rodapé',
    content: `
<footer style="padding:60px 24px 32px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <div style="display:flex;gap:40px;flex-wrap:wrap;margin-bottom:40px;">
      <div style="flex:2;min-width:220px;">
        <p style="font-size:20px;font-weight:800;color:#fff;margin:0 0 12px;">Sua Empresa</p>
        <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">Transformando vidas através de [solução]. Somos referência em [nicho] no Brasil.</p>
        <div style="display:flex;gap:12px;">
          <a href="#" style="width:36px;height:36px;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:16px;">f</a>
          <a href="#" style="width:36px;height:36px;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:16px;">in</a>
          <a href="#" style="width:36px;height:36px;background:rgba(255,255,255,.08);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8;text-decoration:none;font-size:16px;">📷</a>
        </div>
      </div>
      <div style="flex:1;min-width:160px;">
        <p style="font-size:14px;font-weight:700;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Links</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Início</a></li>
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Sobre nós</a></li>
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Serviços</a></li>
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Contato</a></li>
        </ul>
      </div>
      <div style="flex:1;min-width:160px;">
        <p style="font-size:14px;font-weight:700;color:#fff;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Legal</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Privacidade</a></li>
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">Termos de uso</a></li>
          <li><a href="#" style="color:#64748b;font-size:14px;text-decoration:none;">LGPD</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:24px;text-align:center;">
      <p style="color:#475569;font-size:13px;margin:0;">© 2025 Sua Empresa. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
    </div>
  </div>
</footer>
`,
  },

  // ─── ELEMENTOS SIMPLES ───────────────────────────────────────────────────────
  {
    id: 'divisor',
    label: 'Divisor',
    category: 'Elementos',
    content: `<div style="height:2px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:0;"></div>`,
  },
  {
    id: 'espacador',
    label: 'Espaçador',
    category: 'Elementos',
    content: `<div style="height:60px;"></div>`,
  },
  {
    id: 'aviso-destaque',
    label: 'Aviso de destaque',
    category: 'Elementos',
    content: `
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px 20px;border-radius:0 8px 8px 0;font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;">
  <p style="margin:0;color:#92400e;font-size:15px;font-weight:600;">⚠️ Atenção: Esta é uma mensagem de aviso ou destaque importante para o leitor.</p>
</div>
`,
  },
]
