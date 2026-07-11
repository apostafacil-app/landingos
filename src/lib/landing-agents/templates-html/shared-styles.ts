/**
 * Estilos compartilhados por todos os templates HTML mestres.
 *
 * Define CSS custom properties (--lp-*) que os templates individuais usam,
 * reset base, tipografia, e classes utilitárias.
 *
 * Injetado UMA vez no início do HTML gerado, antes de qualquer template.
 */

export const sharedStyles = (primary: string, accent: string) => `<style>
  :root {
    --lp-primary: ${primary};
    --lp-accent: ${accent};
    --lp-ink: #0a0a0a;
    --lp-ink-soft: #4a4a4a;
    --lp-ink-fade: #6b6b6b;
    --lp-ink-mute: #a0a0a0;
    --lp-bg: #ffffff;
    --lp-bg-soft: #fafafa;
    --lp-bg-mute: #f5f5f5;
    --lp-border: #e5e5e5;
    --lp-border-soft: #f0f0f0;
    --lp-danger: #ef4444;
    --lp-success: #10b981;
    --lp-shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
    --lp-shadow-md: 0 4px 20px rgba(0,0,0,0.06);
    --lp-shadow-lg: 0 24px 48px rgba(0,0,0,0.08);
    --lp-shadow-xl: 0 32px 64px rgba(0,0,0,0.12);
    --lp-radius: 12px;
    --lp-radius-lg: 20px;
    --lp-radius-xl: 24px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: var(--lp-bg); color: var(--lp-ink);
    line-height: 1.5; font-weight: 400;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
  }
  a { color: inherit; text-decoration: none; }
  img { display: block; max-width: 100%; height: auto; }

  /* Utility classes */
  .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
  @media (max-width: 720px) {
    .lp-container { padding: 0 20px; }
  }

  /* Section titles compartilhados */
  .lp-section { padding: 96px 0; position: relative; }
  .lp-section-alt { background: var(--lp-bg-soft); }
  .lp-section-dark { background: var(--lp-ink); color: white; }
  @media (max-width: 720px) {
    .lp-section { padding: 64px 0; }
  }
  .lp-section-header { max-width: 720px; margin: 0 auto 64px; text-align: center; }
  .lp-section-eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    font-size: 13px; font-weight: 500;
    color: var(--lp-ink-soft);
    background: white;
    border: 1px solid var(--lp-border);
    border-radius: 999px;
    margin-bottom: 20px;
  }
  .lp-section-dark .lp-section-eyebrow {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.7);
  }
  .lp-section-title {
    font-size: clamp(30px, 4vw, 44px);
    line-height: 1.1; letter-spacing: -0.03em;
    font-weight: 700;
    margin-bottom: 16px;
  }
  .lp-section-subtitle {
    font-size: 18px; line-height: 1.55;
    color: var(--lp-ink-soft);
  }
  .lp-section-dark .lp-section-subtitle { color: rgba(255,255,255,0.7); }

  /* Botões compartilhados */
  .lp-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 24px;
    font-size: 15px; font-weight: 600;
    color: white; background: var(--lp-ink);
    border: none; border-radius: 12px;
    cursor: pointer;
    box-shadow: var(--lp-shadow-sm);
    transition: transform .15s ease, box-shadow .2s ease;
  }
  .lp-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--lp-shadow-lg);
  }
  .lp-btn-primary::after { content: '→'; transition: transform .2s ease; }
  .lp-btn-primary:hover::after { transform: translateX(4px); }
  .lp-btn-secondary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 20px;
    font-size: 15px; font-weight: 500;
    color: var(--lp-ink);
    background: transparent;
    border: 1px solid var(--lp-border);
    border-radius: 12px; cursor: pointer;
    transition: border-color .15s ease, background-color .15s ease;
  }
  .lp-btn-secondary:hover {
    border-color: var(--lp-ink); background: var(--lp-bg-soft);
  }
</style>`
