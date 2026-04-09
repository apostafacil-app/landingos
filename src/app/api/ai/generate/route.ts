import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generatePageSchema } from '@/lib/validations/page'
import { sanitizeHtml } from '@/lib/sanitize'
import { safeFetch, SsrfError } from '@/lib/ssrf'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em copywriting e design de landing pages de alta conversão para SaaS e serviços digitais.
Sua metodologia: cada seção existe para quebrar uma objeção específica e guiar o visitante até a ação.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura:
{
  "slug": "slug-da-pagina",
  "meta_title": "título SEO impactante (max 60 chars)",
  "meta_description": "descrição SEO com benefício claro (max 155 chars)",
  "headline": "título principal — transformação concreta, não feature",
  "subheadline": "subtítulo que expande o headline com contexto e urgência (1-2 frases)",
  "trust_stats": ["🏆 Stat ou prova social 1", "⭐ Stat 2", "✅ Garantia ou diferencial 3"],
  "sections": [
    {
      "type": "benefits",
      "eyebrow": "Por que [negócio]",
      "headline": "Título da seção de benefícios",
      "items": [
        { "icon": "🚀", "title": "Benefício 1", "description": "Frase curta que quebra uma objeção específica do cliente" },
        { "icon": "💡", "title": "Benefício 2", "description": "..." },
        { "icon": "🛡️", "title": "Benefício 3", "description": "..." }
      ]
    },
    {
      "type": "summary",
      "eyebrow": "O que você vai ter",
      "headline": "Tudo que você precisa, sem complicação",
      "items": ["Bullet concreto 1", "Bullet 2", "Bullet 3", "Bullet 4", "Bullet 5"]
    },
    {
      "type": "comparison",
      "eyebrow": "A diferença que faz diferença",
      "headline": "Por que [negócio] é diferente",
      "rows": [
        { "feature": "Diferencial específico", "us": "✓ Como resolvemos", "them": "✗ Como é sem nós" }
      ]
    },
    {
      "type": "social_proof",
      "eyebrow": "Quem já usa",
      "headline": "O que dizem nossos clientes",
      "items": [
        { "text": "Depoimento específico sobre resultado concreto [PLACEHOLDER]", "author": "Nome Sobrenome", "role": "Cargo · Empresa", "rating": 5 }
      ]
    },
    {
      "type": "pricing",
      "eyebrow": "Investimento",
      "headline": "Escolha seu plano",
      "plans": [
        { "name": "Nome do plano", "price": "R$X/mês", "features": ["feature 1", "feature 2", "feature 3"], "highlighted": false }
      ]
    },
    {
      "type": "faq",
      "eyebrow": "Dúvidas comuns",
      "headline": "Perguntas frequentes",
      "items": [
        { "q": "Pergunta direta baseada numa objeção real?", "a": "Resposta direta e honesta que elimina a dúvida." }
      ]
    },
    {
      "type": "offer",
      "headline": "Pronto para começar?",
      "description": "Reforce a transformação e adicione urgência ou garantia",
      "cta": "Texto do botão — verbo de ação + benefício"
    }
  ]
}

Regras OBRIGATÓRIAS:
- Português brasileiro, tom direto, persuasivo e honesto — sem jargão vazio
- ÍCONES: cada benefit DEVE ter um emoji relevante no campo "icon"
- EYEBROW: cada seção DEVE ter um rótulo curto (3-5 palavras) no campo "eyebrow"
- TRUST_STATS: 3 bullets de prova social/confiança no hero (use dados da oferta ou estime de forma conservadora)
- OBJEÇÕES: para cada objeção fornecida, crie benefício OU FAQ que a endereça explicitamente
- Depoimentos: marcar como [PLACEHOLDER] — nunca inventar dados reais; rating sempre 5
- Copy ESPECÍFICA ao nicho — proibido usar frases genéricas como "solução completa" ou "mais produtividade"
- Slug: apenas letras minúsculas, números e hífens
- Seção "comparison": só incluir se houver informação de concorrentes/diferencial
- Seção "pricing": só incluir se houver informação de preço
- Seção "faq": sempre incluir com mínimo 4 perguntas
- Seção "summary": sempre incluir com 4-6 bullets específicos`

/**
 * Gera HTML no formato que o GrapesJS espera:
 *   <style>...</style>\n<section>...</section><div>...</div>...
 *
 * NÃO gera <!DOCTYPE html> / <html> / <head> / <body>.
 * Dessa forma o editor consegue parsear cada bloco como componente
 * independente — clicável, arrastável e editável — e o usuário pode
 * adicionar mais blocos pelo painel lateral.
 */
const COLOR_PALETTES = [
  { id: 'azul-profissional', primary: '#1e3a8a', grad: '#3b5bdb', accent: '#f59e0b', bg: '#f0f4ff' },
  { id: 'roxo-tech',         primary: '#4c1d95', grad: '#7c3aed', accent: '#06b6d4', bg: '#faf5ff' },
  { id: 'verde-natural',     primary: '#14532d', grad: '#16a34a', accent: '#f59e0b', bg: '#f0fdf4' },
  { id: 'laranja-energia',   primary: '#92400e', grad: '#d97706', accent: '#ef4444', bg: '#fffbeb' },
  { id: 'preto-elegante',    primary: '#0f172a', grad: '#334155', accent: '#f59e0b', bg: '#f8fafc' },
  { id: 'ciano-saude',       primary: '#164e63', grad: '#0891b2', accent: '#10b981', bg: '#ecfeff' },
  { id: 'rosa-criativo',     primary: '#831843', grad: '#db2777', accent: '#f97316', bg: '#fdf2f8' },
  { id: 'azul-confianca',    primary: '#1e40af', grad: '#2563eb', accent: '#10b981', bg: '#eff6ff' },
]

type AiSection = {
  type: string
  eyebrow?: string
  headline?: string
  items?: Array<{ icon?: string; title?: string; text?: string; description?: string; author?: string; role?: string; rating?: number; q?: string; a?: string }>
  rows?: Array<{ feature: string; us: string; them: string }>
  plans?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>
  description?: string
  cta?: string
}

/** Tenta extrair URL da logo do site. Só retorna URLs http(s). */
function extractLogoUrl(html: string, baseUrl: string): string | null {
  const resolve = (url: string): string => { try { return new URL(url, baseUrl).href } catch { return url } }
  const safe    = (url: string): string | null => /^https?:\/\//i.test(url) ? url : null

  // 1. <img> com class/alt/id contendo "logo" (mais específico)
  const logoAttr = html.match(/<img[^>]+(?:class|alt|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i)
                ?? html.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:class|alt|id)=["'][^"']*logo[^"']*["']/i)
  if (logoAttr?.[1]) return safe(resolve(logoAttr[1]))

  // 2. src cujo caminho contém "logo" (ex: /images/logo.png, /logo.svg)
  const logoSrc = html.match(/<img[^>]+src=["']([^"']*\/logo[^"']+)["']/i)
  if (logoSrc?.[1]) return safe(resolve(logoSrc[1]))

  // 3. Apple touch icon — ícone quadrado de alta qualidade, geralmente a marca
  const apple = html.match(/<link[^>]+rel=["']apple-touch-icon(?:-precomposed)?["'][^>]+href=["']([^"']+)["']/i)
  if (apple?.[1]) return safe(resolve(apple[1]))

  // 4. og:image apenas como último recurso (frequentemente é um banner, não logo)
  // Ignorado — deforma a nav bar

  return null
}

function generateHtml(data: {
  headline: string
  subheadline: string
  trust_stats?: string[]
  sections: AiSection[]
  pageName: string
  meta_title: string
  colorPalette?: string
  colorMode?: string
  logoUrl?: string
}): string {
  const pal = COLOR_PALETTES.find(p => p.id === data.colorPalette) ?? COLOR_PALETTES[0]
  const { primary, grad, accent } = pal
  const isDark = data.colorMode === 'dark'

  // Variáveis de tema
  const bodyBg     = isDark ? '#0a0f1e' : '#ffffff'
  const bodyText   = isDark ? '#e2e8f0' : '#1e293b'
  const cardBg     = isDark ? '#141c2e' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e8edf5'
  const altBg      = isDark ? '#0d1526' : primary
  const muted      = isDark ? '#64748b' : '#64748b'
  const subText    = isDark ? '#94a3b8' : '#475569'
  const faqABg     = isDark ? '#0f1928' : '#f8fafc'
  const navBg      = isDark ? '#070c18' : primary
  const footerBg   = isDark ? '#070c18' : '#f8fafc'
  const sectionH   = isDark ? '#f1f5f9' : primary

  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${bodyText};line-height:1.6;background:${bodyBg}}
.ai-nav{background:${navBg};padding:16px 32px;display:flex;align-items:center;border-bottom:1px solid ${cardBorder}}
.ai-nav-logo{height:36px;max-width:160px;object-fit:contain;display:block}
.ai-nav-brand{color:#fff;font-size:1.05rem;font-weight:700;letter-spacing:-.01em}
.ai-eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${accent};margin-bottom:10px;text-align:center;display:block}
.ai-hero{background:linear-gradient(135deg,${primary} 0%,${grad} 100%);color:#fff;text-align:center;padding:104px 24px 88px}
.ai-hero h1{font-size:clamp(2rem,5vw,3.6rem);font-weight:900;margin-bottom:20px;max-width:800px;margin-inline:auto;line-height:1.1;letter-spacing:-.03em}
.ai-hero p{font-size:1.15rem;opacity:.88;max-width:580px;margin-inline:auto;margin-bottom:44px;line-height:1.75}
.ai-hero-cta{display:inline-block;background:${accent};color:#fff;font-weight:800;font-size:1rem;padding:16px 48px;border-radius:10px;text-decoration:none;box-shadow:0 6px 28px rgba(0,0,0,.3);letter-spacing:.01em}
.ai-hero-trust{display:flex;justify-content:center;flex-wrap:wrap;gap:24px;margin-top:36px;padding-top:32px;border-top:1px solid rgba(255,255,255,.18)}
.ai-hero-trust span{font-size:.875rem;opacity:.88;display:flex;align-items:center;gap:6px}
.ai-section{padding:88px 24px;max-width:1040px;margin-inline:auto}
.ai-section h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;text-align:center;margin-bottom:48px;color:${sectionH};letter-spacing:-.02em}
.ai-alt{background:${altBg};padding:88px 24px}
.ai-alt-inner{max-width:1040px;margin-inline:auto}
.ai-alt-inner h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;text-align:center;margin-bottom:48px;color:#fff;letter-spacing:-.02em}
.ai-alt .ai-eyebrow{color:rgba(255,255,255,.7)}
.ai-benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.ai-benefit{background:${cardBg};border:1px solid ${cardBorder};border-top:4px solid ${grad};border-radius:14px;padding:28px;box-shadow:0 4px 16px rgba(0,0,0,${isDark ? '.25' : '.06'});transition:transform .2s,box-shadow .2s}
.ai-benefit:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,${isDark ? '.35' : '.1'})}
.ai-benefit-icon{font-size:1.8rem;margin-bottom:16px;display:block;line-height:1}
.ai-benefit h3{font-size:1rem;font-weight:700;margin-bottom:10px;color:${isDark ? '#f1f5f9' : primary}}
.ai-benefit p{font-size:.9rem;color:${muted};line-height:1.7}
.ai-summary-list{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.ai-summary-list li{display:flex;align-items:flex-start;gap:12px;font-size:.95rem;color:rgba(255,255,255,.9);padding:4px 0}
.ai-summary-list li::before{content:"✓";background:${accent};color:#fff;font-weight:800;font-size:.7rem;width:22px;height:22px;min-width:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px}
.ai-comparison-wrap{overflow-x:auto;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,${isDark ? '.35' : '.1'})}
.ai-comparison table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:480px}
.ai-comparison th{background:${primary};color:#fff;padding:16px 20px;text-align:left;font-weight:600;font-size:.82rem;letter-spacing:.05em;text-transform:uppercase}
.ai-comparison td{padding:14px 20px;border-bottom:1px solid ${cardBorder};background:${cardBg};color:${bodyText}}
.ai-comparison tr:last-child td{border-bottom:none}
.ai-comparison .us{color:#22c55e;font-weight:700}
.ai-comparison .them{color:#ef4444}
.ai-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.ai-testimonial{background:${cardBg};border:1px solid ${cardBorder};border-radius:14px;padding:28px;position:relative;overflow:hidden}
.ai-testimonial::before{content:'"';font-size:6rem;color:${grad};opacity:.18;position:absolute;top:-12px;left:16px;line-height:1;font-family:Georgia,serif;font-weight:700}
.ai-testimonial-stars{color:#f59e0b;font-size:1rem;margin-bottom:8px;padding-top:28px;letter-spacing:2px}
.ai-testimonial p{font-size:.9rem;color:${subText};margin-bottom:16px;line-height:1.75;font-style:italic}
.ai-testimonial strong{font-size:.85rem;color:${isDark ? '#f1f5f9' : primary};font-weight:700}
.ai-pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;align-items:stretch}
.ai-plan{border:2px solid ${cardBorder};border-radius:20px;padding:36px 28px;text-align:center;background:${cardBg}}
.ai-plan.highlighted{border-color:transparent;background:linear-gradient(145deg,${primary},${grad});box-shadow:0 12px 48px ${primary}55}
.ai-plan-name{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;margin-bottom:16px;color:${muted}}
.ai-plan.highlighted .ai-plan-name{color:rgba(255,255,255,.65)}
.ai-plan-price{font-size:2.8rem;font-weight:900;color:${isDark ? '#fff' : primary};margin-bottom:24px;line-height:1;letter-spacing:-.04em}
.ai-plan.highlighted .ai-plan-price{color:#fff}
.ai-plan-features{list-style:none;text-align:left;margin-bottom:28px}
.ai-plan-features li{font-size:.875rem;color:${subText};padding:10px 0;border-bottom:1px solid ${cardBorder};display:flex;gap:10px;align-items:flex-start}
.ai-plan.highlighted .ai-plan-features li{color:rgba(255,255,255,.9);border-color:rgba(255,255,255,.15)}
.ai-plan-features li::before{content:"✓";color:${accent};font-weight:800;flex-shrink:0;margin-top:1px}
.ai-plan.highlighted .ai-plan-features li::before{color:#fff;opacity:.9}
.ai-faq{display:flex;flex-direction:column;gap:10px;max-width:720px;margin-inline:auto}
details.ai-faq-item{border:1px solid ${cardBorder};border-radius:14px;overflow:hidden}
details.ai-faq-item summary{list-style:none;cursor:pointer;font-weight:700;font-size:.95rem;color:#fff;padding:18px 24px;background:${primary};display:flex;justify-content:space-between;align-items:center;line-height:1.5;user-select:none}
details.ai-faq-item summary::-webkit-details-marker{display:none}
details.ai-faq-item summary::after{content:"+";font-size:1.3rem;opacity:.75;flex-shrink:0;margin-left:12px;transition:transform .2s}
details.ai-faq-item[open] summary::after{content:"−"}
.ai-faq-a{font-size:.9rem;color:${subText};padding:18px 24px;line-height:1.8;background:${faqABg}}
.ai-cta{background:linear-gradient(135deg,${primary} 0%,${grad} 100%);color:#fff;text-align:center;padding:104px 24px}
.ai-cta h2{font-size:clamp(1.8rem,4vw,3rem);font-weight:900;margin-bottom:16px;letter-spacing:-.03em}
.ai-cta p{opacity:.88;margin-bottom:44px;max-width:520px;margin-inline:auto;font-size:1.08rem;line-height:1.65}
.ai-cta-btn{display:inline-block;background:${accent};color:#fff;font-weight:800;font-size:1.05rem;padding:18px 52px;border-radius:12px;text-decoration:none;box-shadow:0 6px 28px rgba(0,0,0,.3);letter-spacing:.01em}
.ai-footer{text-align:center;padding:40px 24px;color:${muted};font-size:.85rem;border-top:1px solid ${cardBorder};background:${footerBg}}
`.trim()

  const navHtml = data.logoUrl
    ? `<nav class="ai-nav"><img class="ai-nav-logo" src="${data.logoUrl}" alt="${data.pageName}" loading="lazy" /></nav>`
    : `<nav class="ai-nav"><span class="ai-nav-brand">${data.pageName}</span></nav>`

  const heroCtaText = data.sections.find(s => s.type === 'offer')?.cta ?? 'Quero começar agora'

  const sectionHtml = (s: AiSection): string => {
    switch (s.type) {
      case 'benefits':
        return `<div class="ai-section">
  ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
  <h2>${s.headline ?? ''}</h2>
  <div class="ai-benefits">
    ${(s.items ?? []).map(item => `<div class="ai-benefit">${item.icon ? `<span class="ai-benefit-icon">${item.icon}</span>` : ''}<h3>${item.title ?? ''}</h3><p>${item.description ?? ''}</p></div>`).join('\n    ')}
  </div>
</div>`

      case 'summary':
        return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
    <h2>${s.headline ?? ''}</h2>
    <ul class="ai-summary-list">
      ${(s.items ?? []).map(item => `<li>${typeof item === 'string' ? item : (item.title ?? item.description ?? '')}</li>`).join('\n      ')}
    </ul>
  </div>
</div>`

      case 'comparison':
        if (!s.rows?.length) return ''
        return `<div class="ai-section">
  ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
  <h2>${s.headline ?? ''}</h2>
  <div class="ai-comparison-wrap"><div class="ai-comparison">
    <table>
      <thead><tr><th>Recurso</th><th>Com ${data.pageName}</th><th>Alternativa</th></tr></thead>
      <tbody>
        ${s.rows.map(r => `<tr><td>${r.feature}</td><td class="us">${r.us}</td><td class="them">${r.them}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div></div>
</div>`

      case 'social_proof':
        return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
    <h2>${s.headline ?? ''}</h2>
    <div class="ai-testimonials-grid">
      ${(s.items ?? []).map(item => `<div class="ai-testimonial">${item.rating ? `<div class="ai-testimonial-stars">${'⭐'.repeat(item.rating)}</div>` : ''}<p>"${item.text ?? ''}"</p><strong>${item.author ?? ''}${item.role ? ` · ${item.role}` : ''}</strong></div>`).join('\n      ')}
    </div>
  </div>
</div>`

      case 'pricing':
        if (!s.plans?.length) return ''
        return `<div class="ai-section">
  ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
  <h2>${s.headline ?? ''}</h2>
  <div class="ai-pricing">
    ${s.plans.map(p => `<div class="ai-plan${p.highlighted ? ' highlighted' : ''}">
      <div class="ai-plan-name">${p.name}</div>
      <div class="ai-plan-price">${p.price}</div>
      <ul class="ai-plan-features">${(p.features ?? []).map(f => `<li>${f}</li>`).join('')}</ul>
    </div>`).join('\n    ')}
  </div>
</div>`

      case 'faq':
        return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${s.eyebrow ? `<span class="ai-eyebrow">${s.eyebrow}</span>` : ''}
    <h2>${s.headline ?? 'Perguntas frequentes'}</h2>
    <div class="ai-faq">
      ${(s.items ?? []).map(item => `<details class="ai-faq-item"><summary>${item.q ?? ''}</summary><div class="ai-faq-a">${item.a ?? ''}</div></details>`).join('\n      ')}
    </div>
  </div>
</div>`

      case 'offer':
        return `<div class="ai-cta" id="cta">
  <h2>${s.headline ?? ''}</h2>
  <p>${s.description ?? ''}</p>
  <a href="#" class="ai-cta-btn">${s.cta ?? 'Quero começar agora'}</a>
</div>`

      default:
        return ''
    }
  }

  const trustStats = data.trust_stats ?? []
  const heroHtml = `<section class="ai-hero">
  <h1>${data.headline}</h1>
  <p>${data.subheadline}</p>
  <a href="#cta" class="ai-hero-cta">${heroCtaText}</a>
  ${trustStats.length > 0 ? `<div class="ai-hero-trust">${trustStats.map(s => `<span>${s}</span>`).join('')}</div>` : ''}
</section>`

  const footerHtml = `<footer class="ai-footer">
  <p>&copy; ${new Date().getFullYear()} ${data.pageName}. Todos os direitos reservados.</p>
</footer>`

  const sectionsHtml = data.sections.map(sectionHtml).filter(Boolean).join('\n')

  return `<style>${css}</style>\n${navHtml}\n${heroHtml}\n${sectionsHtml}\n${footerHtml}`.trim()
}

export async function POST(request: Request) {
  try {
    // 1. Autenticação — nunca confiar em user_id do body
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Buscar workspace_id do usuário autenticado
    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()

    if (!member?.workspace_id) {
      return NextResponse.json({ error: 'Workspace não encontrado' }, { status: 403 })
    }
    const workspaceId = member.workspace_id

    // 3. Validar input com Zod
    const body = await request.json()
    const parsed = generatePageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
    }
    const input = parsed.data

    // 4. Consumir crédito atomicamente ANTES de chamar a IA
    const { data: credited, error: creditError } = await supabaseAdmin.rpc('consume_ai_credit', {
      p_workspace_id: workspaceId,
    })
    if (creditError) {
      // Função pode não existir ainda (migration pendente) — logar e continuar
      console.warn('[/api/ai/generate] consume_ai_credit error (migration pendente?):', creditError.message)
    } else if (!credited) {
      return NextResponse.json({ error: 'Créditos de IA esgotados. Aguarde a renovação do plano.' }, { status: 402 })
    }

    // 5. Buscar contexto do site (com proteção SSRF) e extrair logo
    let websiteContext = ''
    let logoUrl: string | undefined
    if (input.websiteUrl) {
      try {
        const html = await safeFetch(input.websiteUrl)
        // Extrair apenas texto puro (remover tags) e limitar a 2000 chars
        websiteContext = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2_000)
        // Tentar extrair logo/og:image
        logoUrl = extractLogoUrl(html, input.websiteUrl) ?? undefined
      } catch (e) {
        if (e instanceof SsrfError) {
          return NextResponse.json({ error: `URL inválida: ${e.message}` }, { status: 400 })
        }
        // Outros erros de rede: continuar sem contexto
      }
    }

    // 6. Chamar Claude API — input do usuário separado do system prompt (anti-prompt-injection)
    const userMessage = JSON.stringify({
      pageName: input.pageName,
      businessName: input.businessName,
      segment: input.segment,
      targetAudience: input.targetAudience,
      painPoint: input.painPoint,
      desire: input.desire,
      offer: input.offer,
      websiteContext: websiteContext || undefined,
      // Campos avançados (opcionais)
      objections:  input.objections  || undefined,
      guarantee:   input.guarantee   || undefined,
      competitors: input.competitors || undefined,
      price:       input.price       || undefined,
    })

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Dados do negócio:\n${userMessage}` },
      ],
    })

    const rawContent = message.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Resposta inesperada da IA')
    }

    // 7. Parsear JSON retornado pela IA
    let aiData: {
      slug: string
      meta_title: string
      meta_description: string
      headline: string
      subheadline: string
      trust_stats?: string[]
      sections: AiSection[]
    }
    try {
      // Extrair JSON mesmo se vier com texto ao redor
      const jsonMatch = rawContent.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('JSON não encontrado')
      aiData = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('Resposta da IA em formato inválido')
    }

    // 8. Gerar HTML e sanitizar (XSS — security-checklist A05)
    const rawHtml = generateHtml({ ...aiData, pageName: input.businessName, colorPalette: input.colorPalette, colorMode: input.colorMode, logoUrl })
    const safeHtml = sanitizeHtml(rawHtml)

    // 9. Garantir slug único no workspace
    let slug = aiData.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    const { data: existing } = await supabaseAdmin
      .from('pages')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // 10. Salvar página no banco
    const { data: page, error: pageError } = await supabaseAdmin
      .from('pages')
      .insert({
        workspace_id: workspaceId,
        name: input.pageName,
        slug,
        status: 'draft',
        content: { sections: aiData.sections, headline: aiData.headline, subheadline: aiData.subheadline },
        html: safeHtml,
        meta_title: aiData.meta_title,
        meta_description: aiData.meta_description,
      })
      .select('id')
      .single()

    if (pageError || !page) {
      throw new Error('Erro ao salvar página')
    }

    // 11. Registrar evento de auditoria (não-fatal — tabela pode ainda não existir)
    supabaseAdmin.from('security_events').insert({
      user_id: user.id,
      workspace_id: workspaceId,
      event: 'ai_generation',
      resource: 'pages',
      action: 'create',
      result: 'success',
      metadata: { page_id: page.id, model: 'claude-haiku-4-5-20251001' },
    }).then(({ error }) => {
      if (error) console.warn('[/api/ai/generate] security_events insert:', error.message)
    })

    return NextResponse.json({ pageId: page.id, slug })

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/ai/generate] FATAL:', msg)

    // Erros específicos da Anthropic SDK
    if (error instanceof Anthropic.APIError) {
      if (error.status === 529 || error.status === 503) {
        return NextResponse.json({ error: 'O serviço de IA está sobrecarregado. Aguarde alguns segundos e tente novamente.' }, { status: 503 })
      }
      if (error.status === 429) {
        return NextResponse.json({ error: 'Limite de requisições atingido. Aguarde e tente novamente.' }, { status: 429 })
      }
      if (msg.includes('credit balance') || msg.includes('too low')) {
        return NextResponse.json({ error: 'Saldo insuficiente na API Anthropic. Acesse console.anthropic.com → Billing para verificar.' }, { status: 402 })
      }
      return NextResponse.json({ error: `Serviço de IA indisponível (${error.status}). Tente novamente.` }, { status: 503 })
    }

    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
