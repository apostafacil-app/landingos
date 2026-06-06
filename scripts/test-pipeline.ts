/**
 * Smoke test offline da pipeline multi-agente.
 *
 * Roda os 9 agentes localmente com input mockado, SEM persistir no banco.
 * Valida que o HTML produzido pelo render-v3 contém os markers V3 que o
 * editor parseia (data-lp-model, .lp-block, .lp-el).
 *
 * Como rodar:
 *   cd landingos
 *   npx tsx scripts/test-pipeline.ts
 *
 * Requer OPENROUTER_API_KEY no .env.local (já configurado).
 *
 * Custo: ~$0.15–0.25 em chamadas OpenRouter por execução.
 */

import { config } from 'dotenv'
import { runPipeline } from '../src/lib/landing-agents/pipeline'
import { renderHtmlV3 } from '../src/lib/landing-agents/render-v3'
import type { GeneratePageInput } from '../src/lib/validations/page'

// Carrega .env.local
config({ path: '.env.local' })

const input: GeneratePageInput = {
  pageName:       'Emita nota Fiscal com o eRevendedor',
  businessName:   'eRevendedor',
  segment:        'Pequenas gráficas e revendedores gráficos',
  targetAudience: 'Pequenos revendedores gráficos, gráficas de pequeno porte, empresa de comunicação visual e brindes',
  painPoint:      'Demora e gasto de tempo para emitir NFe',
  desire:         'Emita NF automaticamente a partir de um pedido',
  offer:          'Tenha um ERP exclusivo para revenda gráfica e emita NFs a partir do pedido',
  websiteUrl:     'https://erevendedor.com.br',
  colorPalette:   'roxo-tech',
  colorMode:      'light',
  objections:     'Deve ser complexo de mexer. o eRevendedor é muito intuitivo e simples de mexer, foi feito exclusivamente para área gráfica.',
  guarantee:      'Experimente por 7 dias grátis',
  competitors:    'Enquanto outros ERPs são feitos para outros setores e você revendedor gráfico tem que se adaptar, o eRevendedor foi feito exclusivamente para sua área',
  price:          'Planos a partir de R$ 50,00',
}

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY ausente no .env.local')
    process.exit(1)
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  SMOKE TEST — pipeline multi-agente offline')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Briefing: ${input.businessName} — ${input.segment}`)
  console.log()

  const t0 = Date.now()
  try {
    const { ctx, steps } = await runPipeline({
      input,
      user_id: 'offline-test',
      workspace_id: 'offline-test',
      options: {
        cro_audit: true,
        generate_images: false,    // testar APENAS o upgrade visual (sem imagem AI)
        premium_images: false,
      },
    }, (event) => {
      if (event.type === 'agent:start') {
        process.stdout.write(`  ${event.icon}  ${event.name.padEnd(20)} `)
      } else if (event.type === 'agent:done') {
        const status = event.result.status === 'ok' ? '✓' : '✗'
        console.log(`${status} ${event.result.summary} (${(event.result.ms / 1000).toFixed(1)}s)`)
      }
    })

    const totalMs = Date.now() - t0
    console.log()
    console.log(`Pipeline OK em ${(totalMs / 1000).toFixed(1)}s`)
    console.log()

    // Validações do contexto
    console.log('━━━ RESULTADOS DOS AGENTES ━━━')
    console.log(`Promessa: ${ctx.strategy?.promise}`)
    console.log(`Headline: ${ctx.hero?.headline}`)
    console.log(`Subhead:  ${ctx.hero?.subheadline}`)
    console.log(`CTA:      ${ctx.hero?.cta}`)
    console.log(`Trust:    ${ctx.hero?.trust_stats?.join(' | ')}`)
    console.log(`Design:   ${ctx.design?.palette_id} · ${ctx.design?.mode} · ${ctx.design?.mood}`)
    console.log(`Seções:   ${ctx.architecture?.sections.map(s => s.type).join(' → ')}`)
    console.log(`SEO slug: ${ctx.seo?.slug}`)
    console.log(`Meta tit: ${ctx.seo?.meta_title}`)
    console.log(`CRO:      ${ctx.cro?.verdict} (${ctx.cro?.issues.length} issues, ${ctx.cro?.applied_fixes.length} fixes aplicados)`)
    console.log()

    // Render V3
    console.log('━━━ RENDER V3 ━━━')
    const html = renderHtmlV3(ctx, input.businessName)
    const hasV3Marker = html.includes('data-lp-model="v3"')
    const blockCount = (html.match(/class="lp-block/g) || []).length
    const elementCount = (html.match(/class="lp-el/g) || []).length
    const htmlSize = (html.length / 1024).toFixed(1)
    console.log(`HTML size:     ${htmlSize} KB`)
    console.log(`data-lp-model: ${hasV3Marker ? '✓ presente' : '✗ AUSENTE'}`)
    console.log(`Blocos:        ${blockCount}`)
    console.log(`Elementos:     ${elementCount}`)

    if (!hasV3Marker || blockCount === 0) {
      console.error('\n✗ FALHA: HTML não tem marcação V3 — editor abrirá vazio')
      process.exit(1)
    }

    // Salva HTML pra inspeção visual
    const fs = await import('fs/promises')
    await fs.writeFile('scripts/test-output.html', html, 'utf-8')
    console.log(`\nHTML salvo em scripts/test-output.html — abra no browser pra preview`)

    // Salva o contexto pra debug
    await fs.writeFile('scripts/test-output.json', JSON.stringify({
      strategy: ctx.strategy,
      research: { logo_url: ctx.research?.logo_url, citations: ctx.research?.citations },
      architecture: ctx.architecture,
      design: ctx.design,
      hero: ctx.hero,
      sections: ctx.sections,
      seo: ctx.seo,
      cro: ctx.cro,
      steps,
    }, null, 2), 'utf-8')
    console.log(`Contexto salvo em scripts/test-output.json`)

    console.log('\n✓ SMOKE TEST PASSOU — seguro testar em produção')
  } catch (e) {
    console.error('\n✗ FALHA:', e instanceof Error ? e.message : e)
    if (e instanceof Error && e.stack) console.error(e.stack)
    process.exit(1)
  }
}

main()
