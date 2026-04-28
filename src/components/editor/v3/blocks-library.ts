/**
 * Biblioteca de blocos V3 — templates prontos no formato JSON do V3.
 *
 * Inspirado nas categorias do GreatPages (Headers, Benefícios, Depoimentos,
 * Formulários, CTA, FAQ, Vídeo, Garantia, Planos, Sobre, Estatísticas, Rodapé).
 *
 * Cada template é um Block COMPLETO — altura, fundo, elementos posicionados.
 * Coords baseadas em canvas 1200px de largura.
 */

import type { Block, Element as Elem } from './types'

/**
 * Distribui Omit sobre a união discriminada de Element.
 * Sem isso, TS exige `id` obrigatoriamente (não consegue narrowing).
 */
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never
export type ElemInput = DistributiveOmit<Elem, 'id'>

export interface BlockTemplate {
  /** ID estável do template (não confundir com block.id que é gerado ao inserir) */
  id: string
  label: string
  category: string
  /** Chave do SVG no BlocksModal (BLOCK_ICONS) */
  thumbnailKey?: string
  /** Bloco completo. Os elementos ainda não têm IDs (gerados na inserção) */
  block: Omit<Block, 'id' | 'elements'> & { elements: ElemInput[] }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de construção
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_W = 1200

const C = (x: number, w: number) => Math.round((PAGE_W - w) / 2 + x)  // centraliza horizontal com offset

/** Atalho pra criar tupla de border-radius com 4 cantos iguais.
 *  Inferência de TS perde o tipo tupla em flatMap; r4(N) garante. */
const r4 = (n: number) => [n, n, n, n] as [number, number, number, number]

// ─────────────────────────────────────────────────────────────────────────────
// HERO / HEADERS
// ─────────────────────────────────────────────────────────────────────────────

const heroGradiente: BlockTemplate = {
  id: 'hero-gradiente',
  label: 'Hero Gradiente',
  category: 'Hero',
  thumbnailKey: 'hero-simples',
  block: {
    height: 720,
    // Gradient mesh diagonal — azul profundo → roxo (premium SaaS)
    bgGradient: {
      type: 'linear', angle: 135,
      stops: [
        { color: '#0f172a', pos: 0 },
        { color: '#3b0764', pos: 50 },
        { color: '#1e3a8a', pos: 100 },
      ],
    },
    elements: [
      // ── DECORATIVO: 2 blobs gradient atrás, dão profundidade ──
      {
        type: 'circulo', x: -180, y: -120, w: 480, h: 480,
        bgColor: 'rgba(124,58,237,0.18)',
      },
      {
        type: 'circulo', x: 900, y: 380, w: 460, h: 460,
        bgColor: 'rgba(251,191,36,0.10)',
      },

      // ── Pill eyebrow com SVG sparkles ──
      // Pill 280px centralizado em 1200 → x=460, spans 460-740.
      // Conteudo interno: icon(18) + gap(8) + text(220) = 246. Padding lat 17.
      {
        type: 'caixa', x: 460, y: 100, w: 280, h: 40,
        bgColor: 'rgba(255,255,255,0.08)',
        borders: { radius: r4(999), equalCorners: true,
          color: 'rgba(255,255,255,0.16)', width: 1 },
      },
      {
        type: 'icone', iconId: 'sparkles',
        x: 477, y: 111, w: 18, h: 18, color: '#fbbf24',
      },
      {
        type: 'texto', x: 503, y: 113, w: 220, h: 20,
        html: 'NOVIDADE · VERSÃO 2026',
        fontSize: 11, color: '#e0e7ff', fontWeight: 700, letterSpacing: 2,
      },

      // ── Headline com gradient text amber→orange ──
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 1000), y: 170, w: 1000, h: 150,
        html: 'A plataforma que <span style="background:linear-gradient(135deg,#fbbf24 0%,#f97316 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">multiplica</span> seus resultados',
        fontSize: 64, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', lineHeight: 1.05,
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },

      // ── Subheadline ──
      {
        type: 'texto',
        x: C(0, 720), y: 340, w: 720, h: 60,
        html: 'Tudo que você precisa pra escalar sem complicação. Setup em 5 minutos. Suporte humano 24/7.',
        fontSize: 19, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6,
      },

      // ── 2 CTAs ──
      {
        type: 'botao',
        x: C(-150, 280), y: 440, w: 280, h: 60,
        text: 'Começar grátis →',
        bgColor: '#fbbf24', color: '#0f172a',
        fontSize: 17, fontWeight: 700, borderRadius: 12,
        shadow: 'hard',
      },
      {
        type: 'botao',
        x: C(150, 220), y: 440, w: 220, h: 60,
        text: '▶  Ver demo',
        bgColor: 'rgba(255,255,255,0.06)', color: '#ffffff',
        fontSize: 15, fontWeight: 600, borderRadius: 12,
        borders: { width: 1, color: 'rgba(255,255,255,0.2)',
          radius: r4(12), equalCorners: true },
      },

      // ── Social proof bar: avatares + estrelas + contagem ──
      // Layout horizontal centralizado:
      //   [avatars 124w] gap30 [stars 106w] gap20 [text 240w]
      //   total = 520, start x = (1200-520)/2 = 340
      //   avatars: 340-464, stars: 494-600, text: 620-860
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 340 + i * 22, y: 558, w: 36, h: 36,
        bgImage: `https://i.pravatar.cc/72?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#1e3a8a', width: 2,
          radius: r4(18), equalCorners: true },
      })),
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 494 + i * 22, y: 567, w: 18, h: 18, color: '#fbbf24',
      })),
      {
        type: 'texto',
        x: 620, y: 568, w: 240, h: 20,
        html: '<strong style="color:white">4.9/5</strong> — +5.000 empresas',
        fontSize: 14, color: '#cbd5e1',
      },

      // ── Trust signals row inferior ──
      // Layout horizontal: 3 items com icon + texto, centralizados.
      //   Item 1 (Cancele quando quiser): icon w16 + gap8 + text w170 = 194
      //   Item 2 (Sem cartão):              icon w16 + gap8 + text w95  = 119
      //   Item 3 (Setup em 5 minutos):      icon w16 + gap8 + text w150 = 174
      //   Total: 194+30+119+30+174 = 547. Start x = (1200-547)/2 = 327.
      {
        type: 'icone', iconId: 'check-circle',
        x: 327, y: 626, w: 16, h: 16, color: '#86efac',
      },
      {
        type: 'texto', x: 351, y: 624, w: 170, h: 20,
        html: 'Cancele quando quiser', fontSize: 13, color: '#94a3b8',
      },
      {
        type: 'icone', iconId: 'check-circle',
        x: 551, y: 626, w: 16, h: 16, color: '#86efac',
      },
      {
        type: 'texto', x: 575, y: 624, w: 95, h: 20,
        html: 'Sem cartão', fontSize: 13, color: '#94a3b8',
      },
      {
        type: 'icone', iconId: 'check-circle',
        x: 700, y: 626, w: 16, h: 16, color: '#86efac',
      },
      {
        type: 'texto', x: 724, y: 624, w: 150, h: 20,
        html: 'Setup em 5 minutos', fontSize: 13, color: '#94a3b8',
      },
    ],
  },
}

const heroDoisCol: BlockTemplate = {
  id: 'hero-dois-col',
  label: 'Hero com Imagem',
  category: 'Hero',
  thumbnailKey: 'hero-dois-col',
  block: {
    height: 720,
    // Gradient mesh — 3 stops com angulo diagonal pra dar profundidade
    bgGradient: { type: 'linear', angle: 135,
      stops: [
        { color: '#0f172a', pos: 0 },
        { color: '#1e1b4b', pos: 50 },
        { color: '#312e81', pos: 100 },
      ] },
    elements: [
      // ── DECORATIVO: Blob de luz sutil atrás do conteúdo direito ──
      {
        type: 'circulo',
        x: 880, y: 60, w: 360, h: 360,
        bgColor: 'rgba(99,102,241,0.15)',
      },
      {
        type: 'circulo',
        x: 700, y: 460, w: 220, h: 220,
        bgColor: 'rgba(251,191,36,0.08)',
      },

      // ── COLUNA ESQUERDA: Conteúdo ──
      // Pill eyebrow com SVG sparkle inline (largura aumentada pra texto não quebrar)
      {
        type: 'caixa',
        x: 100, y: 120, w: 290, h: 36,
        bgColor: 'rgba(255,255,255,0.06)',
        borders: { radius: [999, 999, 999, 999], equalCorners: true,
          color: 'rgba(255,255,255,0.12)', width: 1 },
      },
      {
        type: 'icone', iconId: 'sparkles',
        x: 116, y: 128, w: 18, h: 18, color: '#fbbf24',
      },
      {
        type: 'texto',
        x: 138, y: 130, w: 250, h: 20,
        html: 'NOVIDADE • VERSÃO 2026',
        fontSize: 11, color: '#e0e7ff', fontWeight: 700, letterSpacing: 2,
      },

      // Headline com gradient text na palavra-chave (Plus Jakarta Sans)
      {
        type: 'titulo', headingLevel: 1,
        x: 100, y: 180, w: 560, h: 200,
        html: 'O resultado que você sempre quis está <span style="background:linear-gradient(135deg,#fbbf24 0%,#f97316 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">aqui</span>.',
        fontSize: 56, fontWeight: 800, color: '#ffffff',
        lineHeight: 1.05, fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },

      // Subheadline
      {
        type: 'texto',
        x: 100, y: 392, w: 540, h: 60,
        html: 'Sistema completo para quem quer escalar sem complicação. Resultado garantido em 30 dias ou seu dinheiro de volta.',
        fontSize: 18, color: '#cbd5e1', lineHeight: 1.6,
      },

      // ── CTAs duplos ──
      {
        type: 'botao',
        x: 100, y: 484, w: 240, h: 60,
        text: 'Garantir minha vaga →',
        bgColor: '#fbbf24', color: '#1a1a1a',
        fontSize: 16, fontWeight: 700, borderRadius: 12,
        shadow: 'hard',
      },
      {
        type: 'botao',
        x: 356, y: 484, w: 200, h: 60,
        text: '▶  Ver demo',
        bgColor: 'rgba(255,255,255,0.05)', color: '#ffffff',
        fontSize: 15, fontWeight: 600, borderRadius: 12,
        borders: { width: 1, color: 'rgba(255,255,255,0.2)',
          radius: r4(12), equalCorners: true },
      },

      // ── Trust row: avatares empilhados + estrelas + texto ──
      // 5 mini-avatares
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 100 + i * 22, y: 580, w: 36, h: 36,
        bgImage: `https://i.pravatar.cc/72?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#1e1b4b', width: 2,
          radius: r4(18), equalCorners: true },
      })),
      // 5 estrelas PREENCHIDAS dourado (star-filled)
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 220 + i * 18, y: 588, w: 16, h: 16, color: '#fbbf24',
      })),
      {
        type: 'texto',
        x: 100, y: 626, w: 540, h: 22,
        html: '<strong style="color:white">+5.000 pessoas</strong> já transformaram seus resultados',
        fontSize: 14, color: '#94a3b8',
      },

      // ── COLUNA DIREITA: Imagem com decoração ──
      // Card de fundo (sombra grande, deslocado)
      {
        type: 'caixa',
        x: 720, y: 130, w: 380, h: 460,
        bgColor: 'rgba(251,191,36,0.15)',
        borders: { radius: r4(24), equalCorners: true },
      },
      // Imagem principal (sobrepondo o card de fundo, deslocada)
      {
        type: 'imagem',
        x: 700, y: 110, w: 380, h: 460,
        src: 'https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=760&q=80',
        objectFit: 'cover',
        borders: { radius: r4(24), equalCorners: true },
        shadow: 'hard',
      },

      // ── Card flutuante de stat sobre a imagem (overlay) ──
      {
        type: 'caixa',
        x: 640, y: 480, w: 220, h: 90,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'circulo',
        x: 660, y: 500, w: 50, h: 50,
        bgColor: '#dcfce7',
      },
      {
        type: 'icone', iconId: 'trending-up',
        x: 672, y: 512, w: 26, h: 26, color: '#16a34a',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 724, y: 498, w: 130, h: 28,
        html: '+312%', fontSize: 22, fontWeight: 900,
        color: '#0f172a', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 724, y: 528, w: 130, h: 36,
        html: 'em vendas no<br>primeiro mês',
        fontSize: 11, color: '#64748b', lineHeight: 1.4,
      },
    ],
  },
}

const heroClaro: BlockTemplate = {
  id: 'hero-claro',
  label: 'Hero Claro',
  category: 'Hero',
  thumbnailKey: 'hero-claro',
  block: {
    height: 580,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'texto',
        x: C(0, 500), y: 130, w: 500, h: 24,
        html: 'A SOLUÇÃO QUE VOCÊ PRECISAVA',
        fontSize: 14, color: '#2563eb', textAlign: 'center', fontWeight: 700, letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 900), y: 170, w: 900, h: 130,
        html: 'Alcance resultados reais em tempo recorde',
        fontSize: 56, fontWeight: 900, color: '#0f172a', textAlign: 'center', lineHeight: 1.1, letterSpacing: -2,
      },
      {
        type: 'texto',
        x: C(0, 700), y: 320, w: 700, h: 60,
        html: 'Método comprovado por mais de 2.000 pessoas que saíram do zero e chegaram ao topo.',
        fontSize: 20, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(-130, 240), y: 420, w: 240, h: 60,
        text: 'Começar agora →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
      {
        type: 'botao',
        x: C(130, 240), y: 420, w: 240, h: 60,
        text: '▶ Ver demonstração',
        bgColor: '#f1f5f9', color: '#0f172a', fontSize: 16, fontWeight: 600, borderRadius: 10,
      },
      {
        type: 'texto',
        x: C(0, 600), y: 510, w: 600, h: 24,
        html: '✓ Acesso imediato &nbsp;·&nbsp; ✓ Garantia de 7 dias &nbsp;·&nbsp; ✓ Suporte incluso',
        fontSize: 13, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

const heroComVideo: BlockTemplate = {
  id: 'hero-com-video',
  label: 'Hero com Vídeo',
  category: 'Hero',
  thumbnailKey: 'hero-com-video',
  block: {
    height: 680,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'texto',
        x: C(0, 800), y: 70, w: 800, h: 24,
        html: 'A SOLUÇÃO MAIS COMPLETA DO MERCADO',
        fontSize: 13, fontWeight: 700, color: '#2563eb', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 900), y: 110, w: 900, h: 100,
        html: 'Veja em 2 minutos como funciona',
        fontSize: 48, fontWeight: 800, color: '#0f172a', textAlign: 'center', lineHeight: 1.15,
      },
      {
        type: 'texto',
        x: C(0, 700), y: 230, w: 700, h: 50,
        html: 'Assista ao vídeo abaixo e descubra como mudar seus resultados ainda esta semana.',
        fontSize: 18, color: '#475569', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'video',
        x: C(0, 720), y: 310, w: 720, h: 280,
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        type: 'botao',
        x: C(0, 280), y: 610, w: 280, h: 56,
        text: 'Quero saber mais →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
    ],
  },
}

const heroMinimalista: BlockTemplate = {
  id: 'hero-minimalista',
  label: 'Hero Minimalista',
  category: 'Hero',
  thumbnailKey: 'hero-minimalista',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#fafbfc' }] },
    elements: [
      // Pill de anúncio sutil (estilo Linear/Vercel/Notion)
      { type: 'caixa',
        x: C(0, 320), y: 120, w: 320, h: 34,
        bgColor: '#ffffff',
        borders: { radius: r4(999), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'soft' },
      // Bolinha verde "live"
      { type: 'circulo', x: C(-130, 8), y: 133, w: 8, h: 8,
        bgColor: '#10b981' },
      { type: 'texto',
        x: C(-115, 290), y: 130, w: 290, h: 18,
        html: 'Novo · <span style="color:#0f172a;font-weight:700">Lançamento v2.0 →</span>',
        fontSize: 12, color: '#64748b', fontWeight: 500 },

      // Eyebrow letterspaced ultra discreto (acima da headline)
      { type: 'texto',
        x: C(0, 700), y: 178, w: 700, h: 22,
        html: 'PARA TIMES QUE QUEREM IR MAIS LONGE',
        fontSize: 11, color: '#94a3b8', textAlign: 'center',
        letterSpacing: 3, fontWeight: 700 },

      // Headline gigante — uma palavra escapa com itálico serif (efeito editorial)
      { type: 'titulo', headingLevel: 1,
        x: C(0, 1100), y: 218, w: 1100, h: 168,
        html: 'A maneira mais <span style="font-family:\'Playfair Display\',Georgia,serif;font-weight:400;font-style:italic;color:#0f172a">simples</span><br/>de crescer seu negócio',
        fontSize: 72, fontWeight: 900, color: '#0f172a',
        textAlign: 'center', lineHeight: 1.05,
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -3 },

      // Sub elegante, peso médio
      { type: 'texto',
        x: C(0, 720), y: 408, w: 720, h: 56,
        html: 'Sem complicação. Sem mensalidade. Sem fidelidade.<br/>Comece em <strong style="color:#0f172a;font-weight:700">menos de 60 segundos</strong>.',
        fontSize: 18, color: '#475569', textAlign: 'center', lineHeight: 1.6 },

      // CTA primário com seta + secundário em texto (padrão Linear)
      { type: 'botao',
        x: C(-130, 220), y: 488, w: 220, h: 52,
        text: 'Começar grátis →',
        bgColor: '#0f172a', color: '#ffffff',
        fontSize: 15, fontWeight: 700, borderRadius: 8,
        shadow: 'hard' },
      { type: 'botao',
        x: C(100, 180), y: 488, w: 180, h: 52,
        text: 'Ver demo',
        bgColor: 'transparent', color: '#0f172a',
        fontSize: 15, fontWeight: 600, borderRadius: 8,
        borders: { width: 1, color: '#cbd5e1',
          radius: r4(8), equalCorners: true } },

      // Social proof discreto (avatares + texto) — abaixo do CTA
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: C(-130, 32) + i * 22, y: 580, w: 32, h: 32,
        bgImage: `https://i.pravatar.cc/64?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#ffffff', width: 2,
          radius: r4(16), equalCorners: true } })),
      { type: 'texto',
        x: C(20, 280), y: 588, w: 280, h: 22,
        html: '<strong style="color:#0f172a">+3.000 times</strong> usando hoje',
        fontSize: 13, color: '#64748b', fontWeight: 500 },

      // Linha sutil de trust embaixo
      { type: 'caixa',
        x: C(0, 600), y: 638, w: 600, h: 1,
        bgColor: '#e2e8f0' },
      { type: 'texto',
        x: C(0, 800), y: 658, w: 800, h: 22,
        html: '✓ Sem cartão · ✓ Setup em 60s · ✓ Cancele quando quiser',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
        letterSpacing: 0.5 },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFÍCIOS
// ─────────────────────────────────────────────────────────────────────────────

const beneficios3Col: BlockTemplate = {
  id: 'beneficios-3col',
  label: 'Benefícios 3 Colunas',
  category: 'Benefícios',
  thumbnailKey: 'beneficios-3col',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // ── HEADER ──
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'POR QUE +5.000 ESCOLHEM',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Resultados <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">mensuráveis</span> em 30 dias',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Não é promessa vaga — são 3 transformações específicas que você sente já no primeiro mês.',
        fontSize: 17, color: '#64748b', textAlign: 'center',
      },

      // ── 3 CARDS DENSOS (sem espaço vazio, com STATS reais) ──
      // Layout: 3 cards 340w + 2 gaps 30px = 1080. Margem lateral 60px.
      // Card 1 (azul/normal) / Card 2 (DESTAQUE roxo) / Card 3 (amber/normal)
      ...[0, 1, 2].flatMap((i): ElemInput[] => {
        const cardX = 60 + i * 370
        const isFeatured = i === 1  // card central destacado
        const data = [
          { stat: '10×',     statLabel: 'mais rápido',  icon: 'zap' as const,
            color: '#2563eb', bg: '#dbeafe',
            title: 'Setup em minutos',
            desc: '5 minutos pra publicar a primeira página. Sem código, sem dev, sem espera.' },
          { stat: '+312%',   statLabel: 'em conversão', icon: 'target' as const,
            color: '#7c3aed', bg: '#f5f3ff',
            title: 'Estratégia validada',
            desc: 'Método testado em 50+ nichos. Não é template genérico — é playbook que funciona pro seu mercado.' },
          { stat: '∞',       statLabel: 'escalável',    icon: 'rocket' as const,
            color: '#f59e0b', bg: '#fffbeb',
            title: 'Cresce com você',
            desc: 'Mesma estrutura que roda 100 visitas roda 100.000. Não trava, não fica fora do ar.' },
        ][i]
        return [
          // Card: fundo branco normal OU roxo destacado
          { type: 'caixa',
            x: cardX, y: isFeatured ? 230 : 250, w: 340,
            h: isFeatured ? 470 : 430,
            bgColor: isFeatured ? '#0f172a' : '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: isFeatured ? '#0f172a' : '#e2e8f0', width: 1 },
            shadow: isFeatured ? 'hard' : 'soft' },
          // Badge "MAIS POPULAR" só no card central
          ...(isFeatured ? [
            { type: 'caixa' as const,
              x: cardX + 110, y: 210, w: 120, h: 32,
              bgColor: '#fbbf24',
              borders: { radius: r4(999), equalCorners: true } },
            { type: 'texto' as const,
              x: cardX + 110, y: 217, w: 120, h: 18,
              html: 'MAIS ESCOLHIDO', fontSize: 10, fontWeight: 800,
              color: '#7c2d12', textAlign: 'center' as const, letterSpacing: 2 },
          ] : []),
          // STAT GIGANTE (substitui o número órfão decorativo)
          { type: 'titulo', headingLevel: 3,
            x: cardX + 30, y: isFeatured ? 270 : 290, w: 280, h: 70,
            html: data.stat, fontSize: 64, fontWeight: 900,
            color: isFeatured ? '#fbbf24' : data.color,
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -2 },
          // Stat label (ao lado/abaixo do número)
          { type: 'texto',
            x: cardX + 30, y: isFeatured ? 340 : 360, w: 280, h: 22,
            html: data.statLabel, fontSize: 14, fontWeight: 600,
            color: isFeatured ? '#cbd5e1' : '#64748b' },
          // Linha separadora subtil
          { type: 'caixa',
            x: cardX + 30, y: isFeatured ? 376 : 396, w: 280, h: 1,
            bgColor: isFeatured ? '#1e293b' : '#e2e8f0' },
          // Icon BEM MAIOR (40 dentro de 72) próximo ao título
          { type: 'circulo',
            x: cardX + 30, y: isFeatured ? 400 : 420, w: 56, h: 56,
            bgColor: isFeatured ? '#1e293b' : data.bg },
          { type: 'icone', iconId: data.icon,
            x: cardX + 46, y: isFeatured ? 416 : 436, w: 24, h: 24,
            color: isFeatured ? '#fbbf24' : data.color },
          // Título
          { type: 'titulo', headingLevel: 3,
            x: cardX + 100, y: isFeatured ? 408 : 428, w: 220, h: 28,
            html: data.title, fontSize: 19, fontWeight: 700,
            color: isFeatured ? '#ffffff' : '#0f172a',
            fontFamily: 'Plus Jakarta Sans' },
          // Descrição rica
          { type: 'texto',
            x: cardX + 30, y: isFeatured ? 478 : 498, w: 280, h: 90,
            html: data.desc, fontSize: 14,
            color: isFeatured ? '#cbd5e1' : '#475569', lineHeight: 1.6 },
          // CTA "Saiba mais" só nos cards normais (featured tem botão)
          ...(isFeatured ? [
            { type: 'botao' as const,
              x: cardX + 30, y: 620, w: 280, h: 48,
              text: 'Quero esse resultado →',
              bgColor: '#fbbf24', color: '#7c2d12',
              fontSize: 14, fontWeight: 800, borderRadius: 10 },
          ] : [
            { type: 'texto' as const,
              x: cardX + 30, y: 610, w: 280, h: 22,
              html: `<strong style="color:${data.color}">Ver detalhes →</strong>`,
              fontSize: 13 },
          ]),
        ]
      }),
    ],
  },
}

const beneficiosLista: BlockTemplate = {
  id: 'beneficios-lista',
  label: 'Benefícios em Lista',
  category: 'Benefícios',
  thumbnailKey: 'beneficios-lista',
  block: {
    height: 800,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f0fdf4' }] },
    elements: [
      // ── HEADER ──
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: '4 TRANSFORMAÇÕES MENSURÁVEIS',
        fontSize: 13, fontWeight: 800, color: '#16a34a',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'O que você vai <span style="background:linear-gradient(135deg,#16a34a,#0ea5e9);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">conquistar</span>',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Não é discurso vago — são números reais validados por +5.000 clientes.',
        fontSize: 17, color: '#64748b', textAlign: 'center',
      },

      // ── 4 ITEMS, cada um num CARD horizontal grande ──
      // Layout: card 800w x 110h, gap 16px. y=240 + i*126
      ...[
        { t: 'Mais clientes',         d: 'Atraia leads qualificados todos os dias com tráfego automatizado + funis que convertem 3× mais.',
          val: '+312%', sublabel: 'em geração de leads' },
        { t: 'Mais faturamento',      d: 'Receita mensal cresce sem ampliar base — só extraindo mais valor de cada cliente existente.',
          val: 'R$ 12M', sublabel: 'gerados pela base' },
        { t: 'Mais tempo livre',      d: 'Automatize prospecção, qualificação e fechamento. Sua equipe foca só no que dá resultado real.',
          val: '20h', sublabel: 'recuperadas/semana' },
        { t: 'Mais previsibilidade',  d: 'Dashboard em tempo real mostra o que entra, o que sai e o que vai vir nos próximos 30 dias.',
          val: '99%', sublabel: 'de assertividade' },
      ].flatMap((item, i): ElemInput[] => {
        const y = 240 + i * 116
        return [
          // Card branco com border esquerdo verde como acento
          { type: 'caixa', x: 200, y, w: 800, h: 100,
            bgColor: '#ffffff',
            borders: { radius: r4(14), equalCorners: true,
              color: '#dcfce7', width: 1 },
            shadow: 'soft' },
          // Faixa verde decorativa esquerda (acento de hierarquia)
          { type: 'caixa', x: 200, y, w: 4, h: 100,
            bgColor: '#16a34a',
            borders: { radius: [14, 0, 0, 14], equalCorners: false } },
          // Circle check com border duplo
          { type: 'circulo', x: 230, y: y + 22, w: 56, h: 56,
            bgColor: '#dcfce7',
            borders: { color: '#bbf7d0', width: 2,
              radius: r4(28), equalCorners: true } },
          { type: 'icone', iconId: 'check',
            x: 248, y: y + 40, w: 20, h: 20, color: '#16a34a' },
          // Title
          { type: 'titulo', headingLevel: 3,
            x: 310, y: y + 18, w: 480, h: 28,
            html: item.t, fontSize: 20, fontWeight: 700,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          // Description rica
          { type: 'texto',
            x: 310, y: y + 50, w: 480, h: 44,
            html: item.d, fontSize: 14, color: '#64748b', lineHeight: 1.6 },
          // STAT GRANDE à direita verde
          { type: 'titulo', headingLevel: 4,
            x: 820, y: y + 18, w: 170, h: 44,
            html: item.val, fontSize: 36, fontWeight: 900,
            color: '#16a34a', textAlign: 'right',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          { type: 'texto',
            x: 820, y: y + 64, w: 170, h: 18,
            html: item.sublabel, fontSize: 11, fontWeight: 600,
            color: '#94a3b8', textAlign: 'right' },
        ]
      }),

      // ── CTA forte no rodapé ──
      {
        type: 'botao',
        x: 460, y: 720, w: 280, h: 56,
        text: 'Quero esses resultados →',
        bgColor: '#16a34a', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 12,
        shadow: 'medium',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPOIMENTOS
// ─────────────────────────────────────────────────────────────────────────────

const depoimentos3Cards: BlockTemplate = {
  id: 'depoimentos-cards',
  label: 'Depoimentos 3 Cards',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-cards',
  block: {
    height: 700,
    bgColor: '#f8fafc',
    elements: [
      // Header centralizado
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'O QUE DIZEM SOBRE NÓS',
        fontSize: 13, fontWeight: 800, color: '#f59e0b',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 200, y: 105, w: 800, h: 60,
        html: 'Histórias reais de quem aplicou',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: '<strong style="color:#0f172a">+5.000</strong> empresas brasileiras já transformaram seus resultados.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // ── 3 cards de depoimento ──
      // Layout: 3 cards 340w + 2 gaps 30 = 1080. Margem lateral 60.
      // Card N: x = 60 + N * 370
      ...[0, 1, 2].flatMap((i): ElemInput[] => {
        const cardX = 60 + i * 370
        const photos = [47, 12, 26]
        const names  = ['Maria Silva', 'João Santos', 'Ana Costa']
        const roles  = ['CEO · Mendes & Cia', 'Fundador · Startup PME', 'Diretora · TechCo']
        const quotes = [
          'Em apenas 2 meses minha empresa cresceu 3×. O método é simples, prático e funciona — e o suporte é fora de série.',
          'Investi e em 30 dias recuperei todo o valor. Continuo gerando vendas todo dia no piloto automático.',
          'Recomendo pra qualquer empreendedor. O suporte é impecável e o conteúdo vale 10× o que paguei.',
        ]
        return [
          // Card branco com shadow:soft
          { type: 'caixa',
            x: cardX, y: 240, w: 340, h: 340,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          // Aspas decorativas: usa entity ldquo (renderiza " corretamente)
          { type: 'titulo', headingLevel: 4,
            x: cardX + 250, y: 252, w: 60, h: 70,
            html: '&ldquo;', fontSize: 90, fontWeight: 900,
            color: '#f59e0b', opacity: 0.18,
            fontFamily: 'Georgia, serif', textAlign: 'right',
            lineHeight: 1 },
          // 5 estrelas filled SVG
          ...[0,1,2,3,4].map((j): ElemInput => ({
            type: 'icone' as const, iconId: 'star-filled',
            x: cardX + 30 + j * 24, y: 280, w: 20, h: 20, color: '#f59e0b',
          })),
          // Quote (h ajustado pra match content size, sem buraco vazio)
          { type: 'texto',
            x: cardX + 30, y: 318, w: 280, h: 110,
            html: quotes[i], fontSize: 15,
            color: '#334155', lineHeight: 1.7,
            fontFamily: 'Georgia, serif' },
          // STAT específico do cliente (substitui buraco vazio)
          { type: 'caixa',
            x: cardX + 30, y: 442, w: 280, h: 1,
            bgColor: '#e2e8f0' },
          // Resultado destacado em verde (chip-style)
          { type: 'caixa',
            x: cardX + 30, y: 458, w: 110, h: 24,
            bgColor: '#dcfce7',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto',
            x: cardX + 30, y: 462, w: 110, h: 18,
            html: i === 0 ? '✓ +312%' : i === 1 ? '✓ R$ 2.5M' : '✓ 3× ROI',
            fontSize: 11, fontWeight: 800, color: '#15803d',
            textAlign: 'center', letterSpacing: 1 },
          { type: 'texto',
            x: cardX + 150, y: 463, w: 160, h: 18,
            html: i === 0 ? 'em vendas' : i === 1 ? 'em recorrência' : 'no primeiro ano',
            fontSize: 11, color: '#64748b' },
          // Avatar + Info
          { type: 'circulo',
            x: cardX + 30, y: 504, w: 52, h: 52,
            bgImage: `https://i.pravatar.cc/120?img=${photos[i]}`,
            borders: { color: '#f8fafc', width: 3,
              radius: r4(26), equalCorners: true },
            shadow: 'soft' },
          { type: 'titulo', headingLevel: 4,
            x: cardX + 96, y: 508, w: 220, h: 22,
            html: names[i], fontSize: 15, fontWeight: 700,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: cardX + 96, y: 532, w: 220, h: 18,
            html: roles[i], fontSize: 11, color: '#64748b' },
          { type: 'texto',
            x: cardX + 96, y: 548, w: 220, h: 16,
            html: '<strong style="color:#16a34a">cliente desde 2024</strong>',
            fontSize: 10 },
        ]
      }),

      // ── Bottom: prova social agregada ──
      {
        type: 'texto', x: 200, y: 615, w: 800, h: 30,
        html: '<strong style="color:#0f172a;font-size:18px">+5.000 empresas</strong> · 4.9/5 estrelas · <strong style="color:#16a34a">98% recomenda</strong>',
        fontSize: 14, color: '#64748b', textAlign: 'center',
      },
    ],
  },
}

const depoimentoHighlight: BlockTemplate = {
  id: 'depoimento-highlight',
  label: 'Depoimento Destaque',
  category: 'Depoimentos',
  thumbnailKey: 'depoimento-destaque',
  block: {
    height: 660,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 400, y: 60, w: 400, h: 24,
        html: 'CASE DESTAQUE · OUTUBRO/2024',
        fontSize: 12, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3,
      },

      // Aspas decorativas gigantes
      {
        type: 'titulo', headingLevel: 4,
        x: 540, y: 90, w: 120, h: 120,
        html: '&ldquo;', fontSize: 200, fontWeight: 900,
        color: '#fbbf24', opacity: 0.12,
        fontFamily: 'Georgia, serif', textAlign: 'center', lineHeight: 1,
      },

      // 5 estrelas SVG centralizadas
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 530 + i * 28, y: 170, w: 24, h: 24, color: '#fbbf24',
      })),

      // Quote grande
      {
        type: 'titulo', headingLevel: 2,
        x: 150, y: 230, w: 900, h: 160,
        html: 'Em <span style="color:#fbbf24">60 dias</span>, faturamos mais que nos 6 meses anteriores. O método é absurdo de bom.',
        fontSize: 38, fontWeight: 600, color: '#ffffff', textAlign: 'center',
        lineHeight: 1.3, fontFamily: 'Georgia, serif',
      },

      // ── ROW de stats reais embaixo do quote ──
      // Layout: 3 stats centralizados em 720w, gap 60px
      ...[
        { val: 'R$ 380k', lbl: 'em 60 dias' },
        { val: '+312%',   lbl: 'no faturamento' },
        { val: '6 meses', lbl: 'recuperados' },
      ].flatMap((s, i): ElemInput[] => {
        const x = 240 + i * 240
        return [
          { type: 'titulo', headingLevel: 3,
            x, y: 410, w: 240, h: 50,
            html: s.val, fontSize: 36, fontWeight: 900,
            color: '#fbbf24', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          { type: 'texto',
            x, y: 460, w: 240, h: 20,
            html: s.lbl, fontSize: 12, fontWeight: 600,
            color: '#94a3b8', textAlign: 'center', letterSpacing: 1 },
        ]
      }),

      // ── Linha separadora subtil ──
      {
        type: 'caixa', x: 500, y: 500, w: 200, h: 1,
        bgColor: 'rgba(255,255,255,0.15)',
      },

      // Avatar grande com border dourado
      {
        type: 'circulo', x: 560, y: 520, w: 80, h: 80,
        bgImage: 'https://i.pravatar.cc/160?img=33',
        borders: { color: '#fbbf24', width: 3,
          radius: r4(40), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 400, y: 612, w: 400, h: 26,
        html: 'Carlos Mendes', fontSize: 18, fontWeight: 700,
        color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 400, y: 638, w: 400, h: 18,
        html: 'CEO · Mendes & Cia · Cliente desde 2024',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

const depoimentos2Vertical: BlockTemplate = {
  id: 'depoimentos-2-vertical',
  label: 'Depoimentos 2 Cards Largos',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-2-vertical',
  block: {
    height: 620,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'CASES SELECIONADOS',
        fontSize: 13, fontWeight: 800, color: '#f59e0b',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Histórias reais de quem aplicou',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Resultados específicos que nossos clientes obtiveram em meses, não anos.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // ── Card 1 ──
      {
        type: 'caixa', x: 80, y: 240, w: 520, h: 340,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'soft',
      },
      // Faixa amber acento esquerda
      {
        type: 'caixa', x: 80, y: 240, w: 4, h: 340,
        bgColor: '#f59e0b',
        borders: { radius: [20, 0, 0, 20], equalCorners: false },
      },
      // Aspas decorativas
      {
        type: 'titulo', headingLevel: 4,
        x: 530, y: 252, w: 60, h: 70,
        html: '&ldquo;', fontSize: 100, fontWeight: 900,
        color: '#f59e0b', opacity: 0.15,
        fontFamily: 'Georgia, serif', textAlign: 'right', lineHeight: 1,
      },
      // 5 stars filled
      ...[0,1,2,3,4].map((j): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 120 + j * 26, y: 280, w: 22, h: 22, color: '#f59e0b',
      })),
      // Quote
      {
        type: 'texto', x: 120, y: 320, w: 440, h: 100,
        html: 'Mudei a forma como atendia meus clientes e o resultado foi imediato. Em 3 meses, <strong style="color:#0f172a">dobrei o ticket médio</strong> sem aumentar minha base.',
        fontSize: 17, color: '#1e293b', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      // Stat chip
      {
        type: 'caixa', x: 120, y: 432, w: 130, h: 28,
        bgColor: '#fef3c7',
        borders: { radius: r4(999), equalCorners: true },
      },
      {
        type: 'texto', x: 120, y: 437, w: 130, h: 18,
        html: '✓ +200% no ticket', fontSize: 11, fontWeight: 800,
        color: '#92400e', textAlign: 'center', letterSpacing: 1,
      },
      // Linha separadora
      { type: 'caixa', x: 120, y: 482, w: 440, h: 1, bgColor: '#e2e8f0' },
      // Avatar
      {
        type: 'circulo', x: 120, y: 502, w: 56, h: 56,
        bgImage: 'https://i.pravatar.cc/120?img=49',
        borders: { color: '#ffffff', width: 3,
          radius: r4(28), equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'titulo', headingLevel: 4, x: 192, y: 506, w: 380, h: 24,
        html: 'Patrícia Lima', fontSize: 16, fontWeight: 700, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: 192, y: 530, w: 380, h: 18,
        html: 'Consultora de Marketing · Lima Consultoria',
        fontSize: 12, color: '#64748b',
      },
      {
        type: 'texto', x: 192, y: 548, w: 380, h: 16,
        html: '<strong style="color:#16a34a">cliente desde Mar/2024</strong>',
        fontSize: 10,
      },
      // ── Card 2 ──
      {
        type: 'caixa', x: 620, y: 240, w: 520, h: 340,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'soft',
      },
      // Faixa azul acento esquerda
      {
        type: 'caixa', x: 620, y: 240, w: 4, h: 340,
        bgColor: '#2563eb',
        borders: { radius: [20, 0, 0, 20], equalCorners: false },
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 1070, y: 252, w: 60, h: 70,
        html: '&ldquo;', fontSize: 100, fontWeight: 900,
        color: '#2563eb', opacity: 0.15,
        fontFamily: 'Georgia, serif', textAlign: 'right', lineHeight: 1,
      },
      ...[0,1,2,3,4].map((j): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 660 + j * 26, y: 280, w: 22, h: 22, color: '#f59e0b',
      })),
      {
        type: 'texto', x: 660, y: 320, w: 440, h: 100,
        html: 'Cético no início, mas a metodologia me convenceu rápido. Hoje recomendo pra todo empreendedor — <strong style="color:#0f172a">dobrei a operação em 6 meses</strong>.',
        fontSize: 17, color: '#1e293b', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'caixa', x: 660, y: 432, w: 130, h: 28,
        bgColor: '#dbeafe',
        borders: { radius: r4(999), equalCorners: true },
      },
      {
        type: 'texto', x: 660, y: 437, w: 130, h: 18,
        html: '✓ 2× operação', fontSize: 11, fontWeight: 800,
        color: '#1d4ed8', textAlign: 'center', letterSpacing: 1,
      },
      { type: 'caixa', x: 660, y: 482, w: 440, h: 1, bgColor: '#e2e8f0' },
      {
        type: 'circulo', x: 660, y: 502, w: 56, h: 56,
        bgImage: 'https://i.pravatar.cc/120?img=14',
        borders: { color: '#ffffff', width: 3,
          radius: r4(28), equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'titulo', headingLevel: 4, x: 732, y: 506, w: 380, h: 24,
        html: 'Rafael Cruz', fontSize: 16, fontWeight: 700, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: 732, y: 530, w: 380, h: 18,
        html: 'CEO · TechCo · Software B2B',
        fontSize: 12, color: '#64748b',
      },
      {
        type: 'texto', x: 732, y: 548, w: 380, h: 16,
        html: '<strong style="color:#16a34a">cliente desde Jan/2024</strong>',
        fontSize: 10,
      },
    ],
  },
}

const depoimentosLogos: BlockTemplate = {
  id: 'depoimentos-logos',
  label: 'Empresas que Confiam',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-logos',
  block: {
    height: 480,
    bgColor: '#ffffff',
    elements: [
      // Eyebrow + headline pequeno
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'PROVA SOCIAL',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 200, y: 102, w: 800, h: 40,
        html: 'Quem já cresce com a gente',
        fontSize: 28, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -0.5,
      },
      // ── Stats row no topo (substitui texto "+5.000 em 12 países" só) ──
      ...[
        { val: '+5.000', lbl: 'empresas ativas' },
        { val: '12',     lbl: 'países atendidos' },
        { val: '4.9',    lbl: '/5 estrelas' },
        { val: '98%',    lbl: 'recomenda' },
      ].flatMap((s, i): ElemInput[] => {
        const x = 100 + i * 256
        return [
          { type: 'titulo', headingLevel: 3,
            x, y: 170, w: 240, h: 50,
            html: s.val, fontSize: 38, fontWeight: 900,
            color: '#2563eb', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          { type: 'texto',
            x, y: 218, w: 240, h: 22,
            html: s.lbl, fontSize: 12, fontWeight: 600,
            color: '#94a3b8', textAlign: 'center', letterSpacing: 1 },
        ]
      }),
      // Linha separadora subtil
      { type: 'caixa', x: 400, y: 270, w: 400, h: 1, bgColor: '#e2e8f0' },
      // ── Banda de "logos" estilizados (boxes coloridos com siglas) ──
      // Layout: 6 logos de empresa simulados, espacados em 1080w
      // Cada logo "fake" usa um box discreto cinza com sigla minimalista
      ...[
        { sig: 'ACME',    color: '#475569' },
        { sig: 'KAIROS',  color: '#475569' },
        { sig: 'NIMBUS',  color: '#475569' },
        { sig: 'VERTEX',  color: '#475569' },
        { sig: 'POLAR',   color: '#475569' },
        { sig: 'STELLA',  color: '#475569' },
      ].flatMap((logo, i): ElemInput[] => {
        const x = 80 + i * 180
        return [
          { type: 'caixa', x, y: 310, w: 160, h: 70,
            bgColor: '#f8fafc',
            borders: { radius: r4(8), equalCorners: true,
              color: '#e2e8f0', width: 1 } },
          { type: 'titulo', headingLevel: 4,
            x, y: 332, w: 160, h: 28,
            html: logo.sig, fontSize: 18, fontWeight: 800,
            color: logo.color, textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: 2,
            opacity: 0.7 },
        ]
      }),
      // ── Trust statement embaixo ──
      {
        type: 'texto', x: 200, y: 410, w: 800, h: 24,
        html: '⭐ Premiado <strong>"Melhor SaaS B2B do Ano"</strong> · 2024 e 2025',
        fontSize: 14, color: '#475569', textAlign: 'center',
      },
    ],
  },
}

const depoimentoVideo: BlockTemplate = {
  id: 'depoimento-video',
  label: 'Depoimento em Vídeo',
  category: 'Depoimentos',
  thumbnailKey: 'depoimento-video',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Header
      {
        type: 'texto',
        x: 400, y: 70, w: 400, h: 24,
        html: 'CASE EM VÍDEO',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Veja a <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">transformação</span> em 3 minutos',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Carlos conta como faturou R$ 380k em 60 dias usando nossa plataforma.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // ── Video centralizado com card decorativo atrás ──
      {
        type: 'caixa', x: 220, y: 260, w: 760, h: 360,
        bgColor: 'rgba(124,58,237,0.10)',
        borders: { radius: r4(20), equalCorners: true },
      },
      {
        type: 'video',
        x: 200, y: 240, w: 760, h: 360,
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      // ── Card flutuante de info do entrevistado abaixo do video ──
      // Layout centralizado: card 540w + avatar 80 esquerda + col info direita
      // Total: avatar 80 + gap 20 + info 360 = 460. Centralizado em 1200 = 370.
      // Card branco com shadow envolvendo tudo, dando "lifted" feel
      {
        type: 'caixa', x: 350, y: 620, w: 500, h: 80,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'medium',
      },
      // Avatar 64px com border verde (sinal de "validado")
      {
        type: 'circulo', x: 366, y: 628, w: 64, h: 64,
        bgImage: 'https://i.pravatar.cc/128?img=33',
        borders: { color: '#dcfce7', width: 3,
          radius: r4(32), equalCorners: true },
      },
      // 5 estrelas alinhadas no topo da info column
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 446 + i * 18, y: 632, w: 14, h: 14, color: '#f59e0b',
      })),
      // Nome em destaque
      {
        type: 'titulo', headingLevel: 4,
        x: 446, y: 650, w: 380, h: 22,
        html: 'Carlos Mendes', fontSize: 16, fontWeight: 700,
        color: '#0f172a', fontFamily: 'Plus Jakarta Sans',
      },
      // Cargo
      {
        type: 'texto',
        x: 446, y: 672, w: 220, h: 16,
        html: 'CEO · Mendes & Cia',
        fontSize: 11, color: '#64748b',
      },
      // Stat verde no canto direito do card (chip-style)
      {
        type: 'caixa', x: 692, y: 656, w: 144, h: 28,
        bgColor: '#dcfce7',
        borders: { radius: r4(999), equalCorners: true },
      },
      {
        type: 'texto',
        x: 692, y: 661, w: 144, h: 18,
        html: '✓ +R$ 380k em 60 dias',
        fontSize: 11, fontWeight: 800, color: '#15803d',
        textAlign: 'center', letterSpacing: 0.5,
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────────────────────

const ctaSimples: BlockTemplate = {
  id: 'cta-simples',
  label: 'CTA Simples',
  category: 'CTA',
  thumbnailKey: 'cta-simples',
  block: {
    height: 460,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#1e3a8a' }, { color: '#2563eb' }, { color: '#3b82f6' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'JUNTE-SE A +5.000 EMPRESAS',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline com gradient text
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 70,
        html: 'Pronto pra <span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">começar agora</span>?',
        fontSize: 48, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      // Subheadline
      {
        type: 'texto',
        x: 250, y: 195, w: 700, h: 50,
        html: '14 dias grátis. Sem cartão. Cancele quando quiser.',
        fontSize: 18, color: '#dbeafe', textAlign: 'center', lineHeight: 1.6,
      },
      // CTA principal
      {
        type: 'botao',
        x: 440, y: 270, w: 320, h: 64,
        text: 'COMEÇAR AGORA →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 17, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
      // Trust signals row
      {
        type: 'icone', iconId: 'check-circle',
        x: 360, y: 366, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 384, y: 364, w: 160, h: 22,
        html: 'Sem fidelidade', fontSize: 13, color: '#cbd5e1' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 564, y: 366, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 588, y: 364, w: 160, h: 22,
        html: 'Setup em 5 minutos', fontSize: 13, color: '#cbd5e1' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 768, y: 366, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 792, y: 364, w: 160, h: 22,
        html: 'Suporte 24/7', fontSize: 13, color: '#cbd5e1' },
      // Linha de social proof: avatares + "+5.000 ja' usam"
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 460 + i * 22, y: 410, w: 32, h: 32,
        bgImage: `https://i.pravatar.cc/64?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#1e3a8a', width: 2,
          radius: r4(16), equalCorners: true },
      })),
      { type: 'texto', x: 580, y: 416, w: 280, h: 22,
        html: '<strong style="color:#fbbf24">4.9/5</strong> · +5.000 já usam',
        fontSize: 13, color: '#cbd5e1' },
    ],
  },
}

const ctaUrgencia: BlockTemplate = {
  id: 'cta-urgencia',
  label: 'CTA com Urgência',
  category: 'CTA',
  thumbnailKey: 'cta-urgencia',
  block: {
    height: 540,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#7f1d1d' }, { color: '#dc2626' }, { color: '#b91c1c' }] },
    elements: [
      // Eyebrow com SVG flame icon
      {
        type: 'caixa', x: 460, y: 60, w: 280, h: 36,
        bgColor: 'rgba(255,255,255,0.12)',
        borders: { radius: r4(999), equalCorners: true,
          color: 'rgba(255,255,255,0.2)', width: 1 },
      },
      {
        type: 'icone', iconId: 'flame',
        x: 478, y: 69, w: 18, h: 18, color: '#fbbf24',
      },
      {
        type: 'texto', x: 504, y: 71, w: 220, h: 22,
        html: 'OFERTA POR TEMPO LIMITADO',
        fontSize: 11, fontWeight: 800, color: '#fef2f2',
        letterSpacing: 2,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 115, w: 1000, h: 80,
        html: 'Últimas 24h com <span style="color:#fbbf24">50% off</span>',
        fontSize: 56, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -2,
      },
      // Mini countdown inline (4 caixinhas)
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 360 + i * 130
        const labels = ['DIAS', 'HORAS', 'MIN', 'SEG']
        const values = ['00', '23', '59', '00']
        return [
          { type: 'caixa', x, y: 220, w: 100, h: 90,
            bgColor: '#ffffff',
            borders: { radius: r4(12), equalCorners: true },
            shadow: 'hard' },
          { type: 'titulo', headingLevel: 4,
            x, y: 232, w: 100, h: 50,
            html: values[i], fontSize: 38, fontWeight: 900,
            color: '#dc2626', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 282, w: 100, h: 18,
            html: labels[i], fontSize: 10, fontWeight: 800,
            color: '#7f1d1d', textAlign: 'center', letterSpacing: 1.5 },
        ]
      }),
      // Preço de/por
      {
        type: 'texto',
        x: 250, y: 340, w: 700, h: 40,
        html: '<span style="color:#fee2e2;text-decoration:line-through;font-size:18px">De R$ 497</span> &nbsp; <span style="color:#fbbf24;font-size:32px;font-weight:900;font-family:\'Plus Jakarta Sans\',sans-serif">por R$ 247/mês</span>',
        fontSize: 18, color: '#ffffff', textAlign: 'center',
      },
      // CTA
      {
        type: 'botao',
        x: 420, y: 410, w: 360, h: 64,
        text: 'GARANTIR MEU DESCONTO →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 17, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
      // Trust line
      {
        type: 'texto',
        x: 300, y: 495, w: 600, h: 22,
        html: '🔒 Garantia incondicional 30 dias · Pagamento seguro · Acesso imediato',
        fontSize: 13, color: '#fecaca', textAlign: 'center',
      },
    ],
  },
}

const ctaDoisBotoes: BlockTemplate = {
  id: 'cta-2-botoes',
  label: 'CTA Dois Botões',
  category: 'CTA',
  thumbnailKey: 'cta-duplo',
  block: {
    height: 480,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'EXPERIMENTE GRÁTIS HOJE',
        fontSize: 13, fontWeight: 800, color: '#60a5fa',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline com gradient
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 70,
        html: 'Pronto pra <span style="background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">testar sem riscos</span>?',
        fontSize: 46, fontWeight: 800, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      // Subheadline
      {
        type: 'texto',
        x: 250, y: 195, w: 700, h: 50,
        html: '14 dias completos pra testar tudo. Sem cartão de crédito. Sem letras miúdas.',
        fontSize: 17, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6,
      },
      // CTAs lado a lado
      {
        type: 'botao',
        x: 320, y: 280, w: 260, h: 60,
        text: 'COMEÇAR GRÁTIS →',
        bgColor: '#3b82f6', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 10,
        shadow: 'hard',
      },
      {
        type: 'botao',
        x: 600, y: 280, w: 260, h: 60,
        text: 'AGENDAR DEMO',
        bgColor: 'rgba(255,255,255,0.05)', color: '#ffffff',
        fontSize: 16, fontWeight: 600, borderRadius: 10,
        borders: { width: 1, color: 'rgba(255,255,255,0.2)',
          radius: r4(10), equalCorners: true },
      },
      // Trust signals row 3 items
      {
        type: 'icone', iconId: 'check-circle',
        x: 360, y: 376, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 384, y: 374, w: 160, h: 22,
        html: 'Setup em 5 min', fontSize: 13, color: '#94a3b8' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 564, y: 376, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 588, y: 374, w: 160, h: 22,
        html: 'Sem cartão', fontSize: 13, color: '#94a3b8' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 720, y: 376, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 744, y: 374, w: 200, h: 22,
        html: 'Cancele quando quiser', fontSize: 13, color: '#94a3b8' },
      // Avatares + rating
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 470 + i * 22, y: 416, w: 32, h: 32,
        bgImage: `https://i.pravatar.cc/64?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#0f172a', width: 2,
          radius: r4(16), equalCorners: true },
      })),
      { type: 'texto', x: 590, y: 422, w: 280, h: 22,
        html: '<strong style="color:white">+10.000 empresas</strong> já testaram',
        fontSize: 13, color: '#94a3b8' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SOBRE
// ─────────────────────────────────────────────────────────────────────────────

const sobreBio: BlockTemplate = {
  id: 'sobre-bio',
  label: 'Sobre — Bio',
  category: 'Sobre',
  thumbnailKey: 'sobre-bio',
  block: {
    height: 600,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Card decorativo atrás da foto (lifted)
      {
        type: 'caixa', x: 170, y: 100, w: 320, h: 380,
        bgColor: 'rgba(37,99,235,0.12)',
        borders: { radius: r4(200), equalCorners: true },
      },
      {
        type: 'imagem',
        x: 150, y: 80, w: 320, h: 380,
        src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80',
        objectFit: 'cover',
        borders: { radius: r4(200), equalCorners: true },
        shadow: 'hard',
      },
      // Card flutuante "10+ ANOS" sobreposto à foto
      {
        type: 'caixa', x: 380, y: 410, w: 130, h: 80,
        bgColor: '#0f172a',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 380, y: 422, w: 130, h: 36,
        html: '10<span style="color:#fbbf24">+</span>',
        fontSize: 30, fontWeight: 900, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: 380, y: 460, w: 130, h: 16,
        html: 'ANOS DE EXP.', fontSize: 9, fontWeight: 800,
        color: '#94a3b8', textAlign: 'center', letterSpacing: 2,
      },

      // Coluna direita
      {
        type: 'texto',
        x: 540, y: 100, w: 540, h: 24,
        html: 'CONHEÇA QUEM ESTÁ POR TRÁS',
        fontSize: 13, color: '#2563eb', fontWeight: 800, letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 540, y: 134, w: 540, h: 100,
        html: 'Mais de <span style="color:#2563eb">10 anos</span> transformando vidas',
        fontSize: 38, fontWeight: 800, color: '#0f172a', lineHeight: 1.15,
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 540, y: 252, w: 540, h: 100,
        html: 'Comecei do zero e construí um caminho que <strong>já ajudou +5.000 pessoas</strong> a multiplicar resultados. Hoje, divido cada aprendizado com quem está pronto pra dar o próximo passo.',
        fontSize: 15, color: '#475569', lineHeight: 1.7,
      },
      // 3 stats inline
      ...[
        { num: '+5.000', lbl: 'Vidas impactadas' },
        { num: 'R$ 50M', lbl: 'Em vendas geradas' },
        { num: '4.9/5',  lbl: 'Avaliação dos alunos' },
      ].flatMap((s, i): ElemInput[] => {
        const x = 540 + i * 180
        return [
          { type: 'titulo', headingLevel: 4,
            x, y: 372, w: 170, h: 36,
            html: s.num, fontSize: 24, fontWeight: 900, color: '#2563eb',
            fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto', x, y: 408, w: 170, h: 18,
            html: s.lbl, fontSize: 11, fontWeight: 600,
            color: '#94a3b8', letterSpacing: 1 },
        ]
      }),
      // Linha separadora
      { type: 'caixa', x: 540, y: 446, w: 540, h: 1, bgColor: '#e2e8f0' },
      // CTA
      {
        type: 'botao',
        x: 540, y: 470, w: 240, h: 52,
        text: 'Minha história completa →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 14, fontWeight: 700, borderRadius: 10,
        shadow: 'soft',
      },
      // Trust line
      {
        type: 'texto',
        x: 540, y: 540, w: 540, h: 22,
        html: '🔗 Conheça também: <strong style="color:#2563eb">LinkedIn</strong> · <strong style="color:#2563eb">Instagram</strong>',
        fontSize: 12, color: '#94a3b8',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// GARANTIA
// ─────────────────────────────────────────────────────────────────────────────

const garantia30Dias: BlockTemplate = {
  id: 'garantia-30dias',
  label: 'Garantia 30 Dias',
  category: 'Garantia',
  thumbnailKey: 'garantia-30dias',
  block: {
    height: 480,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f0fdf4' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 60, w: 800, h: 24,
        html: 'NOSSA GARANTIA',
        fontSize: 13, fontWeight: 800, color: '#16a34a',
        textAlign: 'center', letterSpacing: 3,
      },
      // Selo grande verde com ribbon-like decorativo
      {
        type: 'circulo', x: 540, y: 105, w: 120, h: 120,
        bgColor: '#dcfce7',
      },
      {
        type: 'circulo',
        x: 530, y: 95, w: 140, h: 140,
        bgColor: '#ffffff',
        borders: { color: '#16a34a', width: 4,
          radius: r4(70), equalCorners: true },
        shadow: 'medium',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 530, y: 122, w: 140, h: 56,
        html: '30', fontSize: 56, fontWeight: 900, color: '#16a34a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 530, y: 184, w: 140, h: 22,
        html: 'DIAS', fontSize: 11, color: '#15803d',
        textAlign: 'center', fontWeight: 800, letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 256, w: 1000, h: 50,
        html: 'Garantia <span style="color:#16a34a">incondicional</span> de 30 dias',
        fontSize: 34, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      // Subtext
      {
        type: 'texto',
        x: 250, y: 314, w: 700, h: 50,
        html: 'Se por qualquer motivo você não ficar satisfeito, devolvemos <strong>100% do seu dinheiro</strong>. Sem perguntas. Sem burocracia.',
        fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 1.6,
      },
      // Trust signals row
      {
        type: 'icone', iconId: 'check-circle',
        x: 360, y: 410, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 384, y: 408, w: 200, h: 22,
        html: '100% do valor', fontSize: 13, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 564, y: 410, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 588, y: 408, w: 200, h: 22,
        html: 'Sem perguntas', fontSize: 13, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 768, y: 410, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 792, y: 408, w: 200, h: 22,
        html: 'Em até 7 dias úteis', fontSize: 13, color: '#475569', fontWeight: 600 },
    ],
  },
}

const garantia7Dias: BlockTemplate = {
  id: 'garantia-7dias',
  label: 'Garantia 7 Dias',
  category: 'Garantia',
  thumbnailKey: 'garantia-7dias',
  block: {
    height: 360,
    bgColor: '#ffffff',
    elements: [
      // Selo azul redondo
      {
        type: 'circulo',
        x: 545, y: 60, w: 110, h: 110,
        bgColor: '#eff6ff',
        borders: { color: '#2563eb', width: 3,
          radius: r4(55), equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 545, y: 80, w: 110, h: 50,
        html: '7', fontSize: 48, fontWeight: 900, color: '#2563eb',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 545, y: 132, w: 110, h: 18,
        html: 'DIAS', fontSize: 10, color: '#2563eb',
        textAlign: 'center', fontWeight: 800, letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 3,
        x: 100, y: 196, w: 1000, h: 36,
        html: 'Teste sem compromisso',
        fontSize: 24, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 250, y: 240, w: 700, h: 50,
        html: 'Você tem <strong style="color:#2563eb">7 dias completos</strong> pra experimentar. Não gostou? Devolvemos seu investimento integralmente.',
        fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      },
      // Trust signals inline
      {
        type: 'icone', iconId: 'check-circle',
        x: 460, y: 308, w: 16, h: 16, color: '#2563eb',
      },
      { type: 'texto', x: 482, y: 306, w: 280, h: 22,
        html: 'Sem perguntas · Sem burocracia',
        fontSize: 12, color: '#475569', fontWeight: 600 },
    ],
  },
}

const garantiaSeloLateral: BlockTemplate = {
  id: 'garantia-selo-lateral',
  label: 'Garantia Selo Lateral',
  category: 'Garantia',
  thumbnailKey: 'garantia-selo-lateral',
  block: {
    height: 440,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Selo escudo card decorativo offset (efeito lifted)
      {
        type: 'caixa', x: 110, y: 90, w: 220, h: 240,
        bgColor: 'rgba(37,99,235,0.15)',
        borders: { radius: r4(20), equalCorners: true },
      },
      {
        type: 'caixa', x: 100, y: 80, w: 220, h: 240,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#dbeafe', width: 1 },
        shadow: 'medium',
      },
      // Shield icon grande
      {
        type: 'circulo', x: 140, y: 110, w: 140, h: 140,
        bgColor: '#dbeafe',
        borders: { radius: r4(70), equalCorners: true },
      },
      {
        type: 'icone', x: 165, y: 135, w: 90, h: 90,
        iconId: 'shield-check', color: '#2563eb',
      },
      {
        type: 'texto', x: 100, y: 264, w: 220, h: 24,
        html: 'GARANTIA TOTAL', fontSize: 12, color: '#1d4ed8',
        textAlign: 'center', fontWeight: 800, letterSpacing: 2,
      },
      {
        type: 'texto', x: 100, y: 290, w: 220, h: 22,
        html: '30 dias · 100% protegido', fontSize: 11,
        textAlign: 'center', color: '#64748b',
      },

      // Conteúdo direita
      {
        type: 'texto',
        x: 380, y: 100, w: 720, h: 24,
        html: 'COMPROMISSO COM VOCÊ',
        fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 380, y: 134, w: 720, h: 90,
        html: '<span style="color:#2563eb">Risco zero.</span> Resultados ou seu dinheiro de volta.',
        fontSize: 32, fontWeight: 800, color: '#0f172a',
        lineHeight: 1.2, fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 380, y: 244, w: 720, h: 70,
        html: 'Confiamos tanto no método que <strong>+5.000 empresas</strong> já testaram que damos garantia incondicional. Se em 30 dias você não ver resultados, devolvemos 100% do investimento.',
        fontSize: 15, color: '#475569', lineHeight: 1.6,
      },
      // Trust row
      {
        type: 'icone', iconId: 'check-circle',
        x: 380, y: 348, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 404, y: 346, w: 220, h: 22,
        html: '100% reembolsado', fontSize: 13, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 600, y: 348, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 624, y: 346, w: 220, h: 22,
        html: 'Em até 7 dias úteis', fontSize: 13, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 820, y: 348, w: 18, h: 18, color: '#16a34a',
      },
      { type: 'texto', x: 844, y: 346, w: 220, h: 22,
        html: 'Sem perguntas', fontSize: 13, color: '#475569', fontWeight: 600 },
    ],
  },
}

const garantiaChecklist: BlockTemplate = {
  id: 'garantia-checklist',
  label: 'Garantia + Checklist',
  category: 'Garantia',
  thumbnailKey: 'garantia-checklist',
  block: {
    height: 540,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f0fdf4' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'COMPRE SEM MEDO',
        fontSize: 13, fontWeight: 800, color: '#16a34a',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: '<span style="color:#16a34a">100% protegido</span> nos 30 primeiros dias',
        fontSize: 38, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      // Selo esquerda
      {
        type: 'circulo', x: 230, y: 220, w: 200, h: 200,
        bgColor: '#dcfce7',
        borders: { color: '#16a34a', width: 4,
          radius: r4(100), equalCorners: true },
        shadow: 'medium',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 230, y: 270, w: 200, h: 56,
        html: '30', fontSize: 64, fontWeight: 900, color: '#16a34a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 230, y: 336, w: 200, h: 22,
        html: 'DIAS DE GARANTIA', fontSize: 11, color: '#15803d',
        textAlign: 'center', fontWeight: 800, letterSpacing: 2,
      },
      // ── Lista de itens incluso à direita ──
      {
        type: 'texto',
        x: 480, y: 220, w: 600, h: 24,
        html: 'O QUE ESTÁ INCLUSO',
        fontSize: 12, fontWeight: 800, color: '#16a34a',
        letterSpacing: 2,
      },
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 254 + i * 50
        const items = [
          'Acesso vitalício a todo conteúdo',
          'Atualizações gratuitas pra sempre',
          'Suporte VIP por 12 meses',
          'Reembolso integral em até 30 dias',
        ]
        return [
          { type: 'circulo', x: 480, y, w: 32, h: 32,
            bgColor: '#dcfce7',
            borders: { color: '#16a34a', width: 1.5,
              radius: r4(16), equalCorners: true } },
          { type: 'icone', iconId: 'check',
            x: 488, y: y + 8, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: 528, y: y + 4, w: 560, h: 24,
            html: items[i], fontSize: 15, color: '#1e293b', fontWeight: 600 },
        ]
      }),
    ],
  },
}

const garantiaTripla: BlockTemplate = {
  id: 'garantia-tripla',
  label: 'Garantia Tripla',
  category: 'Garantia',
  thumbnailKey: 'garantia-tripla',
  block: {
    height: 540,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'PROTEÇÃO TRIPLA',
        fontSize: 13, fontWeight: 800, color: '#16a34a',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Sua tranquilidade em <span style="color:#16a34a">3 camadas</span>',
        fontSize: 40, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 28,
        html: 'Proteção completa em todas as etapas — do checkout ao suporte.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // ── 3 cards de garantia ──
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const cardX = 100 + i * 340
        const data = [
          { num: '7',  label: 'DIAS', sub: 'Pra desistir',
            icon: 'clock' as const,
            desc: 'Não rolou em 7 dias? Cancela sem dor.',
            color: '#2563eb', bg: '#eff6ff' },
          { num: '30', label: 'DIAS', sub: 'Reembolso total',
            icon: 'shield' as const,
            desc: '100% do valor de volta sem perguntas.',
            color: '#16a34a', bg: '#dcfce7' },
          { num: '12', label: 'MESES', sub: 'Suporte VIP',
            icon: 'headset' as const,
            desc: 'Time humano disponível em 3 minutos.',
            color: '#f59e0b', bg: '#fffbeb' },
        ][i]
        return [
          // Card
          { type: 'caixa', x: cardX, y: 240, w: 320, h: 260,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          // Selo central
          { type: 'circulo',
            x: cardX + 110, y: 270, w: 100, h: 100,
            bgColor: data.bg,
            borders: { color: data.color, width: 3,
              radius: r4(50), equalCorners: true } },
          // Number gigante
          { type: 'titulo', headingLevel: 4,
            x: cardX + 110, y: 285, w: 100, h: 50,
            html: data.num, fontSize: 38, fontWeight: 900,
            color: data.color, textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          // Label DIAS/MESES
          { type: 'texto',
            x: cardX + 110, y: 332, w: 100, h: 16,
            html: data.label, fontSize: 9, color: data.color,
            textAlign: 'center', fontWeight: 800, letterSpacing: 2 },
          // Sub
          { type: 'titulo', headingLevel: 3,
            x: cardX, y: 388, w: 320, h: 28,
            html: data.sub, fontSize: 18, fontWeight: 700,
            color: '#0f172a', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          // Descrição
          { type: 'texto',
            x: cardX + 24, y: 422, w: 272, h: 50,
            html: data.desc, fontSize: 13, color: '#64748b',
            textAlign: 'center', lineHeight: 1.5 },
        ]
      }),
    ],
  },
}

const garantiaStrip: BlockTemplate = {
  id: 'garantia-strip',
  label: 'Garantia Strip Compacta',
  category: 'Garantia',
  thumbnailKey: 'garantia-strip',
  block: {
    height: 180,
    bgGradient: { type: 'linear', angle: 90,
      stops: [{ color: '#f0fdf4' }, { color: '#dcfce7' }, { color: '#f0fdf4' }] },
    elements: [
      // Card branco horizontal lifted
      { type: 'caixa', x: 100, y: 30, w: 1000, h: 120,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true,
          color: '#bbf7d0', width: 1 },
        shadow: 'hard' },
      // Faixa verde acento esquerda
      { type: 'caixa', x: 100, y: 30, w: 4, h: 120,
        bgColor: '#16a34a',
        borders: { radius: [16, 0, 0, 16], equalCorners: false } },

      // Selo escudo (esquerda)
      { type: 'circulo', x: 136, y: 56, w: 68, h: 68,
        bgColor: '#dcfce7',
        borders: { color: '#86efac', width: 2,
          radius: r4(34), equalCorners: true },
        shadow: 'soft' },
      { type: 'icone', iconId: 'shield-check',
        x: 154, y: 74, w: 32, h: 32, color: '#16a34a' },

      // Eyebrow chip (acima do título)
      { type: 'caixa', x: 226, y: 50, w: 110, h: 22,
        bgColor: '#dcfce7',
        borders: { radius: r4(999), equalCorners: true } },
      { type: 'texto', x: 226, y: 54, w: 110, h: 16,
        html: 'GARANTIA · 30 DIAS', fontSize: 10, fontWeight: 800,
        color: '#15803d', textAlign: 'center', letterSpacing: 1.5 },

      // Title com gradient text
      { type: 'titulo', headingLevel: 4,
        x: 226, y: 78, w: 540, h: 28,
        html: 'Compre sem medo — <span style="background:linear-gradient(90deg,#16a34a,#10b981);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;font-weight:900">100% do valor de volta</span>',
        fontSize: 18, fontWeight: 700, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans' },

      // Sub + micro proof
      { type: 'texto',
        x: 226, y: 110, w: 540, h: 22,
        html: 'Sem burocracia, sem perguntas. <strong style="color:#15803d">+12.452 clientes ativos.</strong>',
        fontSize: 13, color: '#64748b' },

      // Trust signals à direita (3 chips)
      { type: 'icone', iconId: 'check-circle',
        x: 800, y: 64, w: 16, h: 16, color: '#16a34a' },
      { type: 'texto', x: 822, y: 62, w: 200, h: 20,
        html: '100% reembolso', fontSize: 12, color: '#0f172a', fontWeight: 600 },

      { type: 'icone', iconId: 'check-circle',
        x: 800, y: 88, w: 16, h: 16, color: '#16a34a' },
      { type: 'texto', x: 822, y: 86, w: 200, h: 20,
        html: 'Sem perguntas', fontSize: 12, color: '#0f172a', fontWeight: 600 },

      { type: 'icone', iconId: 'lock',
        x: 800, y: 112, w: 16, h: 16, color: '#16a34a' },
      { type: 'texto', x: 822, y: 110, w: 200, h: 20,
        html: 'SSL · Pagamento seguro', fontSize: 12, color: '#0f172a', fontWeight: 600 },
    ],
  },
}

const garantiaPremium: BlockTemplate = {
  id: 'garantia-premium',
  label: 'Garantia Premium',
  category: 'Garantia',
  thumbnailKey: 'garantia-premium',
  block: {
    height: 580,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto',
        x: 200, y: 70, w: 800, h: 24,
        html: 'GARANTIA HIGH-TICKET',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3,
      },
      // Selo dourado grande premium
      {
        type: 'circulo',
        x: 510, y: 110, w: 180, h: 180,
        bgColor: '#1e293b',
        borders: { color: '#fbbf24', width: 5,
          radius: r4(90), equalCorners: true },
        shadow: 'hard',
      },
      // Anel decorativo extra
      {
        type: 'circulo',
        x: 500, y: 100, w: 200, h: 200,
        bgColor: 'transparent',
        borders: { color: 'rgba(251,191,36,0.25)', width: 1,
          radius: r4(100), equalCorners: true },
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 510, y: 145, w: 180, h: 60,
        html: '30', fontSize: 64, fontWeight: 900, color: '#fbbf24',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 510, y: 210, w: 180, h: 22,
        html: 'DIAS DE GARANTIA', fontSize: 11, color: '#fbbf24',
        textAlign: 'center', fontWeight: 800, letterSpacing: 2,
      },
      // Estrelas decorativas embaixo do selo
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 538 + i * 24, y: 246, w: 16, h: 16, color: '#fbbf24',
      })),
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 332, w: 1000, h: 50,
        html: 'Você está <span style="color:#fbbf24">100% protegido</span>',
        fontSize: 36, fontWeight: 800, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 392, w: 700, h: 60,
        html: 'Se em 30 dias você não ver os resultados que prometemos, devolvemos <strong style="color:#fbbf24">integralmente</strong> seu investimento. Sem perguntas, sem burocracia, sem pegadinha.',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.7,
      },
      // Trust signals row premium
      {
        type: 'icone', iconId: 'check-circle',
        x: 320, y: 488, w: 18, h: 18, color: '#fbbf24',
      },
      { type: 'texto', x: 344, y: 486, w: 220, h: 22,
        html: '100% do valor', fontSize: 13, color: '#cbd5e1', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 530, y: 488, w: 18, h: 18, color: '#fbbf24',
      },
      { type: 'texto', x: 554, y: 486, w: 220, h: 22,
        html: 'Reembolso em 7 dias', fontSize: 13, color: '#cbd5e1', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 760, y: 488, w: 18, h: 18, color: '#fbbf24',
      },
      { type: 'texto', x: 784, y: 486, w: 220, h: 22,
        html: 'Sem letras miúdas', fontSize: 13, color: '#cbd5e1', fontWeight: 600 },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// VÍDEO
// ─────────────────────────────────────────────────────────────────────────────

const videoCentral: BlockTemplate = {
  id: 'video-central',
  label: 'Vídeo Central',
  category: 'Vídeo',
  thumbnailKey: 'video-youtube',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto',
        x: 200, y: 70, w: 800, h: 24,
        html: '⏱ 3 MINUTOS · ASSISTA AGORA',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 70,
        html: 'Veja <span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">como funciona</span> em 3 minutos',
        fontSize: 44, fontWeight: 800, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      // Subheadline
      {
        type: 'texto',
        x: 250, y: 195, w: 700, h: 30,
        html: 'Walk-through completo do método. Sem fluff, só o que importa.',
        fontSize: 16, color: '#cbd5e1', textAlign: 'center',
      },
      // Card decorativo offset (lifted)
      {
        type: 'caixa',
        x: 220, y: 270, w: 760, h: 380,
        bgColor: 'rgba(124,58,237,0.18)',
        borders: { radius: r4(20), equalCorners: true },
      },
      // Video
      {
        type: 'video',
        x: 200, y: 250, w: 800, h: 380,
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        borders: { radius: r4(20), equalCorners: true },
      },
      // Trust signals abaixo do video
      {
        type: 'texto',
        x: 200, y: 660, w: 800, h: 22,
        html: '✓ +5.000 visualizações · ⭐ <strong style="color:#fbbf24">4.9/5</strong> de quem assistiu · ✓ Sem cadastro',
        fontSize: 13, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────────────────────

const faqLista: BlockTemplate = {
  id: 'faq-lista',
  label: 'FAQ Lista',
  category: 'FAQ',
  thumbnailKey: 'faq',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'TIRAMOS SUAS DÚVIDAS',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Perguntas <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">frequentes</span>',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Não achou sua resposta? Mande pra <strong style="color:#2563eb">contato@empresa.com</strong> — respondemos em 1h.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // ─── FAQ REAL — UM elemento com items[]. Renderiza como
      // <details>/<summary> nativo (browser cuida do open/close, sem JS).
      // Adicionar/remover perguntas é via botão no painel direito.
      {
        type: 'faq',
        x: 200, y: 230, w: 800, h: 380,
        items: [
          { id: 'q1', q: 'Por quanto tempo terei acesso ao conteúdo?',
            a: 'Acesso vitalício. Você pode revisar quando quiser, sem prazos.',
            open: true },
          { id: 'q2', q: 'Existe garantia se eu não gostar?',
            a: 'Sim. Garantia incondicional de 30 dias com 100% de reembolso.' },
          { id: 'q3', q: 'Como recebo o material após a compra?',
            a: 'Acesso imediato no seu email. Login pra plataforma em segundos.' },
          { id: 'q4', q: 'Tem suporte se eu travar em alguma coisa?',
            a: 'Suporte ilimitado por email + grupo VIP de alunos no Discord.' },
        ],
        itemBgColor: '#ffffff',
        itemBorderColor: '#e2e8f0',
        itemBorderRadius: 14,
        accentColor: '#2563eb',
        accentWidth: 4,
        qColor: '#0f172a',
        qFontSize: 16,
        qFontWeight: 700,
        qFontFamily: 'Plus Jakarta Sans',
        qHeadingLevel: 3,
        aColor: '#64748b',
        aFontSize: 14,
        aLineHeight: 1.6,
        iconColor: '#2563eb',
        iconStyle: 'plus',
        itemSpacing: 12,
        itemPaddingX: 24,
        itemPaddingY: 18,
        allowMultipleOpen: false,
      },
      // CTA bottom: "Ainda com dúvida?"
      {
        type: 'texto',
        x: 200, y: 640, w: 800, h: 24,
        html: 'Ainda com dúvidas? <strong style="color:#2563eb">Fale com nosso time →</strong>',
        fontSize: 14, color: '#475569', textAlign: 'center',
      },
    ],
  },
}

const faqDuasColunas: BlockTemplate = {
  id: 'faq-2-colunas',
  label: 'FAQ Duas Colunas',
  category: 'FAQ',
  thumbnailKey: 'faq-2-colunas',
  block: {
    height: 660,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#ffffff' }] },
    elements: [
      // Header
      {
        type: 'texto',
        x: 200, y: 70, w: 800, h: 24,
        html: 'TIRAMOS SUAS DÚVIDAS',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Perguntas <span style="color:#2563eb">frequentes</span>',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: '6 dúvidas mais comuns. Resposta direta, sem rodeio.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // ─── FAQ REAL — single element. Em desktop ocupa toda a largura,
      // pode ser estilizado como 2 colunas via CSS responsive futuramente.
      // Por enquanto apresenta como lista vertical com accordion.
      {
        type: 'faq',
        x: 100, y: 230, w: 1000, h: 360,
        items: [
          { id: 'q1', q: 'É online ou presencial?',
            a: '100% online. Acesse de qualquer lugar, no seu ritmo.', open: true },
          { id: 'q2', q: 'Em quanto tempo vejo resultado?',
            a: 'A maioria dos alunos vê resultado nos primeiros 30 dias.' },
          { id: 'q3', q: 'Funciona pra iniciantes?',
            a: 'Sim. Método pensado pra qualquer nível, do zero ao avançado.' },
          { id: 'q4', q: 'Posso parcelar?',
            a: 'Sim. Até 12× no cartão sem juros. Pix com 10% off.' },
          { id: 'q5', q: 'Tem certificado?',
            a: 'Sim. Certificado oficial reconhecido na conclusão dos módulos.' },
          { id: 'q6', q: 'E se eu não gostar?',
            a: 'Devolução total em 30 dias. Sem perguntas, sem burocracia.' },
        ],
        itemBgColor: '#ffffff',
        itemBorderColor: '#e2e8f0',
        itemBorderRadius: 14,
        accentColor: '#2563eb',
        accentWidth: 0,  // sem accent — visual mais clean
        qColor: '#0f172a',
        qFontSize: 15,
        qFontWeight: 700,
        qFontFamily: 'Plus Jakarta Sans',
        qHeadingLevel: 3,
        aColor: '#64748b',
        aFontSize: 13,
        aLineHeight: 1.5,
        iconColor: '#2563eb',
        iconStyle: 'plus',
        itemSpacing: 10,
        itemPaddingX: 24,
        itemPaddingY: 16,
        allowMultipleOpen: true,
      },
      // Trust line
      {
        type: 'texto',
        x: 200, y: 612, w: 800, h: 22,
        html: 'Resposta média do nosso time: <strong style="color:#16a34a">3 minutos</strong>',
        fontSize: 13, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// RODAPÉ
// ─────────────────────────────────────────────────────────────────────────────

const rodapeSimples: BlockTemplate = {
  id: 'rodape-simples',
  label: 'Rodapé Simples',
  category: 'Rodapé',
  thumbnailKey: 'rodape',
  block: {
    height: 320,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#0b1220' }, { color: '#0f172a' }, { color: '#1e1b4b' }] },
    elements: [
      // Linha sutil amber no topo (acento)
      { type: 'caixa', x: 0, y: 0, w: 1200, h: 1,
        bgColor: 'rgba(251,191,36,0.3)' },

      // Eyebrow (ultra discreto)
      { type: 'texto',
        x: 200, y: 50, w: 800, h: 18,
        html: 'OBRIGADO POR ESTAR AQUI',
        fontSize: 10, fontWeight: 700, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3 },

      // Logo / nome marca com gradient text
      { type: 'titulo', headingLevel: 4,
        x: 200, y: 78, w: 800, h: 44,
        html: 'Sua<span style="background:linear-gradient(90deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">Marca</span>',
        fontSize: 36, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },

      // Tagline elegante
      { type: 'texto',
        x: 200, y: 130, w: 800, h: 22,
        html: 'A plataforma mais completa pra landing pages que <strong style="color:#fbbf24">convertem de verdade</strong>.',
        fontSize: 14, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5 },

      // Social icons row (centralizada)
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const icons = ['briefcase', 'mail', 'globe', 'message-circle'] as const
        const x = 506 + i * 48
        return [
          { type: 'circulo', x, y: 170, w: 38, h: 38,
            bgColor: 'rgba(255,255,255,0.04)',
            borders: { color: 'rgba(255,255,255,0.12)', width: 1,
              radius: r4(19), equalCorners: true } },
          { type: 'icone', iconId: icons[i],
            x: x + 11, y: 181, w: 16, h: 16, color: '#cbd5e1' },
        ]
      }),

      // Contact info inline com chips
      { type: 'caixa', x: 320, y: 226, w: 240, h: 30,
        bgColor: 'rgba(255,255,255,0.04)',
        borders: { color: 'rgba(255,255,255,0.10)', width: 1,
          radius: r4(999), equalCorners: true } },
      { type: 'icone', iconId: 'mail',
        x: 336, y: 233, w: 14, h: 14, color: '#fbbf24' },
      { type: 'texto', x: 358, y: 233, w: 200, h: 18,
        html: '<strong style="color:#ffffff">contato@suamarca.com</strong>',
        fontSize: 12, color: '#cbd5e1' },

      { type: 'caixa', x: 580, y: 226, w: 220, h: 30,
        bgColor: 'rgba(255,255,255,0.04)',
        borders: { color: 'rgba(255,255,255,0.10)', width: 1,
          radius: r4(999), equalCorners: true } },
      { type: 'icone', iconId: 'phone',
        x: 596, y: 233, w: 14, h: 14, color: '#fbbf24' },
      { type: 'texto', x: 618, y: 233, w: 180, h: 18,
        html: '<strong style="color:#ffffff">(11) 99999-9999</strong>',
        fontSize: 12, color: '#cbd5e1' },

      { type: 'caixa', x: 820, y: 226, w: 60, h: 30,
        bgColor: 'rgba(34,197,94,0.10)',
        borders: { color: 'rgba(34,197,94,0.3)', width: 1,
          radius: r4(999), equalCorners: true } },
      { type: 'icone', iconId: 'shield-check',
        x: 832, y: 233, w: 12, h: 12, color: '#34d399' },
      { type: 'texto', x: 846, y: 234, w: 30, h: 16,
        html: 'LGPD',
        fontSize: 9, color: '#34d399', fontWeight: 800, letterSpacing: 0.5 },

      // Linha separadora
      { type: 'caixa', x: 200, y: 274, w: 800, h: 1,
        bgColor: 'rgba(255,255,255,0.08)' },

      // Copyright + links
      { type: 'texto',
        x: 200, y: 286, w: 800, h: 22,
        html: '© 2026 SuaMarca · CNPJ 00.000.000/0001-00 · <strong style="color:#cbd5e1">Privacidade</strong> · <strong style="color:#cbd5e1">Termos</strong> · Feito com ❤️ no Brasil',
        fontSize: 11, color: '#64748b', textAlign: 'center' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANOS
// ─────────────────────────────────────────────────────────────────────────────

const planoUnico: BlockTemplate = {
  id: 'plano-unico',
  label: 'Plano Único',
  category: 'Planos',
  thumbnailKey: 'planos-simples',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'OFERTA ÚNICA · 1 PAGAMENTO',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Tudo que você precisa por <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">um valor</span>',
        fontSize: 38, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Sem mensalidade. Sem upsell. Sem letra miúda.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // Card decorativo offset (lifted)
      {
        type: 'caixa',
        x: 380, y: 250, w: 480, h: 420,
        bgColor: 'rgba(37,99,235,0.10)',
        borders: { radius: r4(24), equalCorners: true },
      },
      // Card principal
      {
        type: 'caixa',
        x: 360, y: 230, w: 480, h: 420,
        bgColor: '#ffffff',
        borders: { radius: r4(24), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
      },
      // Badge "MAIS VALOR" topo do card
      {
        type: 'caixa',
        x: 530, y: 210, w: 140, h: 36,
        bgColor: '#fbbf24',
        borders: { radius: r4(999), equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'texto', x: 530, y: 219, w: 140, h: 20,
        html: '⭐ MAIS VALOR', fontSize: 11, fontWeight: 800,
        color: '#7c2d12', textAlign: 'center', letterSpacing: 2,
      },
      // Eyebrow do card
      {
        type: 'texto',
        x: 360, y: 270, w: 480, h: 22,
        html: 'PLANO COMPLETO',
        fontSize: 12, color: '#2563eb', textAlign: 'center',
        fontWeight: 800, letterSpacing: 3,
      },
      // Title
      {
        type: 'titulo', headingLevel: 3,
        x: 360, y: 300, w: 480, h: 36,
        html: 'Acesso Total Vitalício',
        fontSize: 26, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Preço de/por
      {
        type: 'texto',
        x: 360, y: 348, w: 480, h: 24,
        html: '<s style="color:#94a3b8">De R$ 297</s> · à vista no Pix',
        fontSize: 13, color: '#64748b', textAlign: 'center',
      },
      // Preço gigante
      {
        type: 'titulo', headingLevel: 4,
        x: 360, y: 380, w: 480, h: 80,
        html: 'R$ <span style="font-size:80px;background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">97</span>',
        fontSize: 28, color: '#0f172a', textAlign: 'center', fontWeight: 900,
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 360, y: 462, w: 480, h: 22,
        html: 'ou 12× de R$ 9,70 sem juros',
        fontSize: 13, color: '#64748b', textAlign: 'center',
      },
      // Lista de benefícios com checks
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 502 + i * 26
        const items = [
          'Acesso vitalício a todo conteúdo',
          'Atualizações futuras grátis',
          'Suporte VIP por 12 meses',
          'Garantia incondicional 30 dias',
        ]
        return [
          { type: 'icone', iconId: 'check-circle',
            x: 410, y, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: 432, y: y - 1, w: 380, h: 20,
            html: items[i], fontSize: 13, color: '#1e293b', fontWeight: 600 },
        ]
      }),
      // CTA gigante
      {
        type: 'botao',
        x: 410, y: 626, w: 380, h: 60,
        text: 'QUERO COMEÇAR AGORA →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 16, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — Hero Captura (com formulário inline)
// ─────────────────────────────────────────────────────────────────────────────

const heroCaptura: BlockTemplate = {
  id: 'hero-captura',
  label: 'Hero com Captura',
  category: 'Hero',
  thumbnailKey: 'hero-captura',
  block: {
    height: 620,
    bgColor: '#1a2e5a',
    elements: [
      {
        type: 'texto',
        x: 80, y: 90, w: 540, h: 28,
        html: 'EBOOK GRATUITO', fontSize: 13, fontWeight: 700,
        color: '#fbbf24', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: 80, y: 130, w: 540, h: 130,
        html: 'O Guia Definitivo para Vender Mais Online',
        fontSize: 44, fontWeight: 800, color: '#ffffff', lineHeight: 1.15,
      },
      {
        type: 'texto',
        x: 80, y: 280, w: 540, h: 80,
        html: 'Aprenda os 7 gatilhos que aumentaram a conversão dos meus clientes em até 312% sem precisar gastar mais com anúncios.',
        fontSize: 17, color: '#cbd5e1', lineHeight: 1.6,
      },
      {
        type: 'texto',
        x: 80, y: 380, w: 540, h: 24,
        html: '✓ Material em PDF · ✓ Bônus exclusivo · ✓ Acesso imediato',
        fontSize: 14, color: '#94a3b8',
      },
      // Card branco decorativo (atrás do form)
      {
        type: 'caixa',
        x: 680, y: 90, w: 440, h: 460,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      // Título dentro do card
      {
        type: 'titulo', headingLevel: 3,
        x: 700, y: 120, w: 400, h: 32,
        html: 'Receba agora mesmo',
        fontSize: 22, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: 700, y: 160, w: 400, h: 24,
        html: 'Preencha e baixe gratuitamente',
        fontSize: 14, color: '#64748b', textAlign: 'center',
      },
      // ─── Formulário REAL (transparente — usa o card branco decorativo) ───
      // Submit posta em /api/leads. Recomendado configurar redirectUrl pra
      // link direto do PDF no painel "Após envio".
      {
        type: 'formulario',
        x: 700, y: 200, w: 400, h: 320,
        bgColor: 'transparent',
        fields: [
          { id: 'nm', kind: 'texto-curto', name: 'name',
            label: '', placeholder: 'Seu nome', required: true },
          { id: 'em', kind: 'email', name: 'email',
            label: '', placeholder: 'Seu melhor email', required: true },
        ],
        submitText: 'BAIXAR EBOOK GRÁTIS →',
        submitBg: '#2563eb',
        submitColor: '#ffffff',
        submitRadius: 10,
        successMessage: '✓ Pronto! Confira seu email — o ebook chegou.',
        inputBg: '#f8fafc',
        inputColor: '#0f172a',
        inputBorderColor: '#e2e8f0',
        inputRadius: 10,
        fieldGap: 14,
      },
      {
        type: 'texto',
        x: 700, y: 530, w: 400, h: 22,
        html: '🔒 Seus dados estão protegidos. Sem spam.',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// BENEFÍCIOS — Dark com Cards e Horizontal
// ─────────────────────────────────────────────────────────────────────────────

const beneficiosDark: BlockTemplate = {
  id: 'beneficios-dark',
  label: 'Benefícios Cards Dark',
  category: 'Benefícios',
  thumbnailKey: 'beneficios-dark',
  block: {
    height: 600,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }] },
    elements: [
      {
        type: 'texto',
        x: 200, y: 60, w: 800, h: 24,
        html: 'POR QUE ESCOLHER NOSSA SOLUÇÃO',
        fontSize: 13, fontWeight: 800, color: '#60a5fa',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 60,
        html: 'Recursos pensados pra você crescer',
        fontSize: 40, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 168, w: 700, h: 30,
        html: 'Tudo que sua operação precisa, integrado em uma só plataforma.',
        fontSize: 16, color: '#94a3b8', textAlign: 'center',
      },
      // ── 4 cards dark com STATS prominentes ──
      // Layout: 4 cards 240w + 3 gaps 20px = 1020 totais. Margem lateral 90px.
      // Card N: x = 90 + N * 260
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 90 + i * 260
        const data = [
          { stat: '12ms',     statLabel: 'tempo médio',   icon: 'zap' as const,
            title: 'Performance',
            desc: 'Resposta em milissegundos. Sua landing carrega instantânea em qualquer dispositivo.' },
          { stat: '256-bit',  statLabel: 'criptografia',  icon: 'lock' as const,
            title: 'Segurança',
            desc: 'Ponta-a-ponta + SSL gratuito + LGPD nativo. Seus leads sempre protegidos.' },
          { stat: '∞',        statLabel: 'sem limite',    icon: 'trending-up' as const,
            title: 'Escalável',
            desc: 'Mesma estrutura roda 100 ou 100.000 visitas. Não trava, não cai do ar.' },
          { stat: '3min',     statLabel: 'resposta',      icon: 'message-circle' as const,
            title: 'Suporte humano',
            desc: 'Time humano disponível sempre. Resposta média em até 3 minutos no chat ao vivo.' },
        ][i]
        return [
          // Card com border subtil + glow azul-translucent
          { type: 'caixa', x, y: 230, w: 240, h: 320,
            bgColor: 'rgba(30,41,59,0.7)',
            borders: { radius: r4(16), equalCorners: true,
              color: 'rgba(96,165,250,0.2)', width: 1 },
            shadow: 'medium' },
          // STAT GRANDE no topo (substitui bigger circle empty)
          { type: 'titulo', headingLevel: 3,
            x: x + 20, y: 254, w: 200, h: 56,
            html: data.stat, fontSize: 44, fontWeight: 900,
            color: '#60a5fa', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -2 },
          // Stat label
          { type: 'texto',
            x: x + 20, y: 314, w: 200, h: 18,
            html: data.statLabel, fontSize: 11, fontWeight: 700,
            color: '#475569', textAlign: 'center', letterSpacing: 2 },
          // Linha separadora subtil
          { type: 'caixa',
            x: x + 60, y: 346, w: 120, h: 1,
            bgColor: 'rgba(96,165,250,0.2)' },
          // Icon menor lado a lado com title (dupla)
          { type: 'circulo', x: x + 24, y: 366, w: 36, h: 36,
            bgColor: 'rgba(59,130,246,0.15)' },
          { type: 'icone', iconId: data.icon,
            x: x + 34, y: 376, w: 16, h: 16, color: '#60a5fa' },
          // Título ao lado do icon
          { type: 'titulo', headingLevel: 3,
            x: x + 70, y: 372, w: 150, h: 26,
            html: data.title, fontSize: 17, fontWeight: 700,
            color: '#ffffff', fontFamily: 'Plus Jakarta Sans' },
          // Descrição
          { type: 'texto',
            x: x + 24, y: 416, w: 192, h: 110,
            html: data.desc, fontSize: 13, color: '#94a3b8',
            textAlign: 'left', lineHeight: 1.6 },
        ]
      }),
    ],
  },
}

const beneficiosHorizontal: BlockTemplate = {
  id: 'beneficios-horizontal',
  label: 'Benefícios Horizontal',
  category: 'Benefícios',
  thumbnailKey: 'beneficios-horizontal',
  block: {
    height: 580,
    bgColor: '#ffffff',
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 100, y: 80, w: 320, h: 24,
        html: 'TUDO INTEGRADO', fontSize: 13, fontWeight: 800,
        color: '#2563eb', letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 110, w: 600, h: 110,
        html: 'A solução <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">tudo-em-um</span> que você precisava',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        lineHeight: 1.15, fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      // Subheadline
      {
        type: 'texto',
        x: 100, y: 230, w: 580, h: 50,
        html: 'Pare de juntar 7 ferramentas diferentes. Aqui você tem CRM, automação e analytics num só lugar.',
        fontSize: 17, color: '#475569', lineHeight: 1.5,
      },
      // ── 3 itens horizontais, cada um com SVG icon ──
      // Layout: y=320, 360, 400 (gap 40 entre items, h~50 cada)
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const y = 320 + i * 60
        const icons  = ['zap', 'target', 'rocket'] as const
        const colors = ['#2563eb', '#7c3aed', '#f59e0b']
        const bgs    = ['#eff6ff', '#f5f3ff', '#fffbeb']
        const titles = ['Resultados em dias',
                        'Estratégia personalizada',
                        'Sem complicação']
        const descs  = [
          'Sistema validado por +5.000 empresas brasileiras.',
          'Plano ajustado ao seu nicho específico.',
          'Comece em minutos, sem cartão de crédito.',
        ]
        return [
          { type: 'circulo', x: 100, y, w: 48, h: 48, bgColor: bgs[i] },
          { type: 'icone', iconId: icons[i],
            x: 112, y: y + 12, w: 24, h: 24, color: colors[i] },
          { type: 'titulo', headingLevel: 3,
            x: 168, y: y + 2, w: 480, h: 24,
            html: titles[i], fontSize: 17, fontWeight: 700,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: 168, y: y + 26, w: 480, h: 22,
            html: descs[i], fontSize: 14, color: '#64748b' },
        ]
      }),
      // CTA bottom
      {
        type: 'botao',
        x: 100, y: 510, w: 240, h: 52,
        text: 'Quero saber mais →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 15, fontWeight: 700, borderRadius: 10,
        shadow: 'soft',
      },
      // ── Imagem direita com card decorativo de fundo + stat flutuante ──
      // Card decorativo roxo translúcido atrás da imagem (efeito "lifted")
      {
        type: 'caixa', x: 760, y: 100, w: 360, h: 400,
        bgColor: 'rgba(124,58,237,0.12)',
        borders: { radius: r4(20), equalCorners: true },
      },
      {
        type: 'imagem',
        x: 740, y: 80, w: 360, h: 400,
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=720&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'hard',
      },
      // ── Card flutuante com stat sobrepondo a imagem ──
      {
        type: 'caixa', x: 680, y: 380, w: 220, h: 96,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
      },
      // Circle com check verde (sinal de "validado")
      {
        type: 'circulo', x: 700, y: 400, w: 56, h: 56,
        bgColor: '#dcfce7',
      },
      {
        type: 'icone', iconId: 'check-circle',
        x: 716, y: 416, w: 24, h: 24, color: '#16a34a',
      },
      // Stat
      {
        type: 'titulo', headingLevel: 4,
        x: 770, y: 396, w: 120, h: 30,
        html: '+5.000', fontSize: 22, fontWeight: 900,
        color: '#0f172a', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 770, y: 428, w: 120, h: 36,
        html: 'empresas<br>já confiam',
        fontSize: 11, color: '#64748b', lineHeight: 1.4,
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMULÁRIOS
// ─────────────────────────────────────────────────────────────────────────────

const formularioCaptura: BlockTemplate = {
  id: 'formulario-captura',
  label: 'Captura de Leads',
  category: 'Formulários',
  thumbnailKey: 'formulario-captura',
  block: {
    height: 600,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto',
        x: 200, y: 70, w: 800, h: 24,
        html: 'NEWSLETTER · SEMANAL',
        fontSize: 13, fontWeight: 800, color: '#60a5fa',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline com gradient
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 80,
        html: 'Receba os melhores <span style="background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">conteúdos</span> no seu email',
        fontSize: 38, fontWeight: 800, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 205, w: 700, h: 50,
        html: 'Mais de <strong style="color:#fbbf24">50.000 profissionais</strong> já recebem nossas dicas toda semana.',
        fontSize: 16, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5,
      },
      // Avatares + rating row
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 470 + i * 22, y: 280, w: 32, h: 32,
        bgImage: `https://i.pravatar.cc/64?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#0f172a', width: 2,
          radius: r4(16), equalCorners: true },
      })),
      { type: 'texto', x: 600, y: 286, w: 280, h: 22,
        html: '<span style="color:#fbbf24">★★★★★</span> &nbsp;5.000+ avaliações 5★',
        fontSize: 12, color: '#cbd5e1' },
      // ─── Formulário REAL (gera <form data-lp-form="1"> no HTML) ───
      // Runtime em [slug]/page.tsx escuta submit, lê inputs com `name`, e
      // posta em /api/leads. Campo `email` vai pra coluna leads.email.
      {
        type: 'formulario',
        x: 300, y: 330, w: 600, h: 92,
        bgColor: '#ffffff',
        borders: { radius: r4(14), equalCorners: true,
          color: 'rgba(96,165,250,0.3)', width: 1 },
        shadow: 'hard',
        fields: [
          {
            id: 'email-1',
            kind: 'email',
            name: 'email',
            placeholder: 'Seu melhor email',
            required: true,
          },
        ],
        submitText: 'CADASTRAR →',
        submitBg: '#2563eb',
        submitColor: '#ffffff',
        submitRadius: 10,
        successMessage: '✓ Pronto! Você está inscrito.',
        inputBg: '#ffffff',
        inputColor: '#0f172a',
        inputBorderColor: '#e2e8f0',
        inputRadius: 10,
        fieldGap: 10,
      },
      // Trust signals embaixo
      {
        type: 'icone', iconId: 'lock',
        x: 360, y: 432, w: 16, h: 16, color: '#86efac',
      },
      { type: 'texto', x: 382, y: 430, w: 200, h: 22,
        html: 'Dados protegidos', fontSize: 12, color: '#94a3b8' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 552, y: 432, w: 16, h: 16, color: '#86efac',
      },
      { type: 'texto', x: 574, y: 430, w: 160, h: 22,
        html: 'Sem spam', fontSize: 12, color: '#94a3b8' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 700, y: 432, w: 16, h: 16, color: '#86efac',
      },
      { type: 'texto', x: 722, y: 430, w: 200, h: 22,
        html: 'Cancele quando quiser', fontSize: 12, color: '#94a3b8' },
    ],
  },
}

const formularioClaro: BlockTemplate = {
  id: 'formulario-claro',
  label: 'Cadastro Centralizado',
  category: 'Formulários',
  thumbnailKey: 'formulario-claro',
  block: {
    height: 740,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'COMECE EM 60 SEGUNDOS',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Vamos <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">começar</span>',
        fontSize: 44, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Preencha. Nossa equipe responde em <strong style="color:#16a34a">menos de 1h</strong> em dia útil.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // Card decorativo offset (atrás)
      {
        type: 'caixa',
        x: 340, y: 240, w: 560, h: 460,
        bgColor: 'rgba(37,99,235,0.10)',
        borders: { radius: r4(20), equalCorners: true },
      },
      // ─── Formulário REAL com 3 campos (nome + email + telefone) ───
      // Submit posta em /api/leads. Nome especial 'phone' vai pra coluna
      // dedicada da tabela leads.
      {
        type: 'formulario',
        x: 320, y: 220, w: 560, h: 460,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
        fields: [
          { id: 'nm', kind: 'texto-curto', name: 'name',
            label: 'Nome completo', placeholder: 'João Silva', required: true },
          { id: 'em', kind: 'email', name: 'email',
            label: 'Email profissional', placeholder: 'joao@empresa.com', required: true },
          { id: 'ph', kind: 'telefone', name: 'phone',
            label: 'Telefone / WhatsApp', placeholder: '(11) 99999-9999',
            mask: 'phone-br' },
        ],
        submitText: 'QUERO MINHA DEMO →',
        submitBg: '#2563eb',
        submitColor: '#ffffff',
        submitRadius: 12,
        successMessage: '✓ Recebido! Em breve nossa equipe entra em contato.',
        inputBg: '#f8fafc',
        inputColor: '#0f172a',
        inputBorderColor: '#e2e8f0',
        inputRadius: 10,
        fieldGap: 14,
      },
      {
        type: 'texto', x: 360, y: 690, w: 480, h: 20,
        html: '🔒 Dados criptografados · LGPD compliant',
        fontSize: 11, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

const formularioContato: BlockTemplate = {
  id: 'formulario-contato',
  label: 'Contato com Info',
  category: 'Formulários',
  thumbnailKey: 'formulario-contato',
  block: {
    height: 660,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Coluna esquerda: header + info de contato
      {
        type: 'texto', x: 100, y: 80, w: 480, h: 24,
        html: 'FALE COM A GENTE',
        fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 110, w: 480, h: 100,
        html: 'Vamos <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">conversar</span>',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 100, y: 220, w: 480, h: 60,
        html: 'Dúvidas ou quer uma demo? <strong style="color:#16a34a">Resposta em até 1h</strong> em horário comercial.',
        fontSize: 16, color: '#475569', lineHeight: 1.6,
      },
      // Info de contato com SVG icons (era emoji)
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const y = 320 + i * 76
        const data = [
          { icon: 'mail' as const,           title: 'EMAIL',     val: 'contato@empresa.com' },
          { icon: 'phone' as const,          title: 'TELEFONE',  val: '(11) 4444-5555' },
          { icon: 'globe' as const,          title: 'ENDEREÇO',  val: 'Av. Paulista, 1000 - SP' },
        ][i]
        return [
          { type: 'circulo', x: 100, y, w: 48, h: 48,
            bgColor: '#eff6ff',
            borders: { color: '#dbeafe', width: 1.5,
              radius: r4(24), equalCorners: true } },
          { type: 'icone', iconId: data.icon,
            x: 112, y: y + 12, w: 24, h: 24, color: '#2563eb' },
          { type: 'titulo', headingLevel: 4,
            x: 168, y: y + 2, w: 360, h: 22,
            html: data.title, fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 2 },
          { type: 'texto',
            x: 168, y: y + 24, w: 360, h: 24,
            html: data.val, fontSize: 16, color: '#0f172a', fontWeight: 700 },
        ]
      }),
      // Trust line embaixo info
      {
        type: 'texto',
        x: 100, y: 580, w: 480, h: 22,
        html: '⏱ Tempo médio de resposta: <strong style="color:#16a34a">3 minutos</strong>',
        fontSize: 13, color: '#64748b',
      },

      // Card decorativo offset (atrás)
      {
        type: 'caixa',
        x: 680, y: 100, w: 440, h: 480,
        bgColor: 'rgba(37,99,235,0.10)',
        borders: { radius: r4(20), equalCorners: true },
      },
      // ─── Formulário REAL com 3 campos (nome + email + mensagem) ───
      {
        type: 'formulario',
        x: 660, y: 80, w: 440, h: 480,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
        fields: [
          { id: 'nm', kind: 'texto-curto', name: 'name',
            label: 'Nome', placeholder: 'João Silva', required: true },
          { id: 'em', kind: 'email', name: 'email',
            label: 'Email', placeholder: 'joao@empresa.com', required: true },
          { id: 'msg', kind: 'texto-longo', name: 'mensagem',
            label: 'Sua mensagem',
            placeholder: 'Conta um pouco sobre o que você precisa...',
            required: true },
        ],
        submitText: 'ENVIAR MENSAGEM →',
        submitBg: '#2563eb',
        submitColor: '#ffffff',
        submitRadius: 10,
        successMessage: '✓ Mensagem enviada! Responderemos em breve.',
        inputBg: '#f8fafc',
        inputColor: '#0f172a',
        inputBorderColor: '#e2e8f0',
        inputRadius: 10,
        fieldGap: 14,
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTATÍSTICAS
// ─────────────────────────────────────────────────────────────────────────────

const estatisticas4Col: BlockTemplate = {
  id: 'estatisticas-4col',
  label: 'Números 4 Colunas',
  category: 'Estatísticas',
  thumbnailKey: 'estatisticas-3col',
  block: {
    height: 460,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#eff6ff' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'CRESCEMOS QUEM CRESCE COM A GENTE',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Números que <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">falam por nós</span>',
        fontSize: 40, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Métricas reais de Janeiro/2024 a hoje. Nada de marketing inflado.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // ── 4 stats em cards minimalistas ──
      // Layout: 4 cards 240w + 3 gaps 16px = 1008. Margem 96 lateral.
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 96 + i * 256
        const data = [
          { num: '+5.000', delta: '+312% YoY',  label: 'Clientes ativos' },
          { num: '98.7%',  delta: 'Top do setor', label: 'Satisfação NPS' },
          { num: '12',     delta: 'desde 2024',   label: 'Países atendidos' },
          { num: '< 3min', delta: 'Resposta média', label: 'Suporte humano' },
        ][i]
        return [
          // Card branco minimal com border esquerdo azul
          { type: 'caixa', x, y: 240, w: 240, h: 160,
            bgColor: '#ffffff',
            borders: { radius: r4(16), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          { type: 'caixa', x, y: 240, w: 4, h: 160,
            bgColor: '#2563eb',
            borders: { radius: [16, 0, 0, 16], equalCorners: false } },
          // Número grande — anima 0→valor ao entrar no viewport
          { type: 'titulo', headingLevel: 3,
            x: x + 24, y: 264, w: 200, h: 64,
            html: data.num, fontSize: 44, fontWeight: 900,
            color: '#2563eb', fontFamily: 'Plus Jakarta Sans',
            letterSpacing: -2,
            cssClass: 'lp-stat-counter' },
          // Delta verde
          { type: 'texto',
            x: x + 24, y: 326, w: 200, h: 22,
            html: `<strong style="color:#16a34a">↑ ${data.delta}</strong>`,
            fontSize: 12 },
          // Label
          { type: 'texto',
            x: x + 24, y: 354, w: 200, h: 22,
            html: data.label, fontSize: 13, color: '#64748b', fontWeight: 600 },
        ]
      }),
    ],
  },
}

const estatisticasDark: BlockTemplate = {
  id: 'estatisticas-dark',
  label: 'Números Dark',
  category: 'Estatísticas',
  thumbnailKey: 'estatisticas-dark',
  block: {
    height: 520,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto',
        x: 200, y: 70, w: 800, h: 24,
        html: 'NOSSOS RESULTADOS · 2024',
        fontSize: 13, fontWeight: 800, color: '#60a5fa',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'A escolha de quem busca <span style="color:#fbbf24">resultado real</span>',
        fontSize: 40, fontWeight: 800, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Cada número é uma família, um time, uma vida diferente.',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center',
      },
      // ── 3 stats em cards premium ──
      // Layout: 3 cards 320w + 2 gaps 30 = 1020. Margem 90.
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 90 + i * 350
        const data = [
          { num: 'R$ 12M', sub: 'EM VENDAS', desc: 'Geradas pelos clientes em 2024',
            icon: 'dollar' as const },
          { num: '98.7%',  sub: 'NPS',        desc: 'Taxa de satisfação medida trimestralmente',
            icon: 'star' as const },
          { num: '+250%',  sub: 'ROI MÉDIO',  desc: 'Aumento médio de retorno por cliente',
            icon: 'trending-up' as const },
        ][i]
        return [
          // Card escuro com border azul translúcido
          { type: 'caixa', x, y: 240, w: 320, h: 220,
            bgColor: 'rgba(30,41,59,0.7)',
            borders: { radius: r4(16), equalCorners: true,
              color: 'rgba(96,165,250,0.2)', width: 1 },
            shadow: 'medium' },
          // Icon circle top-left
          { type: 'circulo',
            x: x + 24, y: 264, w: 48, h: 48,
            bgColor: 'rgba(96,165,250,0.15)' },
          { type: 'icone', iconId: data.icon,
            x: x + 36, y: 276, w: 24, h: 24, color: '#60a5fa' },
          // Número grande — anima 0→valor ao entrar no viewport
          { type: 'titulo', headingLevel: 3,
            x: x + 24, y: 332, w: 280, h: 56,
            html: data.num, fontSize: 44, fontWeight: 900, color: '#60a5fa',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -2,
            cssClass: 'lp-stat-counter' },
          // Sub label
          { type: 'texto',
            x: x + 24, y: 388, w: 280, h: 18,
            html: data.sub, fontSize: 11, fontWeight: 800,
            color: '#fbbf24', letterSpacing: 2 },
          // Description
          { type: 'texto',
            x: x + 24, y: 412, w: 280, h: 36,
            html: data.desc, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMER (Urgência)
// ─────────────────────────────────────────────────────────────────────────────

const timerUrgencia: BlockTemplate = {
  id: 'timer-urgencia',
  label: 'Timer Urgência',
  category: 'Timer',
  thumbnailKey: 'timer-urgencia',
  block: {
    height: 600,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#7f1d1d' }, { color: '#b91c1c' }, { color: '#dc2626' }] },
    elements: [
      // Pill eyebrow com flame SVG — marca do timer (lp-timer)
      // Default: 24h a partir do 1º acesso do visitante (lp-timer-rel-24h).
      // Pra fixar data alvo, troque por: lp-timer-fixed-YYYYMMDD-HHmm
      {
        type: 'caixa', x: 460, y: 56, w: 280, h: 36,
        bgColor: 'rgba(0,0,0,0.25)',
        borders: { radius: r4(999), equalCorners: true,
          color: 'rgba(251,191,36,0.4)', width: 1 },
        cssClass: 'lp-timer lp-timer-rel-24h',
      },
      {
        type: 'icone', iconId: 'flame',
        x: 480, y: 65, w: 18, h: 18, color: '#fbbf24',
      },
      {
        type: 'texto', x: 506, y: 68, w: 220, h: 20,
        html: 'OFERTA TERMINA EM BREVE',
        fontSize: 11, fontWeight: 800, color: '#fef2f2',
        letterSpacing: 2.5,
      },

      // Headline grande
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 110, w: 1000, h: 60,
        html: 'Garanta com <span style="color:#fbbf24">50% OFF</span> antes que zere',
        fontSize: 42, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },

      // Subheadline
      {
        type: 'texto',
        x: 250, y: 178, w: 700, h: 28,
        html: 'Depois disso volta pra <strong>R$ 497</strong>. Sem extensão.',
        fontSize: 16, color: '#fee2e2', textAlign: 'center',
      },

      // ─── Timer REAL — UM elemento com config completa ───
      {
        type: 'timer',
        x: 200, y: 220, w: 800, h: 170,
        mode: 'relative',
        relativeMinutes: 1440, // 24h
        units: ['days', 'hours', 'minutes', 'seconds'],
        layout: 'cards',
        expiredAction: 'stay',
        boxBgColor: '#ffffff',
        boxBorderColor: 'transparent',
        boxBorderRadius: 18,
        boxShadow: 'hard',
        numberColor: '#dc2626',
        numberFontSize: 64,
        numberFontWeight: 900,
        numberFontFamily: 'Plus Jakarta Sans',
        labelColor: '#7f1d1d',
        labelFontSize: 11,
        unitSpacing: 40,
      },

      // Stat de "vagas restantes" pra reforçar urgência
      {
        type: 'caixa', x: 380, y: 410, w: 440, h: 44,
        bgColor: 'rgba(0,0,0,0.25)',
        borders: { radius: r4(999), equalCorners: true,
          color: 'rgba(251,191,36,0.4)', width: 1 },
      },
      {
        type: 'icone', iconId: 'flame',
        x: 408, y: 422, w: 20, h: 20, color: '#fbbf24',
      },
      {
        type: 'texto', x: 436, y: 422, w: 380, h: 22,
        html: '<strong style="color:#fbbf24">Apenas 47 vagas</strong> restantes deste lote',
        fontSize: 14, color: '#fef2f2', fontWeight: 600,
      },

      // CTA gigante
      {
        type: 'botao',
        x: 360, y: 478, w: 480, h: 64,
        text: 'GARANTIR MINHA VAGA AGORA →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 800, borderRadius: 14,
        shadow: 'hard',
      },

      // Trust footer
      {
        type: 'texto',
        x: 250, y: 558, w: 700, h: 22,
        html: '🔒 Compra 100% segura · ⭐ Garantia 30 dias · ⚡ Acesso imediato',
        fontSize: 12, color: '#fecaca', textAlign: 'center',
      },
    ],
  },
}

const timerSimples: BlockTemplate = {
  id: 'timer-simples',
  label: 'Timer Simples',
  category: 'Timer',
  thumbnailKey: 'timer-simples',
  block: {
    height: 460,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#eff6ff' }] },
    elements: [
      // Card decorativo offset
      {
        type: 'caixa', x: 260, y: 90, w: 680, h: 280,
        bgColor: 'rgba(37,99,235,0.10)',
        borders: { radius: r4(20), equalCorners: true },
      },
      // Card principal
      {
        type: 'caixa', x: 240, y: 70, w: 680, h: 280,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
      },
      // Faixa azul acento esquerda
      {
        type: 'caixa', x: 240, y: 70, w: 4, h: 280,
        bgColor: '#2563eb',
        borders: { radius: [20, 0, 0, 20], equalCorners: false },
      },

      // Clock icon + eyebrow inline
      {
        type: 'circulo', x: 280, y: 100, w: 44, h: 44,
        bgColor: '#eff6ff',
      },
      {
        type: 'icone', iconId: 'clock',
        x: 290, y: 110, w: 24, h: 24, color: '#2563eb',
      },
      // Eyebrow
      {
        type: 'texto', x: 340, y: 100, w: 280, h: 20,
        html: 'TEMPO LIMITADO', fontSize: 11, fontWeight: 800,
        color: '#2563eb', letterSpacing: 3,
      },
      {
        type: 'texto', x: 340, y: 122, w: 280, h: 20,
        html: 'Próximo lote: <strong>maio/2026</strong>',
        fontSize: 12, color: '#64748b',
      },

      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 280, y: 168, w: 600, h: 40,
        html: 'Apenas <span style="color:#2563eb">24h</span> pra garantir',
        fontSize: 28, fontWeight: 800, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -0.5,
      },

      // ─── Timer REAL (apenas HORAS/MIN/SEG) ───
      {
        type: 'timer',
        x: 280, y: 215, w: 290, h: 90,
        mode: 'relative',
        relativeMinutes: 1440,
        units: ['hours', 'minutes', 'seconds'], // sem dias
        layout: 'cards',
        expiredAction: 'stay',
        boxBgColor: '#f8fafc',
        boxBorderColor: '#dbeafe',
        boxBorderRadius: 12,
        numberColor: '#2563eb',
        numberFontSize: 36,
        numberFontWeight: 900,
        numberFontFamily: 'Plus Jakarta Sans',
        labelColor: '#64748b',
        labelFontSize: 9,
        unitSpacing: 12,
      },

      // CTA inline à direita
      {
        type: 'botao',
        x: 600, y: 232, w: 280, h: 60,
        text: 'Quero garantir →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 15, fontWeight: 700, borderRadius: 12,
        shadow: 'soft',
      },
      {
        type: 'texto', x: 600, y: 296, w: 280, h: 18,
        html: '🔒 Pagamento seguro · ⭐ Garantia 30 dias',
        fontSize: 11, color: '#94a3b8', textAlign: 'center',
      },

      // Trust line bottom
      {
        type: 'texto',
        x: 240, y: 380, w: 680, h: 22,
        html: '<strong style="color:#0f172a">+312 pessoas</strong> garantiram nas últimas 24h',
        fontSize: 13, color: '#64748b', textAlign: 'center',
      },
    ],
  },
}

const timerHeroOferta: BlockTemplate = {
  id: 'timer-hero-oferta',
  label: 'Timer Hero com Oferta',
  category: 'Timer',
  thumbnailKey: 'timer-hero',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow pill
      {
        type: 'caixa', x: 460, y: 60, w: 280, h: 36,
        bgColor: 'rgba(251,191,36,0.15)',
        borders: { radius: r4(999), equalCorners: true,
          color: 'rgba(251,191,36,0.4)', width: 1 },
      },
      {
        type: 'icone', iconId: 'flame',
        x: 482, y: 69, w: 18, h: 18, color: '#fbbf24',
      },
      {
        type: 'texto', x: 508, y: 71, w: 220, h: 22,
        html: 'PROMOÇÃO RELÂMPAGO',
        fontSize: 11, fontWeight: 800, color: '#fbbf24',
        letterSpacing: 3,
      },

      // Headline com gradient text
      {
        type: 'titulo', headingLevel: 1,
        x: 100, y: 116, w: 1000, h: 80,
        html: '<span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">50% OFF</span> expira em',
        fontSize: 56, fontWeight: 900, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans', letterSpacing: -2,
      },

      // ─── Timer REAL ───
      {
        type: 'timer',
        x: 200, y: 220, w: 800, h: 180,
        mode: 'relative',
        relativeMinutes: 1440,
        units: ['days', 'hours', 'minutes', 'seconds'],
        layout: 'cards',
        expiredAction: 'stay',
        boxBgColor: 'rgba(30,41,59,0.7)',
        boxBorderColor: 'rgba(251,191,36,0.4)',
        boxBorderRadius: 18,
        boxShadow: 'hard',
        numberColor: '#fbbf24',
        numberFontSize: 72,
        numberFontWeight: 900,
        numberFontFamily: 'Plus Jakarta Sans',
        labelColor: '#94a3b8',
        labelFontSize: 11,
        unitSpacing: 40,
      },

      // Preço de/por com gradient text
      {
        type: 'caixa', x: 360, y: 426, w: 480, h: 80,
        bgColor: 'rgba(0,0,0,0.3)',
        borders: { radius: r4(16), equalCorners: true,
          color: 'rgba(251,191,36,0.2)', width: 1 },
      },
      {
        type: 'texto',
        x: 360, y: 442, w: 240, h: 24,
        html: 'DE <s style="color:#94a3b8">R$ 497</s>',
        fontSize: 14, color: '#94a3b8', textAlign: 'center', fontWeight: 800, letterSpacing: 1,
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 360, y: 466, w: 240, h: 32,
        html: 'POR <strong style="color:#fbbf24">R$ 247</strong>',
        fontSize: 22, fontWeight: 900, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: 600, y: 442, w: 240, h: 24,
        html: 'OU EM ATÉ',
        fontSize: 14, color: '#94a3b8', textAlign: 'center', fontWeight: 800, letterSpacing: 1,
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 600, y: 466, w: 240, h: 32,
        html: '12× de <strong style="color:#fbbf24">R$ 24,70</strong>',
        fontSize: 22, fontWeight: 900, color: '#ffffff', textAlign: 'center',
      },

      // Subheadline
      {
        type: 'texto', x: 200, y: 530, w: 800, h: 28,
        html: '<strong style="color:#fbbf24">Atenção:</strong> depois deste timer, o preço volta ao valor cheio. Sem extensão.',
        fontSize: 14, color: '#cbd5e1', textAlign: 'center',
      },

      // CTA gigante
      {
        type: 'botao',
        x: 360, y: 580, w: 480, h: 64,
        text: 'QUERO O DESCONTO AGORA →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 800, borderRadius: 14,
        shadow: 'hard',
      },

      // Trust footer com 3 signals
      {
        type: 'texto', x: 200, y: 668, w: 800, h: 22,
        html: '🔒 Compra segura · ⭐ Garantia 30 dias · ⚡ Acesso imediato',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

const timerStripCompacto: BlockTemplate = {
  id: 'timer-strip',
  label: 'Timer Strip Compacto',
  category: 'Timer',
  thumbnailKey: 'timer-strip',
  block: {
    height: 120,
    bgGradient: { type: 'linear', angle: 90,
      stops: [{ color: '#0b1220' }, { color: '#1e1b4b' }, { color: '#7f1d1d' }, { color: '#0b1220' }] },
    elements: [
      // Linha amber no topo (acento de urgência)
      { type: 'caixa', x: 0, y: 0, w: 1200, h: 2,
        bgColor: '#fbbf24' },

      // Flame badge à esquerda (com ring decorativo)
      { type: 'circulo', x: 50, y: 30, w: 60, h: 60,
        bgColor: 'rgba(251,191,36,0.10)',
        borders: { color: 'rgba(251,191,36,0.3)', width: 1,
          radius: r4(30), equalCorners: true } },
      { type: 'circulo', x: 60, y: 40, w: 40, h: 40,
        bgColor: 'rgba(251,191,36,0.20)',
        borders: { color: 'rgba(251,191,36,0.5)', width: 1,
          radius: r4(20), equalCorners: true } },
      { type: 'icone', iconId: 'flame',
        x: 70, y: 50, w: 20, h: 20, color: '#fbbf24' },

      // Eyebrow chip
      { type: 'caixa', x: 130, y: 30, w: 140, h: 22,
        bgColor: 'rgba(251,191,36,0.18)',
        borders: { color: 'rgba(251,191,36,0.4)', width: 1,
          radius: r4(999), equalCorners: true } },
      { type: 'texto', x: 130, y: 34, w: 140, h: 16,
        html: '⚡ OFERTA RELÂMPAGO', fontSize: 9, fontWeight: 800,
        color: '#fbbf24', textAlign: 'center', letterSpacing: 1.5 },

      // Headline com gradient text
      { type: 'texto', x: 130, y: 56, w: 320, h: 24,
        html: 'Termina em <span style="background:linear-gradient(90deg,#fbbf24,#fb923c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;font-weight:900">50% OFF</span>',
        fontSize: 16, color: '#ffffff', fontWeight: 600 },

      // Sub
      { type: 'texto', x: 130, y: 84, w: 320, h: 18,
        html: 'Apenas <strong style="color:#fbbf24">47 vagas</strong> restantes',
        fontSize: 11, color: '#cbd5e1' },

      // ─── Timer REAL (layout strip compacto) ───
      {
        type: 'timer',
        x: 470, y: 24, w: 340, h: 72,
        mode: 'relative',
        relativeMinutes: 1440,
        units: ['days', 'hours', 'minutes', 'seconds'],
        layout: 'strip',
        expiredAction: 'stay',
        boxBgColor: '#0b1220',
        boxBorderColor: 'rgba(251,191,36,0.5)',
        boxBorderRadius: 10,
        boxShadow: 'soft',
        numberColor: '#fbbf24',
        numberFontSize: 28,
        numberFontWeight: 900,
        numberFontFamily: 'Plus Jakarta Sans',
        labelColor: '#94a3b8',
        labelFontSize: 8,
        unitSpacing: 8,
        showSeparators: true,
      },

      // CTA com glow (sombra dupla)
      { type: 'caixa', x: 818, y: 36, w: 224, h: 52,
        bgColor: 'rgba(251,191,36,0.3)',
        borders: { radius: r4(10), equalCorners: true } },
      { type: 'botao',
        x: 820, y: 34, w: 220, h: 52,
        text: 'GARANTIR →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 14, fontWeight: 900, borderRadius: 10,
        shadow: 'hard' },
      { type: 'texto',
        x: 820, y: 90, w: 220, h: 18,
        html: '✓ Pagamento seguro · 30 dias',
        fontSize: 9, color: '#cbd5e1', textAlign: 'center', fontWeight: 500 },

      // Stat social proof à direita
      { type: 'texto',
        x: 1056, y: 38, w: 130, h: 20,
        html: '<strong style="color:#fbbf24;font-size:18px">+312</strong>',
        fontSize: 18, color: '#fbbf24', fontWeight: 900 },
      { type: 'texto',
        x: 1056, y: 60, w: 130, h: 32,
        html: 'já garantiram<br>nas últimas 24h',
        fontSize: 9, color: '#94a3b8', lineHeight: 1.4 },
    ],
  },
}

const timerComDesconto: BlockTemplate = {
  id: 'timer-desconto',
  label: 'Timer com Desconto',
  category: 'Timer',
  thumbnailKey: 'timer-desconto',
  block: {
    height: 660,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#fef2f2' }] },
    elements: [
      // Card decorativo offset (lifted)
      {
        type: 'caixa', x: 220, y: 120, w: 760, h: 460,
        bgColor: 'rgba(220,38,38,0.10)',
        borders: { radius: r4(24), equalCorners: true },
      },
      // Card principal
      {
        type: 'caixa', x: 200, y: 100, w: 760, h: 460,
        bgColor: '#ffffff',
        borders: { radius: r4(24), equalCorners: true,
          color: '#fecaca', width: 1 },
        shadow: 'hard',
      },
      // Faixa vermelha topo
      {
        type: 'caixa', x: 200, y: 100, w: 760, h: 6,
        bgColor: '#dc2626',
        borders: { radius: [24, 24, 0, 0], equalCorners: false },
      },

      // Badge "-50% OFF" sobreposto top-right (off-card)
      {
        type: 'circulo', x: 880, y: 70, w: 110, h: 110,
        bgColor: '#dc2626',
        borders: { color: '#ffffff', width: 5,
          radius: r4(55), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 880, y: 92, w: 110, h: 40,
        html: '50%', fontSize: 28, fontWeight: 900,
        color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: 880, y: 132, w: 110, h: 22,
        html: 'OFF', fontSize: 14, fontWeight: 800,
        color: '#fecaca', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'texto', x: 880, y: 152, w: 110, h: 18,
        html: 'POR 24H', fontSize: 8, fontWeight: 800,
        color: '#fbbf24', textAlign: 'center', letterSpacing: 1,
      },

      // Eyebrow
      {
        type: 'texto', x: 240, y: 140, w: 600, h: 22,
        html: 'PROMOÇÃO ESPECIAL · TERMINA HOJE',
        fontSize: 11, fontWeight: 800, color: '#dc2626',
        letterSpacing: 3,
      },
      // Headline
      {
        type: 'titulo', headingLevel: 2,
        x: 240, y: 168, w: 600, h: 50,
        html: 'Garanta com <span style="color:#dc2626">50% de desconto</span>',
        fontSize: 30, fontWeight: 800, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },

      // Preço de/por bem destacado
      {
        type: 'texto',
        x: 240, y: 234, w: 200, h: 22,
        html: 'DE',
        fontSize: 11, fontWeight: 800, color: '#94a3b8', letterSpacing: 2,
      },
      {
        type: 'texto',
        x: 240, y: 256, w: 200, h: 30,
        html: '<s>R$ 497</s>',
        fontSize: 22, color: '#94a3b8', fontWeight: 700,
      },
      {
        type: 'texto',
        x: 240, y: 296, w: 200, h: 18,
        html: 'à vista',
        fontSize: 11, color: '#94a3b8',
      },
      {
        type: 'texto',
        x: 460, y: 234, w: 200, h: 22,
        html: 'POR APENAS',
        fontSize: 11, fontWeight: 800, color: '#dc2626', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 460, y: 252, w: 240, h: 56,
        html: 'R$ <span style="font-size:54px">247</span>',
        fontSize: 26, color: '#dc2626', fontWeight: 900,
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 460, y: 312, w: 240, h: 18,
        html: 'ou 12× de R$ 24,70 sem juros',
        fontSize: 11, color: '#64748b',
      },

      // Timer compacto inline com fundo vermelho claro
      {
        type: 'texto',
        x: 240, y: 350, w: 600, h: 18,
        html: 'OFERTA EXPIRA EM:',
        fontSize: 10, fontWeight: 800, color: '#7f1d1d',
        textAlign: 'center', letterSpacing: 2,
      },
      // ─── Timer REAL ───
      {
        type: 'timer',
        x: 290, y: 376, w: 520, h: 90,
        mode: 'relative',
        relativeMinutes: 1440,
        units: ['days', 'hours', 'minutes', 'seconds'],
        layout: 'cards',
        expiredAction: 'stay',
        boxBgColor: '#fef2f2',
        boxBorderColor: '#fecaca',
        boxBorderRadius: 12,
        numberColor: '#dc2626',
        numberFontSize: 32,
        numberFontWeight: 900,
        numberFontFamily: 'Plus Jakarta Sans',
        labelColor: '#991b1b',
        labelFontSize: 9,
        unitSpacing: 18,
      },
      {
        type: 'botao',
        x: 320, y: 480, w: 520, h: 56,
        text: 'GARANTIR MEU DESCONTO AGORA →',
        bgColor: '#dc2626', color: '#ffffff',
        fontSize: 15, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
      // Trust footer
      {
        type: 'texto', x: 240, y: 552, w: 600, h: 22,
        html: '🔒 Pagamento seguro · ⭐ Garantia 30 dias · ⚡ Acesso imediato após confirmação',
        fontSize: 12, color: '#64748b', textAlign: 'center',
      },
      // Stat de social proof
      {
        type: 'texto', x: 240, y: 586, w: 600, h: 22,
        html: '<strong style="color:#dc2626">+342 pessoas</strong> garantiram com desconto nas últimas 24h',
        fontSize: 13, color: '#475569', textAlign: 'center', fontWeight: 600,
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE / ETAPAS
// ─────────────────────────────────────────────────────────────────────────────

const timelinePassos: BlockTemplate = {
  id: 'timeline-passos',
  label: 'Timeline 4 Passos Horizontal',
  category: 'Timeline',
  thumbnailKey: 'timeline-passos',
  block: {
    height: 580,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'texto', x: C(0, 800), y: 60, w: 800, h: 24,
        html: 'COMO FUNCIONA', fontSize: 13, fontWeight: 800,
        color: '#2563eb', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 96, w: 800, h: 60,
        html: 'Em 4 passos você está rodando',
        fontSize: 36, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Linha conectora horizontal entre os círculos (decorativa)
      {
        type: 'caixa', x: 220, y: 260, w: 760, h: 2, bgColor: '#dbeafe',
      },
      // 4 passos em grid
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 100 + i * 260
        const titles = ['Cadastre-se', 'Configure', 'Personalize', 'Lance']
        const descs  = [
          'Crie sua conta gratuitamente em menos de 2 minutos.',
          'Conecte com seus canais de venda existentes.',
          'Adapte ao seu nicho com nossos templates premium.',
          'Publique e comece a converter visitantes em vendas.',
        ]
        const icons = ['users', 'briefcase', 'sparkles', 'rocket']
        return [
          { type: 'circulo', x: x + 90, y: 230, w: 60, h: 60,
            bgColor: '#ffffff',
            borders: { color: '#2563eb', width: 3,
              radius: [30, 30, 30, 30], equalCorners: true },
            shadow: 'soft' },
          { type: 'icone', iconId: icons[i],
            x: x + 110, y: 250, w: 20, h: 20, color: '#2563eb' },
          // Badge número
          { type: 'circulo', x: x + 138, y: 222, w: 24, h: 24,
            bgColor: '#fbbf24',
            borders: { color: '#ffffff', width: 2,
              radius: [12, 12, 12, 12], equalCorners: true } },
          { type: 'titulo', headingLevel: 4,
            x: x + 138, y: 226, w: 24, h: 18,
            html: `${i + 1}`, fontSize: 12, fontWeight: 900,
            color: '#7c2d12', textAlign: 'center' },
          { type: 'titulo', headingLevel: 3,
            x, y: 320, w: 240, h: 30,
            html: titles[i], fontSize: 18, fontWeight: 700,
            color: '#0f172a', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 358, w: 240, h: 80,
            html: descs[i], fontSize: 14, color: '#64748b',
            textAlign: 'center', lineHeight: 1.6 },
        ]
      }),
      {
        type: 'botao',
        x: C(0, 280), y: 480, w: 280, h: 56,
        text: 'Começar agora →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
    ],
  },
}

const timelineVerticalZigzag: BlockTemplate = {
  id: 'timeline-vertical-zigzag',
  label: 'Timeline Vertical Zigzag',
  category: 'Timeline',
  thumbnailKey: 'timeline-zigzag',
  block: {
    height: 980,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'NOSSA TRAJETÓRIA · 8 ANOS DE EVOLUÇÃO',
        fontSize: 13, fontWeight: 800, color: '#3b82f6',
        textAlign: 'center', letterSpacing: 3 },
      // Headline com gradient text
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 60,
        html: 'A <span style="background:linear-gradient(90deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">jornada</span> que nos trouxe até aqui',
        fontSize: 42, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },
      // Sub
      { type: 'texto',
        x: 200, y: 168, w: 800, h: 26,
        html: 'Cada marco foi construído pela comunidade que cresceu com a gente.',
        fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 1.5 },

      // Linha vertical central (gradient sutil)
      { type: 'caixa', x: C(0, 2), y: 240, w: 2, h: 660,
        bgColor: '#cbd5e1' },

      // 4 milestones zigzag com card lifted + faixa accent
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 280 + i * 160
        const isLeft = i % 2 === 0
        const years  = ['2018', '2020', '2023', '2026']
        const titles = ['Fundação', 'Primeiros 1.000 clientes', 'Expansão internacional', 'Líder de mercado']
        const descs  = [
          'Nascemos com a missão de simplificar landing pages no Brasil.',
          'Atingimos 1.000 empresas atendidas em apenas 18 meses.',
          'Aberta para América Latina e Europa — 12 países atendidos.',
          'Top 1 em ferramentas de conversão da categoria SaaS B2B.',
        ]
        const stats = ['Equipe inicial', '+1k empresas', '+12 países', '+5k clientes']
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        const tints  = ['#dbeafe', '#dcfce7', '#fef3c7', '#ede9fe']
        const cardX  = isLeft ? 110 : 660
        return [
          // Bullet central — duplo ring (acento + branco)
          { type: 'circulo', x: C(0, 28), y: y + 14, w: 28, h: 28,
            bgColor: '#ffffff',
            borders: { color: colors[i], width: 3,
              radius: r4(14), equalCorners: true },
            shadow: 'soft' },
          { type: 'circulo', x: C(0, 12), y: y + 22, w: 12, h: 12,
            bgColor: colors[i],
            borders: { radius: r4(6), equalCorners: true } },
          // Card lifted (faixa accent vertical no lado da linha)
          { type: 'caixa',
            x: cardX, y: y - 30,
            w: 430, h: 140,
            bgColor: '#ffffff',
            borders: { radius: r4(16), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'hard' },
          // Faixa acento na lateral interna do card (lado da linha)
          { type: 'caixa',
            x: isLeft ? cardX + 426 : cardX, y: y - 14,
            w: 4, h: 108,
            bgColor: colors[i],
            borders: { radius: r4(2), equalCorners: true } },
          // Year badge (chip colorido)
          { type: 'caixa',
            x: cardX + 24, y: y - 14, w: 70, h: 26,
            bgColor: tints[i],
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto',
            x: cardX + 24, y: y - 9, w: 70, h: 18,
            html: years[i], fontSize: 12, fontWeight: 800,
            color: colors[i], textAlign: 'center', letterSpacing: 1 },
          // Stats inline (canto direito do card)
          { type: 'texto',
            x: cardX + 280, y: y - 12, w: 130, h: 22,
            html: stats[i], fontSize: 11, fontWeight: 700,
            color: '#94a3b8', textAlign: 'right', letterSpacing: 1.5 },
          // Title
          { type: 'titulo', headingLevel: 3,
            x: cardX + 24, y: y + 22, w: 386, h: 32,
            html: titles[i], fontSize: 20, fontWeight: 800,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          // Desc
          { type: 'texto',
            x: cardX + 24, y: y + 58, w: 386, h: 36,
            html: descs[i], fontSize: 13, color: '#64748b',
            lineHeight: 1.5 },
        ]
      }),

      // Bullet final "futuro" — círculo pulsante minimalista
      { type: 'circulo', x: C(0, 18), y: 906, w: 18, h: 18,
        bgColor: '#ffffff',
        borders: { color: '#cbd5e1', width: 2,
          radius: r4(9), equalCorners: true } },
      { type: 'texto',
        x: C(0, 300), y: 940, w: 300, h: 22,
        html: '✨ <strong style="color:#0f172a">Próximo capítulo:</strong> você junto?',
        fontSize: 13, color: '#64748b', textAlign: 'center' },
    ],
  },
}

const timelineProcessoVertical: BlockTemplate = {
  id: 'timeline-processo-vertical',
  label: 'Timeline Processo Vertical',
  category: 'Timeline',
  thumbnailKey: 'timeline-processo',
  block: {
    height: 720,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'texto', x: C(0, 800), y: 60, w: 800, h: 24,
        html: 'NOSSO PROCESSO', fontSize: 13, fontWeight: 800,
        color: '#60a5fa', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 96, w: 800, h: 60,
        html: 'Como entregamos resultado',
        fontSize: 36, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Linha vertical à esquerda
      {
        type: 'caixa', x: 322, y: 200, w: 2, h: 480,
        bgColor: '#1e3a8a',
      },
      // 4 etapas alinhadas à esquerda
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 210 + i * 120
        const titles = ['Diagnóstico inicial', 'Plano personalizado', 'Implementação', 'Acompanhamento contínuo']
        const descs  = [
          'Análise completa da sua operação e identificação de oportunidades em até 48h.',
          'Estratégia sob medida para seu nicho, com metas claras e mensuráveis a cada etapa.',
          'Execução guiada pelo nosso time de especialistas, com revisões semanais.',
          'Otimização constante baseada nos dados — você nunca para de evoluir.',
        ]
        const icons = ['target', 'briefcase', 'rocket', 'trending-up']
        return [
          // Bullet
          { type: 'circulo', x: 300, y: y - 6, w: 44, h: 44,
            bgColor: '#3b82f6',
            borders: { color: '#ffffff', width: 3,
              radius: [22, 22, 22, 22], equalCorners: true },
            shadow: 'medium' },
          { type: 'icone', iconId: icons[i],
            x: 312, y: y + 6, w: 20, h: 20, color: '#ffffff' },
          // Conteúdo
          { type: 'texto',
            x: 380, y: y - 6, w: 80, h: 22,
            html: `Etapa ${i + 1}`, fontSize: 12, fontWeight: 800,
            color: '#60a5fa', letterSpacing: 2 },
          { type: 'titulo', headingLevel: 3,
            x: 380, y: y + 16, w: 600, h: 30,
            html: titles[i], fontSize: 22, fontWeight: 700,
            color: '#ffffff', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: 380, y: y + 50, w: 600, h: 50,
            html: descs[i], fontSize: 14, color: '#94a3b8',
            lineHeight: 1.6 },
        ]
      }),
    ],
  },
}

const timelineMarcosNumerados: BlockTemplate = {
  id: 'timeline-marcos-numerados',
  label: 'Timeline Marcos Numerados',
  category: 'Timeline',
  thumbnailKey: 'timeline-marcos',
  block: {
    height: 760,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#eff6ff' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'PLANO DE 30 DIAS · RESULTADOS PROGRESSIVOS',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3 },
      // Headline com gradient text
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 60,
        html: 'O que você vai <span style="background:linear-gradient(90deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">conquistar</span> em 30 dias',
        fontSize: 42, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },
      // Sub
      { type: 'texto',
        x: 200, y: 168, w: 800, h: 26,
        html: 'Cada marco entrega valor por si só — você não precisa esperar 30 dias pra ver retorno.',
        fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 1.5 },

      // Card container que envolve a timeline (lifted card central)
      { type: 'caixa',
        x: 150, y: 230, w: 900, h: 480,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard' },

      // Header dentro do card
      { type: 'texto',
        x: 200, y: 260, w: 350, h: 22,
        html: 'CHECKLIST DE PROGRESSO',
        fontSize: 11, fontWeight: 800, color: '#94a3b8',
        letterSpacing: 2 },
      { type: 'texto',
        x: 760, y: 260, w: 240, h: 22,
        html: '<span style="color:#16a34a;font-weight:700">2 de 5 concluídos</span>',
        fontSize: 12, color: '#64748b', textAlign: 'right' },
      // Linha separadora
      { type: 'caixa',
        x: 200, y: 290, w: 800, h: 1,
        bgColor: '#f1f5f9' },

      // 5 marcos premium
      ...[0,1,2,3,4].flatMap((i): ElemInput[] => {
        const y = 320 + i * 76
        const titles = [
          'Setup completo da plataforma',
          'Primeira página publicada',
          'Integrações ativas (Pixel + Email)',
          'Primeiras vendas convertidas',
          'Crescimento previsível com automação',
        ]
        const days   = ['Dia 1', 'Dia 3', 'Dia 7', 'Dia 14', 'Dia 30']
        const stats  = ['<2h', '+20 visitas/dia', '100% tracked', '+R$ 2.5k', '3× ROI']
        const isDone = i < 2
        const colors = ['#3b82f6', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        return [
          // Linha conectora vertical (atrás dos números, exceto último)
          ...(i < 4 ? [{
            type: 'caixa' as const,
            x: 234, y: y + 40, w: 2, h: 36,
            bgColor: isDone ? '#10b981' : '#e2e8f0' }] : []),
          // Círculo numerado (preenchido se concluído, outline se pendente)
          { type: 'circulo', x: 220, y, w: 30, h: 30,
            bgColor: isDone ? '#10b981' : '#ffffff',
            borders: { color: isDone ? '#10b981' : colors[i], width: 2,
              radius: r4(15), equalCorners: true },
            shadow: isDone ? 'soft' : undefined },
          { type: 'texto',
            x: 220, y: y + 6, w: 30, h: 20,
            html: isDone ? '✓' : `${i + 1}`,
            fontSize: isDone ? 14 : 14, fontWeight: 900,
            color: isDone ? '#ffffff' : colors[i],
            textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          // Day chip (ao lado do número)
          { type: 'caixa',
            x: 270, y: y + 4, w: 60, h: 22,
            bgColor: isDone ? '#dcfce7' : '#f1f5f9',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto',
            x: 270, y: y + 8, w: 60, h: 16,
            html: days[i], fontSize: 11, fontWeight: 700,
            color: isDone ? '#15803d' : '#64748b',
            textAlign: 'center', letterSpacing: 0.5 },
          // Title
          { type: 'titulo', headingLevel: 3,
            x: 344, y: y + 4, w: 480, h: 26,
            html: isDone
              ? `<s style="color:#94a3b8">${titles[i]}</s>`
              : titles[i],
            fontSize: 16, fontWeight: 600, color: '#0f172a' },
          // Stat à direita
          { type: 'texto',
            x: 840, y: y + 6, w: 160, h: 22,
            html: stats[i], fontSize: 13, fontWeight: 700,
            color: isDone ? '#16a34a' : colors[i],
            textAlign: 'right' },
        ]
      }),

      // Footer trust line
      { type: 'caixa',
        x: 200, y: 660, w: 800, h: 1,
        bgColor: '#f1f5f9' },
      { type: 'texto',
        x: 200, y: 678, w: 800, h: 22,
        html: '🔒 <strong style="color:#0f172a">Garantia incondicional 30 dias</strong> · Sem atingiu? Devolvemos 100%',
        fontSize: 13, color: '#64748b', textAlign: 'center' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// GALERIA
// ─────────────────────────────────────────────────────────────────────────────

const galeria6Itens: BlockTemplate = {
  id: 'galeria-6-itens',
  label: 'Galeria 6 Cards',
  category: 'Galeria',
  thumbnailKey: 'galeria',
  block: {
    // Layout vertical (sem cair em sobreposição):
    //   header  : 0   → 280  (eyebrow 70/24 + headline 104/64 + sub 184/26 + chips 240/38)
    //   row 0   : 320 → 740  (cards 360×420)
    //   gap     :       30
    //   row 1   : 770 → 1190 (cards 360×420)
    //   gap     :       40
    //   CTA     : 1230 → 1282
    //   padding :       38
    //   total   : 1320
    height: 1320,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 70, w: 900, h: 24,
        html: 'PORTFÓLIO · CASES REAIS COM RESULTADO',
        fontSize: 13, fontWeight: 800, color: '#3b82f6',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 104, w: 900, h: 64,
        html: 'Conheça <span style="background:linear-gradient(90deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">nossos trabalhos</span>',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },
      // Sub
      { type: 'texto', x: 200, y: 184, w: 800, h: 26,
        html: 'Cases reais que mostram o que nosso método entrega na prática.',
        fontSize: 16, color: '#64748b', textAlign: 'center' },

      // Filter chips — calculados pra ficarem perfeitamente centralizados.
      // Total: 70 + 16 + 90 + 16 + 110 + 16 + 80 + 16 + 110 = 524. Centro 600 → start 338.
      ...(() => {
        const labels = ['Todos', 'Branding', 'Web Design', 'Mobile', 'E-commerce']
        const widths = [70, 90, 110, 80, 110]
        const gap = 12
        const total = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1)
        const startX = (1200 - total) / 2
        let cursor = startX
        const out: ElemInput[] = []
        labels.forEach((label, i) => {
          const w = widths[i]
          const active = i === 0
          out.push(
            { type: 'caixa', x: cursor, y: 240, w, h: 38,
              bgColor: active ? '#0f172a' : '#ffffff',
              borders: { radius: r4(999), equalCorners: true,
                color: active ? '#0f172a' : '#e2e8f0', width: 1 },
              shadow: active ? 'soft' : undefined },
            { type: 'texto', x: cursor, y: 250, w, h: 18,
              html: label, fontSize: 13, fontWeight: 700,
              color: active ? '#ffffff' : '#475569',
              textAlign: 'center' },
          )
          cursor += w + gap
        })
        return out
      })(),

      // 6 cards completos (3x2). Cada card é uma "unidade" com imagem +
      // footer dentro de um wrapper branco com radius. Layout matemático
      // limpo:
      // - Card: 360w × 420h
      // - Gap horizontal: 30px (3 cards = 360*3 + 30*2 = 1140, lateral 30px)
      // - Gap vertical:   30px (rows: 320 e 770)
      ...[0,1,2,3,4,5].flatMap((i): ElemInput[] => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 30 + col * 390      // 30, 420, 810
        const y = 320 + row * 450     // 320, 770
        const photos = [
          'photo-1551434678-e076c223a692', // workspace dual screen
          'photo-1556761175-b413da4baf72', // team meeting
          'photo-1517245386807-bb43f82c33c4', // designer drawing
          'photo-1573164713988-8665fc963095', // code on screens
          'photo-1521737711867-e3b97375f902', // team collab
          'photo-1581091226825-a6a2a5aee158', // notebook close
        ]
        const titles = [
          'Rebrand Fintech', 'Lançamento App Mobile', 'E-commerce Moda',
          'SaaS Dashboard', 'Site Institucional', 'Campanha Digital',
        ]
        const cats = [
          'BRANDING', 'MOBILE', 'E-COMMERCE',
          'WEB DESIGN', 'WEB DESIGN', 'BRANDING',
        ]
        const descs = [
          'Identidade visual completa pra fintech B2B em 6 semanas.',
          'iOS + Android nativo · UX research + design system.',
          'Plataforma + integração ERP · BlackFriday recorde.',
          'Redesign do dashboard SaaS reduziu churn em 68%.',
          'Site institucional otimizado pra captação corporativa.',
          'Campanha multicanal · TV + digital + influencers.',
        ]
        const stats = [
          '+240% conversão',
          '50k downloads/mês',
          'R$ 1.2M GMV mensal',
          '−68% churn',
          '+180% leads MQL',
          '+95% engajamento',
        ]
        const accents = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']
        return [
          // Card branco wrapper
          { type: 'caixa', x, y, w: 360, h: 420,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'medium' },
          // Imagem (cobre topo do card, mesma radius nos cantos top)
          { type: 'imagem', x, y, w: 360, h: 240,
            src: `https://images.unsplash.com/${photos[i]}?w=720&q=80`,
            objectFit: 'cover',
            borders: { radius: [20, 20, 0, 0] as [number, number, number, number],
              equalCorners: false } },
          // Categoria badge (canto superior esquerdo da imagem)
          { type: 'caixa', x: x + 16, y: y + 16, w: 110, h: 28,
            bgColor: 'rgba(15,23,42,0.92)',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto', x: x + 16, y: y + 22, w: 110, h: 18,
            html: cats[i], fontSize: 10, fontWeight: 800,
            color: '#ffffff', textAlign: 'center', letterSpacing: 2 },
          // Faixa accent inferior da imagem (4px)
          { type: 'caixa', x, y: y + 240, w: 360, h: 4,
            bgColor: accents[i] },
          // Título (dentro do card, abaixo da imagem)
          { type: 'titulo', headingLevel: 4,
            x: x + 24, y: y + 264, w: 312, h: 28,
            html: titles[i], fontSize: 18, fontWeight: 800,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          // Descrição
          { type: 'texto',
            x: x + 24, y: y + 296, w: 312, h: 60,
            html: descs[i], fontSize: 13, color: '#64748b', lineHeight: 1.5 },
          // Linha divisória sutil
          { type: 'caixa', x: x + 24, y: y + 364, w: 312, h: 1,
            bgColor: '#f1f5f9' },
          // Stat com ícone (canto inferior esquerdo)
          { type: 'icone', iconId: 'trending-up',
            x: x + 24, y: y + 378, w: 16, h: 16, color: accents[i] },
          { type: 'texto',
            x: x + 44, y: y + 378, w: 200, h: 20,
            html: stats[i], fontSize: 13, color: accents[i],
            fontWeight: 700 },
          // Seta "ver case" (canto inferior direito)
          { type: 'texto',
            x: x + 256, y: y + 378, w: 80, h: 20,
            html: 'Ver case →', fontSize: 12, color: '#64748b',
            fontWeight: 600, textAlign: 'right' },
        ]
      }),

      // CTA bottom — y=1230 garante 40px de gap após row 1 (que termina em 1190)
      { type: 'botao',
        x: C(0, 280), y: 1230, w: 280, h: 52,
        text: 'Ver portfólio completo →',
        bgColor: '#0f172a', color: '#ffffff',
        fontSize: 14, fontWeight: 700, borderRadius: 12,
        shadow: 'hard' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// GALERIA — variações adicionais
// ─────────────────────────────────────────────────────────────────────────────

const galeriaMasonry: BlockTemplate = {
  id: 'galeria-masonry',
  label: 'Galeria Masonry (alturas variadas)',
  category: 'Galeria',
  thumbnailKey: 'galeria-masonry',
  block: {
    height: 920,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#fafafa' }, { color: '#ffffff' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'GALERIA · MOMENTOS REAIS',
        fontSize: 13, fontWeight: 800, color: '#ec4899',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 64,
        html: 'Veja <span style="background:linear-gradient(90deg,#ec4899,#f59e0b);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">por dentro</span> dos bastidores',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },
      // Sub
      { type: 'texto', x: 200, y: 176, w: 800, h: 26,
        html: 'Equipe, escritório, eventos, processos. Tudo que faz a marca acontecer.',
        fontSize: 16, color: '#64748b', textAlign: 'center' },

      // ─── Layout Masonry: 3 colunas com alturas variadas pra criar
      // ritmo visual orgânico (não-uniforme). Coluna 1: alta, Coluna 2:
      // baixa-alta, Coluna 3: baixa-alta-baixa.
      //
      // Col 1 (x=60, w=360): 1 imagem grande 360x420 + 1 média 360x180
      // Col 2 (x=440, w=320): 1 média 320x260 + 1 grande 320x340
      // Col 3 (x=780, w=360): 1 média 360x200 + 1 grande 360x400
      //
      // Total height por coluna: ~620px. Bloco 240 header + 620 + 60 footer = 920.

      // Col 1
      { type: 'imagem', x: 60, y: 230, w: 360, h: 420,
        src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=720&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },
      { type: 'caixa', x: 76, y: 246, w: 90, h: 26,
        bgColor: 'rgba(15,23,42,0.85)',
        borders: { radius: r4(999), equalCorners: true } },
      { type: 'texto', x: 76, y: 252, w: 90, h: 16,
        html: 'EQUIPE', fontSize: 10, fontWeight: 800,
        color: '#ffffff', textAlign: 'center', letterSpacing: 2 },

      { type: 'imagem', x: 60, y: 670, w: 360, h: 180,
        src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=720&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },

      // Col 2
      { type: 'imagem', x: 440, y: 230, w: 320, h: 260,
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=640&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },
      { type: 'caixa', x: 456, y: 246, w: 110, h: 26,
        bgColor: 'rgba(236,72,153,0.95)',
        borders: { radius: r4(999), equalCorners: true } },
      { type: 'texto', x: 456, y: 252, w: 110, h: 16,
        html: 'PROCESSO', fontSize: 10, fontWeight: 800,
        color: '#ffffff', textAlign: 'center', letterSpacing: 2 },

      { type: 'imagem', x: 440, y: 510, w: 320, h: 340,
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=640&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },

      // Col 3
      { type: 'imagem', x: 780, y: 230, w: 360, h: 200,
        src: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=720&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },
      { type: 'caixa', x: 796, y: 246, w: 100, h: 26,
        bgColor: 'rgba(245,158,11,0.95)',
        borders: { radius: r4(999), equalCorners: true } },
      { type: 'texto', x: 796, y: 252, w: 100, h: 16,
        html: 'EVENTOS', fontSize: 10, fontWeight: 800,
        color: '#ffffff', textAlign: 'center', letterSpacing: 2 },

      { type: 'imagem', x: 780, y: 450, w: 360, h: 400,
        src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=720&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'medium' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────

const galeriaAntesDepois: BlockTemplate = {
  id: 'galeria-antes-depois',
  label: 'Galeria Antes & Depois',
  category: 'Galeria',
  thumbnailKey: 'galeria-antes-depois',
  block: {
    height: 880,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f0f9ff' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'TRANSFORMAÇÃO · ANTES vs DEPOIS',
        fontSize: 13, fontWeight: 800, color: '#0ea5e9',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 64,
        html: 'A diferença que <span style="background:linear-gradient(90deg,#0ea5e9,#10b981);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">faz a diferença</span>',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },
      // Sub
      { type: 'texto', x: 200, y: 176, w: 800, h: 26,
        html: 'Compare como nossos clientes evoluíram com o método aplicado.',
        fontSize: 16, color: '#64748b', textAlign: 'center' },

      // ─── 3 cases empilhados (1 por linha) — cada um com 2 imagens
      // lado-a-lado (antes / depois) + label + métrica de transformação
      ...[0, 1, 2].flatMap((i): ElemInput[] => {
        const y = 240 + i * 200
        const cases = [
          { antes: 'photo-1497366216548-37526070297c', depois: 'photo-1497366811353-6870744d04b2',
            cliente: 'Studio Casa', metric: '+340%', metricLabel: 'tráfego orgânico' },
          { antes: 'photo-1497366754035-f200968a6e72', depois: 'photo-1572025442646-866d16c84a54',
            cliente: 'Clínica Vitta', metric: '+5x', metricLabel: 'agendamentos/mês' },
          { antes: 'photo-1497366216548-37526070297c', depois: 'photo-1497366754035-f200968a6e72',
            cliente: 'Marca Origens', metric: '−72%', metricLabel: 'CAC reduzido' },
        ][i]
        return [
          // Card wrapper branco
          { type: 'caixa', x: 60, y, w: 1080, h: 180,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'medium' },
          // Imagem antes (esquerda)
          { type: 'imagem', x: 76, y: y + 16, w: 360, h: 148,
            src: `https://images.unsplash.com/${cases.antes}?w=720&q=80`,
            objectFit: 'cover',
            borders: { radius: r4(12), equalCorners: true } },
          // Label "ANTES" sobreposto
          { type: 'caixa', x: 92, y: y + 32, w: 80, h: 24,
            bgColor: 'rgba(220,38,38,0.92)',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto', x: 92, y: y + 36, w: 80, h: 16,
            html: 'ANTES', fontSize: 10, fontWeight: 800,
            color: '#ffffff', textAlign: 'center', letterSpacing: 2 },

          // Seta entre as imagens
          { type: 'circulo', x: 446, y: y + 82, w: 48, h: 48,
            bgColor: '#ffffff',
            borders: { color: '#0ea5e9', width: 2,
              radius: r4(24), equalCorners: true },
            shadow: 'soft' },
          { type: 'texto', x: 446, y: y + 92, w: 48, h: 28,
            html: '→', fontSize: 22, fontWeight: 900,
            color: '#0ea5e9', textAlign: 'center' },

          // Imagem depois (centro-direita)
          { type: 'imagem', x: 504, y: y + 16, w: 360, h: 148,
            src: `https://images.unsplash.com/${cases.depois}?w=720&q=80`,
            objectFit: 'cover',
            borders: { radius: r4(12), equalCorners: true } },
          { type: 'caixa', x: 520, y: y + 32, w: 80, h: 24,
            bgColor: 'rgba(16,185,129,0.95)',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto', x: 520, y: y + 36, w: 80, h: 16,
            html: 'DEPOIS', fontSize: 10, fontWeight: 800,
            color: '#ffffff', textAlign: 'center', letterSpacing: 2 },

          // Painel de métrica à direita
          { type: 'caixa', x: 884, y: y + 16, w: 240, h: 148,
            bgColor: '#0f172a',
            borders: { radius: r4(12), equalCorners: true } },
          { type: 'texto', x: 884, y: y + 36, w: 240, h: 18,
            html: cases.cliente,
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            textAlign: 'center', letterSpacing: 2 },
          { type: 'titulo', headingLevel: 3,
            x: 884, y: y + 60, w: 240, h: 48,
            html: cases.metric, fontSize: 40, fontWeight: 900,
            color: '#10b981', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto', x: 884, y: y + 116, w: 240, h: 22,
            html: cases.metricLabel, fontSize: 12, color: '#cbd5e1',
            textAlign: 'center' },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────

const galeriaTextoLateral: BlockTemplate = {
  id: 'galeria-texto-lateral',
  label: 'Galeria com Texto Lateral',
  category: 'Galeria',
  thumbnailKey: 'galeria-texto-lateral',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }] },
    elements: [
      // Texto à esquerda
      { type: 'texto', x: 80, y: 90, w: 460, h: 22,
        html: 'CASE EM DESTAQUE',
        fontSize: 13, fontWeight: 800, color: '#fbbf24', letterSpacing: 3 },
      { type: 'titulo', headingLevel: 2,
        x: 80, y: 122, w: 460, h: 156,
        html: 'Como redesenhamos<br/>a <span style="background:linear-gradient(90deg,#fbbf24,#fb923c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">experiência</span> de uma fintech inteira',
        fontSize: 38, fontWeight: 800, color: '#ffffff',
        fontFamily: 'Plus Jakarta Sans', lineHeight: 1.15, letterSpacing: -1 },

      // Stats em linha (3 colunas)
      { type: 'caixa', x: 80, y: 296, w: 460, h: 1, bgColor: 'rgba(255,255,255,0.1)' },
      { type: 'titulo', headingLevel: 4,
        x: 80, y: 320, w: 140, h: 36,
        html: '+340%', fontSize: 28, fontWeight: 900,
        color: '#fbbf24', fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 80, y: 358, w: 140, h: 18,
        html: 'usuários ativos', fontSize: 11, color: '#cbd5e1',
        letterSpacing: 1 },

      { type: 'titulo', headingLevel: 4,
        x: 240, y: 320, w: 140, h: 36,
        html: '−68%', fontSize: 28, fontWeight: 900,
        color: '#fbbf24', fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 240, y: 358, w: 140, h: 18,
        html: 'tempo no app', fontSize: 11, color: '#cbd5e1',
        letterSpacing: 1 },

      { type: 'titulo', headingLevel: 4,
        x: 400, y: 320, w: 140, h: 36,
        html: 'R$12M', fontSize: 28, fontWeight: 900,
        color: '#fbbf24', fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 400, y: 358, w: 140, h: 18,
        html: 'volume mensal', fontSize: 11, color: '#cbd5e1',
        letterSpacing: 1 },

      { type: 'caixa', x: 80, y: 396, w: 460, h: 1, bgColor: 'rgba(255,255,255,0.1)' },

      // Quote
      { type: 'texto', x: 80, y: 416, w: 460, h: 70,
        html: '<span style="font-style:italic">"Em 90 dias o nosso app passou de 3.2 ★ para 4.8 ★ na App Store. Investimento que se pagou no primeiro mês."</span>',
        fontSize: 15, color: '#cbd5e1', lineHeight: 1.5 },

      // Avatar + autor
      { type: 'circulo', x: 80, y: 506, w: 44, h: 44,
        bgImage: 'https://i.pravatar.cc/96?img=49',
        borders: { color: '#fbbf24', width: 2,
          radius: r4(22), equalCorners: true } },
      { type: 'texto', x: 136, y: 510, w: 280, h: 22,
        html: '<strong style="color:white">Marina Lopes</strong>',
        fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 136, y: 532, w: 280, h: 18,
        html: 'CEO · BankNow',
        fontSize: 12, color: '#94a3b8' },

      // CTA
      { type: 'botao',
        x: 80, y: 590, w: 220, h: 52,
        text: 'Ver case completo →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 14, fontWeight: 800, borderRadius: 12,
        shadow: 'hard' },

      // ── Galeria à direita (4 imagens em grid 2×2)
      { type: 'imagem', x: 620, y: 90, w: 250, h: 280,
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&q=80',
        objectFit: 'cover',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard' },
      { type: 'imagem', x: 890, y: 90, w: 230, h: 280,
        src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=460&q=80',
        objectFit: 'cover',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard' },
      { type: 'imagem', x: 620, y: 390, w: 230, h: 240,
        src: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=460&q=80',
        objectFit: 'cover',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard' },
      { type: 'imagem', x: 870, y: 390, w: 250, h: 240,
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&q=80',
        objectFit: 'cover',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────

const galeriaLogosClientes: BlockTemplate = {
  id: 'galeria-logos-clientes',
  label: 'Galeria de Logos / Clientes',
  category: 'Galeria',
  thumbnailKey: 'galeria-logos',
  block: {
    height: 460,
    bgColor: '#ffffff',
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'CONFIANÇA · MAIS DE 200 EMPRESAS',
        fontSize: 13, fontWeight: 800, color: '#3b82f6',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 56,
        html: 'Marcas que <span style="background:linear-gradient(90deg,#3b82f6,#8b5cf6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">crescem</span> com a gente',
        fontSize: 38, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1 },

      // 12 logos em grid 6×2 (placeholders nominais — usuário troca por
      // logos reais no editor). Cada "logo" é uma caixa branca com texto
      // em peso pesado, opacidade reduzida — efeito clean B2B.
      ...[0,1,2,3,4,5,6,7,8,9,10,11].flatMap((i): ElemInput[] => {
        const col = i % 6
        const row = Math.floor(i / 6)
        const x = 60 + col * 180
        const y = 200 + row * 120
        const names = ['ACME', 'KAIROS', 'NIMBUS', 'VERTEX', 'POLAR', 'NOVA',
                       'ORBIT', 'PIXEL', 'STREAM', 'VECTOR', 'MERIDIAN', 'ZENITH']
        return [
          { type: 'caixa', x, y, w: 160, h: 100,
            bgColor: '#f8fafc',
            borders: { radius: r4(12), equalCorners: true,
              color: '#e2e8f0', width: 1 } },
          { type: 'texto', x, y: y + 38, w: 160, h: 24,
            html: names[i], fontSize: 16, fontWeight: 800,
            color: '#475569', textAlign: 'center',
            letterSpacing: 2, opacity: 0.7 },
        ]
      }),

      // Linha de stats embaixo
      { type: 'caixa', x: 60, y: 446, w: 1080, h: 1, bgColor: '#e2e8f0' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Dark
// ─────────────────────────────────────────────────────────────────────────────

const faqDark: BlockTemplate = {
  id: 'faq-dark',
  label: 'FAQ Dark',
  category: 'FAQ',
  thumbnailKey: 'faq-dark',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'TIRAMOS SUAS DÚVIDAS',
        fontSize: 13, fontWeight: 800, color: '#60a5fa',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Perguntas <span style="color:#fbbf24">frequentes</span>',
        fontSize: 40, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Não achou? <strong style="color:#60a5fa">Mande pra nosso time</strong> — resposta em até 1h.',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center',
      },
      // ─── FAQ REAL (estilo dark) ───
      {
        type: 'faq',
        x: 200, y: 230, w: 800, h: 380,
        items: [
          { id: 'q1', q: 'O acesso é vitalício?',
            a: 'Sim. Você acessa quando quiser, sem mensalidade nem renovação.',
            open: true },
          { id: 'q2', q: 'Em quanto tempo vejo resultado?',
            a: 'A maioria vê os primeiros resultados nos 30 primeiros dias.' },
          { id: 'q3', q: 'E se eu quiser desistir?',
            a: 'Garantia incondicional de 30 dias. 100% do dinheiro de volta sem perguntas.' },
          { id: 'q4', q: 'Como recebo o material?',
            a: 'No mesmo instante após a confirmação do pagamento. Acesso imediato.' },
        ],
        itemBgColor: 'rgba(30,41,59,0.7)',
        itemBorderColor: 'rgba(96,165,250,0.2)',
        itemBorderRadius: 14,
        accentColor: '#60a5fa',
        accentWidth: 4,
        qColor: '#ffffff',
        qFontSize: 16,
        qFontWeight: 700,
        qFontFamily: 'Plus Jakarta Sans',
        qHeadingLevel: 3,
        aColor: '#94a3b8',
        aFontSize: 13,
        aLineHeight: 1.6,
        iconColor: '#60a5fa',
        iconStyle: 'plus',
        itemSpacing: 12,
        itemPaddingX: 30,
        itemPaddingY: 20,
        allowMultipleOpen: false,
      },
      // Trust line
      {
        type: 'texto',
        x: 200, y: 656, w: 800, h: 22,
        html: 'Resposta média: <strong style="color:#fbbf24">3 minutos</strong> · Time humano disponível 24/7',
        fontSize: 13, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// VÍDEO com Texto Lateral
// ─────────────────────────────────────────────────────────────────────────────

const videoComTexto: BlockTemplate = {
  id: 'video-com-texto',
  label: 'Vídeo com Texto Lateral',
  category: 'Vídeo',
  thumbnailKey: 'video-com-texto',
  block: {
    height: 540,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Card decorativo atrás do video (lifted)
      {
        type: 'caixa',
        x: 100, y: 100, w: 540, h: 320,
        bgColor: 'rgba(124,58,237,0.15)',
        borders: { radius: r4(16), equalCorners: true },
      },
      // Video
      {
        type: 'video',
        x: 80, y: 80, w: 540, h: 320,
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      // Stat chip flutuante sobre o video
      {
        type: 'caixa', x: 80, y: 360, w: 180, h: 80,
        bgColor: '#ffffff',
        borders: { radius: r4(12), equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 100, y: 376, w: 140, h: 36,
        html: '+312%', fontSize: 26, fontWeight: 900,
        color: '#16a34a', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 100, y: 412, w: 140, h: 18,
        html: 'em vendas no 1º mês', fontSize: 11, color: '#64748b',
      },
      // Coluna direita
      {
        type: 'texto',
        x: 660, y: 100, w: 460, h: 24,
        html: 'CONHEÇA O MÉTODO · 3 MIN',
        fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 660, y: 134, w: 460, h: 130,
        html: 'Veja como <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">funciona</span> em 3 minutos',
        fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1.15,
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 660, y: 282, w: 460, h: 90,
        html: 'Assista esse walk-through curto e descubra como nossos alunos multiplicam resultado <strong>ainda no primeiro mês</strong>.',
        fontSize: 15, color: '#475569', lineHeight: 1.6,
      },
      // 3 trust signals
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const y = 380 + i * 28
        const items = [
          'Sem fluff. Só conteúdo prático.',
          'Mostro caso real de R$ 380k em 60 dias.',
          'Você sai sabendo se serve pra você.',
        ]
        return [
          { type: 'icone', iconId: 'check-circle',
            x: 660, y, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: 682, y: y - 1, w: 440, h: 20,
            html: items[i], fontSize: 13, color: '#475569' },
        ]
      }),
      // CTA
      {
        type: 'botao',
        x: 660, y: 470, w: 280, h: 52,
        text: 'Quero saber mais →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 15, fontWeight: 700, borderRadius: 10,
        shadow: 'soft',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SOBRE — Empresa (Missão/Valores)
// ─────────────────────────────────────────────────────────────────────────────

const sobreEmpresa: BlockTemplate = {
  id: 'sobre-empresa',
  label: 'Sobre a Empresa',
  category: 'Sobre',
  thumbnailKey: 'sobre-empresa',
  block: {
    height: 620,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // Card decorativo atrás da imagem (lifted effect)
      {
        type: 'caixa', x: 100, y: 100, w: 480, h: 360,
        bgColor: 'rgba(37,99,235,0.12)',
        borders: { radius: r4(20), equalCorners: true },
      },
      {
        type: 'imagem',
        x: 80, y: 80, w: 480, h: 360,
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=960&q=80',
        objectFit: 'cover',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'hard',
      },
      // Card flutuante "Desde 2018" sobreposto
      {
        type: 'caixa', x: 480, y: 380, w: 140, h: 80,
        bgColor: '#0f172a',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 480, y: 392, w: 140, h: 36,
        html: 'DESDE', fontSize: 11, fontWeight: 800,
        color: '#94a3b8', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'texto', x: 480, y: 416, w: 140, h: 36,
        html: '2018', fontSize: 28, fontWeight: 900, color: '#fbbf24',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },

      // Coluna direita: header + bio + stats
      {
        type: 'texto',
        x: 660, y: 90, w: 460, h: 24,
        html: 'NOSSA HISTÓRIA · 6 ANOS DE MERCADO',
        fontSize: 13, fontWeight: 800, color: '#2563eb', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 660, y: 124, w: 460, h: 130,
        html: '<span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">Tecnologia</span> que empodera pequenos negócios',
        fontSize: 36, fontWeight: 800, color: '#0f172a', lineHeight: 1.15,
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 660, y: 268, w: 460, h: 100,
        html: 'Fundada em 2018, nossa missão é <strong style="color:#0f172a">democratizar acesso</strong> a ferramentas profissionais. Hoje, +10.000 empreendedores brasileiros confiam na nossa plataforma todos os dias.',
        fontSize: 15, color: '#475569', lineHeight: 1.7,
      },
      // Linha separadora
      { type: 'caixa', x: 660, y: 388, w: 460, h: 1, bgColor: '#e2e8f0' },
      // 3 stats em row premium
      ...[
        { num: '+10mil', lbl: 'Clientes ativos' },
        { num: '6 anos', lbl: 'No mercado' },
        { num: 'R$ 12M', lbl: 'Em vendas geradas' },
      ].flatMap((s, i): ElemInput[] => {
        const x = 660 + i * 154
        return [
          { type: 'titulo', headingLevel: 3,
            x, y: 410, w: 144, h: 42,
            html: s.num, fontSize: 26, fontWeight: 900, color: '#2563eb',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          { type: 'texto', x, y: 452, w: 144, h: 20,
            html: s.lbl, fontSize: 11, fontWeight: 600,
            color: '#94a3b8', letterSpacing: 1 },
        ]
      }),
      // Quote/mission embaixo italic
      {
        type: 'texto',
        x: 660, y: 500, w: 460, h: 60,
        html: '<em>"Construímos a ferramenta que sempre quisemos usar — simples, poderosa e acessível pra qualquer empreendedor."</em>',
        fontSize: 14, color: '#475569', lineHeight: 1.6,
        fontFamily: 'Georgia, serif',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANOS — 3 Cards Comparativos
// ─────────────────────────────────────────────────────────────────────────────

const planos3Cards: BlockTemplate = {
  id: 'planos-3-cards',
  label: '3 Planos Comparativos',
  category: 'Planos',
  thumbnailKey: 'planos-3cols',
  block: {
    height: 820,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'PLANOS · TODOS COM 30 DIAS DE GARANTIA',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Escolha o <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">plano ideal</span>',
        fontSize: 42, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Sem fidelidade. Cancele quando quiser. 30 dias de garantia em todos.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },

      // ── Card BÁSICO (esquerda, neutro) ──
      { type: 'caixa', x: 100, y: 240, w: 320, h: 520,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true, color: '#e2e8f0', width: 1 },
        shadow: 'soft' },
      { type: 'texto', x: 100, y: 270, w: 320, h: 24,
        html: 'BÁSICO', fontSize: 12, fontWeight: 800, color: '#64748b',
        textAlign: 'center', letterSpacing: 3 },
      { type: 'titulo', headingLevel: 3, x: 100, y: 300, w: 320, h: 32,
        html: 'Pra começar', fontSize: 22, fontWeight: 700,
        color: '#0f172a', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      { type: 'titulo', headingLevel: 4, x: 100, y: 348, w: 320, h: 64,
        html: 'R$ <span style="font-size:60px">47</span><span style="font-size:13px;color:#94a3b8">/mês</span>',
        fontSize: 22, fontWeight: 900, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 100, y: 416, w: 320, h: 18,
        html: 'ou anual com 20% off', fontSize: 11, color: '#64748b', textAlign: 'center' },
      { type: 'caixa', x: 130, y: 446, w: 260, h: 1, bgColor: '#e2e8f0' },
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 470 + i * 32
        const items = ['Até 1.000 visitas/mês', '1 página personalizada',
                       'Suporte por email', 'Domínio compartilhado']
        return [
          { type: 'icone', iconId: 'check',
            x: 134, y, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: 156, y: y - 1, w: 240, h: 20,
            html: items[i], fontSize: 13, color: '#475569', fontWeight: 500 },
        ]
      }),
      { type: 'botao', x: 130, y: 700, w: 260, h: 48,
        text: 'Começar grátis 14 dias',
        bgColor: 'transparent', color: '#0f172a',
        fontSize: 14, fontWeight: 700, borderRadius: 10,
        borders: { width: 2, color: '#cbd5e1', radius: r4(10), equalCorners: true } },

      // ── Card PRO (destaque dark indigo) ──
      { type: 'caixa', x: 440, y: 220, w: 320, h: 560,
        bgColor: '#4338ca',
        borders: { radius: r4(20), equalCorners: true },
        shadow: 'hard' },
      // Badge POPULAR amber sobreposto
      { type: 'caixa', x: 540, y: 200, w: 120, h: 36,
        bgColor: '#fbbf24',
        borders: { radius: r4(999), equalCorners: true },
        shadow: 'soft' },
      { type: 'texto', x: 540, y: 209, w: 120, h: 20,
        html: '⭐ MAIS POPULAR', fontSize: 11, fontWeight: 800,
        color: '#7c2d12', textAlign: 'center', letterSpacing: 1 },
      { type: 'texto', x: 440, y: 256, w: 320, h: 24,
        html: 'PRO', fontSize: 12, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3 },
      { type: 'titulo', headingLevel: 3, x: 440, y: 286, w: 320, h: 32,
        html: 'Pra crescer', fontSize: 22, fontWeight: 700,
        color: '#ffffff', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      { type: 'titulo', headingLevel: 4, x: 440, y: 334, w: 320, h: 64,
        html: 'R$ <span style="font-size:60px">97</span><span style="font-size:13px;color:#bfdbfe">/mês</span>',
        fontSize: 22, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 440, y: 402, w: 320, h: 18,
        html: 'Economia de R$ 200/ano se anual',
        fontSize: 11, color: '#fbbf24', textAlign: 'center', fontWeight: 700 },
      { type: 'caixa', x: 470, y: 432, w: 260, h: 1,
        bgColor: 'rgba(255,255,255,0.2)' },
      ...[0,1,2,3,4].flatMap((i): ElemInput[] => {
        const y = 456 + i * 32
        const items = ['Até 10.000 visitas/mês', 'Páginas ilimitadas',
                       'Domínio próprio', 'Suporte prioritário', 'A/B testing']
        return [
          { type: 'icone', iconId: 'check',
            x: 474, y, w: 16, h: 16, color: '#fbbf24' },
          { type: 'texto',
            x: 496, y: y - 1, w: 260, h: 20,
            html: items[i], fontSize: 13, color: '#dbeafe', fontWeight: 500 },
        ]
      }),
      { type: 'botao', x: 470, y: 700, w: 260, h: 56,
        text: 'Quero o Pro →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 15, fontWeight: 800, borderRadius: 10,
        shadow: 'hard' },

      // ── Card PREMIUM (direita, neutro) ──
      { type: 'caixa', x: 780, y: 240, w: 320, h: 520,
        bgColor: '#ffffff',
        borders: { radius: r4(20), equalCorners: true, color: '#e2e8f0', width: 1 },
        shadow: 'soft' },
      { type: 'texto', x: 780, y: 270, w: 320, h: 24,
        html: 'PREMIUM', fontSize: 12, fontWeight: 800, color: '#64748b',
        textAlign: 'center', letterSpacing: 3 },
      { type: 'titulo', headingLevel: 3, x: 780, y: 300, w: 320, h: 32,
        html: 'Pra escalar', fontSize: 22, fontWeight: 700,
        color: '#0f172a', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      { type: 'titulo', headingLevel: 4, x: 780, y: 348, w: 320, h: 64,
        html: 'R$ <span style="font-size:60px">197</span><span style="font-size:13px;color:#94a3b8">/mês</span>',
        fontSize: 22, fontWeight: 900, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 780, y: 416, w: 320, h: 18,
        html: 'Tudo do Pro + recursos enterprise', fontSize: 11, color: '#64748b', textAlign: 'center' },
      { type: 'caixa', x: 810, y: 446, w: 260, h: 1, bgColor: '#e2e8f0' },
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 470 + i * 32
        const items = ['Visitas ilimitadas', 'Gerente dedicado',
                       'API e integrações', 'SLA 99.99%']
        return [
          { type: 'icone', iconId: 'check',
            x: 814, y, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: 836, y: y - 1, w: 240, h: 20,
            html: items[i], fontSize: 13, color: '#475569', fontWeight: 500 },
        ]
      }),
      { type: 'botao', x: 810, y: 700, w: 260, h: 48,
        text: 'Falar com vendas',
        bgColor: 'transparent', color: '#0f172a',
        fontSize: 14, fontWeight: 700, borderRadius: 10,
        borders: { width: 2, color: '#cbd5e1', radius: r4(10), equalCorners: true } },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// RODAPÉ — Completo (com newsletter e múltiplas colunas)
// ─────────────────────────────────────────────────────────────────────────────

const rodapeCompleto: BlockTemplate = {
  id: 'rodape-completo',
  label: 'Rodapé Completo',
  category: 'Rodapé',
  thumbnailKey: 'rodape-completo',
  block: {
    height: 460,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#0f172a' }, { color: '#1e1b4b' }] },
    elements: [
      // Coluna 1: logo + descrição + social icons
      { type: 'titulo', headingLevel: 3,
        x: 100, y: 70, w: 280, h: 40,
        html: 'Sua<span style="color:#fbbf24">Marca</span>',
        fontSize: 28, fontWeight: 900, color: '#ffffff',
        fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: 100, y: 120, w: 280, h: 64,
        html: 'A plataforma mais completa para landing pages que convertem mais.',
        fontSize: 13, color: '#94a3b8', lineHeight: 1.6 },
      // Social SVG buttons
      { type: 'circulo', x: 100, y: 200, w: 36, h: 36,
        bgColor: 'rgba(255,255,255,0.08)',
        borders: { color: 'rgba(255,255,255,0.15)', width: 1,
          radius: r4(18), equalCorners: true } },
      { type: 'icone', iconId: 'briefcase',
        x: 110, y: 210, w: 16, h: 16, color: '#cbd5e1' },
      { type: 'circulo', x: 144, y: 200, w: 36, h: 36,
        bgColor: 'rgba(255,255,255,0.08)',
        borders: { color: 'rgba(255,255,255,0.15)', width: 1,
          radius: r4(18), equalCorners: true } },
      { type: 'icone', iconId: 'mail',
        x: 154, y: 210, w: 16, h: 16, color: '#cbd5e1' },
      { type: 'circulo', x: 188, y: 200, w: 36, h: 36,
        bgColor: 'rgba(255,255,255,0.08)',
        borders: { color: 'rgba(255,255,255,0.15)', width: 1,
          radius: r4(18), equalCorners: true } },
      { type: 'icone', iconId: 'globe',
        x: 198, y: 210, w: 16, h: 16, color: '#cbd5e1' },
      // Trust badge
      { type: 'caixa', x: 100, y: 254, w: 280, h: 40,
        bgColor: 'rgba(22,163,74,0.12)',
        borders: { radius: r4(8), equalCorners: true,
          color: 'rgba(22,163,74,0.3)', width: 1 } },
      { type: 'icone', iconId: 'shield-check',
        x: 116, y: 264, w: 20, h: 20, color: '#16a34a' },
      { type: 'texto', x: 144, y: 263, w: 230, h: 22,
        html: '<strong style="color:white">100% LGPD</strong> · SSL Premium',
        fontSize: 12, color: '#86efac' },

      // Coluna 2: Produto
      { type: 'titulo', headingLevel: 4, x: 460, y: 70, w: 200, h: 24,
        html: 'PRODUTO', fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: 3 },
      { type: 'texto', x: 460, y: 102, w: 200, h: 22, html: 'Recursos', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 128, w: 200, h: 22, html: 'Preços', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 154, w: 200, h: 22, html: 'Templates', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 180, w: 200, h: 22, html: 'Integrações', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 206, w: 200, h: 22,
        html: 'Novidades <span style="color:#fbbf24;font-size:10px;font-weight:800;background:rgba(251,191,36,0.15);padding:2px 6px;border-radius:4px">NEW</span>',
        fontSize: 13, color: '#cbd5e1' },

      // Coluna 3: Empresa
      { type: 'titulo', headingLevel: 4, x: 660, y: 70, w: 200, h: 24,
        html: 'EMPRESA', fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: 3 },
      { type: 'texto', x: 660, y: 102, w: 200, h: 22, html: 'Sobre', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 128, w: 200, h: 22, html: 'Blog', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 154, w: 200, h: 22,
        html: 'Carreiras <span style="color:#16a34a;font-size:10px;font-weight:800">+5 vagas</span>',
        fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 180, w: 200, h: 22, html: 'Contato', fontSize: 13, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 206, w: 200, h: 22, html: 'Imprensa', fontSize: 13, color: '#cbd5e1' },

      // Coluna 4: Newsletter
      { type: 'titulo', headingLevel: 4, x: 860, y: 70, w: 240, h: 24,
        html: 'NEWSLETTER', fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: 3 },
      { type: 'texto', x: 860, y: 102, w: 240, h: 50,
        html: 'Receba dicas práticas <strong style="color:white">toda terça</strong> direto no email.',
        fontSize: 13, color: '#94a3b8', lineHeight: 1.5 },
      // ─── Formulário REAL — newsletter inline ───
      // Submit posta em /api/leads (campo email). Útil para crescer base
      // mesmo de quem só quer ler conteúdo, não comprar.
      {
        type: 'formulario',
        x: 860, y: 150, w: 240, h: 130,
        bgColor: 'transparent',
        fields: [
          { id: 'em', kind: 'email', name: 'email',
            label: '', placeholder: 'Seu email', required: true },
        ],
        submitText: 'INSCREVER →',
        submitBg: '#fbbf24',
        submitColor: '#7c2d12',
        submitRadius: 10,
        successMessage: '✓ Inscrito! Próxima edição vai chegar terça.',
        inputBg: 'rgba(255,255,255,0.06)',
        inputColor: '#ffffff',
        inputBorderColor: 'rgba(255,255,255,0.15)',
        inputRadius: 10,
        fieldGap: 8,
      },
      { type: 'texto', x: 860, y: 290, w: 240, h: 18,
        html: '✓ Sem spam · Cancele em 1 click',
        fontSize: 11, color: '#64748b' },

      // Linha separadora + copyright
      { type: 'caixa', x: 100, y: 360, w: 1000, h: 1, bgColor: 'rgba(255,255,255,0.1)' },
      { type: 'texto', x: 100, y: 386, w: 700, h: 22,
        html: '© 2026 <strong style="color:white">SuaMarca</strong> · CNPJ 00.000.000/0001-00 · Feito com ❤️ no Brasil',
        fontSize: 11, color: '#64748b' },
      { type: 'texto', x: 800, y: 386, w: 300, h: 22,
        html: '<strong style="color:#cbd5e1">Privacidade</strong> · <strong style="color:#cbd5e1">Termos</strong> · Cookies',
        fontSize: 11, color: '#64748b', textAlign: 'right' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EQUIPES (NOVA categoria — espelha "Equipes" do GreatPages)
// ─────────────────────────────────────────────────────────────────────────────

const equipe4Cards: BlockTemplate = {
  id: 'equipe-4-cards',
  label: 'Equipe 4 Pessoas',
  category: 'Equipes',
  thumbnailKey: 'equipe-4-cards',
  block: {
    height: 740,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'NOSSO TIME · 32 ANOS DE EXPERIÊNCIA SOMADA',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Quem está por trás dos seus resultados',
        fontSize: 40, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Especialistas que conduzem cada projeto com obsessão por excelência.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },

      // ── 4 cards de pessoa ──
      // Layout: 4 cards 240w + 3 gaps 20px = 1020. Margem lateral 90.
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const cardX = 90 + i * 260
        const data = [
          { photo: 33, name: 'Lucas Pereira',  role: 'CEO & FUNDADOR',
            bio: 'Lidera estratégia. 12 anos no mercado.', years: '12 anos' },
          { photo: 49, name: 'Ana Souza',      role: 'CTO',
            bio: 'Constrói a tecnologia que escala. Ex-Google.', years: '10 anos' },
          { photo: 12, name: 'Pedro Lima',     role: 'HEAD DE DESIGN',
            bio: 'Desenha experiências que convertem.', years: '8 anos' },
          { photo: 26, name: 'Marina Costa',   role: 'HEAD DE VENDAS',
            bio: 'Multiplica receita previsivelmente.', years: '11 anos' },
        ][i]
        return [
          // Card branco com border subtil
          { type: 'caixa', x: cardX, y: 240, w: 240, h: 440,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          // Avatar grande circle com border azul
          { type: 'circulo', x: cardX + 60, y: 270, w: 120, h: 120,
            bgImage: `https://i.pravatar.cc/240?img=${data.photo}`,
            borders: { color: '#dbeafe', width: 4,
              radius: r4(60), equalCorners: true },
            shadow: 'soft' },
          // Years experience badge top-right do avatar
          { type: 'caixa', x: cardX + 156, y: 376, w: 70, h: 24,
            bgColor: '#0f172a',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto',
            x: cardX + 156, y: 380, w: 70, h: 18,
            html: data.years, fontSize: 11, fontWeight: 700,
            color: '#fbbf24', textAlign: 'center', letterSpacing: 0.5 },
          // Nome
          { type: 'titulo', headingLevel: 4,
            x: cardX, y: 416, w: 240, h: 28,
            html: data.name, fontSize: 18, fontWeight: 700,
            color: '#0f172a', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          // Cargo letterspaced
          { type: 'texto',
            x: cardX, y: 446, w: 240, h: 22,
            html: data.role, fontSize: 11, color: '#2563eb',
            textAlign: 'center', fontWeight: 800, letterSpacing: 2 },
          // Bio curta
          { type: 'texto',
            x: cardX + 20, y: 480, w: 200, h: 50,
            html: data.bio, fontSize: 13, color: '#64748b',
            textAlign: 'center', lineHeight: 1.5 },
          // Linha separadora
          { type: 'caixa', x: cardX + 30, y: 558, w: 180, h: 1,
            bgColor: '#e2e8f0' },
          // Social icons row (botões coloridos com SVG icons)
          { type: 'caixa', x: cardX + 70, y: 580, w: 36, h: 36,
            bgColor: '#eff6ff',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'icone', iconId: 'briefcase',
            x: cardX + 80, y: 590, w: 16, h: 16, color: '#2563eb' },
          { type: 'caixa', x: cardX + 134, y: 580, w: 36, h: 36,
            bgColor: '#eff6ff',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'icone', iconId: 'mail',
            x: cardX + 144, y: 590, w: 16, h: 16, color: '#2563eb' },
          // Trust line embaixo
          { type: 'texto',
            x: cardX, y: 632, w: 240, h: 18,
            html: 'Disponível pra Q&A',
            fontSize: 11, color: '#94a3b8', textAlign: 'center' },
        ]
      }),
    ],
  },
}

const equipeFundadorDestaque: BlockTemplate = {
  id: 'equipe-fundador',
  label: 'Fundador em Destaque',
  category: 'Equipes',
  thumbnailKey: 'equipe-fundador',
  block: {
    height: 660,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#f8fafc' }, { color: '#eff6ff' }] },
    elements: [
      // ── COLUNA ESQUERDA: imagem com card decorativo ──
      // Card decorativo azul translúcido offset (efeito "lifted")
      {
        type: 'caixa', x: 120, y: 100, w: 380, h: 480,
        bgColor: 'rgba(37,99,235,0.15)',
        borders: { radius: r4(24), equalCorners: true },
      },
      {
        type: 'imagem', x: 100, y: 80, w: 380, h: 480,
        src: 'https://i.pravatar.cc/760?img=33',
        objectFit: 'cover',
        borders: { radius: r4(24), equalCorners: true },
        shadow: 'hard',
      },
      // Card flutuante "12 anos" sobreponto a imagem (top-right)
      {
        type: 'caixa', x: 380, y: 100, w: 140, h: 100,
        bgColor: '#0f172a',
        borders: { radius: r4(16), equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: 380, y: 120, w: 140, h: 42,
        html: '12<span style="color:#fbbf24">+</span>',
        fontSize: 36, fontWeight: 900, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 380, y: 162, w: 140, h: 22,
        html: 'ANOS DE EXP.', fontSize: 11, fontWeight: 800,
        color: '#94a3b8', textAlign: 'center', letterSpacing: 2,
      },

      // ── COLUNA DIREITA: bio + stats ──
      {
        type: 'texto', x: 560, y: 110, w: 540, h: 24,
        html: 'CONHEÇA O FUNDADOR', fontSize: 13, fontWeight: 800,
        color: '#2563eb', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 560, y: 150, w: 540, h: 60,
        html: 'Lucas Pereira',
        fontSize: 44, fontWeight: 800, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: -1,
      },
      {
        type: 'texto', x: 560, y: 220, w: 540, h: 24,
        html: '<strong style="color:#2563eb">CEO & FUNDADOR</strong> · ex-Consultor McKinsey',
        fontSize: 14, color: '#64748b', fontWeight: 600,
      },
      {
        type: 'texto', x: 560, y: 264, w: 540, h: 130,
        html: 'Há 12 anos transformando negócios digitais no Brasil. Já ajudou <strong style="color:#0f172a">+5.000 empresas</strong> a multiplicarem resultados, com passagem por consultorias internacionais e <strong style="color:#0f172a">dois exits bem-sucedidos</strong> (R$ 80M e R$ 120M).',
        fontSize: 16, color: '#475569', lineHeight: 1.7,
      },
      // Linha separadora
      { type: 'caixa', x: 560, y: 414, w: 540, h: 1, bgColor: '#e2e8f0' },
      // ── 3 stats grandes ──
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 560 + i * 180
        const data = [
          { num: '+5.000',   lbl: 'Empresas atendidas' },
          { num: 'R$ 200M',  lbl: 'Em valor de exits' },
          { num: '2',        lbl: 'Empresas vendidas' },
        ][i]
        return [
          { type: 'titulo', headingLevel: 3,
            x, y: 440, w: 170, h: 44,
            html: data.num, fontSize: 32, fontWeight: 900, color: '#2563eb',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          { type: 'texto',
            x, y: 484, w: 170, h: 20,
            html: data.lbl, fontSize: 11, fontWeight: 600,
            color: '#94a3b8', letterSpacing: 1 },
        ]
      }),
      // ── Quote/Mission do fundador ──
      {
        type: 'texto', x: 560, y: 522, w: 540, h: 56,
        html: '<em>"Construo o que eu mesmo gostaria de usar. Não vendo promessas — entrego sistemas que escalam."</em>',
        fontSize: 14, color: '#475569', lineHeight: 1.6,
        fontFamily: 'Georgia, serif',
      },
    ],
  },
}

const equipe3CardsCompacto: BlockTemplate = {
  id: 'equipe-3-compacto',
  label: 'Equipe 3 Cards Compactos',
  category: 'Equipes',
  thumbnailKey: 'equipe-3-compacto',
  block: {
    height: 580,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      // Header
      {
        type: 'texto', x: 400, y: 70, w: 400, h: 24,
        html: 'TIME QUE FAZ ACONTECER',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: '3 fundadores. <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">+30 anos</span> de experiência.',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Cada um lidera uma área crítica do negócio com obsessão por resultado.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // ── 3 cards mais ricos ──
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const cardX = 100 + i * 340
        const data = [
          { photo: 33, name: 'Lucas Pereira', role: 'CEO',         years: '12 anos',
            quote: '"Lidero a estratégia. Não tomamos decisão sem dado."',
            stat: '+5.000', statLabel: 'empresas atendidas' },
          { photo: 49, name: 'Ana Souza',     role: 'CTO',         years: '10 anos',
            quote: '"Construo a tecnologia que escala. Zero downtime em 2 anos."',
            stat: '99.99%', statLabel: 'uptime mantido' },
          { photo: 12, name: 'Pedro Lima',    role: 'HEAD DESIGN', years: '8 anos',
            quote: '"Desenho experiências que vendem. Não é decoração — é conversão."',
            stat: '+312%',  statLabel: 'em conversão média' },
        ][i]
        return [
          // Card branco
          { type: 'caixa', x: cardX, y: 240, w: 320, h: 320,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          // Avatar maior (80) com border azul
          { type: 'circulo', x: cardX + 120, y: 270, w: 80, h: 80,
            bgImage: `https://i.pravatar.cc/160?img=${data.photo}`,
            borders: { color: '#dbeafe', width: 3,
              radius: r4(40), equalCorners: true } },
          // Years badge
          { type: 'caixa', x: cardX + 200, y: 318, w: 60, h: 22,
            bgColor: '#fbbf24',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto',
            x: cardX + 200, y: 322, w: 60, h: 16,
            html: data.years, fontSize: 10, fontWeight: 800,
            color: '#7c2d12', textAlign: 'center', letterSpacing: 0.5 },
          // Nome
          { type: 'titulo', headingLevel: 4,
            x: cardX, y: 366, w: 320, h: 26,
            html: data.name, fontSize: 18, fontWeight: 700,
            color: '#0f172a', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          // Cargo letterspaced
          { type: 'texto',
            x: cardX, y: 394, w: 320, h: 20,
            html: data.role, fontSize: 11, color: '#2563eb',
            textAlign: 'center', fontWeight: 800, letterSpacing: 2 },
          // Quote em italic
          { type: 'texto',
            x: cardX + 20, y: 422, w: 280, h: 60,
            html: `<em>${data.quote}</em>`, fontSize: 13,
            color: '#475569', textAlign: 'center', lineHeight: 1.5,
            fontFamily: 'Georgia, serif' },
          // Stat embaixo
          { type: 'caixa',
            x: cardX + 30, y: 498, w: 260, h: 1,
            bgColor: '#e2e8f0' },
          { type: 'titulo', headingLevel: 4,
            x: cardX, y: 510, w: 320, h: 28,
            html: data.stat, fontSize: 22, fontWeight: 900,
            color: '#16a34a', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: cardX, y: 540, w: 320, h: 16,
            html: data.statLabel, fontSize: 10, fontWeight: 600,
            color: '#94a3b8', textAlign: 'center', letterSpacing: 1 },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUTOS / BÔNUS (NOVA categoria — espelha "Produtos/Bônus" do GreatPages)
// ─────────────────────────────────────────────────────────────────────────────

const produtosBonusList: BlockTemplate = {
  id: 'produtos-bonus-list',
  label: 'Bônus em Lista',
  category: 'Produtos/Bônus',
  thumbnailKey: 'produtos-bonus-list',
  block: {
    height: 820,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#0b1220' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 60, w: 900, h: 24,
        html: 'TUDO QUE VOCÊ RECEBE · VALOR REAL DECLARADO',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 92, w: 900, h: 60,
        html: 'Pacote completo + <span style="background:linear-gradient(90deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">4 bônus exclusivos</span>',
        fontSize: 40, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      // Sub
      { type: 'texto', x: 200, y: 162, w: 800, h: 24,
        html: 'Cada bônus liberado imediatamente após a compra · Sem espera',
        fontSize: 15, color: '#94a3b8', textAlign: 'center' },

      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 220 + i * 96
        const titles = [
          'Templates Prontos pra Conversão',
          'Aulas ao Vivo Mensais (Q&A)',
          'Comunidade VIP no Discord',
          'Suporte 1:1 por 30 dias',
        ]
        const descs = [
          '50+ templates editáveis no Notion + Figma. Pronto pra qualquer nicho.',
          'Encontros mensais ao vivo com casos reais e estudos práticos.',
          'Networking direto com +500 alunos ativos e 12 mentores especialistas.',
          'Sessões individuais por chamada de vídeo pra tirar dúvidas técnicas.',
        ]
        const values = ['R$ 497', 'R$ 1.200', 'R$ 297', 'R$ 1.500']
        const accents = ['#fbbf24', '#60a5fa', '#a78bfa', '#34d399']
        return [
          // Card
          { type: 'caixa', x: 140, y, w: 920, h: 80,
            bgColor: '#111827',
            borders: { radius: r4(14), equalCorners: true,
              color: '#1f2937', width: 1 },
            shadow: 'soft' },
          // Faixa acento esquerda
          { type: 'caixa', x: 140, y: y + 16, w: 4, h: 48,
            bgColor: accents[i],
            borders: { radius: r4(2), equalCorners: true } },
          // Numero do bonus
          { type: 'circulo', x: 168, y: y + 20, w: 40, h: 40,
            bgColor: accents[i] },
          { type: 'texto', x: 168, y: y + 30, w: 40, h: 22,
            html: `${i + 1}`, fontSize: 16, fontWeight: 900,
            color: '#0f172a', textAlign: 'center' },
          // Title
          { type: 'titulo', headingLevel: 4,
            x: 224, y: y + 14, w: 600, h: 26,
            html: `Bônus #${i + 1}: ${titles[i]}`,
            fontSize: 17, fontWeight: 800, color: '#ffffff' },
          // Desc
          { type: 'texto',
            x: 224, y: y + 42, w: 600, h: 24,
            html: descs[i], fontSize: 13, color: '#94a3b8' },
          // Valor (lateral direita)
          { type: 'texto',
            x: 850, y: y + 18, w: 180, h: 18,
            html: 'VALOR', fontSize: 10, color: '#64748b',
            textAlign: 'right', letterSpacing: 2, fontWeight: 700 },
          { type: 'titulo', headingLevel: 4,
            x: 850, y: y + 36, w: 180, h: 28,
            html: values[i], fontSize: 22, fontWeight: 900,
            color: accents[i], textAlign: 'right' },
        ]
      }),

      // Total stack
      { type: 'caixa', x: C(0, 920), y: 624, w: 920, h: 1,
        bgColor: '#1f2937' },
      { type: 'texto', x: 224, y: 656, w: 400, h: 22,
        html: 'VALOR TOTAL DOS BÔNUS',
        fontSize: 12, color: '#94a3b8', letterSpacing: 2, fontWeight: 700 },
      { type: 'titulo', headingLevel: 3,
        x: 224, y: 678, w: 400, h: 36,
        html: 'R$ 3.494',
        fontSize: 32, fontWeight: 900, color: '#fbbf24',
        fontFamily: 'Plus Jakarta Sans' },

      // CTA
      { type: 'botao',
        x: 720, y: 660, w: 310, h: 60,
        text: 'QUERO TUDO ISSO →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 15, fontWeight: 900, borderRadius: 12,
        shadow: 'hard' },

      // Trust
      { type: 'icone', iconId: 'shield-check',
        x: 380, y: 750, w: 20, h: 20, color: '#34d399' },
      { type: 'texto', x: 408, y: 752, w: 500, h: 22,
        html: 'Acesso vitalício · Garantia incondicional 30 dias',
        fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
    ],
  },
}

const produtosBonusStack: BlockTemplate = {
  id: 'produtos-bonus-stack',
  label: 'Bônus em Pilha',
  category: 'Produtos/Bônus',
  thumbnailKey: 'produtos-bonus-stack',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#fef2f2' }] },
    elements: [
      // Eyebrow + scarcity badge
      { type: 'caixa', x: C(0, 280), y: 60, w: 280, h: 36,
        bgColor: '#fef2f2',
        borders: { radius: r4(999), equalCorners: true,
          color: '#fecaca', width: 1 } },
      { type: 'icone', iconId: 'flame',
        x: C(-90, 16), y: 70, w: 16, h: 16, color: '#dc2626' },
      { type: 'texto', x: C(-70, 240), y: 70, w: 240, h: 18,
        html: 'BÔNUS EXCLUSIVOS · 100 PRIMEIROS',
        fontSize: 12, fontWeight: 800, color: '#dc2626',
        letterSpacing: 2 },

      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 116, w: 900, h: 60,
        html: 'Garanta agora seu <span style="background:linear-gradient(90deg,#dc2626,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">acesso vip</span> + 3 bônus',
        fontSize: 38, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      // Sub
      { type: 'texto', x: 200, y: 186, w: 800, h: 24,
        html: 'Cada um vale mais que o curso · Liberados imediatamente após a compra',
        fontSize: 15, color: '#475569', textAlign: 'center' },

      // 3 cards de bônus em colunas
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 100 + i * 350
        const titles = [
          'Mentoria em Grupo',
          'App Mobile Vitalício',
          'Ebook + 12 Planilhas',
        ]
        const subs = [
          '4 encontros ao vivo · 90min cada',
          'iOS + Android · sincronia em nuvem',
          '180 páginas + planilhas Excel',
        ]
        const values = ['R$ 1.997', 'R$ 497', 'R$ 297']
        const icons  = ['headset' as const, 'rocket' as const, 'briefcase' as const]
        const tints  = ['#fef3c7', '#dbeafe', '#fce7f3']
        const colors = ['#d97706', '#2563eb', '#db2777']
        return [
          // Card
          { type: 'caixa', x, y: 250, w: 320, h: 380,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#fee2e2', width: 1 },
            shadow: 'hard' },
          // Faixa acento topo
          { type: 'caixa', x, y: 250, w: 320, h: 4,
            bgColor: '#dc2626',
            borders: { radius: r4(2), equalCorners: true } },
          // Bônus number badge
          { type: 'caixa', x: x + 24, y: 274, w: 90, h: 28,
            bgColor: '#fef2f2',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto', x: x + 24, y: 280, w: 90, h: 18,
            html: `BÔNUS #${i + 1}`, fontSize: 11, fontWeight: 800,
            color: '#dc2626', textAlign: 'center', letterSpacing: 1 },
          // Imagem ilustrada (caixa colorida + ícone)
          { type: 'caixa', x: x + 24, y: 320, w: 272, h: 130,
            bgColor: tints[i],
            borders: { radius: r4(14), equalCorners: true } },
          { type: 'circulo', x: x + 130, y: 350, w: 60, h: 60,
            bgColor: '#ffffff', shadow: 'soft' },
          { type: 'icone', iconId: icons[i],
            x: x + 144, y: 364, w: 32, h: 32, color: colors[i] },
          // Title
          { type: 'titulo', headingLevel: 4,
            x: x + 24, y: 470, w: 272, h: 28,
            html: titles[i], fontSize: 18, fontWeight: 800,
            color: '#0f172a' },
          // Sub
          { type: 'texto',
            x: x + 24, y: 502, w: 272, h: 22,
            html: subs[i], fontSize: 13, color: '#64748b' },
          // Valor riscado
          { type: 'texto',
            x: x + 24, y: 540, w: 130, h: 22,
            html: `<s style="color:#94a3b8">${values[i]}</s>`,
            fontSize: 14, color: '#94a3b8' },
          // GRÁTIS badge
          { type: 'caixa', x: x + 160, y: 538, w: 110, h: 28,
            bgColor: '#dcfce7',
            borders: { radius: r4(999), equalCorners: true } },
          { type: 'texto', x: x + 160, y: 544, w: 110, h: 18,
            html: '✓ GRÁTIS PRA VOCÊ', fontSize: 10, fontWeight: 800,
            color: '#15803d', textAlign: 'center', letterSpacing: 1 },
          // Tag de status
          { type: 'icone', iconId: 'check-circle',
            x: x + 24, y: 588, w: 16, h: 16, color: '#16a34a' },
          { type: 'texto',
            x: x + 46, y: 588, w: 240, h: 20,
            html: 'Liberado após a compra',
            fontSize: 12, color: '#16a34a', fontWeight: 600 },
        ]
      }),

      // Trust line
      { type: 'texto', x: 200, y: 666, w: 800, h: 24,
        html: '🔒 Total dos bônus: <span style="font-weight:800;color:#dc2626">R$ 2.791</span> · Você leva tudo grátis',
        fontSize: 14, color: '#475569', textAlign: 'center' },
    ],
  },
}

const produtosOferta: BlockTemplate = {
  id: 'produtos-oferta',
  label: 'Oferta Final c/ Stack',
  category: 'Produtos/Bônus',
  thumbnailKey: 'produtos-oferta',
  block: {
    height: 880,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0b1220' }, { color: '#1e3a8a' }, { color: '#4338ca' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 60, w: 900, h: 24,
        html: 'OFERTA COMPLETA · ÚLTIMA VEZ NESTE PREÇO',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 92, w: 900, h: 60,
        html: 'Tudo isso por um <span style="background:linear-gradient(90deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">valor único</span>',
        fontSize: 42, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      // Sub
      { type: 'texto', x: 200, y: 162, w: 800, h: 24,
        html: 'Acesso vitalício · Pagamento à vista ou em até 12x',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center' },

      // Card stack (lifted)
      { type: 'caixa', x: C(0, 640), y: 220, w: 640, h: 460,
        bgColor: '#ffffff',
        borders: { radius: r4(24), equalCorners: true },
        shadow: 'hard' },
      // Faixa topo do card
      { type: 'caixa', x: C(0, 640), y: 220, w: 640, h: 6,
        bgColor: '#fbbf24',
        borders: { radius: r4(3), equalCorners: true } },

      // Card header
      { type: 'texto', x: C(-280, 560), y: 252, w: 560, h: 22,
        html: 'O QUE VOCÊ LEVA',
        fontSize: 12, fontWeight: 800, color: '#94a3b8',
        letterSpacing: 3 },

      ...[0,1,2,3,4].flatMap((i): ElemInput[] => {
        const y = 290 + i * 52
        const items  = [
          'Curso completo (12 módulos · 24h aula)',
          'Templates editáveis (Notion + Figma)',
          'Mentoria em grupo (4 encontros ao vivo)',
          'Comunidade VIP no Discord',
          'Suporte 1:1 com mentor (30 dias)',
        ]
        const values = ['R$ 1.997', 'R$ 497', 'R$ 1.200', 'R$ 297', 'R$ 1.500']
        return [
          // Linha
          { type: 'caixa', x: C(-280, 560), y: y + 36, w: 560, h: 1,
            bgColor: '#f1f5f9' },
          // Check
          { type: 'icone', iconId: 'check-circle',
            x: C(-280, 22), y: y + 8, w: 22, h: 22, color: '#16a34a' },
          // Item
          { type: 'texto',
            x: C(-248, 380), y: y + 6, w: 380, h: 26,
            html: items[i], fontSize: 15, color: '#1e293b', fontWeight: 600 },
          // Valor
          { type: 'texto',
            x: C(140, 140), y: y + 6, w: 140, h: 26,
            html: values[i], fontSize: 15, color: '#94a3b8',
            textAlign: 'right' },
        ]
      }),

      // Total stack box
      { type: 'caixa', x: C(0, 600), y: 590, w: 600, h: 76,
        bgColor: '#0f172a',
        borders: { radius: r4(14), equalCorners: true } },
      { type: 'texto', x: C(-260, 220), y: 608, w: 220, h: 22,
        html: 'TOTAL HOJE',
        fontSize: 12, fontWeight: 800, color: '#94a3b8',
        letterSpacing: 3 },
      { type: 'texto', x: C(-260, 220), y: 632, w: 220, h: 24,
        html: 'De <s style="color:#94a3b8">R$ 5.491</s> por apenas',
        fontSize: 13, color: '#fbbf24' },
      { type: 'titulo', headingLevel: 3,
        x: C(120, 240), y: 612, w: 240, h: 44,
        html: 'R$ <span style="font-size:46px">497</span>',
        fontSize: 22, fontWeight: 900, color: '#fbbf24',
        textAlign: 'right', fontFamily: 'Plus Jakarta Sans' },
      { type: 'texto', x: C(120, 240), y: 654, w: 240, h: 18,
        html: 'ou 12x de R$ 49,70',
        fontSize: 12, color: '#cbd5e1', textAlign: 'right' },

      // CTA
      { type: 'botao',
        x: C(0, 420), y: 720, w: 420, h: 64,
        text: 'QUERO GARANTIR MEU ACESSO →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 900, borderRadius: 14,
        shadow: 'hard' },

      // Trust row
      { type: 'icone', iconId: 'shield-check',
        x: 320, y: 802, w: 18, h: 18, color: '#34d399' },
      { type: 'texto', x: 344, y: 803, w: 200, h: 20,
        html: 'Pagamento seguro',
        fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
      { type: 'icone', iconId: 'check-circle',
        x: 552, y: 802, w: 18, h: 18, color: '#34d399' },
      { type: 'texto', x: 576, y: 803, w: 200, h: 20,
        html: 'Garantia 30 dias',
        fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
      { type: 'icone', iconId: 'lock',
        x: 760, y: 802, w: 18, h: 18, color: '#34d399' },
      { type: 'texto', x: 784, y: 803, w: 200, h: 20,
        html: 'SSL · 256 bits',
        fontSize: 13, color: '#cbd5e1', fontWeight: 500 },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO — adições profissionais (gradient + SVG icons)
// ─────────────────────────────────────────────────────────────────────────────

const heroComStats: BlockTemplate = {
  id: 'hero-com-stats',
  label: 'Hero com Estatísticas',
  category: 'Hero',
  thumbnailKey: 'hero-com-stats',
  block: {
    height: 720,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e293b' }, { color: '#0f172a' }] },
    elements: [
      {
        type: 'caixa', x: C(0, 240), y: 90, w: 240, h: 36,
        bgColor: 'rgba(96,165,250,0.1)',
        borders: { radius: [999, 999, 999, 999], equalCorners: true,
          color: 'rgba(96,165,250,0.2)', width: 1 },
      },
      {
        type: 'texto', x: C(0, 240), y: 99, w: 240, h: 22,
        html: '⚡ Lançamento 2026', fontSize: 12, color: '#93c5fd',
        textAlign: 'center', fontWeight: 600,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 1000), y: 150, w: 1000, h: 140,
        html: 'A plataforma <span style="background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent">tudo-em-um</span> que escala seu negócio',
        fontSize: 56, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', lineHeight: 1.1, fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: C(0, 720), y: 320, w: 720, h: 60,
        html: 'CRM, automação, pagamentos e analytics — tudo integrado em uma única plataforma. Setup em 5 minutos.',
        fontSize: 18, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(0, 280), y: 420, w: 280, h: 60,
        text: 'Começar grátis 14 dias →',
        bgColor: '#3b82f6', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 12,
      },
      // Stats cards na parte inferior
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 100 + i * 260
        const numbers = ['+10mil', '99.9%', 'R$1.2B', '4.9/5']
        const labels  = ['Clientes ativos', 'Uptime', 'Processados', 'Avaliação']
        return [
          { type: 'titulo', headingLevel: 3,
            x, y: 540, w: 240, h: 50,
            html: numbers[i], fontSize: 36, fontWeight: 900,
            color: '#60a5fa', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 596, w: 240, h: 22,
            html: labels[i], fontSize: 13, color: '#94a3b8',
            textAlign: 'center', letterSpacing: 1 },
        ]
      }),
    ],
  },
}

const heroSplitBeneficios: BlockTemplate = {
  id: 'hero-split-beneficios',
  label: 'Hero Split com Benefícios',
  category: 'Hero',
  thumbnailKey: 'hero-split-beneficios',
  block: {
    height: 620,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'texto', x: 100, y: 100, w: 540, h: 28,
        html: 'PLATAFORMA #1 DO BRASIL', fontSize: 13, fontWeight: 700,
        color: '#2563eb', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: 100, y: 140, w: 540, h: 130,
        html: 'Vendas no piloto automático em 30 dias',
        fontSize: 50, fontWeight: 800, color: '#0f172a',
        lineHeight: 1.1, fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: 100, y: 290, w: 540, h: 56,
        html: 'O sistema usado por 5.000+ empresas para automatizar prospecção, qualificação e fechamento.',
        fontSize: 17, color: '#475569', lineHeight: 1.6,
      },
      // Lista de benefícios com SVG checks
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const y = 360 + i * 36
        const items = [
          'Setup completo em 5 minutos',
          'Sem mensalidade nos primeiros 14 dias',
          'Cancele quando quiser, sem multas',
        ]
        return [
          { type: 'icone', iconId: 'check-circle',
            x: 100, y, w: 24, h: 24, color: '#16a34a' },
          { type: 'texto',
            x: 132, y: y + 2, w: 460, h: 22,
            html: items[i], fontSize: 15, color: '#1e293b', fontWeight: 500 },
        ]
      }),
      {
        type: 'botao',
        x: 100, y: 490, w: 240, h: 56,
        text: 'Começar agora →',
        bgColor: '#2563eb', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
      // Imagem direita
      {
        type: 'imagem',
        x: 690, y: 80, w: 410, h: 460,
        src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=820&q=80',
        objectFit: 'cover',
        borders: { radius: [20, 20, 20, 20], equalCorners: true },
        shadow: 'hard',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SOBRE — adições (Missão/Valores)
// ─────────────────────────────────────────────────────────────────────────────

const sobreMissaoValores: BlockTemplate = {
  id: 'sobre-missao-valores',
  label: 'Missão · Visão · Valores',
  category: 'Sobre',
  thumbnailKey: 'sobre-missao-valores',
  block: {
    height: 640,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#ffffff' }, { color: '#f8fafc' }] },
    elements: [
      {
        type: 'texto', x: 200, y: 70, w: 800, h: 24,
        html: 'O QUE NOS MOVE',
        fontSize: 13, fontWeight: 800, color: '#2563eb',
        textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 105, w: 1000, h: 60,
        html: 'Nossos <span style="background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">princípios</span> em 3 frases',
        fontSize: 40, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        letterSpacing: -1,
      },
      {
        type: 'texto',
        x: 250, y: 175, w: 700, h: 30,
        html: 'Não é frase de marketing — é a régua que usamos pra cada decisão.',
        fontSize: 15, color: '#64748b', textAlign: 'center',
      },
      // 3 cards premium
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const cardX = 100 + i * 340
        const data = [
          { icon: 'target' as const,  title: 'Missão',
            tagline: 'POR QUE EXISTIMOS',
            desc: 'Empoderar empreendedores brasileiros com tecnologia profissional acessível e descomplicada.',
            color: '#2563eb', bg: '#eff6ff' },
          { icon: 'rocket' as const,  title: 'Visão',
            tagline: 'AONDE QUEREMOS CHEGAR',
            desc: 'Ser a plataforma escolhida por 1 milhão de pequenos negócios brasileiros até 2030.',
            color: '#7c3aed', bg: '#f5f3ff' },
          { icon: 'star' as const,    title: 'Valores',
            tagline: 'COMO TRABALHAMOS',
            desc: 'Transparência radical, foco no cliente e qualidade obsessiva em cada detalhe que entregamos.',
            color: '#f59e0b', bg: '#fffbeb' },
        ][i]
        return [
          // Card branco
          { type: 'caixa', x: cardX, y: 240, w: 320, h: 340,
            bgColor: '#ffffff',
            borders: { radius: r4(20), equalCorners: true,
              color: '#e2e8f0', width: 1 },
            shadow: 'soft' },
          // Faixa colorida acento topo
          { type: 'caixa', x: cardX, y: 240, w: 320, h: 4,
            bgColor: data.color,
            borders: { radius: [20, 20, 0, 0], equalCorners: false } },
          // Icon circle grande
          { type: 'circulo',
            x: cardX + 130, y: 280, w: 60, h: 60,
            bgColor: data.bg },
          { type: 'icone', iconId: data.icon,
            x: cardX + 148, y: 298, w: 24, h: 24, color: data.color },
          // Tagline letterspaced (acima do título)
          { type: 'texto',
            x: cardX, y: 360, w: 320, h: 20,
            html: data.tagline, fontSize: 10, fontWeight: 800,
            color: data.color, textAlign: 'center', letterSpacing: 2 },
          // Title big
          { type: 'titulo', headingLevel: 3,
            x: cardX, y: 384, w: 320, h: 36,
            html: data.title, fontSize: 26, fontWeight: 800,
            color: '#0f172a', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -1 },
          // Linha separadora curta
          { type: 'caixa', x: cardX + 130, y: 432, w: 60, h: 2,
            bgColor: data.color },
          // Descrição
          { type: 'texto',
            x: cardX + 28, y: 450, w: 264, h: 110,
            html: data.desc, fontSize: 14, color: '#64748b',
            textAlign: 'center', lineHeight: 1.6 },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANOS — adições
// ─────────────────────────────────────────────────────────────────────────────

const planosToggle: BlockTemplate = {
  id: 'planos-toggle',
  label: 'Planos com Toggle Anual',
  category: 'Planos',
  thumbnailKey: 'planos-toggle',
  block: {
    height: 880,
    bgGradient: { type: 'linear', angle: 180,
      stops: [{ color: '#0b1220' }, { color: '#0f172a' }, { color: '#1e1b4b' }] },
    elements: [
      // Eyebrow
      { type: 'texto', x: 150, y: 64, w: 900, h: 22,
        html: 'PLANOS · ECONOMIZE 20% COM PAGAMENTO ANUAL',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3 },
      // Headline
      { type: 'titulo', headingLevel: 2,
        x: 150, y: 96, w: 900, h: 60,
        html: 'Escolha o <span style="background:linear-gradient(90deg,#60a5fa,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">plano ideal</span> pra você',
        fontSize: 42, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
      // Sub
      { type: 'texto', x: 200, y: 168, w: 800, h: 24,
        html: 'Cancele quando quiser · Sem fidelidade · Suporte humano em todos',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center' },

      // ─── Toggle Mensal/Anual (interativo) ───
      // Container do toggle (lp-billing-toggle = scope do JS)
      { type: 'caixa', x: C(0, 280), y: 220, w: 280, h: 48,
        bgColor: '#1e293b',
        borders: { radius: r4(999), equalCorners: true,
          color: '#334155', width: 1 },
        cssClass: 'lp-billing-toggle' },
      // Pill ativa MENSAL (visível por default)
      { type: 'caixa', x: C(-70, 130), y: 224, w: 130, h: 40,
        bgColor: '#3b82f6',
        borders: { radius: r4(999), equalCorners: true },
        shadow: 'soft',
        cssClass: 'lp-billing-pill-monthly' },
      // Pill ativa ANUAL (oculta por default — JS mostra ao clicar Anual)
      { type: 'caixa', x: C(60, 130), y: 224, w: 130, h: 40,
        bgColor: '#3b82f6',
        borders: { radius: r4(999), equalCorners: true },
        shadow: 'soft',
        cssClass: 'lp-billing-pill-yearly' },
      // Botão "Mensal" (clicável — lp-billing-toggle-monthly)
      { type: 'texto', x: C(-70, 130), y: 236, w: 130, h: 20,
        html: 'Mensal', fontSize: 14, color: '#ffffff',
        textAlign: 'center', fontWeight: 700,
        cssClass: 'lp-billing-toggle-monthly' },
      // Botão "Anual −20%" (clicável — lp-billing-toggle-yearly)
      { type: 'texto', x: C(60, 130), y: 236, w: 130, h: 20,
        html: 'Anual <span style="color:#fbbf24;font-weight:800">−20%</span>',
        fontSize: 14, color: '#cbd5e1',
        textAlign: 'center', fontWeight: 600,
        cssClass: 'lp-billing-toggle-yearly' },

      // 3 planos
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 100 + i * 340
        const tiers   = ['STARTER', 'GROWTH', 'SCALE']
        const subs    = ['Pra começar', 'Pra crescer', 'Pra escalar']
        const pricesMonthly = ['R$ 49', 'R$ 149', 'R$ 449']
        const pricesYearly  = ['R$ 39', 'R$ 119', 'R$ 359'] // 20% off prorated /mês
        const savingsMonthly = [
          'Economize R$ 118 no anual',
          '💰 Economize R$ 358 no plano anual',
          'Economize R$ 1.078 no anual',
        ]
        const savingsYearly = [
          'Cobrança anual: R$ 468/ano',
          '💰 Cobrança anual: R$ 1.428/ano',
          'Cobrança anual: R$ 4.308/ano',
        ]
        const accents = ['#60a5fa', '#fbbf24', '#a78bfa']
        const featured = i === 1
        return [
          // Card
          { type: 'caixa', x, y: 300, w: 320, h: 540,
            bgColor: featured ? '#1e3a8a' : '#111827',
            borders: { radius: r4(20), equalCorners: true,
              color: featured ? '#fbbf24' : '#1f2937',
              width: featured ? 2 : 1 },
            shadow: featured ? 'hard' : 'soft' },
          // Faixa acento esquerda
          { type: 'caixa', x: x + 0, y: 320, w: 4, h: 80,
            bgColor: accents[i],
            borders: { radius: r4(2), equalCorners: true } },
          // Badge POPULAR (só Growth)
          ...(featured ? [{
            type: 'caixa' as const, x: x + 90, y: 280, w: 140, h: 36,
            bgColor: '#fbbf24',
            borders: { radius: r4(999), equalCorners: true },
            shadow: 'soft' as const,
          }, {
            type: 'texto' as const, x: x + 90, y: 290, w: 140, h: 20,
            html: '⭐ MAIS POPULAR', fontSize: 11, fontWeight: 800,
            color: '#7c2d12', textAlign: 'center' as const, letterSpacing: 1,
          }] : []),
          // Tier label
          { type: 'texto',
            x: x + 28, y: 340, w: 270, h: 22,
            html: tiers[i], fontSize: 12, fontWeight: 800,
            color: accents[i], letterSpacing: 3 },
          // Sub
          { type: 'texto',
            x: x + 28, y: 366, w: 270, h: 24,
            html: subs[i], fontSize: 14, color: '#cbd5e1', fontWeight: 500 },
          // Price MENSAL (visible por default — lp-billing-monthly)
          { type: 'titulo', headingLevel: 3,
            x: x + 28, y: 400, w: 270, h: 64,
            html: `${pricesMonthly[i]}<span style="font-size:14px;color:#94a3b8">/mês</span>`,
            fontSize: 44, fontWeight: 900,
            color: '#ffffff', fontFamily: 'Plus Jakarta Sans',
            cssClass: 'lp-billing-monthly' },
          // Price ANUAL (oculto por default — lp-billing-yearly)
          { type: 'titulo', headingLevel: 3,
            x: x + 28, y: 400, w: 270, h: 64,
            html: `${pricesYearly[i]}<span style="font-size:14px;color:#94a3b8">/mês</span>`,
            fontSize: 44, fontWeight: 900,
            color: '#ffffff', fontFamily: 'Plus Jakarta Sans',
            cssClass: 'lp-billing-yearly' },
          // Economia anual — 2 versões
          { type: 'texto',
            x: x + 28, y: 470, w: 270, h: 20,
            html: savingsMonthly[i],
            fontSize: 12, color: featured ? '#fbbf24' : '#94a3b8',
            fontWeight: 600,
            cssClass: 'lp-billing-monthly' },
          { type: 'texto',
            x: x + 28, y: 470, w: 270, h: 20,
            html: savingsYearly[i],
            fontSize: 12, color: featured ? '#fbbf24' : '#86efac',
            fontWeight: 600,
            cssClass: 'lp-billing-yearly' },
          // Divisor
          { type: 'caixa', x: x + 28, y: 504, w: 264, h: 1,
            bgColor: '#1f2937' },
          // Features
          ...[0,1,2,3,4].flatMap((j): ElemInput[] => {
            const fy = 524 + j * 32
            const features = [
              ['1.000 contatos', '10.000 contatos', 'Contatos ilimitados'],
              ['1 usuário', '5 usuários', 'Usuários ilimitados'],
              ['Email suporte', 'Chat prioritário 24/7', 'Gerente dedicado'],
              ['Templates básicos', 'Templates premium', 'Templates customizados'],
              ['Sem API', 'API + Zapier', 'API + webhooks + SSO'],
            ]
            return [
              { type: 'icone', iconId: 'check-circle',
                x: x + 28, y: fy, w: 18, h: 18,
                color: accents[i] },
              { type: 'texto',
                x: x + 54, y: fy + 1, w: 240, h: 20,
                html: features[j][i], fontSize: 13,
                color: '#e5e7eb', fontWeight: 500 },
            ]
          }),
          // CTA
          { type: 'botao',
            x: x + 28, y: 770, w: 264, h: 50,
            text: featured ? 'Começar agora →' : 'Escolher plano',
            bgColor: featured ? '#fbbf24' : 'transparent',
            color: featured ? '#7c2d12' : '#ffffff',
            fontSize: 15, fontWeight: 800, borderRadius: 12,
            shadow: featured ? 'hard' : undefined,
            ...(featured ? {} : {
              borders: { width: 1, color: '#475569',
                radius: r4(12), equalCorners: true } }),
          },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA — adições
// ─────────────────────────────────────────────────────────────────────────────

const ctaSocialProof: BlockTemplate = {
  id: 'cta-social-proof',
  label: 'CTA com Prova Social',
  category: 'CTA',
  thumbnailKey: 'cta-social-proof',
  block: {
    height: 540,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#1e3a8a' }, { color: '#4338ca' }, { color: '#7c3aed' }] },
    elements: [
      // Avatares empilhados centralizados (5 × 36 com 22px stride = 124w)
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 538 + i * 22, y: 80, w: 36, h: 36,
        bgImage: `https://i.pravatar.cc/72?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#ffffff', width: 3,
          radius: r4(18), equalCorners: true },
        shadow: 'soft',
      })),
      // 5 estrelas filled SVG centralizadas
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 540 + i * 24, y: 134, w: 20, h: 20, color: '#fbbf24',
      })),
      {
        type: 'texto', x: 200, y: 162, w: 800, h: 24,
        html: '<strong style="color:white">4.9/5</strong> · 5.000+ profissionais já usam',
        fontSize: 14, color: '#cbd5e1', textAlign: 'center',
      },
      // Headline com gradient text
      {
        type: 'titulo', headingLevel: 2,
        x: 50, y: 210, w: 1100, h: 110,
        html: 'Já vendemos <span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">R$ 12 milhões</span><br>com nossos clientes',
        fontSize: 44, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        lineHeight: 1.2, letterSpacing: -1,
      },
      // CTA
      {
        type: 'botao',
        x: 420, y: 360, w: 360, h: 64,
        text: 'Quero fazer parte →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 17, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
      // Trust signals row 3
      {
        type: 'icone', iconId: 'check-circle',
        x: 360, y: 460, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 384, y: 458, w: 200, h: 22,
        html: 'Sem cartão de crédito', fontSize: 13, color: '#cbd5e1' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 600, y: 460, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 624, y: 458, w: 200, h: 22,
        html: 'Cancele quando quiser', fontSize: 13, color: '#cbd5e1' },
      {
        type: 'icone', iconId: 'check-circle',
        x: 840, y: 460, w: 18, h: 18, color: '#86efac',
      },
      { type: 'texto', x: 864, y: 458, w: 160, h: 22,
        html: 'Setup em 5 min', fontSize: 13, color: '#cbd5e1' },
    ],
  },
}

const ctaFundoFoto: BlockTemplate = {
  id: 'cta-fundo-foto',
  label: 'CTA com Foto de Fundo',
  category: 'CTA',
  thumbnailKey: 'cta-fundo-foto',
  block: {
    height: 560,
    bgColor: '#0f172a',
    bgImage: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&q=80',
    bgSize: 'cover',
    bgPosition: 'center',
    bgOverlayColor: '#0f172a',
    bgOverlayOpacity: 0.78,
    elements: [
      // Eyebrow
      {
        type: 'texto', x: 200, y: 80, w: 800, h: 24,
        html: 'TRANSFORME SEU RESULTADO HOJE',
        fontSize: 13, fontWeight: 800, color: '#fbbf24',
        textAlign: 'center', letterSpacing: 3,
      },
      // Headline com gradient
      {
        type: 'titulo', headingLevel: 2,
        x: 50, y: 120, w: 1100, h: 130,
        html: 'Pronto pra <span style="background:linear-gradient(135deg,#fbbf24,#f97316);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent">mudar seus resultados</span>?',
        fontSize: 52, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
        lineHeight: 1.15, letterSpacing: -1,
      },
      // Subheadline
      {
        type: 'texto', x: 250, y: 270, w: 700, h: 50,
        html: 'Comece hoje. Veja resultado em 7 dias. Garanta sua vaga agora.',
        fontSize: 18, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5,
      },
      // CTA
      {
        type: 'botao',
        x: 420, y: 350, w: 360, h: 64,
        text: 'COMEÇAR AGORA →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 17, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
      },
      // Avatares + rating row
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'circulo' as const,
        x: 470 + i * 22, y: 446, w: 32, h: 32,
        bgImage: `https://i.pravatar.cc/64?img=${[33, 49, 12, 26, 47][i]}`,
        borders: { color: '#0f172a', width: 2,
          radius: r4(16), equalCorners: true },
      })),
      ...[0,1,2,3,4].map((i): ElemInput => ({
        type: 'icone' as const, iconId: 'star-filled',
        x: 600 + i * 22, y: 451, w: 16, h: 16, color: '#fbbf24',
      })),
      { type: 'texto', x: 720, y: 452, w: 280, h: 22,
        html: '<strong style="color:white">+5.000 já usam</strong>',
        fontSize: 13, color: '#cbd5e1' },
      // Trust footer
      {
        type: 'texto', x: 200, y: 500, w: 800, h: 22,
        html: '🔒 Pagamento seguro · Garantia 30 dias · Suporte 24/7',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// AVISO DESTAQUE (banner de alerta no topo)
// ─────────────────────────────────────────────────────────────────────────────

const avisoDestaque: BlockTemplate = {
  id: 'aviso-destaque',
  label: 'Banner de Aviso',
  category: 'Elementos',
  thumbnailKey: 'aviso-destaque',
  block: {
    height: 96,
    bgGradient: { type: 'linear', angle: 90,
      stops: [{ color: '#fef3c7' }, { color: '#fde68a' }, { color: '#fcd34d' }] },
    elements: [
      // Borda inferior amber
      { type: 'caixa', x: 0, y: 92, w: 1200, h: 4,
        bgColor: '#f59e0b' },
      // Pill com ícone (esquerda)
      { type: 'caixa', x: 280, y: 32, w: 36, h: 32,
        bgColor: '#7c2d12',
        borders: { radius: r4(999), equalCorners: true },
        shadow: 'soft' },
      { type: 'icone', iconId: 'flame',
        x: 288, y: 40, w: 20, h: 20, color: '#fbbf24' },
      // Mensagem
      { type: 'texto',
        x: 328, y: 32, w: 600, h: 24,
        html: '<strong style="font-weight:900;letter-spacing:1px">ATENÇÃO:</strong> Últimas <strong>17 vagas</strong> · Inscrições encerram hoje à meia-noite',
        fontSize: 15, color: '#7c2d12', fontWeight: 600 },
      // Sub
      { type: 'texto',
        x: 328, y: 56, w: 600, h: 20,
        html: 'Próxima turma só em 60 dias e com valor reajustado',
        fontSize: 12, color: '#92400e', fontWeight: 500 },
      // CTA inline
      { type: 'botao',
        x: 940, y: 30, w: 180, h: 40,
        text: 'Garantir vaga →',
        bgColor: '#7c2d12', color: '#fef3c7',
        fontSize: 13, fontWeight: 800, borderRadius: 10,
        shadow: 'hard' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCKS_LIBRARY: BlockTemplate[] = [
  // Hero
  heroGradiente,
  heroDoisCol,
  heroClaro,
  heroComVideo,
  heroMinimalista,
  heroCaptura,
  heroComStats,
  heroSplitBeneficios,
  // Benefícios
  beneficios3Col,
  beneficiosLista,
  beneficiosDark,
  beneficiosHorizontal,
  // Depoimentos
  depoimentos3Cards,
  depoimentoHighlight,
  depoimentos2Vertical,
  depoimentosLogos,
  depoimentoVideo,
  // Equipes
  equipe4Cards,
  equipeFundadorDestaque,
  equipe3CardsCompacto,
  // Estatísticas
  estatisticas4Col,
  estatisticasDark,
  // Formulários
  formularioCaptura,
  formularioClaro,
  formularioContato,
  // CTA
  ctaSimples,
  ctaUrgencia,
  ctaDoisBotoes,
  ctaSocialProof,
  ctaFundoFoto,
  // Timer
  timerUrgencia,
  timerSimples,
  timerHeroOferta,
  timerStripCompacto,
  timerComDesconto,
  // Sobre
  sobreBio,
  sobreEmpresa,
  sobreMissaoValores,
  // Garantia
  garantia30Dias,
  garantia7Dias,
  garantiaSeloLateral,
  garantiaChecklist,
  garantiaTripla,
  garantiaStrip,
  garantiaPremium,
  // Vídeo
  videoCentral,
  videoComTexto,
  // FAQ
  faqLista,
  faqDuasColunas,
  faqDark,
  // Planos
  planoUnico,
  planos3Cards,
  planosToggle,
  // Produtos/Bônus
  produtosBonusList,
  produtosBonusStack,
  produtosOferta,
  // Timeline
  timelinePassos,
  timelineVerticalZigzag,
  timelineProcessoVertical,
  timelineMarcosNumerados,
  // Galeria
  galeria6Itens,
  galeriaMasonry,
  galeriaAntesDepois,
  galeriaTextoLateral,
  galeriaLogosClientes,
  // Rodapé
  rodapeSimples,
  rodapeCompleto,
  // Elementos
  avisoDestaque,
]

export const BLOCKS_CATEGORIES = [
  'Hero', 'Benefícios', 'Depoimentos', 'Equipes', 'Estatísticas',
  'Formulários', 'CTA', 'Timer', 'Sobre', 'Garantia', 'Vídeo',
  'FAQ', 'Planos', 'Produtos/Bônus', 'Timeline', 'Galeria',
  'Rodapé', 'Elementos',
] as const
