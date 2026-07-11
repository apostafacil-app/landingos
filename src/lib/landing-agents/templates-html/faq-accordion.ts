/**
 * FAQ — accordion nativo com <details>/<summary>.
 * Animação smooth via CSS transitions, sem JS.
 * Estilo Cal/Linear: cards limpos, ícone plus/minus animado.
 */

export const faqTemplate = `<style>
  .lp-faq { background: white; }
  .lp-faq-list {
    max-width: 780px; margin: 0 auto;
    display: flex; flex-direction: column; gap: 12px;
  }
  .lp-faq-item {
    background: var(--lp-bg-soft);
    border: 1px solid var(--lp-border-soft);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color .2s ease, background .2s ease;
  }
  .lp-faq-item:hover { border-color: var(--lp-border); }
  .lp-faq-item[open] { background: white; border-color: var(--lp-border); box-shadow: var(--lp-shadow-sm); }
  .lp-faq-item summary {
    list-style: none;
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    font-size: 16px; font-weight: 600;
    color: var(--lp-ink);
    cursor: pointer; user-select: none;
    transition: color .15s ease;
  }
  .lp-faq-item summary::-webkit-details-marker { display: none; }
  .lp-faq-item summary:hover { color: var(--lp-primary); }
  .lp-faq-icon {
    flex-shrink: 0; width: 20px; height: 20px;
    color: var(--lp-ink-fade);
    transition: transform .25s ease, color .15s ease;
  }
  .lp-faq-item[open] .lp-faq-icon { transform: rotate(180deg); color: var(--lp-primary); }
  .lp-faq-answer {
    padding: 0 24px 22px;
    font-size: 15px; line-height: 1.65;
    color: var(--lp-ink-soft);
  }
</style>

<section class="lp-section lp-faq" id="faq">
  <div class="lp-container">
    <div class="lp-section-header">
      {{#IF_EYEBROW}}<span class="lp-section-eyebrow">{{EYEBROW}}</span>{{/IF_EYEBROW}}
      <h2 class="lp-section-title">{{HEADLINE}}</h2>
      {{#IF_SUBTITLE}}<p class="lp-section-subtitle">{{SUBTITLE}}</p>{{/IF_SUBTITLE}}
    </div>
    <div class="lp-faq-list">
      {{ITEMS_HTML}}
    </div>
  </div>
</section>
`

export function renderFaqItem(question: string, answer: string): string {
  const chevron = '<svg class="lp-faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
  return `<details class="lp-faq-item">
        <summary>${question}${chevron}</summary>
        <div class="lp-faq-answer">${answer}</div>
      </details>`
}
