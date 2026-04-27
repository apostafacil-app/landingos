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
  function initFaq(){
    var items = document.querySelectorAll('.lp-faq-item');
    var qs    = document.querySelectorAll('.lp-faq-q');
    var as    = document.querySelectorAll('.lp-faq-a');
    var icons = document.querySelectorAll('.lp-faq-icon');
    console.log('[LandingOS FAQ] items=' + items.length + ' qs=' + qs.length + ' as=' + as.length + ' icons=' + icons.length);
    if (items.length === 0 || qs.length === 0 || as.length === 0) return;

    // ─── Layout 2 colunas (faqDuasColunas) ────────────────────────
    // Itens estão lado a lado no mesmo Y — não dá pra reflowar
    // verticalmente sem quebrar o grid. Solução: NÃO permitir colapso
    // nesses (lp-faq-open em todos garante que o accordion não roda).
    // Apenas o JSON-LD aproveita as classes pra SEO.

    // Agrupa items por parentNode E por linha (Y). Itens com mesmo
    // parent + mesmo Y são "irmãos horizontais" (2 colunas) e formam
    // um GRUPO independente pra reflow.
    var n = Math.min(items.length, qs.length, as.length);
    var groups = new Map(); // key = "parentId|y" → array de faq
    var groupKeys = []; // ordem original

    for (var i = 0; i < n; i++) {
      var item = items[i];
      var q    = qs[i];
      var a    = as[i];
      var icon = icons[i] || null;
      var parent = item.parentNode;
      if (!parent) continue;

      // Faixa accent: mesma coord top e largura <=10
      var faixa = null;
      var psibs = parent.children;
      var iTop = parseFloat(item.style.top || '0');
      for (var j = 0; j < psibs.length; j++) {
        var sib = psibs[j];
        if (sib === item) continue;
        if (sib.classList && sib.classList.contains('lp-faq-item')) continue;
        var sTop = parseFloat(sib.style.top || '0');
        var sW = parseFloat(sib.style.width || '999');
        if (Math.abs(sTop - iTop) < 1 && sW <= 10) { faixa = sib; break; }
      }

      var itemH = parseFloat(item.style.height || '0');
      var aTop  = parseFloat(a.style.top || '0');
      var collapsedH = Math.max(40, aTop - iTop + 8);
      var expandedH  = itemH;

      // Chave do grupo: parentNode + linha Y (arredondada). Permite
      // tratar layouts 2-colunas como grupos separados por LINHA.
      // Não usa parentNode.dataset.lpId (alguns parents não têm); usa
      // index do parent no body como fallback.
      var parentId = parent.getAttribute && parent.getAttribute('data-lp-id') || '';
      if (!parentId) {
        // Cria id ad-hoc baseado em referência (objetos diferentes → keys diferentes)
        parentId = '_p' + (parent.__lpFaqId = parent.__lpFaqId || ('id' + Math.random()));
      }
      var rowKey = parentId + '|' + Math.round(iTop);

      var faqEntry = {
        item: item, faixa: faixa, q: q, a: a, icon: icon,
        parent: parent,
        origItemTop: iTop,
        origH: itemH,
        collapsedH: collapsedH,
        expandedH: expandedH,
        isOpen: item.classList.contains('lp-faq-open'),
      };

      if (!groups.has(rowKey)) {
        groups.set(rowKey, { parent: parent, items: [] });
        groupKeys.push(rowKey);
      }
      groups.get(rowKey).items.push(faqEntry);
    }

    // Pra cada PARENT (bloco), captura os irmãos pra reposicionamento
    var parentSiblings = new Map(); // parent → [{el, origTop}]
    groups.forEach(function(g){
      if (parentSiblings.has(g.parent)) return;
      var arr = [];
      var ch = g.parent.children;
      for (var k = 0; k < ch.length; k++) {
        var n_ = ch[k];
        if (!(n_ instanceof HTMLElement)) continue;
        arr.push({ el: n_, origTop: parseFloat(n_.style.top || '0') });
      }
      parentSiblings.set(g.parent, arr);
    });

    // Detecta layout 2-colunas: se um GRUPO tem múltiplos items com
    // a MESMA Y (mesma row), é layout horizontal — não permite colapso
    // (todos forçados como 'open').
    var lockedGroups = new Set();
    groups.forEach(function(g, key){
      if (g.items.length > 1) lockedGroups.add(key);
    });

    function applyLayoutForParent(parent){
      // Coleta groups deste parent na ordem ORIGINAL de Y
      var parentGroups = [];
      groups.forEach(function(g, key){
        if (g.parent === parent) parentGroups.push({ key: key, group: g });
      });
      // Ordena por Y do primeiro item de cada grupo
      parentGroups.sort(function(a, b){
        return a.group.items[0].origItemTop - b.group.items[0].origItemTop;
      });

      // Reflow vertical: cumula delta dos grupos colapsados
      var cumulativeDelta = 0;
      var collapsedRanges = []; // {start, delta}

      parentGroups.forEach(function(pg){
        var locked = lockedGroups.has(pg.key);
        // Pra cada item dentro do grupo (1 normalmente; >1 em 2 colunas)
        pg.group.items.forEach(function(f){
          var canCollapse = !locked;
          var newH = (canCollapse && !f.isOpen) ? f.collapsedH : f.expandedH;
          var thisDelta = newH - f.origH;
          var newTop = f.origItemTop + cumulativeDelta;

          f.item.style.transition = 'top .25s ease, height .25s ease';
          f.item.style.top = newTop + 'px';
          f.item.style.height = newH + 'px';
          if (f.faixa) {
            f.faixa.style.transition = 'top .25s ease, height .25s ease';
            f.faixa.style.top = newTop + 'px';
            f.faixa.style.height = newH + 'px';
          }
          f.a.style.display = (canCollapse && !f.isOpen) ? 'none' : '';
          f.q.setAttribute('aria-expanded', (locked || f.isOpen) ? 'true' : 'false');
          if (f.icon) f.icon.style.transform = (locked || f.isOpen) ? 'rotate(45deg)' : 'rotate(0)';
        });
        // Delta do grupo = max delta entre items (todos no grupo têm
        // mesmo Y, então o reflow do próximo grupo usa o maior delta)
        var groupDelta = 0;
        pg.group.items.forEach(function(f){
          var locked = lockedGroups.has(pg.key);
          var canCollapse = !locked;
          var newH = (canCollapse && !f.isOpen) ? f.collapsedH : f.expandedH;
          var d = newH - f.origH;
          if (Math.abs(d) > Math.abs(groupDelta)) groupDelta = d;
        });
        if (groupDelta !== 0) {
          var startY = pg.group.items[0].origItemTop + pg.group.items[0].origH;
          collapsedRanges.push({ start: startY, delta: groupDelta });
        }
        cumulativeDelta += groupDelta;
      });

      // Reposiciona elementos do parent que não são item nem faixa
      var siblings = parentSiblings.get(parent) || [];
      siblings.forEach(function(s){
        if (s.el.classList.contains('lp-faq-item')) return;
        // skip faixas (já reposicionadas)
        var isFaixa = false;
        groups.forEach(function(g){
          g.items.forEach(function(f){ if (f.faixa === s.el) isFaixa = true; });
        });
        if (isFaixa) return;
        var offset = 0;
        for (var ri = 0; ri < collapsedRanges.length; ri++) {
          if (s.origTop >= collapsedRanges[ri].start) offset += collapsedRanges[ri].delta;
        }
        s.el.style.transition = 'top .25s ease';
        s.el.style.top = (s.origTop + offset) + 'px';
      });
    }

    function applyLayout(){
      // Aplica reflow em cada parent (bloco) separadamente
      var processedParents = new Set();
      groups.forEach(function(g){
        if (processedParents.has(g.parent)) return;
        processedParents.add(g.parent);
        applyLayoutForParent(g.parent);
      });
    }

    // Init: adiciona listeners
    groups.forEach(function(g, key){
      var locked = lockedGroups.has(key);
      g.items.forEach(function(f){
        if (locked) return; // 2 colunas não tem accordion (visual quebra)
        f.q.style.cursor = 'pointer';
        f.q.setAttribute('role', 'button');
        f.q.setAttribute('tabindex', '0');
        if (f.icon) {
          f.icon.style.transition = 'transform .2s ease';
          f.icon.style.transformOrigin = 'center center';
        }
        function toggle(){
          f.isOpen = !f.isOpen;
          applyLayout();
        }
        f.q.addEventListener('click', toggle);
        f.q.addEventListener('keydown', function(e){
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
    });

    applyLayout();
  }

  // ─── FAQ JSON-LD (schema.org FAQPage) ──────────────────────────────
  // Mesma lógica de pareamento por ordem (NÃO por descendant query).
  function injectFaqJsonLd(){
    var qs = document.querySelectorAll('.lp-faq-q');
    var as = document.querySelectorAll('.lp-faq-a');
    var n = Math.min(qs.length, as.length);
    if (n === 0) return;
    var entities = [];
    for (var i = 0; i < n; i++) {
      var q = (qs[i].textContent || '').replace(/\\s*[+−]\\s*$/, '').trim();
      var a = (as[i].textContent || '').trim();
      if (!q || !a) continue;
      entities.push({
        '@type': 'Question',
        'name': q,
        'acceptedAnswer': { '@type': 'Answer', 'text': a }
      });
    }
    if (entities.length === 0) return;
    if (document.getElementById('lp-faq-jsonld')) return;
    var s = document.createElement('script');
    s.id = 'lp-faq-jsonld';
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': entities
    });
    document.head.appendChild(s);
  }

  // ─── Timer countdown ──────────────────────────────────────────────
  // Convenção:
  //   .lp-timer                     elemento container/marker
  //   .lp-timer-rel-NNh             NN horas a partir do 1º acesso
  //   .lp-timer-rel-NNd             NN dias
  //   .lp-timer-fixed-YYYYMMDD-HHmm data alvo absoluta (ex: 20261231-2359)
  //   .lp-timer-d / -h / -m / -s    elementos que recebem os valores
  //                                 (procurados no .lp-block ancestral)
  //   .lp-timer-expired             class adicionada quando termina
  //
  // Persistência: 1º acesso é gravado em localStorage por path. Recargas
  // continuam de onde estava (urgência real, não reset a cada refresh).
  function initTimers(){
    var timers = document.querySelectorAll('.lp-timer');
    if (timers.length === 0) return;

    timers.forEach(function(timer){
      var classes = (timer.className || '').split(/\\s+/);
      var hours = 24, fixedTs = 0;
      classes.forEach(function(c){
        var rel = /^lp-timer-rel-(\\d+)([dhm])$/.exec(c);
        if (rel) {
          var n = parseInt(rel[1], 10);
          if (rel[2] === 'd') hours = n * 24;
          else if (rel[2] === 'h') hours = n;
          else if (rel[2] === 'm') hours = n / 60;
        }
        var fix = /^lp-timer-fixed-(\\d{4})(\\d{2})(\\d{2})-(\\d{2})(\\d{2})$/.exec(c);
        if (fix) {
          fixedTs = new Date(
            parseInt(fix[1], 10),
            parseInt(fix[2], 10) - 1,
            parseInt(fix[3], 10),
            parseInt(fix[4], 10),
            parseInt(fix[5], 10)
          ).getTime();
        }
      });

      var endMs;
      if (fixedTs > 0) {
        endMs = fixedTs;
      } else {
        // Relativo: 1º acesso fica salvo em localStorage por página
        var pageKey = 'lp-timer-' + window.location.pathname;
        var startMs = 0;
        try { startMs = parseInt(localStorage.getItem(pageKey) || '0', 10); } catch(e) {}
        if (!startMs || startMs <= 0) {
          startMs = Date.now();
          try { localStorage.setItem(pageKey, String(startMs)); } catch(e) {}
        }
        endMs = startMs + hours * 3600 * 1000;
      }

      // Procura unidades no bloco ancestral (timer geralmente é um elemento
      // singular dentro do bloco, e as caixinhas DD/HH/MM/SS são irmãs)
      var scope = timer.closest('.lp-block') || timer.parentElement || document;
      var dEl = scope.querySelector('.lp-timer-d');
      var hEl = scope.querySelector('.lp-timer-h');
      var mEl = scope.querySelector('.lp-timer-m');
      var sEl = scope.querySelector('.lp-timer-s');
      if (!dEl && !hEl && !mEl && !sEl) {
        console.warn('[LandingOS] Timer encontrado sem unidades (lp-timer-d/h/m/s) no bloco.');
        return;
      }

      function pad(n){ return n < 10 ? '0' + n : '' + n; }
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
          timer.classList.add('lp-timer-expired');
          if (scope.classList) scope.classList.add('lp-timer-expired');
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
    console.log('[LandingOS] runtime initAll, readyState=' + document.readyState);
    initFaq();
    injectFaqJsonLd();
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
