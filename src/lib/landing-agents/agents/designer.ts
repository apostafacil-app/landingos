/**
 * Agente 4 — Designer de Sistema
 *
 * Escolhe o sistema visual (paleta, tipografia, mood, modo claro/escuro)
 * com base no segmento e na promessa. Justifica a escolha.
 *
 * Lê: ctx.strategy, input.colorPalette/colorMode (preferências do usuário)
 * Escreve: ctx.design
 */

import { chat, parseJSON } from '../openrouter'
import { MODELS, PROFILES } from '../models'
import type { Agent, DesignSystem } from '../types'
import { THEMES, getThemeById } from '../themes'

/** Paletas de cor disponíveis. */
const PALETTES = [
  { id: 'azul-profissional', primary: '#1e3a8a', grad: '#3b5bdb', accent: '#f59e0b', bg: '#f0f4ff', fits: 'consultoria, fintech, jurídico, B2B' },
  { id: 'roxo-tech',         primary: '#4c1d95', grad: '#7c3aed', accent: '#06b6d4', bg: '#faf5ff', fits: 'SaaS, tecnologia, IA, dev tools' },
  { id: 'verde-natural',     primary: '#14532d', grad: '#16a34a', accent: '#f59e0b', bg: '#f0fdf4', fits: 'sustentabilidade, agro, alimentação, eco' },
  { id: 'laranja-energia',   primary: '#92400e', grad: '#d97706', accent: '#ef4444', bg: '#fffbeb', fits: 'fitness, esporte, infoproduto urgente, vendas' },
  { id: 'preto-elegante',    primary: '#0f172a', grad: '#334155', accent: '#f59e0b', bg: '#f8fafc', fits: 'luxo, premium, alta consultoria, B2B enterprise' },
  { id: 'ciano-saude',       primary: '#164e63', grad: '#0891b2', accent: '#10b981', bg: '#ecfeff', fits: 'saúde, bem-estar, clínica, terapia' },
  { id: 'rosa-criativo',     primary: '#831843', grad: '#db2777', accent: '#f97316', bg: '#fdf2f8', fits: 'criativo, design, beleza, infantil, feminino' },
  { id: 'azul-confianca',    primary: '#1e40af', grad: '#2563eb', accent: '#10b981', bg: '#eff6ff', fits: 'educação, finanças pessoais, serviços, healthtech' },
] as const

const SYSTEM = `Você é diretor de arte para landing pages PT-BR.
Escolha o sistema visual mais adequado ao segmento e à promessa do produto.
Responda APENAS com JSON válido.`

const designer: Agent = {
  key: 'designer',
  name: 'Designer',
  icon: '🎨',
  description: 'Define paleta, tipografia e mood',

  async run(ctx) {
    const { input, strategy } = ctx
    if (!strategy) throw new Error('Designer exige ctx.strategy')

    // Se o usuário forçou uma paleta no form, respeitar — só pedir mood/typography.
    const userPalette = input.colorPalette && input.colorPalette !== ''
      ? PALETTES.find(p => p.id === input.colorPalette)
      : null

    const palettesList = PALETTES.map(p => `- ${p.id}: ${p.fits}`).join('\n')
    const themesList = THEMES.map(t => `- ${t.id}: ${t.description} | moods: ${t.moods.join(',')}`).join('\n')

    // Seed temporal pra induzir variação real entre execuções. Sem isso,
    // Sonnet com temperature 0.1 sempre escolhe o mesmo theme pro mesmo
    // briefing (zero variação real entre páginas geradas seguidas).
    const seed = (Date.now() % 1000)
    const themeHint = THEMES[seed % THEMES.length].id

    const { text } = await chat({
      model: MODELS.structured,
      temperature: 0.5,  // de 0.1 (precise) pra 0.5 — variar mais entre execuções
      maxTokens: 800,
      system: SYSTEM,
      prompt: `Briefing:
- Segmento: ${input.segment}
- Promessa: ${strategy.promise}
- Tom: ${strategy.tone}
- Persona: ${strategy.persona}

PALETAS DISPONÍVEIS:
${palettesList}

DESIGN THEMES DISPONÍVEIS (cada theme é um conjunto coordenado de tipografia + variants de layout):
${themesList}

${userPalette ? `O usuário JÁ escolheu a paleta "${userPalette.id}" — use essa.` : 'Escolha a paleta que melhor casa com o segmento e a promessa.'}
${input.colorMode === 'dark' ? 'Usuário pediu modo ESCURO — respeite.' : input.colorMode === 'light' ? 'Usuário pediu modo CLARO — respeite.' : 'Escolha modo claro ou escuro baseado no segmento.'}

REGRAS DE ESCOLHA DO THEME (muito importante — varia o resultado visual):

VARIAÇÃO É CRÍTICA. Não escolha sempre "default". Cada theme tem identidade:
- "default": só pra B2B safest (vendas tradicionais, segmento muito conservador)
- "stripe": SaaS B2B premium, fintech (mood clean/bold)
- "linear": tech/dev tools premium minimalista (mood minimalista/elegante)
- "notion": editorial moderno friendly (consultoria, educação, infoproduto)
- "vercel": tech ousado direto, image-heavy (mood bold/energetico)
- "apple": premium luxo imagens dominam (mood elegante/minimalista)
- "webflow": criativo playful (agência criativa, marketing, design)

Pra eRevendedor (gráficas, B2B prático): escolher entre "stripe" ou "notion" — não default.
Pra fintech moderno: "linear" ou "vercel".
Pra cursos/infoproduto: "notion" ou "webflow".
Pra ecommerce premium: "apple".
Pra dev tool / API: "linear".

DICA DE VARIAÇÃO (use só como inspiração — você pode discordar):
Se você ficou em dúvida entre 2-3 themes que cabem pro segmento, prefira "${themeHint}".
Isso ajuda a NÃO produzir páginas iguais quando o briefing é parecido.
Se o "${themeHint}" NÃO cabe pro segmento (ex.: "apple" pra ERP burocrático),
ignore a dica e escolha o que faz mais sentido.

JSON:
{
  "palette_id": "${userPalette ? userPalette.id : 'um dos IDs acima'}",
  "mode": "light | dark",
  "mood": "clean | bold | elegante | energetico | minimalista",
  "theme_id": "stripe | linear | notion | vercel | apple | webflow | default",
  "rationale": "1 frase justificando ESPECIFICAMENTE por que esse theme casa com o segmento"
}`,
    })

    const choice = parseJSON<{
      palette_id?: string
      mode?: 'light' | 'dark'
      mood?: DesignSystem['mood']
      theme_id?: string
      rationale?: string
    }>(text)
    const paletteId = choice?.palette_id ?? userPalette?.id ?? PALETTES[0].id
    const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]

    // Theme escolhido pelo Designer determina typography + variants coordenados
    const theme = getThemeById(choice?.theme_id)

    const design: DesignSystem = {
      palette_id: palette.id,
      primary: palette.primary,
      gradient_end: palette.grad,
      accent: palette.accent,
      background: palette.bg,
      mode: choice?.mode ?? 'light',
      typography: theme.typography,
      mood: choice?.mood ?? 'clean',
      rationale: `[${theme.name}] ${choice?.rationale ?? ''}`,
      layout_variants: theme.variants,
    }
    ctx.design = design

    const lv = design.layout_variants
    return {
      summary: `${theme.id} · ${design.palette_id} · ${design.mode} · ${lv?.hero}/${lv?.benefits}/${lv?.pricing}`,
      data: design,
    }
  },
}

export { PALETTES }
export default designer
