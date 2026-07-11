/**
 * Sistema de slots pra templates HTML mestres.
 *
 * Modelo novo (Framer/Cal/Stripe style): em vez da IA gerar coordenadas
 * x/y/w/h em pixels, ela preenche SLOTS em templates HTML+CSS pré-desenhados
 * com Tailwind-esque responsive nativo.
 *
 * Vantagens:
 * - Templates responsivos DE VERDADE (flexbox/grid + media queries)
 * - Consistência premium garantida (design é feito uma vez, bem)
 * - Zero heurística de altura de texto — flexbox auto-ajusta
 * - Hover/animações nativas
 * - Meta Pixel + GA4 events prontos em CTAs via data-track
 *
 * Trade-off: páginas geradas não abrem no editor V3 (que espera coordenadas
 * absolutas). Como uso é interno, aceitamos.
 */

/**
 * Substitui `{{SLOT_NAME}}` no template pelo valor de data[SLOT_NAME].
 * Se um slot não existe em data, remove o placeholder (não quebra o HTML).
 * Se data tem `IF_SLOT`, blocos `{{#IF_SLOT}}...{{/IF_SLOT}}` são renderizados
 * ou removidos conforme truthy/falsy.
 *
 * Escaping: valores são inseridos EXATAMENTE (HTML-safe). Callers devem
 * escapar previamente quando necessário (via `escapeHtml`).
 */
export function fillSlots(template: string, data: Record<string, string | boolean | undefined | null>): string {
  let result = template

  // 1. Blocos condicionais: {{#IF_KEY}}...{{/IF_KEY}}
  //    Renderiza conteúdo se data.IF_KEY (ou data.KEY) for truthy.
  result = result.replace(/\{\{#IF_(\w+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g, (_, key, body) => {
    return data[key] || data[`IF_${key}`] ? body : ''
  })

  // 2. Slots simples: {{KEY}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = data[key]
    if (v === undefined || v === null || v === false) return ''
    return String(v)
  })

  return result
}

/** Escapa HTML pra evitar XSS quando slot recebe texto do usuário. */
export function escapeHtml(text: string): string {
  return String(text ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!))
}

/**
 * Wrapper padrão dos CTAs com data-attributes de tracking. Runtime no
 * [slug]/page.tsx pode ouvir cliques em [data-lp-track] e disparar
 * fbq/gtag events automaticamente.
 *
 * Uso no template: `${trackAttrs('cta_primary', 'Lead')}`
 * Renderiza: `data-lp-track="cta_primary" data-lp-track-event="Lead"`
 */
export function trackAttrs(kind: string, event: 'Lead' | 'InitiateCheckout' | 'ViewContent' | 'CompleteRegistration' = 'Lead'): string {
  return `data-lp-track="${kind}" data-lp-track-event="${event}"`
}
