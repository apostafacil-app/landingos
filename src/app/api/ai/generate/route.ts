import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generatePageSchema } from '@/lib/validations/page'
import { sanitizeHtml } from '@/lib/sanitize'
import { safeFetch, SsrfError } from '@/lib/ssrf'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em copywriting e criação de landing pages de alta conversão.
Sua metodologia: cada seção da página existe para quebrar uma objeção específica do cliente.

Retorne APENAS um JSON válido (sem markdown, sem \`\`\`json) com esta estrutura:
{
  "slug": "slug-da-pagina",
  "meta_title": "título SEO (max 60 chars)",
  "meta_description": "descrição SEO (max 155 chars)",
  "headline": "título principal impactante",
  "subheadline": "subtítulo de apoio (1-2 frases)",
  "sections": [
    {
      "type": "benefits",
      "headline": "Por que escolher [negócio]?",
      "items": [
        { "title": "Benefício 1", "description": "Descrição que quebra uma objeção específica" },
        { "title": "Benefício 2", "description": "..." },
        { "title": "Benefício 3", "description": "..." }
      ]
    },
    {
      "type": "summary",
      "headline": "Tudo que você precisa, sem complicação",
      "items": ["O que o produto faz — bullet 1", "bullet 2", "bullet 3", "bullet 4"]
    },
    {
      "type": "comparison",
      "headline": "Por que [negócio] é diferente",
      "rows": [
        { "feature": "Nome do diferencial", "us": "✓ Como fazemos", "them": "✗ Como é sem nós" }
      ]
    },
    {
      "type": "social_proof",
      "headline": "O que dizem nossos clientes",
      "items": [
        { "text": "Depoimento [PLACEHOLDER]", "author": "Nome Sobrenome", "role": "Cargo/Empresa" }
      ]
    },
    {
      "type": "pricing",
      "headline": "Escolha seu plano",
      "plans": [
        { "name": "Nome do plano", "price": "R$X/mês", "features": ["feature 1", "feature 2"], "highlighted": false }
      ]
    },
    {
      "type": "faq",
      "headline": "Perguntas frequentes",
      "items": [
        { "q": "Pergunta baseada numa objeção", "a": "Resposta direta que quebra a objeção" }
      ]
    },
    {
      "type": "offer",
      "headline": "Comece agora",
      "description": "Reforce a transformação + urgência",
      "cta": "Texto do botão de ação"
    }
  ]
}

Regras:
- Português brasileiro, tom persuasivo mas honesto
- OBJEÇÕES: para cada objeção fornecida, crie pelo menos um benefício OU uma pergunta de FAQ que a endereça explicitamente
- Foque na transformação do cliente, não no produto
- Depoimentos: marcar como [PLACEHOLDER] — nunca inventar dados reais
- Slug: apenas letras minúsculas, números e hífens
- Seção "comparison": só incluir se houver informação de concorrentes/diferencial
- Seção "pricing": só incluir se houver informação de preço
- Seção "faq": sempre incluir, especialmente se houver objeções
- Seção "summary": sempre incluir com 4-6 bullets do que o produto entrega`

/**
 * Gera HTML no formato que o GrapesJS espera:
 *   <style>...</style>\n<section>...</section><div>...</div>...
 *
 * NÃO gera <!DOCTYPE html> / <html> / <head> / <body>.
 * Dessa forma o editor consegue parsear cada bloco como componente
 * independente — clicável, arrastável e editável — e o usuário pode
 * adicionar mais blocos pelo painel lateral.
 */
type AiSection = {
  type: string
  headline?: string
  items?: Array<{ title?: string; text?: string; description?: string; author?: string; role?: string; q?: string; a?: string }>
  rows?: Array<{ feature: string; us: string; them: string }>
  plans?: Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>
  description?: string
  cta?: string
}

function generateHtml(data: {
  headline: string
  subheadline: string
  sections: AiSection[]
  pageName: string
  meta_title: string
}): string {
  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;color:#1e293b;line-height:1.6}
.ai-hero{background:linear-gradient(135deg,#1e3a8a,#3b5bdb);color:#fff;text-align:center;padding:80px 24px}
.ai-hero h1{font-size:clamp(1.8rem,4vw,3rem);font-weight:800;margin-bottom:16px;max-width:700px;margin-inline:auto;line-height:1.2}
.ai-hero p{font-size:1.1rem;opacity:.9;max-width:560px;margin-inline:auto}
.ai-section{padding:64px 24px;max-width:900px;margin-inline:auto}
.ai-section h2{font-size:1.8rem;font-weight:700;text-align:center;margin-bottom:40px;color:#1e3a8a}
.ai-alt{background:#f8faff;padding:64px 24px}
.ai-alt-inner{max-width:900px;margin-inline:auto}
.ai-alt-inner h2{font-size:1.8rem;font-weight:700;text-align:center;margin-bottom:40px;color:#1e3a8a}
.ai-benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px}
.ai-benefit{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}
.ai-benefit h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:#1e3a8a}
.ai-benefit p{font-size:.9rem;color:#64748b}
.ai-summary-list{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.ai-summary-list li{display:flex;align-items:flex-start;gap:10px;font-size:.95rem;color:#334155}
.ai-summary-list li::before{content:"✓";color:#2563eb;font-weight:700;flex-shrink:0;margin-top:2px}
.ai-comparison table{width:100%;border-collapse:collapse;font-size:.9rem}
.ai-comparison th{background:#1e3a8a;color:#fff;padding:12px 16px;text-align:left;font-weight:600}
.ai-comparison td{padding:12px 16px;border-bottom:1px solid #e2e8f0}
.ai-comparison tr:nth-child(even) td{background:#f8faff}
.ai-comparison .us{color:#16a34a;font-weight:600}
.ai-comparison .them{color:#dc2626}
.ai-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.ai-testimonial{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}
.ai-testimonial p{font-size:.9rem;color:#475569;margin-bottom:12px;font-style:italic}
.ai-testimonial strong{font-size:.85rem;color:#1e3a8a}
.ai-pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.ai-plan{border:2px solid #e2e8f0;border-radius:16px;padding:28px;text-align:center}
.ai-plan.highlighted{border-color:#2563eb;background:#eff6ff}
.ai-plan-name{font-size:.9rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
.ai-plan-price{font-size:2rem;font-weight:800;color:#1e3a8a;margin-bottom:16px}
.ai-plan-features{list-style:none;text-align:left;margin-bottom:20px}
.ai-plan-features li{font-size:.875rem;color:#475569;padding:6px 0;border-bottom:1px solid #f1f5f9;display:flex;gap:8px}
.ai-plan-features li::before{content:"✓";color:#2563eb;font-weight:700;flex-shrink:0}
.ai-faq{display:flex;flex-direction:column;gap:12px}
.ai-faq-item{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.ai-faq-q{font-weight:700;font-size:.95rem;color:#1e3a8a;padding:16px 20px;background:#f8faff}
.ai-faq-a{font-size:.9rem;color:#475569;padding:16px 20px;line-height:1.7}
.ai-cta{background:linear-gradient(135deg,#1e3a8a,#3b5bdb);color:#fff;text-align:center;padding:80px 24px}
.ai-cta h2{font-size:2rem;font-weight:800;margin-bottom:16px}
.ai-cta p{opacity:.9;margin-bottom:32px;max-width:480px;margin-inline:auto}
.ai-cta-btn{display:inline-block;background:#f59e0b;color:#000;font-weight:700;font-size:1rem;padding:16px 40px;border-radius:8px;text-decoration:none}
.ai-footer{text-align:center;padding:32px 24px;color:#94a3b8;font-size:.85rem}
`.trim()

  const sectionHtml = (s: AiSection): string => {
    switch (s.type) {
      case 'benefits':
        return `<div class="ai-section">
  <h2>${s.headline ?? ''}</h2>
  <div class="ai-benefits">
    ${(s.items ?? []).map(item => `<div class="ai-benefit"><h3>${item.title ?? ''}</h3><p>${item.description ?? ''}</p></div>`).join('\n    ')}
  </div>
</div>`

      case 'summary':
        return `<div class="ai-alt">
  <div class="ai-alt-inner">
    <h2>${s.headline ?? ''}</h2>
    <ul class="ai-summary-list">
      ${(s.items ?? []).map(item => `<li>${typeof item === 'string' ? item : (item.title ?? item.description ?? '')}</li>`).join('\n      ')}
    </ul>
  </div>
</div>`

      case 'comparison':
        if (!s.rows?.length) return ''
        return `<div class="ai-section ai-comparison">
  <h2>${s.headline ?? ''}</h2>
  <table>
    <thead><tr><th>Recurso</th><th>${'Com ' + data.pageName}</th><th>Sem nós</th></tr></thead>
    <tbody>
      ${s.rows.map(r => `<tr><td>${r.feature}</td><td class="us">${r.us}</td><td class="them">${r.them}</td></tr>`).join('\n      ')}
    </tbody>
  </table>
</div>`

      case 'social_proof':
        return `<div class="ai-alt">
  <div class="ai-alt-inner">
    <h2>${s.headline ?? ''}</h2>
    <div class="ai-testimonials-grid">
      ${(s.items ?? []).map(item => `<div class="ai-testimonial"><p>"${item.text ?? ''}"</p><strong>${item.author ?? ''}${item.role ? ` · ${item.role}` : ''}</strong></div>`).join('\n      ')}
    </div>
  </div>
</div>`

      case 'pricing':
        if (!s.plans?.length) return ''
        return `<div class="ai-section">
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
    <h2>${s.headline ?? 'Perguntas frequentes'}</h2>
    <div class="ai-faq">
      ${(s.items ?? []).map(item => `<div class="ai-faq-item"><div class="ai-faq-q">${item.q ?? ''}</div><div class="ai-faq-a">${item.a ?? ''}</div></div>`).join('\n      ')}
    </div>
  </div>
</div>`

      case 'offer':
        return `<div class="ai-cta">
  <h2>${s.headline ?? ''}</h2>
  <p>${s.description ?? ''}</p>
  <a href="#" class="ai-cta-btn">${s.cta ?? 'Quero começar agora'}</a>
</div>`

      default:
        return ''
    }
  }

  const heroHtml = `<section class="ai-hero">
  <h1>${data.headline}</h1>
  <p>${data.subheadline}</p>
</section>`

  const footerHtml = `<footer class="ai-footer">
  <p>&copy; ${new Date().getFullYear()} ${data.pageName}. Todos os direitos reservados.</p>
</footer>`

  const sectionsHtml = data.sections.map(sectionHtml).filter(Boolean).join('\n')

  return `<style>${css}</style>\n${heroHtml}\n${sectionsHtml}\n${footerHtml}`.trim()
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

    // 5. Buscar contexto do site (com proteção SSRF)
    let websiteContext = ''
    if (input.websiteUrl) {
      try {
        const html = await safeFetch(input.websiteUrl)
        // Extrair apenas texto puro (remover tags) e limitar a 2000 chars
        websiteContext = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2_000)
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
      model: 'claude-3-5-haiku-20241022',
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
      sections: Array<{ type: string; headline?: string; items?: Array<{ title?: string; text?: string; description?: string; author?: string; role?: string }>; description?: string; cta?: string }>
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
    const rawHtml = generateHtml({ ...aiData, pageName: input.businessName })
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
      metadata: { page_id: page.id, model: 'claude-3-5-haiku-20241022' },
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
