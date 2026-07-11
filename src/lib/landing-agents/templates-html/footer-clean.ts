/**
 * Footer — 4 colunas com logo/tagline + links.
 * Clean B2B style: fundo cinza claro, borders sutis, hover suave.
 */

export const footerTemplate = `<style>
  .lp-footer {
    background: var(--lp-bg-soft);
    border-top: 1px solid var(--lp-border);
    padding: 64px 0 32px;
  }
  .lp-footer-grid {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 40px;
  }
  @media (max-width: 900px) {
    .lp-footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 500px) {
    .lp-footer-grid { grid-template-columns: 1fr; gap: 32px; }
  }
  .lp-footer-brand {
    display: flex; align-items: center; gap: 10px;
    font-weight: 700; font-size: 18px;
    color: var(--lp-ink);
    margin-bottom: 12px;
  }
  .lp-footer-brand img { max-height: 32px; }
  .lp-footer-tagline {
    font-size: 14px; line-height: 1.55;
    color: var(--lp-ink-soft);
    max-width: 320px;
  }
  .lp-footer-col-title {
    font-size: 13px; font-weight: 600;
    color: var(--lp-ink);
    margin-bottom: 16px;
    letter-spacing: 0.02em;
  }
  .lp-footer-col-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 10px;
  }
  .lp-footer-col-list a {
    font-size: 14px;
    color: var(--lp-ink-soft);
    transition: color .15s ease;
  }
  .lp-footer-col-list a:hover { color: var(--lp-ink); }
  .lp-footer-bottom {
    padding-top: 24px;
    border-top: 1px solid var(--lp-border);
    display: flex; align-items: center; justify-content: space-between;
    gap: 20px; flex-wrap: wrap;
    font-size: 13px; color: var(--lp-ink-fade);
  }
</style>

<footer class="lp-footer">
  <div class="lp-container">
    <div class="lp-footer-grid">
      <div>
        <div class="lp-footer-brand">
          {{#IF_LOGO_URL}}<img src="{{LOGO_URL}}" alt="{{BUSINESS_NAME}}" />{{/IF_LOGO_URL}}
          {{#IF_NO_LOGO_URL}}{{BUSINESS_NAME}}{{/IF_NO_LOGO_URL}}
        </div>
        <p class="lp-footer-tagline">{{TAGLINE}}</p>
      </div>
      <div>
        <div class="lp-footer-col-title">Produto</div>
        <ul class="lp-footer-col-list">{{PRODUCT_LINKS_HTML}}</ul>
      </div>
      <div>
        <div class="lp-footer-col-title">Empresa</div>
        <ul class="lp-footer-col-list">
          <li><a href="#">Sobre</a></li>
          <li><a href="#">Contato</a></li>
          <li><a href="#">Blog</a></li>
        </ul>
      </div>
      <div>
        <div class="lp-footer-col-title">Legal</div>
        <ul class="lp-footer-col-list">
          <li><a href="#">Termos de uso</a></li>
          <li><a href="#">Privacidade</a></li>
          <li><a href="#">LGPD</a></li>
        </ul>
      </div>
    </div>
    <div class="lp-footer-bottom">
      <div>&copy; {{YEAR}} {{BUSINESS_NAME}}. Todos os direitos reservados.</div>
      <div>Feito com cuidado 🇧🇷</div>
    </div>
  </div>
</footer>
`
