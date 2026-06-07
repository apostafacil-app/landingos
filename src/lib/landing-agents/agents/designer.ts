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

    const { text } = await chat({
      model: MODELS.structured,
      ...PROFILES.precise,
      maxTokens: 800,
      system: SYSTEM,
      prompt: `Briefing:
- Segmento: ${input.segment}
- Promessa: ${strategy.promise}
- Tom: ${strategy.tone}
- Persona: ${strategy.persona}

PALETAS DISPONÍVEIS:
${palettesList}

${userPalette ? `O usuário JÁ escolheu a paleta "${userPalette.id}" — use essa.` : 'Escolha a paleta que melhor casa com o segmento e a promessa.'}
${input.colorMode === 'dark' ? 'Usuário pediu modo ESCURO — respeite.' : input.colorMode === 'light' ? 'Usuário pediu modo CLARO — respeite.' : 'Escolha modo claro ou escuro baseado no segmento.'}

REGRAS DE TIPOGRAFIA (importante):
- "display" (Syne + DM Sans) é o DEFAULT pra qualquer SaaS, tech, fintech, infoproduto, dev tool, marketing — dá identidade visual moderna.
- "serif-premium" só pra luxo, alta consultoria, editorial, advocacia.
- "monoespacada" só pra dev tools, code, API.
- "system" é último recurso quando nada combina (raríssimo).

LAYOUT VARIANTS (biblioteca de templates):
- hero "split" (default): copy esquerda + visual direita. Bom pra SaaS com produto visual (dashboard, app).
- hero "centered": copy 100% centralizada, sem coluna visual. Bom pra mood elegante/minimalista/premium.
- benefits "cards" (default): grid 3 colunas de cards. Bom pra 6+ benefícios curtos.
- benefits "zigzag": cada benefício linha inteira alternada esquerda/direita, com número decorativo 01/02/03. Bom pra 3-5 benefícios narrativos (storytelling).
- social_proof "cards" (default): grid uniforme de cards. Bom pra muitos depoimentos.
- social_proof "wall": 1 depoimento DESTACADO grande à esquerda + 2-4 menores à direita. Bom pra dar voz forte a 1 cliente icônico.

REGRAS DE ESCOLHA:
- mood "elegante" ou "minimalista" → hero centered, benefits zigzag, social_proof wall
- mood "bold" ou "energetico" → hero split, benefits cards, social_proof cards
- mood "clean" → hero split, benefits cards (mais previsível)
- Se segmento é editorial/storytelling (consultoria, educação, infoproduto) → benefits zigzag

JSON:
{
  "palette_id": "${userPalette ? userPalette.id : 'um dos IDs acima'}",
  "mode": "light | dark",
  "typography": "system | serif-premium | display | monoespacada",
  "mood": "clean | bold | elegante | energetico | minimalista",
  "layout_variants": {
    "hero": "split | centered",
    "benefits": "cards | zigzag",
    "social_proof": "cards | wall"
  },
  "rationale": "1 frase justificando as escolhas (paleta, typography, mood, variants)"
}`,
    })

    const choice = parseJSON<Pick<DesignSystem, 'palette_id' | 'mode' | 'typography' | 'mood' | 'rationale' | 'layout_variants'>>(text)
    const paletteId = choice?.palette_id ?? userPalette?.id ?? PALETTES[0].id
    const palette = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]

    const design: DesignSystem = {
      palette_id: palette.id,
      primary: palette.primary,
      gradient_end: palette.grad,
      accent: palette.accent,
      background: palette.bg,
      mode: choice?.mode ?? 'light',
      typography: choice?.typography ?? 'system',
      mood: choice?.mood ?? 'clean',
      rationale: choice?.rationale ?? '',
      layout_variants: choice?.layout_variants ?? { hero: 'split', benefits: 'cards', social_proof: 'cards' },
    }
    ctx.design = design

    const lv = design.layout_variants
    return {
      summary: `${design.palette_id} · ${design.mode} · ${design.mood} · ${lv?.hero}/${lv?.benefits}/${lv?.social_proof}`,
      data: design,
    }
  },
}

export { PALETTES }
export default designer
