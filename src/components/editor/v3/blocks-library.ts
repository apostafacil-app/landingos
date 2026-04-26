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
    height: 480,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 1000), y: 140, w: 1000, h: 110,
        html: 'A maneira mais simples de crescer',
        fontSize: 64, fontWeight: 900, color: '#0f172a', textAlign: 'center', lineHeight: 1.1,
      },
      {
        type: 'texto',
        x: C(0, 700), y: 280, w: 700, h: 50,
        html: 'Sem complicação. Sem mensalidade. Sem fidelidade.',
        fontSize: 20, color: '#475569', textAlign: 'center', lineHeight: 1.5,
      },
      {
        type: 'botao',
        x: C(0, 240), y: 360, w: 240, h: 56,
        text: 'Começar agora',
        bgColor: '#0f172a', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 6,
      },
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
    height: 500,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'imagem',
        x: 150, y: 80, w: 320, h: 380,
        src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=640&q=80',
        objectFit: 'cover',
        borders: { radius: [200, 200, 200, 200], equalCorners: true },
      },
      {
        type: 'texto',
        x: 540, y: 100, w: 540, h: 24,
        html: 'SOBRE MIM', fontSize: 14, color: '#2563eb', fontWeight: 700, letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 540, y: 130, w: 540, h: 70,
        html: 'Mais de 10 anos transformando vidas',
        fontSize: 40, fontWeight: 800, color: '#0f172a', lineHeight: 1.15,
      },
      {
        type: 'texto',
        x: 540, y: 230, w: 540, h: 130,
        html: 'Comecei do zero e construí um caminho que ajudou centenas de pessoas. Hoje, divido meus aprendizados com quem está pronto pra dar o próximo passo.',
        fontSize: 16, color: '#475569', lineHeight: 1.7,
      },
      {
        type: 'botao',
        x: 540, y: 380, w: 220, h: 52,
        text: 'Conheça minha história',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 15, fontWeight: 600, borderRadius: 8,
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
    height: 160,
    bgColor: '#f0fdf4',
    elements: [
      // Card branco horizontal centralizado
      // Layout: 1000w centralizado em 1200 = x=100. Conteúdo:
      // [icon 60] [text col 540] [trust col 240] = 840 + paddings 80 = 920
      {
        type: 'caixa', x: 100, y: 30, w: 1000, h: 100,
        bgColor: '#ffffff',
        borders: { radius: r4(16), equalCorners: true,
          color: '#bbf7d0', width: 1 },
        shadow: 'soft',
      },
      // Faixa verde acento esquerda
      {
        type: 'caixa', x: 100, y: 30, w: 4, h: 100,
        bgColor: '#16a34a',
        borders: { radius: [16, 0, 0, 16], equalCorners: false },
      },
      // Shield icon left
      {
        type: 'circulo', x: 140, y: 52, w: 56, h: 56,
        bgColor: '#dcfce7',
      },
      {
        type: 'icone', iconId: 'shield-check',
        x: 154, y: 66, w: 28, h: 28, color: '#16a34a',
      },
      // Title + sub
      {
        type: 'titulo', headingLevel: 4,
        x: 220, y: 54, w: 540, h: 26,
        html: 'Garantia incondicional de <span style="color:#16a34a">30 dias</span>',
        fontSize: 17, fontWeight: 700, color: '#0f172a',
        fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: 220, y: 84, w: 540, h: 22,
        html: 'Não gostou? Devolvemos 100% do valor sem burocracia.',
        fontSize: 13, color: '#64748b',
      },
      // Trust signals à direita
      {
        type: 'icone', iconId: 'check-circle',
        x: 800, y: 56, w: 16, h: 16, color: '#16a34a',
      },
      { type: 'texto', x: 822, y: 54, w: 240, h: 20,
        html: '100% reembolso', fontSize: 12, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 800, y: 80, w: 16, h: 16, color: '#16a34a',
      },
      { type: 'texto', x: 822, y: 78, w: 240, h: 20,
        html: 'Sem perguntas', fontSize: 12, color: '#475569', fontWeight: 600 },
      {
        type: 'icone', iconId: 'check-circle',
        x: 800, y: 104, w: 16, h: 16, color: '#16a34a',
      },
      { type: 'texto', x: 822, y: 102, w: 240, h: 20,
        html: 'Em até 7 dias', fontSize: 12, color: '#475569', fontWeight: 600 },
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
    height: 600,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Veja como funciona',
        fontSize: 36, fontWeight: 800, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 30,
        html: 'Assista o vídeo abaixo e descubra os detalhes do método.',
        fontSize: 16, color: '#94a3b8', textAlign: 'center',
      },
      {
        type: 'video',
        x: C(0, 800), y: 200, w: 800, h: 360,
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
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
    height: 580,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Perguntas frequentes',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      ...[
        { y: 160, q: 'Por quanto tempo terei acesso?', a: 'O acesso é vitalício. Você pode revisar quando quiser.' },
        { y: 250, q: 'Existe garantia?',                a: 'Sim! Garantia incondicional de 30 dias.' },
        { y: 340, q: 'Como recebo o material?',         a: 'Imediatamente após a compra, no seu email.' },
        { y: 430, q: 'Tem suporte?',                    a: 'Sim, suporte ilimitado por email e grupo VIP.' },
      ].flatMap((item): ElemInput[] => [
        { type: 'caixa', x: 200, y: item.y, w: 800, h: 70, bgColor: '#f8fafc', borders: { radius: [12, 12, 12, 12], equalCorners: true } },
        { type: 'titulo', headingLevel: 3, x: 230, y: item.y + 14, w: 740, h: 22, html: item.q, fontSize: 16, fontWeight: 700, color: '#0f172a' },
        { type: 'texto', x: 230, y: item.y + 38, w: 740, h: 24, html: item.a, fontSize: 14, color: '#64748b', lineHeight: 1.5 },
      ]),
    ],
  },
}

const faqDuasColunas: BlockTemplate = {
  id: 'faq-2-colunas',
  label: 'FAQ Duas Colunas',
  category: 'FAQ',
  thumbnailKey: 'faq-2-colunas',
  block: {
    height: 540,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'texto',
        x: C(0, 800), y: 50, w: 800, h: 28,
        html: 'TIRAMOS SUAS DÚVIDAS',
        fontSize: 13, fontWeight: 700, color: '#2563eb', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 90, w: 800, h: 60,
        html: 'Perguntas frequentes',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      ...[
        // Coluna esquerda
        { x: 100,  y: 200, q: 'O curso é online ou presencial?',     a: '100% online. Acesse de qualquer lugar, no seu ritmo.' },
        { x: 100,  y: 320, q: 'Em quanto tempo verei resultados?',   a: 'A maioria dos alunos vê os primeiros resultados em 30 dias.' },
        { x: 100,  y: 440, q: 'Funciona para iniciantes?',           a: 'Sim. O método foi pensado para qualquer nível de conhecimento.' },
        // Coluna direita
        { x: 620, y: 200, q: 'Posso parcelar?',                     a: 'Sim, em até 12x no cartão de crédito sem juros.' },
        { x: 620, y: 320, q: 'Tem certificado?',                    a: 'Emitimos certificado de conclusão reconhecido na conclusão.' },
        { x: 620, y: 440, q: 'E se eu não gostar?',                 a: 'Devolução total em até 30 dias, sem perguntas.' },
      ].flatMap((item): ElemInput[] => [
        { type: 'caixa', x: item.x, y: item.y, w: 480, h: 100,
          bgColor: '#ffffff', borders: { radius: [12, 12, 12, 12], equalCorners: true }, shadow: 'soft' },
        { type: 'titulo', headingLevel: 3, x: item.x + 24, y: item.y + 18, w: 432, h: 24,
          html: item.q, fontSize: 15, fontWeight: 700, color: '#0f172a' },
        { type: 'texto', x: item.x + 24, y: item.y + 48, w: 432, h: 40,
          html: item.a, fontSize: 13, color: '#64748b', lineHeight: 1.5 },
      ]),
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
    height: 200,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'titulo', headingLevel: 4,
        x: C(0, 400), y: 50, w: 400, h: 32,
        html: 'Sua Marca', fontSize: 22, fontWeight: 700, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 95, w: 700, h: 24,
        html: 'contato@suaempresa.com.br · (11) 9999-9999',
        fontSize: 14, color: '#94a3b8', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 24,
        html: '© 2026 Sua Marca · Todos os direitos reservados',
        fontSize: 12, color: '#64748b', textAlign: 'center',
      },
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
    height: 600,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Investimento',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'caixa',
        x: C(0, 480), y: 160, w: 480, h: 380,
        bgColor: '#ffffff',
        borders: { radius: [20, 20, 20, 20], equalCorners: true, color: '#e2e8f0', width: 1 },
        shadow: 'medium',
      },
      {
        type: 'texto',
        x: C(0, 480), y: 200, w: 480, h: 28,
        html: 'PLANO COMPLETO', fontSize: 14, color: '#2563eb', textAlign: 'center', fontWeight: 700, letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 3,
        x: C(0, 480), y: 240, w: 480, h: 40,
        html: 'Acesso Total', fontSize: 28, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: C(0, 480), y: 296, w: 480, h: 80,
        html: 'R$ <span style="font-size:64px">97</span>',
        fontSize: 24, color: '#0f172a', textAlign: 'center', fontWeight: 900,
      },
      {
        type: 'texto',
        x: C(0, 480), y: 380, w: 480, h: 24,
        html: '✓ Acesso vitalício &nbsp;·&nbsp; ✓ Suporte VIP &nbsp;·&nbsp; ✓ Garantia 30 dias',
        fontSize: 14, color: '#475569', textAlign: 'center',
      },
      {
        type: 'botao',
        x: C(0, 320), y: 440, w: 320, h: 56,
        text: 'QUERO COMEÇAR →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 12,
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
      // Form card direito
      {
        type: 'caixa',
        x: 680, y: 90, w: 440, h: 440,
        bgColor: '#ffffff',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 720, y: 130, w: 360, h: 32,
        html: 'Receba agora mesmo',
        fontSize: 22, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: 720, y: 170, w: 360, h: 24,
        html: 'Preencha e baixe gratuitamente',
        fontSize: 14, color: '#64748b', textAlign: 'center',
      },
      {
        type: 'caixa', x: 720, y: 220, w: 360, h: 48,
        bgColor: '#f8fafc',
        borders: { radius: [10, 10, 10, 10], equalCorners: true, color: '#e2e8f0', width: 1 },
      },
      {
        type: 'texto', x: 740, y: 232, w: 320, h: 24,
        html: 'Seu nome', fontSize: 14, color: '#94a3b8',
      },
      {
        type: 'caixa', x: 720, y: 286, w: 360, h: 48,
        bgColor: '#f8fafc',
        borders: { radius: [10, 10, 10, 10], equalCorners: true, color: '#e2e8f0', width: 1 },
      },
      {
        type: 'texto', x: 740, y: 298, w: 320, h: 24,
        html: 'Seu melhor email', fontSize: 14, color: '#94a3b8',
      },
      {
        type: 'botao',
        x: 720, y: 360, w: 360, h: 56,
        text: 'BAIXAR EBOOK GRÁTIS →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
      {
        type: 'texto',
        x: 720, y: 432, w: 360, h: 22,
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
    height: 540,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'texto',
        x: C(0, 800), y: 70, w: 800, h: 28,
        html: 'COMECE GRÁTIS HOJE',
        fontSize: 13, fontWeight: 700, color: '#60a5fa', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 110, w: 900, h: 70,
        html: 'Receba os melhores conteúdos no seu email',
        fontSize: 36, fontWeight: 800, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 200, w: 700, h: 50,
        html: 'Mais de 50.000 profissionais já recebem nossas dicas semanais.',
        fontSize: 17, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5,
      },
      // Form
      {
        type: 'caixa',
        x: C(0, 600), y: 290, w: 600, h: 56,
        bgColor: '#1e293b',
        borders: { radius: [12, 12, 12, 12], equalCorners: true, color: '#334155', width: 1 },
      },
      {
        type: 'texto',
        x: C(-115, 320), y: 304, w: 320, h: 28,
        html: 'Seu melhor email', fontSize: 15, color: '#64748b',
      },
      {
        type: 'botao',
        x: C(180, 220), y: 294, w: 220, h: 48,
        text: 'CADASTRAR →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 14, fontWeight: 700, borderRadius: 10,
      },
      {
        type: 'texto',
        x: C(0, 800), y: 380, w: 800, h: 22,
        html: '🔒 Seus dados protegidos · Sem spam · Cancele quando quiser',
        fontSize: 13, color: '#64748b', textAlign: 'center',
      },
    ],
  },
}

const formularioClaro: BlockTemplate = {
  id: 'formulario-claro',
  label: 'Cadastro Centralizado',
  category: 'Formulários',
  thumbnailKey: 'formulario-claro',
  block: {
    height: 640,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 70, w: 800, h: 60,
        html: 'Vamos começar',
        fontSize: 38, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 140, w: 700, h: 28,
        html: 'Preencha o formulário abaixo e nossa equipe entra em contato em até 24h.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      {
        type: 'caixa',
        x: C(0, 560), y: 200, w: 560, h: 380,
        bgColor: '#ffffff',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'medium',
      },
      // Campo Nome
      {
        type: 'caixa', x: C(0, 480), y: 240, w: 480, h: 48,
        bgColor: '#f8fafc',
        borders: { radius: [10, 10, 10, 10], equalCorners: true, color: '#e2e8f0', width: 1 },
      },
      { type: 'texto', x: C(-220, 420), y: 252, w: 420, h: 24,
        html: 'Nome completo', fontSize: 14, color: '#94a3b8' },
      // Campo Email
      {
        type: 'caixa', x: C(0, 480), y: 304, w: 480, h: 48,
        bgColor: '#f8fafc',
        borders: { radius: [10, 10, 10, 10], equalCorners: true, color: '#e2e8f0', width: 1 },
      },
      { type: 'texto', x: C(-220, 420), y: 316, w: 420, h: 24,
        html: 'Email profissional', fontSize: 14, color: '#94a3b8' },
      // Campo Telefone
      {
        type: 'caixa', x: C(0, 480), y: 368, w: 480, h: 48,
        bgColor: '#f8fafc',
        borders: { radius: [10, 10, 10, 10], equalCorners: true, color: '#e2e8f0', width: 1 },
      },
      { type: 'texto', x: C(-220, 420), y: 380, w: 420, h: 24,
        html: '(00) 00000-0000', fontSize: 14, color: '#94a3b8' },
      // Botão
      {
        type: 'botao',
        x: C(0, 480), y: 440, w: 480, h: 56,
        text: 'QUERO ME CADASTRAR →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 12,
      },
      {
        type: 'texto', x: C(0, 480), y: 510, w: 480, h: 22,
        html: 'Ao continuar, você concorda com nossa política de privacidade.',
        fontSize: 12, color: '#94a3b8', textAlign: 'center',
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
    height: 580,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: 100, y: 80, w: 480, h: 50,
        html: 'Vamos conversar',
        fontSize: 36, fontWeight: 800, color: '#0f172a',
      },
      {
        type: 'texto',
        x: 100, y: 144, w: 480, h: 60,
        html: 'Tem dúvidas ou quer uma demo personalizada? Nosso time responde em até 1h em horário comercial.',
        fontSize: 16, color: '#64748b', lineHeight: 1.6,
      },
      // Info de contato
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const y = 240 + i * 76
        const icons = ['✉️', '📞', '📍']
        const titles = ['Email', 'Telefone', 'Endereço']
        const values = ['contato@empresa.com', '(11) 4444-5555', 'Av. Paulista, 1000 - SP']
        return [
          { type: 'circulo', x: 100, y, w: 48, h: 48, bgColor: '#eff6ff' },
          { type: 'icone',   x: 110, y: y + 6, w: 28, h: 36, emoji: icons[i] },
          { type: 'titulo', headingLevel: 4,
            x: 168, y: y + 2, w: 360, h: 22,
            html: titles[i], fontSize: 13, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 },
          { type: 'texto',
            x: 168, y: y + 26, w: 360, h: 24,
            html: values[i], fontSize: 16, color: '#0f172a', fontWeight: 600 },
        ]
      }),
      // Form direita
      {
        type: 'caixa',
        x: 660, y: 80, w: 440, h: 420,
        bgColor: '#f8fafc',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
      },
      { type: 'caixa', x: 700, y: 120, w: 360, h: 44,
        bgColor: '#ffffff',
        borders: { radius: [8, 8, 8, 8], equalCorners: true, color: '#e2e8f0', width: 1 } },
      { type: 'texto', x: 716, y: 132, w: 320, h: 20, html: 'Nome', fontSize: 14, color: '#94a3b8' },
      { type: 'caixa', x: 700, y: 178, w: 360, h: 44,
        bgColor: '#ffffff',
        borders: { radius: [8, 8, 8, 8], equalCorners: true, color: '#e2e8f0', width: 1 } },
      { type: 'texto', x: 716, y: 190, w: 320, h: 20, html: 'Email', fontSize: 14, color: '#94a3b8' },
      { type: 'caixa', x: 700, y: 236, w: 360, h: 140,
        bgColor: '#ffffff',
        borders: { radius: [8, 8, 8, 8], equalCorners: true, color: '#e2e8f0', width: 1 } },
      { type: 'texto', x: 716, y: 248, w: 320, h: 20, html: 'Sua mensagem', fontSize: 14, color: '#94a3b8' },
      { type: 'botao', x: 700, y: 392, w: 360, h: 52,
        text: 'ENVIAR MENSAGEM →',
        bgColor: '#0f172a', color: '#ffffff', fontSize: 15, fontWeight: 700, borderRadius: 10 },
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
          // Número grande
          { type: 'titulo', headingLevel: 3,
            x: x + 24, y: 264, w: 200, h: 64,
            html: data.num, fontSize: 44, fontWeight: 900,
            color: '#2563eb', fontFamily: 'Plus Jakarta Sans',
            letterSpacing: -2 },
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
          // Número grande
          { type: 'titulo', headingLevel: 3,
            x: x + 24, y: 332, w: 280, h: 56,
            html: data.num, fontSize: 44, fontWeight: 900, color: '#60a5fa',
            fontFamily: 'Plus Jakarta Sans', letterSpacing: -2 },
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
    height: 460,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#7f1d1d' }, { color: '#dc2626' }] },
    elements: [
      // Eyebrow pill — largura aumentada pra caber o texto sem quebrar
      {
        type: 'caixa', x: C(0, 320), y: 50, w: 320, h: 36,
        bgColor: 'rgba(255,255,255,0.15)',
        borders: { radius: [999, 999, 999, 999], equalCorners: true,
          color: 'rgba(255,255,255,0.25)', width: 1 },
      },
      // Texto da pill com flame inline — sem icone separado pra evitar misalignment
      {
        type: 'texto', x: C(0, 320), y: 60, w: 320, h: 22,
        html: '🔥 &nbsp;OFERTA POR TEMPO LIMITADO',
        fontSize: 11, fontWeight: 800,
        color: '#fef2f2', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 110, w: 900, h: 60,
        html: 'A OFERTA TERMINA EM',
        fontSize: 36, fontWeight: 900, color: '#ffffff', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans', letterSpacing: 1,
      },
      // 4 caixinhas de tempo (DD HH MM SS) — premium com sombra e gradient interno
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = C(-420, 120) + i * 140
        const labels = ['DIAS', 'HORAS', 'MIN', 'SEG']
        const values = ['02', '23', '59', '00']
        return [
          { type: 'caixa', x, y: 200, w: 120, h: 130,
            bgColor: '#ffffff',
            borders: { radius: [16, 16, 16, 16], equalCorners: true },
            shadow: 'hard' },
          { type: 'titulo', headingLevel: 3,
            x, y: 222, w: 120, h: 70,
            html: values[i], fontSize: 56, fontWeight: 900,
            color: '#dc2626', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 296, w: 120, h: 22,
            html: labels[i], fontSize: 11, fontWeight: 800,
            color: '#7f1d1d', textAlign: 'center', letterSpacing: 2 },
        ]
      }),
      // Separadores ":" entre as caixas
      ...[0,1,2].map((i): ElemInput => ({
        type: 'titulo', headingLevel: 4,
        x: C(-300, 20) + i * 140, y: 240, w: 20, h: 50,
        html: ':', fontSize: 44, fontWeight: 900,
        color: 'rgba(255,255,255,0.4)', textAlign: 'center',
      })),
      {
        type: 'botao',
        x: C(0, 380), y: 360, w: 380, h: 60,
        text: 'GARANTIR MEU DESCONTO →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
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
    height: 420,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'caixa', x: C(0, 720), y: 60, w: 720, h: 300,
        bgColor: '#ffffff',
        borders: { radius: [20, 20, 20, 20], equalCorners: true,
          color: '#e2e8f0', width: 1 },
        shadow: 'soft',
      },
      {
        type: 'circulo', x: C(0, 64), y: 90, w: 64, h: 64,
        bgColor: '#eff6ff',
      },
      {
        type: 'icone', iconId: 'clock',
        x: C(0, 36), y: 104, w: 36, h: 36, color: '#2563eb',
      },
      {
        type: 'texto', x: C(0, 600), y: 168, w: 600, h: 22,
        html: 'TEMPO LIMITADO', fontSize: 11, fontWeight: 800,
        color: '#2563eb', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 600), y: 196, w: 600, h: 40,
        html: 'Apenas 24h para garantir',
        fontSize: 26, fontWeight: 800, color: '#0f172a', textAlign: 'center',
        fontFamily: 'Plus Jakarta Sans',
      },
      // 3 caixinhas reais (não só texto solto) — bem espaçadas e legíveis
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = C(-150, 90) + i * 110
        const labels = ['HORAS', 'MIN', 'SEG']
        const values = ['23', '59', '00']
        return [
          { type: 'caixa', x, y: 250, w: 90, h: 80,
            bgColor: '#f8fafc',
            borders: { radius: [12, 12, 12, 12], equalCorners: true,
              color: '#e2e8f0', width: 1 } },
          { type: 'titulo', headingLevel: 4,
            x, y: 262, w: 90, h: 40,
            html: values[i], fontSize: 32, fontWeight: 900,
            color: '#0f172a', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 304, w: 90, h: 18,
            html: labels[i], fontSize: 10, fontWeight: 800,
            color: '#64748b', textAlign: 'center', letterSpacing: 2 },
        ]
      }),
    ],
  },
}

const timerHeroOferta: BlockTemplate = {
  id: 'timer-hero-oferta',
  label: 'Timer Hero com Oferta',
  category: 'Timer',
  thumbnailKey: 'timer-hero',
  block: {
    height: 580,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#0f172a' }, { color: '#1e293b' }, { color: '#0f172a' }] },
    elements: [
      // Eyebrow
      {
        type: 'texto', x: C(0, 800), y: 70, w: 800, h: 24,
        html: 'PROMOÇÃO RELÂMPAGO', fontSize: 13, fontWeight: 800,
        color: '#fbbf24', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 1000), y: 110, w: 1000, h: 130,
        html: '50% OFF expira em',
        fontSize: 60, fontWeight: 900, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // 4 caixinhas grandes premium
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = C(-420, 120) + i * 140
        const labels = ['DIAS', 'HORAS', 'MIN', 'SEG']
        const values = ['02', '23', '59', '00']
        return [
          { type: 'caixa', x, y: 270, w: 120, h: 140,
            bgColor: '#1e293b',
            borders: { radius: [16, 16, 16, 16], equalCorners: true,
              color: 'rgba(251,191,36,0.3)', width: 1 } },
          { type: 'titulo', headingLevel: 3,
            x, y: 290, w: 120, h: 80,
            html: values[i], fontSize: 64, fontWeight: 900,
            color: '#fbbf24', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 372, w: 120, h: 22,
            html: labels[i], fontSize: 11, fontWeight: 800,
            color: '#94a3b8', textAlign: 'center', letterSpacing: 2 },
        ]
      }),
      {
        type: 'texto', x: C(0, 700), y: 440, w: 700, h: 28,
        html: 'Depois deste timer, o preço volta ao valor cheio.',
        fontSize: 15, color: '#cbd5e1', textAlign: 'center',
      },
      {
        type: 'botao',
        x: C(0, 380), y: 480, w: 380, h: 60,
        text: 'QUERO O DESCONTO AGORA →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 800, borderRadius: 12,
        shadow: 'hard',
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
    height: 100,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'texto', x: 200, y: 38, w: 32, h: 24,
        html: '🔥', fontSize: 20, textAlign: 'left',
      },
      {
        type: 'texto', x: 240, y: 38, w: 320, h: 24,
        html: '<strong>Promoção termina em:</strong>',
        fontSize: 15, color: '#ffffff',
      },
      // 4 mini caixas em linha — apenas o número (sem letra "d/h/m/s" inline).
      // Label fica abaixo em texto separado pra ficar limpo.
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = 580 + i * 70
        const labels = ['DIA', 'HORA', 'MIN', 'SEG']
        const values = ['02', '23', '59', '00']
        return [
          { type: 'caixa', x, y: 22, w: 60, h: 56,
            bgColor: '#1e293b',
            borders: { radius: [8, 8, 8, 8], equalCorners: true,
              color: '#334155', width: 1 } },
          { type: 'titulo', headingLevel: 4,
            x, y: 28, w: 60, h: 30,
            html: values[i], fontSize: 22, fontWeight: 900,
            color: '#ffffff', textAlign: 'center',
            fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 58, w: 60, h: 16,
            html: labels[i], fontSize: 8, fontWeight: 800,
            color: '#fbbf24', textAlign: 'center', letterSpacing: 1 },
        ]
      }),
      {
        type: 'botao',
        x: 880, y: 28, w: 200, h: 44,
        text: 'GARANTIR →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 13, fontWeight: 800, borderRadius: 8,
      },
    ],
  },
}

const timerComDesconto: BlockTemplate = {
  id: 'timer-desconto',
  label: 'Timer com Desconto',
  category: 'Timer',
  thumbnailKey: 'timer-desconto',
  block: {
    height: 540,
    bgColor: '#ffffff',
    elements: [
      // Card principal — com altura suficiente pra acomodar tudo
      {
        type: 'caixa', x: C(0, 800), y: 80, w: 800, h: 420,
        bgColor: '#fef2f2',
        borders: { radius: [24, 24, 24, 24], equalCorners: true,
          color: '#fecaca', width: 2 },
      },
      // Badge "-50% OFF" sobreposto no canto: y:50 fica metade dentro/fora do card iniciado em y:80
      {
        type: 'circulo', x: C(280, 100), y: 50, w: 100, h: 100,
        bgColor: '#dc2626',
        borders: { color: '#ffffff', width: 4,
          radius: [50, 50, 50, 50], equalCorners: true },
        shadow: 'hard',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: C(280, 100), y: 70, w: 100, h: 36,
        html: '50%', fontSize: 24, fontWeight: 900,
        color: '#ffffff', textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto', x: C(280, 100), y: 106, w: 100, h: 18,
        html: 'OFF', fontSize: 12, fontWeight: 800,
        color: '#fecaca', textAlign: 'center', letterSpacing: 2,
      },
      // Conteúdo central
      {
        type: 'texto', x: C(0, 600), y: 130, w: 600, h: 22,
        html: 'PROMOÇÃO ESPECIAL', fontSize: 12, fontWeight: 800,
        color: '#dc2626', textAlign: 'center', letterSpacing: 3,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 700), y: 162, w: 700, h: 50,
        html: 'Garanta com 50% de desconto',
        fontSize: 32, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Preço de/por — sem strikethrough no titulo (que quebra alignment).
      // Tudo num único texto centralizado com baseline correto.
      {
        type: 'texto',
        x: C(0, 600), y: 230, w: 600, h: 60,
        html: '<span style="font-size:18px;color:#94a3b8;text-decoration:line-through;vertical-align:super">R$ 497</span> &nbsp; <span style="font-size:48px;font-weight:900;color:#dc2626;font-family:\'Plus Jakarta Sans\',sans-serif">R$ 247</span>',
        fontSize: 18, color: '#0f172a', textAlign: 'center',
      },
      // Timer compacto inline
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const x = C(-220, 110) + i * 110
        const labels = ['DIAS', 'HORAS', 'MIN', 'SEG']
        const values = ['02', '23', '59', '00']
        return [
          { type: 'caixa', x, y: 320, w: 90, h: 80,
            bgColor: '#ffffff',
            borders: { radius: [12, 12, 12, 12], equalCorners: true,
              color: '#fecaca', width: 1 } },
          { type: 'titulo', headingLevel: 4,
            x, y: 334, w: 90, h: 36,
            html: values[i], fontSize: 28, fontWeight: 900,
            color: '#dc2626', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x, y: 372, w: 90, h: 18,
            html: labels[i], fontSize: 9, fontWeight: 800,
            color: '#991b1b', textAlign: 'center', letterSpacing: 1 },
        ]
      }),
      {
        type: 'botao',
        x: C(0, 360), y: 420, w: 360, h: 56,
        text: 'GARANTIR DESCONTO →',
        bgColor: '#dc2626', color: '#ffffff',
        fontSize: 15, fontWeight: 800, borderRadius: 10,
        shadow: 'medium',
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
    height: 800,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Nossa jornada',
        fontSize: 36, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 28,
        html: 'Os marcos que nos trouxeram até aqui.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // Linha vertical central
      {
        type: 'caixa', x: C(0, 2), y: 200, w: 2, h: 540,
        bgColor: '#e2e8f0',
      },
      // 4 milestones alternando esq/dir
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 220 + i * 130
        const isLeft = i % 2 === 0
        const years  = ['2018', '2020', '2023', '2026']
        const titles = ['Fundação', 'Primeiro 1k clientes', 'Expansão internacional', 'Marca consolidada']
        const descs  = [
          'Nascemos com a missão de simplificar landing pages no Brasil.',
          'Atingimos 1.000 empresas atendidas em 18 meses.',
          'Abertura para mercado da América Latina e Europa.',
          'Top 1 em ferramentas de conversão da categoria.',
        ]
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
        // Bullet central
        return [
          { type: 'circulo', x: C(0, 20), y: y - 4, w: 20, h: 20,
            bgColor: colors[i],
            borders: { color: '#ffffff', width: 3,
              radius: [10, 10, 10, 10], equalCorners: true },
            shadow: 'soft' },
          // Card
          { type: 'caixa',
            x: isLeft ? 100 : 660, y: y - 50,
            w: 440, h: 120,
            bgColor: '#f8fafc',
            borders: { radius: [16, 16, 16, 16], equalCorners: true,
              color: '#e2e8f0', width: 1 } },
          { type: 'texto',
            x: (isLeft ? 100 : 660) + 24, y: y - 30, w: 80, h: 22,
            html: years[i], fontSize: 13, fontWeight: 800,
            color: colors[i], letterSpacing: 1 },
          { type: 'titulo', headingLevel: 3,
            x: (isLeft ? 100 : 660) + 24, y: y - 6, w: 392, h: 28,
            html: titles[i], fontSize: 18, fontWeight: 700,
            color: '#0f172a', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: (isLeft ? 100 : 660) + 24, y: y + 26, w: 392, h: 36,
            html: descs[i], fontSize: 13, color: '#64748b',
            lineHeight: 1.5 },
        ]
      }),
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
    height: 540,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'O que você vai conquistar',
        fontSize: 36, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 28,
        html: 'Seu progresso em 5 marcos importantes.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // 5 marcos compactos
      ...[0,1,2,3,4].flatMap((i): ElemInput[] => {
        const y = 200 + i * 60
        const titles = [
          'Setup completo (Dia 1)',
          'Primeira página publicada (Dia 3)',
          'Integrações ativas (Dia 7)',
          'Primeiras vendas (Dia 14)',
          'Crescimento previsível (Dia 30)',
        ]
        return [
          // Número grande
          { type: 'caixa', x: 200, y, w: 50, h: 50,
            bgColor: '#eff6ff',
            borders: { color: '#2563eb', width: 2,
              radius: [12, 12, 12, 12], equalCorners: true } },
          { type: 'titulo', headingLevel: 4,
            x: 200, y: y + 10, w: 50, h: 30,
            html: `${i + 1}`, fontSize: 20, fontWeight: 900,
            color: '#2563eb', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          // Linha conectora vertical (exceto último)
          ...(i < 4 ? [{
            type: 'caixa' as const,
            x: 224, y: y + 50, w: 2, h: 14,
            bgColor: '#dbeafe',
          }] : []),
          // Texto do marco
          { type: 'titulo', headingLevel: 3,
            x: 270, y: y + 14, w: 700, h: 26,
            html: titles[i], fontSize: 17, fontWeight: 600,
            color: '#1e293b' },
          // Check ao lado direito
          { type: 'icone', iconId: 'check-circle',
            x: 970, y: y + 14, w: 24, h: 24, color: '#16a34a' },
        ]
      }),
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// GALERIA
// ─────────────────────────────────────────────────────────────────────────────

const galeria6Itens: BlockTemplate = {
  id: 'galeria-6-itens',
  label: 'Galeria 6 Itens',
  category: 'Galeria',
  thumbnailKey: 'galeria',
  block: {
    height: 700,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Conheça nossos trabalhos',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 28,
        html: 'Cases reais que mostram o que nosso método entrega.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // 6 imagens em 3x2
      ...[0,1,2,3,4,5].map((i): ElemInput => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 100 + col * 340
        const y = 200 + row * 240
        // Diferentes imagens unsplash
        const photos = [
          'photo-1551434678-e076c223a692',
          'photo-1556761175-b413da4baf72',
          'photo-1517245386807-bb43f82c33c4',
          'photo-1573164713988-8665fc963095',
          'photo-1521737711867-e3b97375f902',
          'photo-1581091226825-a6a2a5aee158',
        ]
        return {
          type: 'imagem', x, y, w: 320, h: 220,
          src: `https://images.unsplash.com/${photos[i]}?w=640&q=80`,
          objectFit: 'cover',
          borders: { radius: [12, 12, 12, 12], equalCorners: true },
        }
      }),
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
    height: 580,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Perguntas frequentes',
        fontSize: 36, fontWeight: 800, color: '#ffffff', textAlign: 'center',
      },
      ...[
        { y: 160, q: 'O acesso é vitalício?',           a: 'Sim. Você acessa quando quiser, sem mensalidade.' },
        { y: 250, q: 'Quanto tempo para ver resultado?', a: 'A maioria vê os primeiros resultados em 30 dias.' },
        { y: 340, q: 'E se eu quiser desistir?',         a: 'Garantia incondicional de 30 dias. 100% do dinheiro de volta.' },
        { y: 430, q: 'Como recebo o material?',          a: 'No mesmo instante após a confirmação do pagamento.' },
      ].flatMap((item): ElemInput[] => [
        { type: 'caixa', x: 200, y: item.y, w: 800, h: 70,
          bgColor: '#1e293b',
          borders: { radius: [12, 12, 12, 12], equalCorners: true } },
        { type: 'titulo', headingLevel: 3,
          x: 230, y: item.y + 14, w: 740, h: 22,
          html: item.q, fontSize: 16, fontWeight: 700, color: '#ffffff' },
        { type: 'texto',
          x: 230, y: item.y + 38, w: 740, h: 24,
          html: item.a, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 },
      ]),
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
    height: 480,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'video',
        x: 80, y: 80, w: 540, h: 320,
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        type: 'texto',
        x: 660, y: 90, w: 460, h: 28,
        html: 'CONHEÇA O MÉTODO',
        fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 660, y: 130, w: 460, h: 100,
        html: 'Veja como funciona em apenas 3 minutos',
        fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1.2,
      },
      {
        type: 'texto',
        x: 660, y: 250, w: 460, h: 90,
        html: 'Assista esse vídeo curto e descubra como nossos alunos estão multiplicando os resultados ainda no primeiro mês.',
        fontSize: 16, color: '#475569', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: 660, y: 360, w: 280, h: 52,
        text: 'Quero saber mais →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 15, fontWeight: 700, borderRadius: 10,
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
    height: 580,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'imagem',
        x: 80, y: 80, w: 480, h: 360,
        src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=960&q=80',
        objectFit: 'cover',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
      },
      {
        type: 'texto',
        x: 620, y: 90, w: 480, h: 28,
        html: 'NOSSA HISTÓRIA',
        fontSize: 13, fontWeight: 700, color: '#2563eb', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: 620, y: 130, w: 480, h: 110,
        html: 'Tecnologia para empoderar pequenos negócios',
        fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1.2,
      },
      {
        type: 'texto',
        x: 620, y: 260, w: 480, h: 100,
        html: 'Fundada em 2018, nossa missão é democratizar o acesso a ferramentas profissionais. Hoje, mais de 10 mil empreendedores confiam na nossa plataforma.',
        fontSize: 16, color: '#475569', lineHeight: 1.6,
      },
      // Stats inline
      {
        type: 'titulo', headingLevel: 3,
        x: 620, y: 380, w: 220, h: 42,
        html: '+10mil', fontSize: 28, fontWeight: 900, color: '#2563eb',
      },
      {
        type: 'texto',
        x: 620, y: 422, w: 220, h: 20,
        html: 'Clientes ativos', fontSize: 13, color: '#64748b',
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 880, y: 380, w: 220, h: 42,
        html: '6 anos', fontSize: 28, fontWeight: 900, color: '#2563eb',
      },
      {
        type: 'texto',
        x: 880, y: 422, w: 220, h: 20,
        html: 'No mercado', fontSize: 13, color: '#64748b',
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
    height: 760,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Escolha o plano ideal',
        fontSize: 38, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 130, w: 700, h: 28,
        html: 'Sem fidelidade. Cancele quando quiser. 30 dias de garantia.',
        fontSize: 16, color: '#64748b', textAlign: 'center',
      },
      // Plano Básico
      { type: 'caixa', x: 100, y: 200, w: 320, h: 480,
        bgColor: '#ffffff',
        borders: { radius: [16, 16, 16, 16], equalCorners: true, color: '#e2e8f0', width: 1 },
        shadow: 'soft' },
      { type: 'texto', x: 100, y: 240, w: 320, h: 26,
        html: 'BÁSICO', fontSize: 13, fontWeight: 700, color: '#64748b', textAlign: 'center', letterSpacing: 2 },
      { type: 'titulo', headingLevel: 3, x: 100, y: 280, w: 320, h: 48,
        html: 'R$ 47<span style="font-size:14px;color:#94a3b8">/mês</span>',
        fontSize: 38, fontWeight: 900, color: '#0f172a', textAlign: 'center' },
      { type: 'texto', x: 130, y: 360, w: 260, h: 24,
        html: '✓ Até 1.000 visitas/mês', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 130, y: 392, w: 260, h: 24,
        html: '✓ 1 página personalizada', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 130, y: 424, w: 260, h: 24,
        html: '✓ Suporte por email', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 130, y: 456, w: 260, h: 24,
        html: '✗ Sem domínio próprio', fontSize: 14, color: '#94a3b8' },
      { type: 'botao', x: 130, y: 600, w: 260, h: 48,
        text: 'Começar grátis',
        bgColor: 'transparent', color: '#0f172a',
        fontSize: 14, fontWeight: 700, borderRadius: 10,
        borders: { width: 2, color: '#cbd5e1', radius: [10, 10, 10, 10], equalCorners: true } },
      // Plano Pro (destaque)
      { type: 'caixa', x: 440, y: 180, w: 320, h: 520,
        bgColor: '#1e3a8a',
        borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'hard' },
      { type: 'texto', x: 540, y: 196, w: 120, h: 28,
        html: 'MAIS POPULAR', fontSize: 11, fontWeight: 800, color: '#fbbf24', textAlign: 'center', letterSpacing: 1 },
      { type: 'texto', x: 440, y: 240, w: 320, h: 26,
        html: 'PRO', fontSize: 13, fontWeight: 700, color: '#93c5fd', textAlign: 'center', letterSpacing: 2 },
      { type: 'titulo', headingLevel: 3, x: 440, y: 280, w: 320, h: 48,
        html: 'R$ 97<span style="font-size:14px;color:#93c5fd">/mês</span>',
        fontSize: 38, fontWeight: 900, color: '#ffffff', textAlign: 'center' },
      { type: 'texto', x: 470, y: 360, w: 260, h: 24,
        html: '✓ Até 10.000 visitas/mês', fontSize: 14, color: '#dbeafe' },
      { type: 'texto', x: 470, y: 392, w: 260, h: 24,
        html: '✓ Páginas ilimitadas', fontSize: 14, color: '#dbeafe' },
      { type: 'texto', x: 470, y: 424, w: 260, h: 24,
        html: '✓ Domínio próprio', fontSize: 14, color: '#dbeafe' },
      { type: 'texto', x: 470, y: 456, w: 260, h: 24,
        html: '✓ Suporte prioritário', fontSize: 14, color: '#dbeafe' },
      { type: 'texto', x: 470, y: 488, w: 260, h: 24,
        html: '✓ A/B testing', fontSize: 14, color: '#dbeafe' },
      { type: 'botao', x: 470, y: 620, w: 260, h: 56,
        text: 'Quero o Pro →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 15, fontWeight: 800, borderRadius: 10 },
      // Plano Premium
      { type: 'caixa', x: 780, y: 200, w: 320, h: 480,
        bgColor: '#ffffff',
        borders: { radius: [16, 16, 16, 16], equalCorners: true, color: '#e2e8f0', width: 1 },
        shadow: 'soft' },
      { type: 'texto', x: 780, y: 240, w: 320, h: 26,
        html: 'PREMIUM', fontSize: 13, fontWeight: 700, color: '#64748b', textAlign: 'center', letterSpacing: 2 },
      { type: 'titulo', headingLevel: 3, x: 780, y: 280, w: 320, h: 48,
        html: 'R$ 197<span style="font-size:14px;color:#94a3b8">/mês</span>',
        fontSize: 38, fontWeight: 900, color: '#0f172a', textAlign: 'center' },
      { type: 'texto', x: 810, y: 360, w: 260, h: 24,
        html: '✓ Visitas ilimitadas', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 810, y: 392, w: 260, h: 24,
        html: '✓ Tudo do Pro +', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 810, y: 424, w: 260, h: 24,
        html: '✓ Gerente dedicado', fontSize: 14, color: '#475569' },
      { type: 'texto', x: 810, y: 456, w: 260, h: 24,
        html: '✓ API e integrações', fontSize: 14, color: '#475569' },
      { type: 'botao', x: 810, y: 600, w: 260, h: 48,
        text: 'Falar com vendas',
        bgColor: 'transparent', color: '#0f172a',
        fontSize: 14, fontWeight: 700, borderRadius: 10,
        borders: { width: 2, color: '#cbd5e1', radius: [10, 10, 10, 10], equalCorners: true } },
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
    height: 420,
    bgColor: '#0f172a',
    elements: [
      // Coluna logo + descrição
      { type: 'titulo', headingLevel: 3,
        x: 100, y: 70, w: 280, h: 40,
        html: 'SuaMarca', fontSize: 24, fontWeight: 900, color: '#ffffff' },
      { type: 'texto', x: 100, y: 120, w: 280, h: 90,
        html: 'A plataforma mais completa para landing pages que convertem.',
        fontSize: 14, color: '#94a3b8', lineHeight: 1.6 },
      { type: 'texto', x: 100, y: 230, w: 280, h: 24,
        html: '🐦 𝕏  ·  📷 IG  ·  💼 LinkedIn',
        fontSize: 16, color: '#cbd5e1' },
      // Coluna Produto
      { type: 'titulo', headingLevel: 4, x: 460, y: 80, w: 200, h: 24,
        html: 'PRODUTO', fontSize: 12, fontWeight: 800, color: '#475569', letterSpacing: 2 },
      { type: 'texto', x: 460, y: 116, w: 200, h: 24, html: 'Recursos', fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 146, w: 200, h: 24, html: 'Preços',   fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 176, w: 200, h: 24, html: 'Templates',fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 460, y: 206, w: 200, h: 24, html: 'Integrações', fontSize: 14, color: '#cbd5e1' },
      // Coluna Empresa
      { type: 'titulo', headingLevel: 4, x: 660, y: 80, w: 200, h: 24,
        html: 'EMPRESA', fontSize: 12, fontWeight: 800, color: '#475569', letterSpacing: 2 },
      { type: 'texto', x: 660, y: 116, w: 200, h: 24, html: 'Sobre',     fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 146, w: 200, h: 24, html: 'Blog',      fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 176, w: 200, h: 24, html: 'Carreiras', fontSize: 14, color: '#cbd5e1' },
      { type: 'texto', x: 660, y: 206, w: 200, h: 24, html: 'Contato',   fontSize: 14, color: '#cbd5e1' },
      // Coluna Newsletter
      { type: 'titulo', headingLevel: 4, x: 860, y: 80, w: 240, h: 24,
        html: 'NEWSLETTER', fontSize: 12, fontWeight: 800, color: '#475569', letterSpacing: 2 },
      { type: 'texto', x: 860, y: 116, w: 240, h: 60,
        html: 'Receba as novidades diretamente no seu email.',
        fontSize: 13, color: '#94a3b8', lineHeight: 1.5 },
      { type: 'caixa', x: 860, y: 184, w: 240, h: 40,
        bgColor: '#1e293b',
        borders: { radius: [8, 8, 8, 8], equalCorners: true, color: '#334155', width: 1 } },
      { type: 'texto', x: 872, y: 194, w: 220, h: 20,
        html: 'Seu email', fontSize: 13, color: '#64748b' },
      { type: 'botao', x: 860, y: 232, w: 240, h: 38,
        text: 'INSCREVER →',
        bgColor: '#2563eb', color: '#ffffff', fontSize: 12, fontWeight: 700, borderRadius: 8 },
      // Linha separadora + copyright
      { type: 'caixa', x: 100, y: 330, w: 1000, h: 1, bgColor: '#1e293b' },
      { type: 'texto', x: 100, y: 350, w: 600, h: 24,
        html: '© 2026 SuaMarca. Todos os direitos reservados.',
        fontSize: 12, color: '#64748b' },
      { type: 'texto', x: 700, y: 350, w: 400, h: 24,
        html: 'Privacidade  ·  Termos  ·  Cookies',
        fontSize: 12, color: '#64748b', textAlign: 'right' },
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
    height: 640,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'texto', x: C(0, 800), y: 60, w: 800, h: 28,
        html: 'TUDO QUE VOCÊ RECEBE', fontSize: 13, fontWeight: 700,
        color: '#fbbf24', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 96, w: 900, h: 60,
        html: 'Pacote completo + 4 bônus exclusivos',
        fontSize: 36, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      ...[0,1,2,3].flatMap((i): ElemInput[] => {
        const y = 200 + i * 90
        const titles = [
          'Bônus #1: Templates Prontos',
          'Bônus #2: Aulas ao vivo mensais',
          'Bônus #3: Comunidade VIP no Discord',
          'Bônus #4: Suporte 1:1 por 30 dias',
        ]
        const descs = [
          '50+ templates editáveis prontos para uso em qualquer nicho.',
          'Encontros mensais ao vivo com Q&A e estudos de caso.',
          'Networking direto com +500 alunos e mentores ativos.',
          'Sessões individuais por chamada para tirar suas dúvidas.',
        ]
        const values = ['R$ 497', 'R$ 1.200', 'R$ 297', 'R$ 1.500']
        return [
          { type: 'caixa', x: 100, y, w: 1000, h: 78,
            bgColor: '#1e293b',
            borders: { radius: [12, 12, 12, 12], equalCorners: true,
              color: '#334155', width: 1 } },
          { type: 'circulo', x: 124, y: y + 19, w: 40, h: 40,
            bgColor: '#fbbf24' },
          { type: 'icone', iconId: 'gift',
            x: 132, y: y + 27, w: 24, h: 24, color: '#7c2d12' },
          { type: 'titulo', headingLevel: 4,
            x: 184, y: y + 14, w: 700, h: 26,
            html: titles[i], fontSize: 17, fontWeight: 700, color: '#ffffff' },
          { type: 'texto',
            x: 184, y: y + 42, w: 700, h: 24,
            html: descs[i], fontSize: 13, color: '#94a3b8' },
          { type: 'texto',
            x: 920, y: y + 18, w: 160, h: 20,
            html: 'Valor', fontSize: 11, color: '#64748b',
            textAlign: 'right', letterSpacing: 1 },
          { type: 'titulo', headingLevel: 4,
            x: 920, y: y + 36, w: 160, h: 28,
            html: values[i], fontSize: 20, fontWeight: 800,
            color: '#fbbf24', textAlign: 'right' },
        ]
      }),
    ],
  },
}

const produtosBonusStack: BlockTemplate = {
  id: 'produtos-bonus-stack',
  label: 'Bônus em Pilha',
  category: 'Produtos/Bônus',
  thumbnailKey: 'produtos-bonus-stack',
  block: {
    height: 580,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'texto', x: C(0, 800), y: 60, w: 800, h: 28,
        html: 'BÔNUS EXCLUSIVOS', fontSize: 13, fontWeight: 700,
        color: '#dc2626', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 96, w: 900, h: 60,
        html: 'Apenas para os primeiros 100 inscritos',
        fontSize: 32, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // 3 cards de bônus em colunas
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 100 + i * 350
        const titles = ['Mentoria em Grupo', 'Acesso ao App Mobile', 'Ebook + Planilhas']
        const values = ['R$ 1.997', 'R$ 497', 'R$ 297']
        return [
          { type: 'caixa', x, y: 200, w: 320, h: 320,
            bgColor: '#ffffff',
            borders: { radius: [16, 16, 16, 16], equalCorners: true },
            shadow: 'medium' },
          // Faixa de bônus no topo do card
          { type: 'caixa', x, y: 200, w: 320, h: 36,
            bgColor: '#fef2f2',
            borders: { radius: [16, 16, 0, 0], equalCorners: false } },
          { type: 'texto',
            x, y: 209, w: 320, h: 20,
            html: `BÔNUS #${i + 1}`, fontSize: 12, fontWeight: 800,
            color: '#dc2626', textAlign: 'center', letterSpacing: 2 },
          // Imagem placeholder
          { type: 'caixa', x: x + 40, y: 260, w: 240, h: 130,
            bgColor: '#fef3c7',
            borders: { radius: [12, 12, 12, 12], equalCorners: true } },
          { type: 'icone',
            x: x + 130, y: 295, w: 60, h: 60,
            iconId: 'gift', color: '#f59e0b' },
          { type: 'titulo', headingLevel: 4,
            x, y: 410, w: 320, h: 28,
            html: titles[i], fontSize: 16, fontWeight: 700,
            color: '#0f172a', textAlign: 'center' },
          { type: 'texto',
            x, y: 444, w: 320, h: 22,
            html: `Valor: <s style="color:#94a3b8">${values[i]}</s>`, fontSize: 13,
            color: '#64748b', textAlign: 'center' },
          { type: 'texto',
            x, y: 470, w: 320, h: 26,
            html: 'GRÁTIS pra você', fontSize: 14, fontWeight: 800,
            color: '#16a34a', textAlign: 'center' },
        ]
      }),
    ],
  },
}

const produtosOferta: BlockTemplate = {
  id: 'produtos-oferta',
  label: 'Oferta Final c/ Stack',
  category: 'Produtos/Bônus',
  thumbnailKey: 'produtos-oferta',
  block: {
    height: 700,
    bgGradient: { type: 'linear', angle: 135,
      stops: [{ color: '#1e3a8a' }, { color: '#4338ca' }] },
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 70, w: 900, h: 60,
        html: 'Tudo isso por um valor único',
        fontSize: 36, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Tabela de valores
      { type: 'caixa', x: C(0, 600), y: 180, w: 600, h: 320,
        bgColor: '#ffffff',
        borders: { radius: [20, 20, 20, 20], equalCorners: true },
        shadow: 'hard' },
      ...[0,1,2,3,4].flatMap((i): ElemInput[] => {
        const y = 210 + i * 50
        const items  = ['Curso completo (12h)', 'Templates editáveis', 'Mentoria em grupo', 'Acesso ao Discord VIP', 'Suporte 1:1 (30 dias)']
        const values = ['R$ 1.997', 'R$ 497', 'R$ 1.200', 'R$ 297', 'R$ 1.500']
        return [
          { type: 'icone', iconId: 'check-circle',
            x: C(-260, 22), y: y + 8, w: 22, h: 22, color: '#16a34a' },
          { type: 'texto',
            x: C(-228, 380), y: y + 6, w: 380, h: 26,
            html: items[i], fontSize: 16, color: '#1e293b', fontWeight: 600 },
          { type: 'texto',
            x: C(160, 130), y: y + 6, w: 130, h: 26,
            html: values[i], fontSize: 16, color: '#64748b', textAlign: 'right' },
        ]
      }),
      // Preço final
      { type: 'caixa', x: C(0, 600), y: 460, w: 600, h: 70,
        bgColor: '#0f172a',
        borders: { radius: [12, 12, 12, 12], equalCorners: true } },
      { type: 'texto', x: C(-260, 200), y: 482, w: 200, h: 28,
        html: 'TOTAL HOJE:', fontSize: 14, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 },
      { type: 'texto', x: C(-260, 200), y: 502, w: 200, h: 22,
        html: 'De <s>R$ 5.491</s>', fontSize: 12, color: '#fbbf24' },
      { type: 'titulo', headingLevel: 3,
        x: C(160, 200), y: 484, w: 200, h: 40,
        html: 'R$ 497', fontSize: 32, fontWeight: 900, color: '#fbbf24',
        textAlign: 'right' },
      // CTA
      {
        type: 'botao',
        x: C(0, 360), y: 560, w: 360, h: 64,
        text: 'QUERO GARANTIR MEU ACESSO →',
        bgColor: '#fbbf24', color: '#7c2d12',
        fontSize: 16, fontWeight: 800, borderRadius: 12,
      },
      {
        type: 'texto', x: C(0, 600), y: 640, w: 600, h: 22,
        html: '🔒 Pagamento seguro · Garantia 30 dias',
        fontSize: 13, color: '#cbd5e1', textAlign: 'center',
      },
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
    height: 540,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 70, w: 800, h: 50,
        html: 'O que nos move',
        fontSize: 36, fontWeight: 800, color: '#0f172a',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 100 + i * 350
        const icons = ['target', 'rocket', 'star']
        const titles = ['Missão', 'Visão', 'Valores']
        const descs = [
          'Empoderar empreendedores brasileiros com tecnologia de ponta acessível e descomplicada.',
          'Ser a plataforma escolhida por 1 milhão de pequenos negócios até 2030.',
          'Transparência radical, foco no cliente e qualidade obsessiva em cada detalhe.',
        ]
        const colors = ['#2563eb', '#7c3aed', '#f59e0b']
        const bgs    = ['#eff6ff', '#f5f3ff', '#fffbeb']
        return [
          { type: 'caixa', x, y: 170, w: 320, h: 300,
            bgColor: '#ffffff',
            borders: { radius: [16, 16, 16, 16], equalCorners: true },
            shadow: 'soft' },
          { type: 'circulo', x: x + 130, y: 200, w: 60, h: 60,
            bgColor: bgs[i] },
          { type: 'icone', x: x + 145, y: 215, w: 30, h: 30,
            iconId: icons[i], color: colors[i] },
          { type: 'titulo', headingLevel: 3,
            x, y: 280, w: 320, h: 32,
            html: titles[i], fontSize: 20, fontWeight: 800,
            color: '#0f172a', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          { type: 'texto',
            x: x + 24, y: 322, w: 272, h: 130,
            html: descs[i], fontSize: 14, color: '#64748b',
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
    height: 760,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 60, w: 900, h: 60,
        html: 'Escolha seu plano',
        fontSize: 38, fontWeight: 800, color: '#ffffff',
        textAlign: 'center', fontFamily: 'Plus Jakarta Sans',
      },
      // Toggle Mensal/Anual
      { type: 'caixa', x: C(0, 240), y: 140, w: 240, h: 44,
        bgColor: '#1e293b',
        borders: { radius: [999, 999, 999, 999], equalCorners: true } },
      { type: 'caixa', x: C(-60, 110), y: 144, w: 110, h: 36,
        bgColor: '#3b82f6',
        borders: { radius: [999, 999, 999, 999], equalCorners: true } },
      { type: 'texto', x: C(-60, 110), y: 156, w: 110, h: 20,
        html: 'Mensal', fontSize: 13, color: '#ffffff',
        textAlign: 'center', fontWeight: 700 },
      { type: 'texto', x: C(50, 110), y: 156, w: 110, h: 20,
        html: 'Anual −20%', fontSize: 13, color: '#94a3b8',
        textAlign: 'center', fontWeight: 600 },
      // 3 planos
      ...[0,1,2].flatMap((i): ElemInput[] => {
        const x = 100 + i * 340
        const tiers   = ['STARTER', 'GROWTH', 'SCALE']
        const prices  = ['R$ 49', 'R$ 149', 'R$ 449']
        const featured = i === 1
        const r4 = (n: number) => [n, n, n, n] as [number, number, number, number]
        return [
          { type: 'caixa', x, y: 220, w: 320, h: 480,
            bgColor: featured ? '#3b82f6' : '#1e293b',
            borders: { radius: r4(16), equalCorners: true,
              color: featured ? '#3b82f6' : '#334155', width: 1 } },
          ...(featured ? [{
            type: 'caixa' as const, x: x + 100, y: 200, w: 120, h: 32,
            bgColor: '#fbbf24',
            borders: { radius: r4(999), equalCorners: true },
          }, {
            type: 'texto' as const, x: x + 100, y: 208, w: 120, h: 20,
            html: 'POPULAR', fontSize: 11, fontWeight: 800,
            color: '#7c2d12', textAlign: 'center' as const, letterSpacing: 1,
          }] : []),
          { type: 'texto',
            x, y: 260, w: 320, h: 26,
            html: tiers[i], fontSize: 13, fontWeight: 700,
            color: featured ? '#bfdbfe' : '#94a3b8',
            textAlign: 'center', letterSpacing: 2 },
          { type: 'titulo', headingLevel: 3,
            x, y: 300, w: 320, h: 50,
            html: `${prices[i]}<span style="font-size:14px;color:${featured ? '#bfdbfe' : '#94a3b8'}">/mês</span>`,
            fontSize: 40, fontWeight: 900,
            color: '#ffffff', textAlign: 'center', fontFamily: 'Plus Jakarta Sans' },
          // Features
          ...[0,1,2,3].flatMap((j): ElemInput[] => {
            const fy = 380 + j * 36
            const features = [
              ['Até 1k contatos', 'Até 10k contatos', 'Contatos ilimitados'],
              ['1 usuário', '5 usuários', 'Usuários ilimitados'],
              ['Email suporte', 'Chat prioritário', 'Gerente dedicado'],
              ['Sem API', 'API básica', 'API + webhooks'],
            ]
            return [
              { type: 'icone', iconId: 'check',
                x: x + 24, y: fy, w: 18, h: 18,
                color: featured ? '#bfdbfe' : '#86efac' },
              { type: 'texto',
                x: x + 50, y: fy, w: 250, h: 22,
                html: features[j][i], fontSize: 13,
                color: featured ? '#dbeafe' : '#cbd5e1' },
            ]
          }),
          { type: 'botao',
            x: x + 24, y: 620, w: 272, h: 48,
            text: featured ? 'Começar agora →' : 'Escolher plano',
            bgColor: featured ? '#fbbf24' : 'transparent',
            color: featured ? '#7c2d12' : '#ffffff',
            fontSize: 14, fontWeight: 700, borderRadius: 10,
            ...(featured ? {} : {
              borders: { width: 1, color: '#475569',
                radius: r4(10), equalCorners: true } }),
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
    height: 80,
    bgColor: '#fffbeb',
    elements: [
      {
        type: 'texto',
        x: C(0, 1000), y: 28, w: 1000, h: 24,
        html: '⚠️ <strong>Atenção:</strong> Últimas vagas! Inscrições encerram hoje à meia-noite.',
        fontSize: 15, color: '#92400e', textAlign: 'center', fontWeight: 600,
      },
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
