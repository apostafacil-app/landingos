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

// ─────────────────────────────────────────────────────────────────────────────
// HERO / HEADERS
// ─────────────────────────────────────────────────────────────────────────────

const heroGradiente: BlockTemplate = {
  id: 'hero-gradiente',
  label: 'Hero Gradiente',
  category: 'Hero',
  thumbnailKey: 'hero-simples',
  block: {
    height: 600,
    bgColor: '#1e40af',
    elements: [
      {
        type: 'titulo', headingLevel: 1,
        x: C(0, 800), y: 180, w: 800, h: 100,
        html: 'Transforme seu negócio com nossa solução',
        fontSize: 52, fontWeight: 800, color: '#ffffff', textAlign: 'center', lineHeight: 1.15,
      },
      {
        type: 'texto',
        x: C(0, 700), y: 300, w: 700, h: 60,
        html: 'Descubra como centenas de empresas já conseguiram resultados extraordinários com nossa plataforma.',
        fontSize: 20, color: '#dbeafe', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(0, 280), y: 420, w: 280, h: 60,
        text: 'Quero começar agora →',
        bgColor: '#f59e0b', color: '#1a1a1a', fontSize: 18, fontWeight: 700, borderRadius: 10,
      },
      {
        type: 'texto',
        x: C(0, 400), y: 500, w: 400, h: 24,
        html: 'Sem compromisso · Cancele quando quiser',
        fontSize: 13, color: '#cbd5e1', textAlign: 'center',
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
    height: 560,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'caixa',
        x: 100, y: 200, w: 100, h: 28,
        bgColor: '#3b82f6', borderRadius: 100,
      },
      {
        type: 'texto',
        x: 110, y: 204, w: 80, h: 20,
        html: 'NOVIDADE 2026',
        fontSize: 11, color: '#ffffff', textAlign: 'center', fontWeight: 700, letterSpacing: 1,
      },
      {
        type: 'titulo', headingLevel: 1,
        x: 100, y: 250, w: 460, h: 120,
        html: 'O resultado que você sempre quis está aqui',
        fontSize: 44, fontWeight: 800, color: '#ffffff', lineHeight: 1.15,
      },
      {
        type: 'texto',
        x: 100, y: 380, w: 460, h: 70,
        html: 'Solução completa para quem quer crescer sem complicação e com resultado garantido.',
        fontSize: 18, color: '#94a3b8', lineHeight: 1.7,
      },
      {
        type: 'botao',
        x: 100, y: 470, w: 240, h: 56,
        text: 'Garantir minha vaga →',
        bgColor: '#f59e0b', color: '#000000', fontSize: 16, fontWeight: 700, borderRadius: 10,
      },
      {
        type: 'imagem',
        x: 640, y: 130, w: 460, h: 300,
        src: 'https://placehold.co/600x400/1e293b/475569?text=Sua+imagem+aqui',
        objectFit: 'cover',
        borders: { radius: [20, 20, 20, 20], equalCorners: true },
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
  thumbnailKey: 'hero-imagem',
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
  thumbnailKey: 'hero-simples',
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
    height: 460,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 700), y: 60, w: 700, h: 60,
        html: 'Por que escolher nossa solução',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      // Col 1
      {
        type: 'circulo', x: 220, y: 170, w: 64, h: 64,
        bgColor: '#dbeafe',
      },
      {
        type: 'icone', x: 232, y: 182, w: 40, h: 40,
        emoji: '⚡', color: '#2563eb',
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 130, y: 250, w: 240, h: 36,
        html: 'Rápido', fontSize: 22, fontWeight: 700, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto', x: 130, y: 290, w: 240, h: 60,
        html: 'Veja resultados em poucos dias com nosso método validado.',
        fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      },
      // Col 2
      {
        type: 'circulo', x: 568, y: 170, w: 64, h: 64,
        bgColor: '#dcfce7',
      },
      {
        type: 'icone', x: 580, y: 182, w: 40, h: 40,
        emoji: '🎯', color: '#16a34a',
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 478, y: 250, w: 240, h: 36,
        html: 'Preciso', fontSize: 22, fontWeight: 700, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto', x: 478, y: 290, w: 240, h: 60,
        html: 'Estratégia personalizada para seu nicho e objetivo específico.',
        fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      },
      // Col 3
      {
        type: 'circulo', x: 916, y: 170, w: 64, h: 64,
        bgColor: '#fef3c7',
      },
      {
        type: 'icone', x: 928, y: 182, w: 40, h: 40,
        emoji: '🚀', color: '#f59e0b',
      },
      {
        type: 'titulo', headingLevel: 3,
        x: 826, y: 250, w: 240, h: 36,
        html: 'Escalável', fontSize: 22, fontWeight: 700, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto', x: 826, y: 290, w: 240, h: 60,
        html: 'Cresça sem limites com um sistema que funciona em qualquer escala.',
        fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 1.6,
      },
    ],
  },
}

const beneficiosLista: BlockTemplate = {
  id: 'beneficios-lista',
  label: 'Benefícios em Lista',
  category: 'Benefícios',
  thumbnailKey: 'beneficios-lista',
  block: {
    height: 540,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 700), y: 60, w: 700, h: 60,
        html: 'O que você vai conquistar',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      // 4 itens em coluna
      ...[
        { y: 160, t: 'Mais clientes', d: 'Atraia clientes qualificados todos os dias automaticamente.' },
        { y: 250, t: 'Mais faturamento', d: 'Aumente sua receita mensal sem esforço adicional.' },
        { y: 340, t: 'Mais tempo livre', d: 'Automatize processos e tenha tempo pro que importa.' },
        { y: 430, t: 'Mais previsibilidade', d: 'Saiba exatamente quanto vai entrar todo mês.' },
      ].flatMap((item): ElemInput[] => [
        { type: 'circulo', x: 300, y: item.y, w: 48, h: 48, bgColor: '#dcfce7' },
        { type: 'icone', x: 312, y: item.y + 12, w: 24, h: 24, emoji: '✓', color: '#16a34a' },
        { type: 'titulo', headingLevel: 3, x: 380, y: item.y + 4, w: 540, h: 32, html: item.t, fontSize: 22, fontWeight: 700, color: '#0f172a' },
        { type: 'texto', x: 380, y: item.y + 36, w: 540, h: 28, html: item.d, fontSize: 15, color: '#64748b', lineHeight: 1.5 },
      ]),
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
    height: 520,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 700), y: 60, w: 700, h: 60,
        html: 'O que dizem sobre nós',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      // Card 1
      {
        type: 'caixa', x: 100, y: 160, w: 320, h: 280,
        bgColor: '#ffffff', borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'texto', x: 130, y: 180, w: 120, h: 24,
        html: '⭐⭐⭐⭐⭐', fontSize: 16, color: '#f59e0b',
      },
      {
        type: 'texto', x: 130, y: 220, w: 260, h: 130,
        html: '"Em apenas 2 meses minha empresa cresceu 3×. O método é simples, prático e funciona."',
        fontSize: 16, color: '#334155', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: 130, y: 370, w: 48, h: 48, bgColor: '#cbd5e1',
      },
      {
        type: 'titulo', headingLevel: 4, x: 190, y: 374, w: 200, h: 22,
        html: 'Maria Silva', fontSize: 15, fontWeight: 700, color: '#0f172a',
      },
      {
        type: 'texto', x: 190, y: 397, w: 200, h: 18,
        html: 'CEO @ Empresa X', fontSize: 12, color: '#64748b',
      },
      // Card 2
      {
        type: 'caixa', x: 440, y: 160, w: 320, h: 280,
        bgColor: '#ffffff', borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'texto', x: 470, y: 180, w: 120, h: 24,
        html: '⭐⭐⭐⭐⭐', fontSize: 16, color: '#f59e0b',
      },
      {
        type: 'texto', x: 470, y: 220, w: 260, h: 130,
        html: '"Resultado garantido. Investi e em 30 dias já tinha recuperado todo o valor."',
        fontSize: 16, color: '#334155', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: 470, y: 370, w: 48, h: 48, bgColor: '#cbd5e1',
      },
      {
        type: 'titulo', headingLevel: 4, x: 530, y: 374, w: 200, h: 22,
        html: 'João Santos', fontSize: 15, fontWeight: 700, color: '#0f172a',
      },
      {
        type: 'texto', x: 530, y: 397, w: 200, h: 18,
        html: 'Fundador @ Startup', fontSize: 12, color: '#64748b',
      },
      // Card 3
      {
        type: 'caixa', x: 780, y: 160, w: 320, h: 280,
        bgColor: '#ffffff', borders: { radius: [16, 16, 16, 16], equalCorners: true },
        shadow: 'soft',
      },
      {
        type: 'texto', x: 810, y: 180, w: 120, h: 24,
        html: '⭐⭐⭐⭐⭐', fontSize: 16, color: '#f59e0b',
      },
      {
        type: 'texto', x: 810, y: 220, w: 260, h: 130,
        html: '"Recomendo para qualquer empreendedor. O suporte é impecável e o conteúdo é ouro."',
        fontSize: 16, color: '#334155', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: 810, y: 370, w: 48, h: 48, bgColor: '#cbd5e1',
      },
      {
        type: 'titulo', headingLevel: 4, x: 870, y: 374, w: 200, h: 22,
        html: 'Ana Costa', fontSize: 15, fontWeight: 700, color: '#0f172a',
      },
      {
        type: 'texto', x: 870, y: 397, w: 200, h: 18,
        html: 'Empresária', fontSize: 12, color: '#64748b',
      },
    ],
  },
}

const depoimentoHighlight: BlockTemplate = {
  id: 'depoimento-highlight',
  label: 'Depoimento Destaque',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-cards',
  block: {
    height: 460,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'texto', x: C(0, 80), y: 80, w: 80, h: 30,
        html: '⭐⭐⭐⭐⭐', fontSize: 22, color: '#f59e0b', textAlign: 'center',
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 130, w: 900, h: 130,
        html: '"Em 60 dias, faturamos mais que nos 6 meses anteriores."',
        fontSize: 36, fontWeight: 700, color: '#ffffff', textAlign: 'center',
        lineHeight: 1.3, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: C(0, 64), y: 290, w: 64, h: 64, bgColor: '#3b82f6',
      },
      {
        type: 'titulo', headingLevel: 4,
        x: C(0, 400), y: 370, w: 400, h: 26,
        html: 'Carlos Mendes', fontSize: 18, fontWeight: 700,
        color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 400), y: 400, w: 400, h: 22,
        html: 'Diretor — Mendes & Cia', fontSize: 14, color: '#94a3b8', textAlign: 'center',
      },
    ],
  },
}

const depoimentos2Vertical: BlockTemplate = {
  id: 'depoimentos-2-vertical',
  label: 'Depoimentos 2 Cards Largos',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-cards',
  block: {
    height: 580,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 60, w: 800, h: 60,
        html: 'Histórias reais de quem aplicou',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      // Card esquerdo
      {
        type: 'caixa', x: 100, y: 160, w: 480, h: 360,
        bgColor: '#f8fafc', borders: { radius: [16, 16, 16, 16], equalCorners: true },
      },
      {
        type: 'texto', x: 140, y: 190, w: 120, h: 30,
        html: '⭐⭐⭐⭐⭐', fontSize: 18, color: '#f59e0b',
      },
      {
        type: 'texto', x: 140, y: 230, w: 400, h: 180,
        html: '"Mudei a forma como atendia meus clientes e o resultado foi imediato. Em 3 meses, dobrei o ticket médio sem aumentar minha base."',
        fontSize: 18, color: '#1e293b', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: 140, y: 430, w: 56, h: 56, bgColor: '#cbd5e1',
      },
      {
        type: 'titulo', headingLevel: 4, x: 210, y: 438, w: 320, h: 24,
        html: 'Patrícia Lima', fontSize: 16, fontWeight: 700, color: '#0f172a',
      },
      {
        type: 'texto', x: 210, y: 466, w: 320, h: 20,
        html: 'Consultora de Marketing', fontSize: 13, color: '#64748b',
      },
      // Card direito
      {
        type: 'caixa', x: 620, y: 160, w: 480, h: 360,
        bgColor: '#f8fafc', borders: { radius: [16, 16, 16, 16], equalCorners: true },
      },
      {
        type: 'texto', x: 660, y: 190, w: 120, h: 30,
        html: '⭐⭐⭐⭐⭐', fontSize: 18, color: '#f59e0b',
      },
      {
        type: 'texto', x: 660, y: 230, w: 400, h: 180,
        html: '"Cético no início, mas a metodologia me convenceu rápido. Hoje recomendo pra todo empreendedor que conheço."',
        fontSize: 18, color: '#1e293b', lineHeight: 1.6, fontFamily: 'Georgia, serif',
      },
      {
        type: 'circulo', x: 660, y: 430, w: 56, h: 56, bgColor: '#cbd5e1',
      },
      {
        type: 'titulo', headingLevel: 4, x: 730, y: 438, w: 320, h: 24,
        html: 'Rafael Cruz', fontSize: 16, fontWeight: 700, color: '#0f172a',
      },
      {
        type: 'texto', x: 730, y: 466, w: 320, h: 20,
        html: 'CEO — TechCo', fontSize: 13, color: '#64748b',
      },
    ],
  },
}

const depoimentosLogos: BlockTemplate = {
  id: 'depoimentos-logos',
  label: 'Empresas que Confiam',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-cards',
  block: {
    height: 320,
    bgColor: '#f8fafc',
    elements: [
      {
        type: 'titulo', headingLevel: 3,
        x: C(0, 800), y: 60, w: 800, h: 30,
        html: 'EMPRESAS QUE JÁ CONFIAM EM NÓS',
        fontSize: 13, fontWeight: 700, color: '#64748b', textAlign: 'center',
        letterSpacing: 2,
      },
      // Logos placeholder em 5 colunas
      {
        type: 'caixa', x: 100, y: 130, w: 180, h: 80,
        bgColor: '#e2e8f0', borders: { radius: [12, 12, 12, 12], equalCorners: true },
      },
      { type: 'texto', x: 100, y: 158, w: 180, h: 24, html: 'LOGO 1', fontSize: 14, fontWeight: 700, color: '#94a3b8', textAlign: 'center' },
      {
        type: 'caixa', x: 310, y: 130, w: 180, h: 80,
        bgColor: '#e2e8f0', borders: { radius: [12, 12, 12, 12], equalCorners: true },
      },
      { type: 'texto', x: 310, y: 158, w: 180, h: 24, html: 'LOGO 2', fontSize: 14, fontWeight: 700, color: '#94a3b8', textAlign: 'center' },
      {
        type: 'caixa', x: 520, y: 130, w: 180, h: 80,
        bgColor: '#e2e8f0', borders: { radius: [12, 12, 12, 12], equalCorners: true },
      },
      { type: 'texto', x: 520, y: 158, w: 180, h: 24, html: 'LOGO 3', fontSize: 14, fontWeight: 700, color: '#94a3b8', textAlign: 'center' },
      {
        type: 'caixa', x: 730, y: 130, w: 180, h: 80,
        bgColor: '#e2e8f0', borders: { radius: [12, 12, 12, 12], equalCorners: true },
      },
      { type: 'texto', x: 730, y: 158, w: 180, h: 24, html: 'LOGO 4', fontSize: 14, fontWeight: 700, color: '#94a3b8', textAlign: 'center' },
      {
        type: 'caixa', x: 940, y: 130, w: 160, h: 80,
        bgColor: '#e2e8f0', borders: { radius: [12, 12, 12, 12], equalCorners: true },
      },
      { type: 'texto', x: 940, y: 158, w: 160, h: 24, html: 'LOGO 5', fontSize: 14, fontWeight: 700, color: '#94a3b8', textAlign: 'center' },
      {
        type: 'texto', x: C(0, 800), y: 240, w: 800, h: 24,
        html: 'Mais de 5.000 clientes em 12 países',
        fontSize: 14, color: '#475569', textAlign: 'center',
      },
    ],
  },
}

const depoimentoVideo: BlockTemplate = {
  id: 'depoimento-video',
  label: 'Depoimento em Vídeo',
  category: 'Depoimentos',
  thumbnailKey: 'depoimentos-cards',
  block: {
    height: 520,
    bgColor: '#ffffff',
    elements: [
      {
        type: 'titulo', headingLevel: 3,
        x: C(0, 800), y: 50, w: 800, h: 30,
        html: 'VEJA QUEM JÁ TRANSFORMOU O NEGÓCIO',
        fontSize: 12, fontWeight: 700, color: '#2563eb', textAlign: 'center',
        letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 90, w: 800, h: 60,
        html: 'Resultado em vídeo',
        fontSize: 36, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'video',
        x: C(0, 720), y: 180, w: 720, h: 280,
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
    height: 380,
    bgColor: '#2563eb',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 90, w: 800, h: 60,
        html: 'Pronto para começar?',
        fontSize: 42, fontWeight: 900, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 170, w: 700, h: 50,
        html: 'Junte-se aos milhares que já transformaram seus resultados.',
        fontSize: 18, color: '#dbeafe', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(0, 320), y: 240, w: 320, h: 64,
        text: 'COMEÇAR AGORA →',
        bgColor: '#f59e0b', color: '#1a1a1a', fontSize: 18, fontWeight: 700, borderRadius: 32,
      },
    ],
  },
}

const ctaUrgencia: BlockTemplate = {
  id: 'cta-urgencia',
  label: 'CTA com Urgência',
  category: 'CTA',
  thumbnailKey: 'cta-simples',
  block: {
    height: 460,
    bgColor: '#dc2626',
    elements: [
      {
        type: 'texto',
        x: C(0, 800), y: 60, w: 800, h: 28,
        html: '🔥 OFERTA POR TEMPO LIMITADO',
        fontSize: 14, fontWeight: 700, color: '#fee2e2', textAlign: 'center', letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 900), y: 110, w: 900, h: 70,
        html: 'Últimas 24h com 50% off',
        fontSize: 48, fontWeight: 900, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 200, w: 700, h: 60,
        html: 'Não deixe essa oportunidade passar. Garanta sua vaga agora antes que volte ao preço normal.',
        fontSize: 18, color: '#fee2e2', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(0, 360), y: 290, w: 360, h: 68,
        text: 'GARANTIR DESCONTO →',
        bgColor: '#fbbf24', color: '#7c2d12', fontSize: 18, fontWeight: 800, borderRadius: 12,
      },
      {
        type: 'texto',
        x: C(0, 600), y: 380, w: 600, h: 22,
        html: 'Garantia incondicional de 30 dias · 7 dias para arrependimento',
        fontSize: 13, color: '#fecaca', textAlign: 'center',
      },
    ],
  },
}

const ctaDoisBotoes: BlockTemplate = {
  id: 'cta-2-botoes',
  label: 'CTA Dois Botões',
  category: 'CTA',
  thumbnailKey: 'cta-simples',
  block: {
    height: 400,
    bgColor: '#0f172a',
    elements: [
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 90, w: 800, h: 60,
        html: 'Comece grátis hoje',
        fontSize: 42, fontWeight: 800, color: '#ffffff', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 170, w: 700, h: 50,
        html: 'Teste todos os recursos por 14 dias. Sem cartão de crédito.',
        fontSize: 18, color: '#cbd5e1', textAlign: 'center', lineHeight: 1.6,
      },
      {
        type: 'botao',
        x: C(-160, 240), y: 260, w: 240, h: 56,
        text: 'COMEÇAR GRÁTIS',
        bgColor: '#3b82f6', color: '#ffffff', fontSize: 16, fontWeight: 700, borderRadius: 8,
      },
      {
        type: 'botao',
        x: C(160, 240), y: 260, w: 240, h: 56,
        text: 'AGENDAR DEMO',
        bgColor: 'transparent', color: '#ffffff',
        fontSize: 16, fontWeight: 700, borderRadius: 8,
        borders: { width: 2, color: '#475569', radius: [8, 8, 8, 8], equalCorners: true },
      },
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
        src: 'https://placehold.co/600x720/f1f5f9/64748b?text=Sua+foto',
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
    height: 380,
    bgColor: '#f0fdf4',
    elements: [
      {
        type: 'circulo',
        x: C(0, 140), y: 60, w: 140, h: 140,
        bgColor: '#ffffff',
        borders: { color: '#16a34a', width: 4, radius: [70, 70, 70, 70], equalCorners: true },
      },
      {
        type: 'titulo', headingLevel: 4,
        x: C(0, 140), y: 95, w: 140, h: 36,
        html: '30', fontSize: 36, fontWeight: 900, color: '#16a34a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 140), y: 138, w: 140, h: 22,
        html: 'DIAS', fontSize: 14, color: '#16a34a', textAlign: 'center', fontWeight: 700, letterSpacing: 2,
      },
      {
        type: 'titulo', headingLevel: 2,
        x: C(0, 800), y: 220, w: 800, h: 50,
        html: 'Garantia incondicional de 30 dias',
        fontSize: 30, fontWeight: 800, color: '#0f172a', textAlign: 'center',
      },
      {
        type: 'texto',
        x: C(0, 700), y: 290, w: 700, h: 50,
        html: 'Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro.',
        fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 1.6,
      },
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
  thumbnailKey: 'faq',
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
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCKS_LIBRARY: BlockTemplate[] = [
  // Hero
  heroGradiente,
  heroDoisCol,
  heroClaro,
  heroComVideo,
  heroMinimalista,
  // Benefícios
  beneficios3Col,
  beneficiosLista,
  // Depoimentos
  depoimentos3Cards,
  depoimentoHighlight,
  depoimentos2Vertical,
  depoimentosLogos,
  depoimentoVideo,
  // CTA
  ctaSimples,
  ctaUrgencia,
  ctaDoisBotoes,
  // Sobre
  sobreBio,
  // Garantia
  garantia30Dias,
  // Vídeo
  videoCentral,
  // FAQ
  faqLista,
  faqDuasColunas,
  // Planos
  planoUnico,
  // Rodapé
  rodapeSimples,
]

export const BLOCKS_CATEGORIES = [
  'Hero', 'Benefícios', 'Depoimentos', 'CTA', 'Sobre',
  'Garantia', 'Vídeo', 'FAQ', 'Planos', 'Rodapé',
] as const
