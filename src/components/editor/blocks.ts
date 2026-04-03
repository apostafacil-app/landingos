// Landing page blocks for GrapesJS
// Each block is a pre-built HTML section users can drag into the page

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
    label: 'Hero Simples',
    category: 'Hero',
    content: `
<section data-gjs-type="section" style="background:linear-gradient(135deg,#1a2e5a 0%,#2563eb 100%);padding:100px 24px;text-align:center;color:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:700px;margin:0 auto;">
    <h1 style="font-size:52px;font-weight:800;margin:0 0 20px;line-height:1.15;letter-spacing:-1px;">Transforme seu negócio com nossa solução</h1>
    <p style="font-size:20px;margin:0 0 36px;opacity:.85;line-height:1.6;">Descubra como centenas de empresas já conseguiram resultados extraordinários. Comece hoje mesmo.</p>
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
<section data-gjs-type="section" style="background:#0f172a;padding:80px 24px;font-family:system-ui,sans-serif;">
  <div style="max-width:1000px;margin:0 auto;display:flex;align-items:center;gap:60px;flex-wrap:wrap;">
    <div style="flex:1;min-width:280px;color:#fff;">
      <span style="display:inline-block;background:#3b82f6;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase;">Novidade 2025</span>
      <h1 style="font-size:44px;font-weight:800;margin:0 0 20px;line-height:1.15;">O resultado que você sempre quis está aqui</h1>
      <p style="font-size:18px;margin:0 0 32px;color:#94a3b8;line-height:1.7;">Solução completa para quem quer crescer sem complicação e com resultado garantido.</p>
      <a href="#formulario" style="display:inline-block;background:#f59e0b;color:#000;font-size:16px;font-weight:700;padding:16px 40px;border-radius:10px;text-decoration:none;">Garantir minha vaga agora →</a>
    </div>
    <div style="flex:1;min-width:280px;background:rgba(255,255,255,.06);border-radius:20px;height:300px;display:flex;align-items:center;justify-content:center;color:#475569;font-size:14px;border:1px dashed rgba(255,255,255,.15);">
      [Insira sua imagem aqui]
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
<section data-gjs-type="section" style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
  <div style="max-width:960px;margin:0 auto;">
    <h2 style="text-align:center;font-size:36px;font-weight:800;color:#0f172a;margin:0 0 12px;">Por que escolher a nossa solução?</h2>
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
<section data-gjs-type="section" style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
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
        <div><strong style="color:#0f172a;font-size:18px;">Tempo livre para o que importa</strong><p style="color:#64748b;margin:4px 0 0;font-size:15px;line-height:1.6;">Processo automatizado para que você foque no crescimento do negócio.</p></div>
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

  // ─── DEPOIMENTOS ────────────────────────────────────────────────────────────
  {
    id: 'depoimentos-cards',
    label: 'Depoimentos em cards',
    category: 'Depoimentos',
    content: `
<section data-gjs-type="section" style="padding:80px 24px;background:#f8fafc;font-family:system-ui,sans-serif;">
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

  // ─── FORMULÁRIO DE CAPTURA ──────────────────────────────────────────────────
  {
    id: 'formulario-captura',
    label: 'Formulário de Captura',
    category: 'Formulários',
    content: `
<section data-gjs-type="section" id="formulario" style="padding:80px 24px;background:#0f172a;font-family:system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;text-align:center;">
    <h2 style="font-size:36px;font-weight:800;color:#fff;margin:0 0 12px;">Garanta sua vaga agora</h2>
    <p style="color:#94a3b8;font-size:17px;margin:0 0 36px;">Preencha seus dados e receba acesso imediato</p>
    <form style="display:flex;flex-direction:column;gap:14px;">
      <input type="text" name="name" placeholder="Seu nome completo" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <input type="email" name="email" placeholder="Seu melhor e-mail" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <input type="tel" name="phone" placeholder="WhatsApp (opcional)" style="width:100%;padding:16px 20px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:16px;box-sizing:border-box;" />
      <button type="submit" style="width:100%;padding:18px;background:#f59e0b;color:#000;font-size:18px;font-weight:700;border:none;border-radius:10px;cursor:pointer;">QUERO GARANTIR MINHA VAGA →</button>
      <p style="color:#475569;font-size:13px;margin:0;">🔒 Seus dados estão 100% seguros. Não enviamos spam.</p>
    </form>
  </div>
</section>
`,
  },

  // ─── CTA ────────────────────────────────────────────────────────────────────
  {
    id: 'cta-simples',
    label: 'CTA Simples',
    category: 'CTA',
    content: `
<section data-gjs-type="section" style="padding:80px 24px;background:#2563eb;text-align:center;font-family:system-ui,sans-serif;">
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
    label: 'CTA com Urgência',
    category: 'CTA',
    content: `
<section data-gjs-type="section" style="padding:64px 24px;background:#991b1b;text-align:center;font-family:system-ui,sans-serif;">
  <div style="max-width:640px;margin:0 auto;">
    <p style="display:inline-block;background:#ef4444;color:#fff;font-size:12px;font-weight:700;padding:6px 16px;border-radius:100px;letter-spacing:2px;text-transform:uppercase;margin:0 0 20px;">⚠️ Últimas vagas disponíveis</p>
    <h2 style="font-size:38px;font-weight:800;color:#fff;margin:0 0 16px;line-height:1.2;">Esta oferta encerra em breve</h2>
    <p style="font-size:17px;color:rgba(255,255,255,.8);margin:0 0 32px;line-height:1.6;">Não deixe para depois. Quem age agora garante o melhor preço e condições exclusivas.</p>
    <a href="#formulario" style="display:inline-block;background:#fff;color:#991b1b;font-size:18px;font-weight:800;padding:18px 52px;border-radius:10px;text-decoration:none;">GARANTIR MINHA VAGA AGORA →</a>
  </div>
</section>
`,
  },

  // ─── FAQ ────────────────────────────────────────────────────────────────────
  {
    id: 'faq',
    label: 'Perguntas Frequentes',
    category: 'FAQ',
    content: `
<section data-gjs-type="section" style="padding:80px 24px;background:#fff;font-family:system-ui,sans-serif;">
  <div style="max-width:720px;margin:0 auto;">
    <h2 style="font-size:36px;font-weight:800;color:#0f172a;margin:0 0 8px;">Perguntas frequentes</h2>
    <p style="color:#64748b;font-size:17px;margin:0 0 48px;">Tudo que você precisa saber antes de começar</p>
    <div style="display:flex;flex-direction:column;gap:0;">
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Para quem é essa solução?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Para qualquer pessoa que queira alcançar [resultado] sem precisar de experiência prévia. Iniciantes e experientes se beneficiam igualmente.</p>
      </div>
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Em quanto tempo verei os resultados?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">A maioria dos nossos clientes começa a ver resultados em 30 dias. Com dedicação, os resultados chegam ainda mais rápido.</p>
      </div>
      <div style="border-bottom:1px solid #e2e8f0;padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Há garantia?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Sim! Oferecemos garantia incondicional de 7 dias. Se não ficar satisfeito, devolvemos 100% do seu investimento.</p>
      </div>
      <div style="padding:24px 0;">
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;">Como funciona o suporte?</h3>
        <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0;">Nosso time está disponível de seg a sex para responder dúvidas e garantir que você tenha o melhor resultado possível.</p>
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
<section data-gjs-type="section" style="padding:80px 24px;background:#0f172a;text-align:center;font-family:system-ui,sans-serif;">
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

  // ─── GARANTIA ───────────────────────────────────────────────────────────────
  {
    id: 'garantia',
    label: 'Garantia',
    category: 'Garantia',
    content: `
<section data-gjs-type="section" style="padding:60px 24px;background:#f0fdf4;text-align:center;font-family:system-ui,sans-serif;border-top:4px solid #22c55e;">
  <div style="max-width:560px;margin:0 auto;">
    <div style="font-size:60px;margin-bottom:16px;">🛡️</div>
    <h2 style="font-size:32px;font-weight:800;color:#14532d;margin:0 0 12px;">Garantia incondicional de 7 dias</h2>
    <p style="color:#166534;font-size:17px;line-height:1.7;margin:0;">Se por qualquer motivo você não ficar satisfeito nos primeiros 7 dias, devolvemos 100% do seu investimento. Sem burocracia, sem perguntas.</p>
  </div>
</section>
`,
  },

  // ─── RODAPÉ ─────────────────────────────────────────────────────────────────
  {
    id: 'rodape',
    label: 'Rodapé',
    category: 'Rodapé',
    content: `
<footer data-gjs-type="section" style="padding:40px 24px;background:#0f172a;text-align:center;font-family:system-ui,sans-serif;">
  <p style="color:#475569;font-size:14px;margin:0 0 8px;">© 2025 Sua Empresa. Todos os direitos reservados.</p>
  <div style="display:flex;gap:20px;justify-content:center;">
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Política de Privacidade</a>
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Termos de Uso</a>
    <a href="#" style="color:#64748b;font-size:13px;text-decoration:none;">Contato</a>
  </div>
</footer>
`,
  },

  // ─── DIVISOR ────────────────────────────────────────────────────────────────
  {
    id: 'divisor',
    label: 'Divisor de Seção',
    category: 'Elementos',
    content: `<div style="height:2px;background:linear-gradient(90deg,transparent,#e2e8f0,transparent);margin:0;"></div>`,
  },
  {
    id: 'espacador',
    label: 'Espaçador',
    category: 'Elementos',
    content: `<div style="height:60px;"></div>`,
  },
]
