import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generatePageSchema } from '@/lib/validations/page'
import { sanitizeHtml } from '@/lib/sanitize'
import { safeFetch, SsrfError } from '@/lib/ssrf'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um especialista em copywriting e criação de landing pages de alta conversão.
Gere o conteúdo completo de uma landing page com base nos dados do negócio fornecidos.

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
        { "title": "Benefício 1", "description": "Descrição curta e direta" },
        { "title": "Benefício 2", "description": "..." },
        { "title": "Benefício 3", "description": "..." }
      ]
    },
    {
      "type": "social_proof",
      "headline": "O que dizem nossos clientes",
      "items": [
        { "text": "Depoimento aqui [PLACEHOLDER]", "author": "Nome Sobrenome", "role": "Cargo/Empresa" }
      ]
    },
    {
      "type": "offer",
      "headline": "Comece agora",
      "description": "Descrição da oferta",
      "cta": "Texto do botão de ação"
    }
  ]
}

Regras:
- Português brasileiro, tom persuasivo mas honesto
- Foque na transformação do cliente, não no produto
- Depoimentos: marcar como [PLACEHOLDER] — nunca inventar dados reais
- Slug: apenas letras minúsculas, números e hífens`

/**
 * Gera HTML no formato que o GrapesJS espera:
 *   <style>...</style>\n<section>...</section><div>...</div>...
 *
 * NÃO gera <!DOCTYPE html> / <html> / <head> / <body>.
 * Dessa forma o editor consegue parsear cada bloco como componente
 * independente — clicável, arrastável e editável — e o usuário pode
 * adicionar mais blocos pelo painel lateral.
 */
function generateHtml(data: {
  headline: string
  subheadline: string
  sections: Array<{ type: string; headline?: string; items?: Array<{ title?: string; text?: string; description?: string; author?: string; role?: string }>; description?: string; cta?: string }>
  pageName: string
  meta_title: string
}): string {
  const benefitsSection = data.sections.find(s => s.type === 'benefits')
  const socialSection   = data.sections.find(s => s.type === 'social_proof')
  const offerSection    = data.sections.find(s => s.type === 'offer')

  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;color:#1e293b;line-height:1.6}
.ai-hero{background:linear-gradient(135deg,#1e3a8a,#3b5bdb);color:#fff;text-align:center;padding:80px 24px}
.ai-hero h1{font-size:clamp(1.8rem,4vw,3rem);font-weight:800;margin-bottom:16px;max-width:700px;margin-inline:auto}
.ai-hero p{font-size:1.1rem;opacity:.9;max-width:560px;margin-inline:auto}
.ai-section{padding:64px 24px;max-width:900px;margin-inline:auto}
.ai-section h2{font-size:1.8rem;font-weight:700;text-align:center;margin-bottom:40px;color:#1e3a8a}
.ai-benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px}
.ai-benefit{background:#f8faff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}
.ai-benefit h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:#1e3a8a}
.ai-benefit p{font-size:.9rem;color:#64748b}
.ai-testimonials{background:#f8faff;padding:64px 24px}
.ai-testimonials-inner{max-width:900px;margin-inline:auto}
.ai-testimonials h2{font-size:1.8rem;font-weight:700;text-align:center;margin-bottom:40px;color:#1e3a8a}
.ai-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.ai-testimonial{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px}
.ai-testimonial p{font-size:.9rem;color:#475569;margin-bottom:12px;font-style:italic}
.ai-testimonial strong{font-size:.85rem;color:#1e3a8a}
.ai-cta{background:linear-gradient(135deg,#1e3a8a,#3b5bdb);color:#fff;text-align:center;padding:80px 24px}
.ai-cta h2{font-size:2rem;font-weight:800;margin-bottom:16px}
.ai-cta p{opacity:.9;margin-bottom:32px;max-width:480px;margin-inline:auto}
.ai-cta-btn{display:inline-block;background:#f59e0b;color:#fff;font-weight:700;font-size:1rem;padding:16px 40px;border-radius:8px;text-decoration:none;transition:opacity .2s}
.ai-cta-btn:hover{opacity:.9}
.ai-footer{text-align:center;padding:32px 24px;color:#94a3b8;font-size:.85rem}
`.trim()

  const heroHtml = `
<section class="ai-hero">
  <h1>${data.headline}</h1>
  <p>${data.subheadline}</p>
</section>`.trim()

  const benefitsHtml = benefitsSection ? `
<div class="ai-section">
  <h2>${benefitsSection.headline ?? ''}</h2>
  <div class="ai-benefits">
    ${(benefitsSection.items ?? []).map(item => `
    <div class="ai-benefit">
      <h3>${item.title ?? ''}</h3>
      <p>${item.description ?? ''}</p>
    </div>`).join('')}
  </div>
</div>`.trim() : ''

  const socialHtml = socialSection ? `
<div class="ai-testimonials">
  <div class="ai-testimonials-inner">
    <h2>${socialSection.headline ?? ''}</h2>
    <div class="ai-testimonials-grid">
      ${(socialSection.items ?? []).map(item => `
      <div class="ai-testimonial">
        <p>"${item.text ?? ''}"</p>
        <strong>${item.author ?? ''} ${item.role ? `· ${item.role}` : ''}</strong>
      </div>`).join('')}
    </div>
  </div>
</div>`.trim() : ''

  const ctaHtml = offerSection ? `
<div class="ai-cta">
  <h2>${offerSection.headline ?? ''}</h2>
  <p>${offerSection.description ?? ''}</p>
  <a href="#" class="ai-cta-btn">${offerSection.cta ?? 'Quero começar agora'}</a>
</div>`.trim() : ''

  const footerHtml = `
<footer class="ai-footer">
  <p>&copy; ${new Date().getFullYear()} ${data.pageName}. Todos os direitos reservados.</p>
</footer>`.trim()

  // Formato GrapesJS: <style> separado, depois os blocos do body
  return `<style>${css}</style>\n${[heroHtml, benefitsHtml, socialHtml, ctaHtml, footerHtml].filter(Boolean).join('\n')}`.trim()
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
