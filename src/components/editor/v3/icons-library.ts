/**
 * Biblioteca de ícones SVG profissionais (estilo Lucide / Feather).
 *
 * Stroke-based, 24x24 viewBox, currentColor — herda a cor do parent.
 * Usar via IconeElement.svg em vez de IconeElement.emoji para visual
 * consistente entre browsers (emojis renderizam diferente em cada SO).
 */

export interface IconDef {
  id: string
  label: string
  category: 'check' | 'shield' | 'time' | 'rocket' | 'star' | 'comm' | 'biz' | 'arrow'
  /** SVG sem tag <svg> wrapper — usa currentColor pra herdar `color` do parent. */
  paths: string
}

const VB = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'

/** Wrap pra string SVG completa pronta pra inserir como innerHTML. */
export function iconSvg(id: string, sizeRatio = 0.7): string {
  const ic = ICONS.find(i => i.id === id)
  if (!ic) return ''
  return `<svg xmlns="http://www.w3.org/2000/svg" ${VB} style="width:${sizeRatio * 100}%;height:${sizeRatio * 100}%">${ic.paths}</svg>`
}

export const ICONS: IconDef[] = [
  // Check / Confirmação
  { id: 'check',          label: 'Check',         category: 'check', paths: '<polyline points="20 6 9 17 4 12"/>' },
  { id: 'check-circle',   label: 'Check em círculo', category: 'check', paths: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
  { id: 'badge-check',    label: 'Selo de verificado', category: 'check', paths: '<path d="M12 2L9.91 4.09 7 4l-.5 2.91L4 8.5l1.5 2.5L4 13.5l2.5 1.59L7 18l2.91-.09L12 20l2.09-2.09L17 18l.5-2.91L20 13.5 18.5 11 20 8.5l-2.5-1.59L17 4l-2.91.09Z"/><polyline points="9 12 11 14 15 10"/>' },
  { id: 'sparkles',       label: 'Brilho',        category: 'check', paths: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>' },

  // Shield / Garantia
  { id: 'shield',         label: 'Escudo',        category: 'shield', paths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { id: 'shield-check',   label: 'Escudo c/ check', category: 'shield', paths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>' },
  { id: 'lock',           label: 'Cadeado',       category: 'shield', paths: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>' },

  // Time / Velocidade
  { id: 'clock',          label: 'Relógio',       category: 'time', paths: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
  { id: 'timer',          label: 'Timer',         category: 'time', paths: '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="15" y2="11"/><circle cx="12" cy="14" r="8"/>' },
  { id: 'zap',            label: 'Raio',          category: 'time', paths: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },

  // Rocket / Crescimento
  { id: 'rocket',         label: 'Foguete',       category: 'rocket', paths: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>' },
  { id: 'trending-up',    label: 'Tendência alta', category: 'rocket', paths: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id: 'target',         label: 'Alvo',          category: 'rocket', paths: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>' },
  { id: 'flame',          label: 'Chama',         category: 'rocket', paths: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>' },

  // Star / Quality
  { id: 'star',           label: 'Estrela',       category: 'star', paths: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  { id: 'award',          label: 'Prêmio',        category: 'star', paths: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>' },
  { id: 'crown',          label: 'Coroa',         category: 'star', paths: '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>' },
  { id: 'thumbs-up',      label: 'Joinha',        category: 'star', paths: '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>' },

  // Communication
  { id: 'mail',           label: 'Email',         category: 'comm', paths: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>' },
  { id: 'phone',          label: 'Telefone',      category: 'comm', paths: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>' },
  { id: 'message-circle', label: 'Chat',          category: 'comm', paths: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>' },
  { id: 'headset',        label: 'Suporte',       category: 'comm', paths: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>' },

  // Business
  { id: 'briefcase',      label: 'Maleta',        category: 'biz', paths: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
  { id: 'dollar',         label: 'Cifrão',        category: 'biz', paths: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
  { id: 'chart-bar',      label: 'Gráfico barra', category: 'biz', paths: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>' },
  { id: 'users',          label: 'Pessoas',       category: 'biz', paths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { id: 'globe',          label: 'Globo',         category: 'biz', paths: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' },
  { id: 'gift',           label: 'Presente',      category: 'biz', paths: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>' },

  // Arrows / Setas
  { id: 'arrow-right',    label: 'Seta direita',  category: 'arrow', paths: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>' },
  { id: 'play',           label: 'Play',          category: 'arrow', paths: '<polygon points="5 3 19 12 5 21 5 3"/>' },
  { id: 'download',       label: 'Download',      category: 'arrow', paths: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>' },
]

export const ICON_CATEGORIES: { id: IconDef['category']; label: string }[] = [
  { id: 'check',  label: 'Confirmação' },
  { id: 'shield', label: 'Garantia' },
  { id: 'time',   label: 'Tempo' },
  { id: 'rocket', label: 'Crescimento' },
  { id: 'star',   label: 'Qualidade' },
  { id: 'comm',   label: 'Comunicação' },
  { id: 'biz',    label: 'Negócios' },
  { id: 'arrow',  label: 'Ações' },
]
