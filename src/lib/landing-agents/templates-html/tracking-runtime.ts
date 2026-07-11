/**
 * Runtime JS de tracking — injetado no <body> das páginas publicadas quando
 * a página tem gaId ou pixelId configurado.
 *
 * Ouve cliques em qualquer elemento com `data-lp-track="..."` e dispara:
 * - Meta Pixel: `fbq('track', event, {content_name})`
 * - GA4: `gtag('event', event, {content_name, section})`
 *
 * Meta events padrão: PageView (auto), Lead (CTA primário), InitiateCheckout
 * (CTA nav), ViewContent (CTA ghost), CompleteRegistration (submit form).
 */

export const trackingRuntime = `
(function() {
  if (typeof window === 'undefined') return;
  var handled = new WeakSet();
  document.addEventListener('click', function(e) {
    var target = e.target;
    while (target && target !== document.body) {
      if (target.getAttribute && target.getAttribute('data-lp-track')) {
        if (handled.has(target)) return;
        handled.add(target);
        var kind = target.getAttribute('data-lp-track');
        var event = target.getAttribute('data-lp-track-event') || 'Lead';
        var text = (target.textContent || '').trim().slice(0, 60);
        try {
          if (typeof window.fbq === 'function') {
            window.fbq('track', event, { content_name: text, content_category: kind });
          }
        } catch (err) {}
        try {
          if (typeof window.gtag === 'function') {
            window.gtag('event', event.toLowerCase(), { content_name: text, section: kind });
          }
        } catch (err) {}
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'lp_' + kind, section: kind, event_type: event, content_name: text });
        } catch (err) {}
        // Reset após 800ms pra permitir re-fire em navegações spa
        setTimeout(function() { handled.delete(target); }, 800);
        return;
      }
      target = target.parentElement;
    }
  }, true);
})();
`
