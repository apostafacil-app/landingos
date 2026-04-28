/**
 * Runtime client-side dos formulários V3.
 *
 * Compartilhado entre:
 * - app/[slug]/page.tsx (página publicada)
 * - app/(preview)/paginas/[id]/preview/page.tsx (preview no iframe srcDoc)
 *
 * Comportamento:
 * - Escuta submit em form[data-lp-form] (delegated em document)
 * - Lê inputs com `name` (specials: name, email, phone → colunas dedicadas
 *   da tabela leads; outros → custom_fields)
 * - POSTa em /api/leads com page_id
 * - Suporta data-redirect, data-webhook-*, data-fb-pixel-event,
 *   data-success-message
 * - Aplica máscaras (phone-br, cpf, cnpj, cep) em input[data-lp-mask]
 * - Pré-preenche inputs hidden via UTM da URL
 * - Banner de sucesso persistente (position:absolute;inset:0) substitui o form
 * - Banner de erro discreto abaixo do form em caso de falha
 */
export function buildFormRuntimeScript(pageId: string): string {
  return `
(function(){
  window.__lpPageId = ${JSON.stringify(pageId)};

  // Aviso de diagnóstico para páginas com bloco V3 sem <form data-lp-form>
  // (templates antigos em modo mockup visual).
  try {
    window.addEventListener('DOMContentLoaded', function(){
      var fs = document.querySelectorAll('form[data-lp-form]');
      if (fs.length === 0 && document.querySelector('[data-lp-type="formulario"]') == null) return;
      if (fs.length === 0) {
        console.warn('[LandingOS] Bloco de formulário visual sem <form data-lp-form>. Re-publique com template atualizado.');
      }
    });
  } catch(ex) {}

  // ── Máscaras BR (input event) ─────────────────────────────────────
  function maskValue(kind, v) {
    v = (v || '').replace(/\\D/g, '');
    if (kind === 'phone-br') {
      if (v.length > 11) v = v.slice(0,11);
      if (v.length > 10) return v.replace(/(\\d{2})(\\d{5})(\\d{0,4}).*/, '($1) $2-$3');
      if (v.length > 6)  return v.replace(/(\\d{2})(\\d{4})(\\d{0,4}).*/, '($1) $2-$3');
      if (v.length > 2)  return v.replace(/(\\d{2})(\\d{0,5}).*/, '($1) $2');
      return v.length ? '(' + v : '';
    }
    if (kind === 'cpf') {
      if (v.length > 11) v = v.slice(0,11);
      return v.replace(/(\\d{3})(\\d{0,3})(\\d{0,3})(\\d{0,2}).*/, function(_,a,b,c,d){
        return [a, b && '.'+b, c && '.'+c, d && '-'+d].filter(Boolean).join('');
      });
    }
    if (kind === 'cnpj') {
      if (v.length > 14) v = v.slice(0,14);
      return v.replace(/(\\d{2})(\\d{0,3})(\\d{0,3})(\\d{0,4})(\\d{0,2}).*/, function(_,a,b,c,d,e){
        return [a, b && '.'+b, c && '.'+c, d && '/'+d, e && '-'+e].filter(Boolean).join('');
      });
    }
    if (kind === 'cep') {
      if (v.length > 8) v = v.slice(0,8);
      return v.replace(/(\\d{5})(\\d{0,3}).*/, function(_,a,b){
        return [a, b && '-'+b].filter(Boolean).join('');
      });
    }
    return v;
  }
  document.addEventListener('input', function(e){
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var k = t.getAttribute('data-lp-mask');
    if (!k) return;
    t.value = maskValue(k, t.value);
  });

  // ── Pré-preenchimento UTM em hidden inputs ────────────────────────
  try {
    var qs = new URLSearchParams(window.location.search);
    document.querySelectorAll('input[type="hidden"]').forEach(function(h){
      var n = h.getAttribute('name');
      if (!n || h.value) return;
      var v = qs.get(n);
      if (v) h.value = v;
    });
  } catch(ex) {}

  // ── Submit handler ────────────────────────────────────────────────
  document.addEventListener('submit', function(e){
    var form = e.target;
    if (!form || !form.hasAttribute || !form.hasAttribute('data-lp-form')) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    var originalText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }
    var inputs = form.querySelectorAll('input, select, textarea');
    var name = null, email = null, phone = null, custom = {};
    inputs.forEach(function(inp){
      if (!inp.name) return;
      if (inp.type === 'checkbox' || inp.type === 'radio') {
        if (!inp.checked) return;
        if (custom[inp.name] != null) {
          custom[inp.name] = [].concat(custom[inp.name], inp.value);
        } else {
          custom[inp.name] = inp.value;
        }
        return;
      }
      if (!inp.value) return;
      if (inp.name === 'name')        name  = inp.value;
      else if (inp.name === 'email')  email = inp.value;
      else if (inp.name === 'phone')  phone = inp.value;
      else                            custom[inp.name] = inp.value;
    });
    var payload = { page_id: window.__lpPageId };
    if (name)  payload.name  = name;
    if (email) payload.email = email;
    if (phone) payload.phone = phone;
    if (Object.keys(custom).length) payload.custom_fields = custom;
    var redirect       = form.getAttribute('data-redirect')        || '';
    var successMsg     = form.getAttribute('data-success-message') || '';
    var webhookUrl     = form.getAttribute('data-webhook-url')     || '';
    var webhookMethod  = form.getAttribute('data-webhook-method')  || 'POST_JSON';
    var webhookToken   = form.getAttribute('data-webhook-token')   || '';
    var fbPixelEvent   = form.getAttribute('data-fb-pixel-event')  || '';

    // ── Webhook customizado ──────────────────────────────────────────
    // Disparado em paralelo ao /api/leads. Best-effort: se falhar (CORS,
    // 4xx, 5xx), apenas loga no console — NÃO bloqueia o lead que já foi
    // pro nosso DB.
    //
    // CORS: webhooks third-party precisam permitir Origin do site. Zapier
    // e Make aceitam por default. RD Station/Mailchimp NÃO aceitam direto
    // — usuário precisa Zapier/Pluga no meio.
    if (webhookUrl) {
      try {
        // "Aplaina" o payload pra envio: name/email/phone na raiz +
        // custom_fields como chaves no mesmo nível (compatível com Zapier,
        // Pipedream, Make.com etc).
        var flat = Object.assign({}, payload);
        if (flat.custom_fields) {
          Object.keys(flat.custom_fields).forEach(function(k){
            // não sobrescreve chaves nativas (page_id, name, email, phone)
            if (!(k in flat)) flat[k] = flat.custom_fields[k];
          });
          delete flat.custom_fields;
        }

        if (webhookMethod === 'GET') {
          var qsW = Object.keys(flat).map(function(k){
            var v = typeof flat[k] === 'object' ? JSON.stringify(flat[k]) : flat[k];
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
          }).join('&');
          fetch(webhookUrl + (webhookUrl.includes('?') ? '&' : '?') + qsW)
            .then(function(r){ console.log('[LandingOS] webhook (GET) status:', r.status); })
            .catch(function(err){ console.warn('[LandingOS] webhook (GET) failed (CORS?):', err); });
        } else if (webhookMethod === 'POST_FORM') {
          // application/x-www-form-urlencoded — formato padrão de form
          // submit. Mais permissivo com CORS que JSON em alguns
          // endpoints (sem preflight OPTIONS).
          var formBody = Object.keys(flat).map(function(k){
            var v = typeof flat[k] === 'object' ? JSON.stringify(flat[k]) : flat[k];
            return encodeURIComponent(k) + '=' + encodeURIComponent(v);
          }).join('&');
          var fHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
          if (webhookToken) fHeaders['Authorization'] = 'Bearer ' + webhookToken;
          fetch(webhookUrl, { method: 'POST', headers: fHeaders, body: formBody })
            .then(function(r){ console.log('[LandingOS] webhook (POST_FORM) status:', r.status); })
            .catch(function(err){ console.warn('[LandingOS] webhook (POST_FORM) failed (CORS?):', err); });
        } else {
          // POST_JSON — default
          var jHeaders = { 'Content-Type': 'application/json' };
          if (webhookToken) jHeaders['Authorization'] = 'Bearer ' + webhookToken;
          fetch(webhookUrl, { method: 'POST', headers: jHeaders, body: JSON.stringify(flat) })
            .then(function(r){ console.log('[LandingOS] webhook (POST_JSON) status:', r.status); })
            .catch(function(err){ console.warn('[LandingOS] webhook (POST_JSON) failed (CORS?):', err); });
        }
      } catch(ex) {
        console.warn('[LandingOS] webhook setup error:', ex);
      }
    }

    // ── Facebook Pixel ───────────────────────────────────────────────
    // Só funciona se page.facebook_pixel_id estiver configurado nas
    // settings da página (init do fbq fica no <head>). Senão, alerta o
    // dev em vez de falhar silenciosamente.
    if (fbPixelEvent) {
      if (typeof window.fbq === 'function') {
        try {
          window.fbq('track', fbPixelEvent);
          console.log('[LandingOS] FB Pixel event:', fbPixelEvent);
        } catch(ex) { console.warn('[LandingOS] FB Pixel error:', ex); }
      } else {
        console.warn('[LandingOS] Evento FB Pixel "' + fbPixelEvent + '" configurado, mas Pixel ID não está setado nas configurações da página. Configure em "Configurações → Pixel do Facebook" pra disparar.');
      }
    }
    // GTM dataLayer — funciona se o user injetou GTM via "código no <head>"
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      try { window.dataLayer.push({ event: 'lp_form_submit', form_id: form.id || null }); } catch(ex) {}
    }

    // POST /api/leads — usa origem do parent quando em iframe srcdoc
    var apiBase = '';
    try {
      // Em iframe srcdoc com allow-same-origin, location.href é "about:srcdoc"
      // → fetch relativo falha. Usa parent.location.origin como fallback.
      if (window.location.protocol === 'about:' && window.parent && window.parent.location) {
        apiBase = window.parent.location.origin;
      }
    } catch(ex) {}

    fetch(apiBase + '/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){
      console.log('[LandingOS] /api/leads status:', r.status);
      return r.json().catch(function(){ return {}; });
    }).then(function(data){
      console.log('[LandingOS] /api/leads body:', data);
      if (redirect) { window.location.href = redirect; return; }
      var msg = successMsg || '✓ Recebido com sucesso!';
      var container = form.parentNode;
      if (!container) {
        if (btn) { btn.disabled = false; btn.textContent = msg; }
        return;
      }
      try {
        var pos = window.getComputedStyle(container).position;
        if (pos === 'static') container.style.position = 'relative';
      } catch(ex) {}
      var success = document.createElement('div');
      success.className = 'lp-form-success';
      success.setAttribute('role', 'status');
      success.style.cssText = [
        'position:absolute', 'inset:0', 'z-index:50',
        'background:#ffffff',
        'padding:32px 24px', 'box-sizing:border-box',
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'gap:14px', 'text-align:center',
        'animation:lpFadeIn .25s ease-out',
      ].join(';');
      if (!document.getElementById('lp-fadein-kf')) {
        var st = document.createElement('style');
        st.id = 'lp-fadein-kf';
        st.textContent = '@keyframes lpFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}';
        document.head.appendChild(st);
      }
      var icon = document.createElement('div');
      icon.style.cssText = 'width:72px;height:72px;border-radius:50%;background:#dcfce7;display:flex;align-items:center;justify-content:center;color:#16a34a;font-size:38px;font-weight:900;line-height:1';
      icon.textContent = '✓';
      var text = document.createElement('div');
      text.style.cssText = 'font-size:17px;font-weight:600;color:#0f172a;line-height:1.4;max-width:90%';
      text.textContent = msg.replace(/^[\\s✓✔]+/, '').trim() || 'Recebido com sucesso!';
      success.appendChild(icon);
      success.appendChild(text);
      form.style.display = 'none';
      container.appendChild(success);
      form.reset();
      console.log('[LandingOS] success banner shown');
    }).catch(function(err){
      console.error('[LandingOS] form submit error:', err);
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      var existing = form.querySelector('.lp-form-error');
      if (existing) existing.remove();
      var errDiv = document.createElement('div');
      errDiv.className = 'lp-form-error';
      errDiv.setAttribute('role', 'alert');
      errDiv.style.cssText = 'margin-top:8px;padding:10px 14px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-size:13px;text-align:center';
      errDiv.textContent = '⚠ Não conseguimos enviar agora. Tente novamente em instantes.';
      form.appendChild(errDiv);
      setTimeout(function(){ errDiv.remove(); }, 5000);
    });
  });

  // ─── FAQ accordion ─────────────────────────────────────────────────
  // No V3, todos os elementos são posicionados absolutamente como IRMÃOS
  // dentro do .lp-block-inner — não há aninhamento parent>child entre
  // .lp-faq-item e .lp-faq-q/a/icon. Pareamento é feito por ORDEM no DOM:
  // a 1ª .lp-faq-q corresponde ao 1º .lp-faq-item, e assim por diante.
  //
  // Convenção:
  //   .lp-faq-item   marker (caixa container)
  //   .lp-faq-open   item começa aberto (default: só o 1º)
  //   .lp-faq-q      pergunta (clicável, toggle)
  //   .lp-faq-a      resposta (display:none/'')
  //   .lp-faq-icon   ícone "+" que gira pra "x" ao abrir
  // ─── FAQ ──────────────────────────────────────────────────────────
  // Abertura/fechamento usa <details>/<summary> nativos — zero JS.
  // Aqui só implementamos "single open mode": ao abrir um, fecha os
  // outros do mesmo grupo (.lp-faq com data-lp-faq-single).
  function initFaq(){
    var grps = document.querySelectorAll('.lp-faq[data-lp-faq-single="1"]');
    grps.forEach(function(grp){
      var details = grp.querySelectorAll('details');
      details.forEach(function(d){
        d.addEventListener('toggle', function(){
          if (d.open) {
            details.forEach(function(other){
              if (other !== d) other.removeAttribute('open');
            });
          }
        });
      });
    });
  }

  // ─── Timer countdown ──────────────────────────────────────────────
  // Lê config dos data-attrs (data-lp-timer-mode, data-lp-timer-min,
  // data-lp-timer-fixed, data-lp-timer-expired, data-lp-timer-redirect)
  // e atualiza .lp-timer-d / -h / -m / -s a cada segundo.
  //
  // Persistência: modo relativo grava 1º acesso em localStorage por path
  // (URL). Reload → continua de onde estava. Urgência REAL.
  function initTimers(){
    var timers = document.querySelectorAll('.lp-timer');
    if (timers.length === 0) return;

    timers.forEach(function(timer){
      var mode = timer.getAttribute('data-lp-timer-mode') || 'relative';
      var minStr = timer.getAttribute('data-lp-timer-min');
      var fixedStr = timer.getAttribute('data-lp-timer-fixed');
      var expiredAction = timer.getAttribute('data-lp-timer-expired') || 'stay';
      var expiredRedirect = timer.getAttribute('data-lp-timer-redirect') || '';

      var endMs = 0;
      if (mode === 'fixed' && fixedStr) {
        endMs = new Date(fixedStr).getTime();
      } else {
        var minutes = parseInt(minStr || '1440', 10);
        if (!isFinite(minutes) || minutes <= 0) minutes = 1440;
        // localStorage: chave única por elemento (id no DOM) pra que
        // múltiplos timers na mesma página tenham startMs independentes
        var elId = timer.getAttribute('data-lp-id') || 'global';
        var key = 'lp-timer-' + window.location.pathname + ':' + elId + ':' + minutes;
        var startMs = 0;
        try { startMs = parseInt(localStorage.getItem(key) || '0', 10); } catch(e) {}
        if (!startMs || startMs <= 0) {
          startMs = Date.now();
          try { localStorage.setItem(key, String(startMs)); } catch(e) {}
        }
        endMs = startMs + minutes * 60 * 1000;
      }

      // Procura unidades dentro do PRÓPRIO timer (escopo restrito —
      // múltiplos timers no mesmo bloco não interferem).
      var dEl = timer.querySelector('.lp-timer-d');
      var hEl = timer.querySelector('.lp-timer-h');
      var mEl = timer.querySelector('.lp-timer-m');
      var sEl = timer.querySelector('.lp-timer-s');
      if (!dEl && !hEl && !mEl && !sEl) {
        console.warn('[LandingOS] Timer sem unidades (.lp-timer-d/h/m/s).');
        return;
      }

      function pad(n){ return n < 10 ? '0' + n : '' + n; }
      function handleExpired(){
        timer.classList.add('lp-timer-expired');
        if (expiredAction === 'hide') {
          timer.style.display = 'none';
        } else if (expiredAction === 'message') {
          // Substitui o conteúdo por mensagem
          var msg = (timer.querySelector('[data-lp-timer-cfg]') ||
                     timer).getAttribute && timer.getAttribute('data-lp-timer-cfg');
          var msgText = 'Esta oferta encerrou.';
          if (msg) {
            try {
              var cfg = JSON.parse(msg.replace(/&apos;/g, "'").replace(/&quot;/g, '"'));
              if (cfg.expiredMessage) msgText = cfg.expiredMessage;
            } catch(e) {}
          }
          var box = timer.querySelector('div[id^="lptimer-"]');
          if (box) box.innerHTML = '<div class="lp-timer-expired-msg">' + msgText + '</div>';
        } else if (expiredAction === 'redirect' && expiredRedirect) {
          window.location.href = expiredRedirect;
        }
        // 'stay': fica em 00:00:00:00, só adiciona class .lp-timer-expired
      }

      function tick(){
        var now = Date.now();
        var delta = Math.max(0, endMs - now);
        var sec = Math.floor(delta / 1000);
        var d = Math.floor(sec / 86400);
        var h = Math.floor((sec % 86400) / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;
        if (dEl) dEl.textContent = pad(d);
        if (hEl) hEl.textContent = pad(h);
        if (mEl) mEl.textContent = pad(m);
        if (sEl) sEl.textContent = pad(s);
        if (delta <= 0) {
          clearInterval(intervalId);
          handleExpired();
        }
      }
      tick();
      var intervalId = setInterval(tick, 1000);
    });
  }

  // ─── Toggle Mensal/Anual ──────────────────────────────────────────
  // Convenção:
  //   .lp-billing-toggle           container do toggle (existe pra escopo)
  //   .lp-billing-toggle-monthly   click → modo mensal
  //   .lp-billing-toggle-yearly    click → modo anual
  //   .lp-billing-pill-monthly     pill ativa quando mensal
  //   .lp-billing-pill-yearly      pill ativa quando anual
  //   .lp-billing-monthly          elementos visíveis em modo mensal
  //   .lp-billing-yearly           elementos visíveis em modo anual
  function initBillingToggle(){
    var togglesM = document.querySelectorAll('.lp-billing-toggle-monthly');
    var togglesY = document.querySelectorAll('.lp-billing-toggle-yearly');
    if (togglesM.length === 0 && togglesY.length === 0) return;

    function setMode(mode){
      var isMonthly = mode === 'monthly';
      // Pills
      document.querySelectorAll('.lp-billing-pill-monthly').forEach(function(el){
        el.style.display = isMonthly ? '' : 'none';
      });
      document.querySelectorAll('.lp-billing-pill-yearly').forEach(function(el){
        el.style.display = isMonthly ? 'none' : '';
      });
      // Conteúdo (preços + textos)
      document.querySelectorAll('.lp-billing-monthly').forEach(function(el){
        el.style.display = isMonthly ? '' : 'none';
      });
      document.querySelectorAll('.lp-billing-yearly').forEach(function(el){
        el.style.display = isMonthly ? 'none' : '';
      });
      // Estado nos labels (cor de texto)
      togglesM.forEach(function(el){
        el.style.color = isMonthly ? '#ffffff' : '#cbd5e1';
        el.style.fontWeight = isMonthly ? '700' : '600';
      });
      togglesY.forEach(function(el){
        el.style.color = isMonthly ? '#cbd5e1' : '#ffffff';
        el.style.fontWeight = isMonthly ? '600' : '700';
      });
    }

    // Estado inicial: mensal
    setMode('monthly');
    togglesM.forEach(function(el){
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(){ setMode('monthly'); });
    });
    togglesY.forEach(function(el){
      el.style.cursor = 'pointer';
      el.addEventListener('click', function(){ setMode('yearly'); });
    });
  }

  // ─── Stats counter animado ────────────────────────────────────────
  // Convenção: elementos com class .lp-stat-counter têm seu valor
  // numérico animado de 0 até o textContent original quando entram no
  // viewport. Aceita formatos: "5.000", "98.7%", "+312%", "R$12M".
  // Pra valores complexos, anima só a parte numérica e mantém prefixo/
  // sufixo. Pra valores curtos (≤2 dígitos sem decimal), pula animação.
  function initStatsCounter(){
    var counters = document.querySelectorAll('.lp-stat-counter');
    if (counters.length === 0) return;

    function animate(el){
      if (el.dataset.lpAnimated === '1') return;
      el.dataset.lpAnimated = '1';
      var raw = el.textContent || '';
      // Captura prefixo (não-dígito), parte numérica (com . ou ,), sufixo
      var m = /^(.*?)([\\d]+(?:[.,][\\d]+)?)(.*)$/.exec(raw);
      if (!m) return;
      var prefix = m[1], numStr = m[2], suffix = m[3];
      // Detecta separador de milhar (.) vs decimal (,)
      var pt = numStr.indexOf('.'), cm = numStr.indexOf(',');
      var hasComma = cm > -1;
      var normalized = hasComma
        ? numStr.replace(/\\./g, '').replace(',', '.')
        : (pt > -1 && /\\.\\d{3}\\b/.test(numStr) ? numStr.replace(/\\./g, '') : numStr);
      var target = parseFloat(normalized);
      if (!isFinite(target) || target < 5) return; // pula valores triviais

      var decimals = hasComma
        ? (numStr.split(',')[1] || '').length
        : (numStr.split('.').pop() && numStr.indexOf('.') > 0 && !/\\.\\d{3}\\b/.test(numStr)
            ? (numStr.split('.')[1] || '').length : 0);

      function format(n){
        var fixed = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString();
        if (hasComma) fixed = fixed.replace('.', ',');
        // Adiciona separadores de milhar se o valor original tinha
        if (target >= 1000 && /\\d{3,}/.test(numStr.replace(/[.,]/g, ''))) {
          var parts = fixed.split(hasComma ? ',' : '.');
          parts[0] = parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
          fixed = parts.join(hasComma ? ',' : '.');
        }
        return prefix + fixed + suffix;
      }

      var duration = 1500;
      var startTime = performance.now();
      function tick(now){
        var elapsed = now - startTime;
        var progress = Math.min(1, elapsed / duration);
        // ease-out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) {
            animate(e.target);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      counters.forEach(function(el){ io.observe(el); });
    } else {
      // Fallback: anima imediato
      counters.forEach(animate);
    }
  }

  // Roda após DOM pronto. setTimeout 0 garante que o parser HTML
  // terminou de inserir TODOS os elementos do <body> antes da gente
  // contar (mesmo em readyState='interactive' o parsing pode estar
  // em progresso se o script estiver no meio do body).
  var initAllRan = false;
  function initAll(){
    if (initAllRan) return;
    initAllRan = true;
    initFaq();
    initTimers();
    initBillingToggle();
    initStatsCounter();
  }
  if (document.readyState === 'complete') {
    initAll();
  } else {
    document.addEventListener('DOMContentLoaded', initAll);
    // Backup: às vezes DOMContentLoaded já passou quando o <script>
    // executa; chamamos também via load + setTimeout pra cobrir
    window.addEventListener('load', initAll);
    setTimeout(initAll, 100);
  }
})();
`.trim()
}
