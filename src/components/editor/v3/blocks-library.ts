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
        type: 'texto', x: 130, y: 180, w: 60, h: 30,
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
        type: 'texto', x: 470, y: 180, w: 60, h: 30,
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
        type: 'texto', x: 810, y: 180, w: 60, h: 30,
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
  // Benefícios
  beneficios3Col,
  beneficiosLista,
  // Depoimentos
  depoimentos3Cards,
  // CTA
  ctaSimples,
  // Sobre
  sobreBio,
  // Garantia
  garantia30Dias,
  // Vídeo
  videoCentral,
  // FAQ
  faqLista,
  // Planos
  planoUnico,
  // Rodapé
  rodapeSimples,
]

export const BLOCKS_CATEGORIES = [
  'Hero', 'Benefícios', 'Depoimentos', 'CTA', 'Sobre',
  'Garantia', 'Vídeo', 'FAQ', 'Planos', 'Rodapé',
] as const
