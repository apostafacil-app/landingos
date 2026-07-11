/**
 * Social Proof — grid de depoimentos estilo Linear/Vercel.
 * Aspas grandes, avatar circular com inicial, hover suave.
 */

export const socialProofTemplate = `<style>
  .lp-testimonials { background: var(--lp-bg-soft); }
  .lp-testimonials-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    .lp-testimonials-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 600px) {
    .lp-testimonials-grid { grid-template-columns: 1fr; }
  }
  .lp-testimonial {
    padding: 28px;
    background: white;
    border: 1px solid var(--lp-border-soft);
    border-radius: 16px;
    display: flex; flex-direction: column;
    transition: transform .2s ease, box-shadow .3s ease;
  }
  .lp-testimonial:hover {
    transform: translateY(-3px);
    box-shadow: var(--lp-shadow-md);
  }
  .lp-testimonial-quote {
    font-size: 15px; line-height: 1.65;
    color: var(--lp-ink);
    margin-bottom: 20px; flex: 1;
    letter-spacing: -0.005em;
  }
  .lp-testimonial-quote::before {
    content: '"'; display: block;
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 48px; line-height: 0;
    color: var(--lp-accent);
    margin-bottom: 12px; opacity: 0.5;
  }
  .lp-testimonial-author {
    display: flex; align-items: center; gap: 12px;
  }
  .lp-testimonial-avatar {
    width: 40px; height: 40px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--lp-primary), var(--lp-accent));
    color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 15px;
    flex-shrink: 0;
  }
  .lp-testimonial-meta { display: flex; flex-direction: column; min-width: 0; }
  .lp-testimonial-name { font-size: 14px; font-weight: 600; color: var(--lp-ink); }
  .lp-testimonial-role {
    font-size: 13px; color: var(--lp-ink-fade);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
</style>

<section class="lp-section lp-testimonials" id="depoimentos">
  <div class="lp-container">
    <div class="lp-section-header">
      {{#IF_EYEBROW}}<span class="lp-section-eyebrow">{{EYEBROW}}</span>{{/IF_EYEBROW}}
      <h2 class="lp-section-title">{{HEADLINE}}</h2>
      {{#IF_SUBTITLE}}<p class="lp-section-subtitle">{{SUBTITLE}}</p>{{/IF_SUBTITLE}}
    </div>
    <div class="lp-testimonials-grid">
      {{ITEMS_HTML}}
    </div>
  </div>
</section>
`

export function renderTestimonial(quote: string, name: string, role: string): string {
  const initial = (name.trim()[0] || '?').toUpperCase()
  return `<div class="lp-testimonial">
        <p class="lp-testimonial-quote">${quote}</p>
        <div class="lp-testimonial-author">
          <div class="lp-testimonial-avatar">${initial}</div>
          <div class="lp-testimonial-meta">
            <div class="lp-testimonial-name">${name}</div>
            ${role ? `<div class="lp-testimonial-role">${role}</div>` : ''}
          </div>
        </div>
      </div>`
}
