/**
 * Agente 9 — Auditor CRO
 *
 * Última camada: revisa hero + seções com foco em CONVERSÃO.
 * Quando encontra problemas claros, aplica fixes pontuais (sem reescrever do zero).
 *
 * Lê: tudo. Escreve: ctx.cro + pode mutar ctx.hero/ctx.sections.
 *
 * Skip-friendly: se Sonnet falhar, registra erro mas não trava pipeline.
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, CroAuditOutput, HeroCopy, SectionCopy } from '../types'

const SYSTEM = `Você é auditor de conversão (CRO) para landing pages PT-BR.

CHECKLIST DE AUDITORIA:
1. Hero responde "o que é + pra quem + benefício" em 3 segundos?
2. Headline tem transformação CONCRETA (não jargão)?
3. CTA é o mesmo verbo/intenção em todas as seções de CTA?
4. Cada objeção da estratégia é tratada em algum benefit, FAQ ou comparison?
5. Há fricção desnecessária (pedir dado que não vai usar, prometer mais do que entrega)?
6. Pricing tem ancoragem clara (plano destacado, sensação de melhor escolha)?
7. FAQ trata DOR real ou é fluff?
8. Offer final tem urgência ou garantia palpável?

Quando identificar um problema corrigível, devolva o FIX EXATO (campo, valor antigo, valor novo).
Não reescreva do zero — só correções cirúrgicas.
Responda APENAS com JSON válido.`

const auditorCro: Agent = {
  key: 'auditor-cro',
  name: 'Auditor CRO',
  icon: '🔍',
  description: 'Audita conversão e aplica fixes pontuais',

  async run(ctx) {
    const { strategy, hero, sections } = ctx
    if (!strategy || !hero || !sections) throw new Error('Auditor CRO exige strategy + hero + sections')

    const { text } = await chat({
      model: MODELS.reasoning,
      ...PROFILES.precise,
      maxTokens: 2500,
      system: SYSTEM,
      prompt: `ESTRATÉGIA:
- Promessa: ${strategy.promise}
- Persona: ${strategy.persona}
- Objeções: ${strategy.objections.join(' | ')}

HERO ATUAL:
${JSON.stringify(hero, null, 2)}

SEÇÕES:
${JSON.stringify(sections, null, 2)}

Audite e responda JSON:
{
  "verdict": "aprovado | revisar",
  "issues": [
    { "section": "hero | benefits | faq | ...", "problem": "qual é o defeito", "suggestion": "como corrigir" }
  ],
  "fixes": [
    { "target": "hero.headline | hero.subheadline | hero.cta | section[INDEX].data.FIELD", "new_value": "valor corrigido" }
  ]
}

Aplique fixes APENAS quando a correção é objetiva (ex.: CTA inconsistente, jargão evidente, FAQ vazia).
Não corrija questões de estilo subjetivo.`,
    })

    const data = parseJSON<{
      verdict?: 'aprovado' | 'revisar'
      issues?: Array<{ section: string; problem: string; suggestion: string }>
      fixes?: Array<{ target: string; new_value: string }>
    }>(text)

    if (!data) {
      // Falha silenciosa — não trava pipeline
      const result: CroAuditOutput = { verdict: 'aprovado', issues: [], applied_fixes: ['JSON do auditor inválido — ignorado'] }
      ctx.cro = result
      return { summary: 'auditor falhou (ignorado)', data: result }
    }

    const applied_fixes: string[] = []
    for (const fix of data.fixes ?? []) {
      if (applyFix(ctx.hero!, ctx.sections!, fix)) {
        applied_fixes.push(`${fix.target} → "${fix.new_value.slice(0, 60)}"`)
      }
    }

    const result: CroAuditOutput = {
      verdict: data.verdict ?? 'aprovado',
      issues: data.issues ?? [],
      applied_fixes,
    }
    ctx.cro = result

    return {
      summary: `${result.verdict} · ${result.issues.length} issues · ${applied_fixes.length} fixes`,
      data: result,
    }
  },
}

/** Aplica um fix no hero ou em uma seção. Retorna true se aplicou. */
function applyFix(
  hero: HeroCopy,
  sections: SectionCopy[],
  fix: { target: string; new_value: string },
): boolean {
  const { target, new_value } = fix
  if (!target || typeof new_value !== 'string') return false

  if (target.startsWith('hero.')) {
    const field = target.slice('hero.'.length) as keyof HeroCopy
    if (field === 'headline' || field === 'subheadline' || field === 'cta') {
      hero[field] = new_value
      return true
    }
    return false
  }

  const sectionMatch = target.match(/^section\[(\d+)\]\.data\.(.+)$/)
  if (sectionMatch) {
    const idx = Number(sectionMatch[1])
    const field = sectionMatch[2]
    const section = sections[idx]
    if (section?.data) {
      (section.data as Record<string, unknown>)[field] = new_value
      return true
    }
  }
  return false
}

export default auditorCro
