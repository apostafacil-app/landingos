/**
 * Renderiza o resultado da pipeline no formato HTML que o editor V3 consome.
 *
 * Mantém o mesmo formato da rota legada (`<style>` + `<section>`s, sem
 * `<!DOCTYPE>`/`<html>`/`<head>`/`<body>`), pra que o editor parseie cada
 * bloco como componente editável.
 */

import type { PipelineContext } from './types'

export function renderHtml(ctx: PipelineContext, businessName: string): string {
  if (!ctx.design || !ctx.hero || !ctx.sections) {
    throw new Error('Render exige design + hero + sections')
  }

  const { design, hero, sections, visual, research } = ctx
  const isDark = design.mode === 'dark'

  // Variáveis de tema
  const bodyBg     = isDark ? '#0a0f1e' : '#ffffff'
  const bodyText   = isDark ? '#e2e8f0' : '#1e293b'
  const cardBg     = isDark ? '#141c2e' : '#ffffff'
  const cardBorder = isDark ? '#1e293b' : '#e8edf5'
  const altBg      = isDark ? '#0d1526' : design.primary
  const muted      = '#64748b'
  const subText    = isDark ? '#94a3b8' : '#475569'
  const faqABg     = isDark ? '#0f1928' : '#f8fafc'
  const navBg      = isDark ? '#070c18' : design.primary
  const footerBg   = isDark ? '#070c18' : '#f8fafc'
  const sectionH   = isDark ? '#f1f5f9' : design.primary

  const fontFamily = (() => {
    switch (design.typography) {
      case 'serif-premium': return "'Cormorant Garamond', Georgia, serif"
      case 'display':       return "'Playfair Display', Georgia, serif"
      case 'monoespacada':  return "'JetBrains Mono', Consolas, monospace"
      default:              return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }
  })()

  const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${fontFamily};color:${bodyText};line-height:1.6;background:${bodyBg}}
.ai-nav{background:${navBg};padding:16px 32px;display:flex;align-items:center;border-bottom:1px solid ${cardBorder}}
.ai-nav-logo{height:36px;max-width:160px;object-fit:contain;display:block}
.ai-nav-brand{color:#fff;font-size:1.05rem;font-weight:700;letter-spacing:-.01em}
.ai-eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:${design.accent};margin-bottom:10px;text-align:center;display:block}
.ai-hero{background:linear-gradient(135deg,${design.primary} 0%,${design.gradient_end} 100%);color:#fff;text-align:center;padding:104px 24px 88px;position:relative;overflow:hidden}
.ai-hero-img{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.25;z-index:0}
.ai-hero-inner{position:relative;z-index:1}
.ai-hero h1{font-size:clamp(2rem,5vw,3.6rem);font-weight:900;margin-bottom:20px;max-width:800px;margin-inline:auto;line-height:1.1;letter-spacing:-.03em}
.ai-hero p{font-size:1.15rem;opacity:.88;max-width:580px;margin-inline:auto;margin-bottom:44px;line-height:1.75}
.ai-hero-cta{display:inline-block;background:${design.accent};color:#fff;font-weight:800;font-size:1rem;padding:16px 48px;border-radius:10px;text-decoration:none;box-shadow:0 6px 28px rgba(0,0,0,.3);letter-spacing:.01em}
.ai-hero-trust{display:flex;justify-content:center;flex-wrap:wrap;gap:24px;margin-top:36px;padding-top:32px;border-top:1px solid rgba(255,255,255,.18)}
.ai-hero-trust span{font-size:.875rem;opacity:.88;display:flex;align-items:center;gap:6px}
.ai-section{padding:88px 24px;max-width:1040px;margin-inline:auto}
.ai-section h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;text-align:center;margin-bottom:48px;color:${sectionH};letter-spacing:-.02em}
.ai-alt{background:${altBg};padding:88px 24px}
.ai-alt-inner{max-width:1040px;margin-inline:auto}
.ai-alt-inner h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:800;text-align:center;margin-bottom:48px;color:#fff;letter-spacing:-.02em}
.ai-alt .ai-eyebrow{color:rgba(255,255,255,.7)}
.ai-benefits{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px}
.ai-benefit{background:${cardBg};border:1px solid ${cardBorder};border-top:4px solid ${design.gradient_end};border-radius:14px;padding:28px;box-shadow:0 4px 16px rgba(0,0,0,${isDark ? '.25' : '.06'});transition:transform .2s,box-shadow .2s}
.ai-benefit:hover{transform:translateY(-3px);box-shadow:0 10px 32px rgba(0,0,0,${isDark ? '.35' : '.1'})}
.ai-benefit-icon{font-size:1.8rem;margin-bottom:16px;display:block;line-height:1}
.ai-benefit h3{font-size:1rem;font-weight:700;margin-bottom:10px;color:${isDark ? '#f1f5f9' : design.primary}}
.ai-benefit p{font-size:.9rem;color:${muted};line-height:1.7}
.ai-summary-list{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
.ai-summary-list li{display:flex;align-items:flex-start;gap:12px;font-size:.95rem;color:rgba(255,255,255,.9);padding:4px 0}
.ai-summary-list li::before{content:"✓";background:${design.accent};color:#fff;font-weight:800;font-size:.7rem;width:22px;height:22px;min-width:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px}
.ai-comparison-wrap{overflow-x:auto;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,${isDark ? '.35' : '.1'})}
.ai-comparison table{width:100%;border-collapse:collapse;font-size:.9rem;min-width:480px}
.ai-comparison th{background:${design.primary};color:#fff;padding:16px 20px;text-align:left;font-weight:600;font-size:.82rem;letter-spacing:.05em;text-transform:uppercase}
.ai-comparison td{padding:14px 20px;border-bottom:1px solid ${cardBorder};background:${cardBg};color:${bodyText}}
.ai-comparison tr:last-child td{border-bottom:none}
.ai-comparison .us{color:#22c55e;font-weight:700}
.ai-comparison .them{color:#ef4444}
.ai-testimonials-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
.ai-testimonial{background:${cardBg};border:1px solid ${cardBorder};border-radius:14px;padding:28px;position:relative;overflow:hidden}
.ai-testimonial::before{content:'"';font-size:6rem;color:${design.gradient_end};opacity:.18;position:absolute;top:-12px;left:16px;line-height:1;font-family:Georgia,serif;font-weight:700}
.ai-testimonial-stars{color:#f59e0b;font-size:1rem;margin-bottom:8px;padding-top:28px;letter-spacing:2px}
.ai-testimonial p{font-size:.9rem;color:${subText};margin-bottom:16px;line-height:1.75;font-style:italic}
.ai-testimonial strong{font-size:.85rem;color:${isDark ? '#f1f5f9' : design.primary};font-weight:700}
.ai-pricing{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;align-items:stretch}
.ai-plan{border:2px solid ${cardBorder};border-radius:20px;padding:36px 28px;text-align:center;background:${cardBg}}
.ai-plan.highlighted{border-color:transparent;background:linear-gradient(145deg,${design.primary},${design.gradient_end});box-shadow:0 12px 48px ${design.primary}55}
.ai-plan-name{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.14em;margin-bottom:16px;color:${muted}}
.ai-plan.highlighted .ai-plan-name{color:rgba(255,255,255,.65)}
.ai-plan-price{font-size:2.8rem;font-weight:900;color:${isDark ? '#fff' : design.primary};margin-bottom:24px;line-height:1;letter-spacing:-.04em}
.ai-plan.highlighted .ai-plan-price{color:#fff}
.ai-plan-features{list-style:none;text-align:left;margin-bottom:28px}
.ai-plan-features li{font-size:.875rem;color:${subText};padding:10px 0;border-bottom:1px solid ${cardBorder};display:flex;gap:10px;align-items:flex-start}
.ai-plan.highlighted .ai-plan-features li{color:rgba(255,255,255,.9);border-color:rgba(255,255,255,.15)}
.ai-plan-features li::before{content:"✓";color:${design.accent};font-weight:800;flex-shrink:0;margin-top:1px}
.ai-plan.highlighted .ai-plan-features li::before{color:#fff;opacity:.9}
.ai-faq{display:flex;flex-direction:column;gap:10px;max-width:720px;margin-inline:auto}
details.ai-faq-item{border:1px solid ${cardBorder};border-radius:14px;overflow:hidden}
details.ai-faq-item summary{list-style:none;cursor:pointer;font-weight:700;font-size:.95rem;color:#fff;padding:18px 24px;background:${design.primary};display:flex;justify-content:space-between;align-items:center;line-height:1.5;user-select:none}
details.ai-faq-item summary::-webkit-details-marker{display:none}
details.ai-faq-item summary::after{content:"+";font-size:1.3rem;opacity:.75;flex-shrink:0;margin-left:12px;transition:transform .2s}
details.ai-faq-item[open] summary::after{content:"−"}
.ai-faq-a{font-size:.9rem;color:${subText};padding:18px 24px;line-height:1.8;background:${faqABg}}
.ai-cta{background:linear-gradient(135deg,${design.primary} 0%,${design.gradient_end} 100%);color:#fff;text-align:center;padding:104px 24px}
.ai-cta h2{font-size:clamp(1.8rem,4vw,3rem);font-weight:900;margin-bottom:16px;letter-spacing:-.03em}
.ai-cta p{opacity:.88;margin-bottom:44px;max-width:520px;margin-inline:auto;font-size:1.08rem;line-height:1.65}
.ai-cta-btn{display:inline-block;background:${design.accent};color:#fff;font-weight:800;font-size:1.05rem;padding:18px 52px;border-radius:12px;text-decoration:none;box-shadow:0 6px 28px rgba(0,0,0,.3);letter-spacing:.01em}
.ai-footer{text-align:center;padding:40px 24px;color:${muted};font-size:.85rem;border-top:1px solid ${cardBorder};background:${footerBg}}
`.trim()

  const logoUrl = research?.logo_url
  const navHtml = logoUrl
    ? `<nav class="ai-nav"><img class="ai-nav-logo" src="${esc(logoUrl)}" alt="${esc(businessName)}" loading="lazy" /></nav>`
    : `<nav class="ai-nav"><span class="ai-nav-brand">${esc(businessName)}</span></nav>`

  // Hero
  const heroBg = visual?.hero_data_url ? `<div class="ai-hero-img" style="background-image:url('${esc(visual.hero_data_url)}')"></div>` : ''
  const heroHtml = `<section class="ai-hero">
  ${heroBg}
  <div class="ai-hero-inner">
    <h1>${esc(hero.headline)}</h1>
    <p>${esc(hero.subheadline)}</p>
    <a href="#cta" class="ai-hero-cta">${esc(hero.cta)}</a>
    ${hero.trust_stats?.length ? `<div class="ai-hero-trust">${hero.trust_stats.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''}
  </div>
</section>`

  // Seções
  const sectionsHtml = sections.map(s => renderSection(s, businessName)).filter(Boolean).join('\n')

  const footerHtml = `<footer class="ai-footer">
  <p>&copy; ${new Date().getFullYear()} ${esc(businessName)}. Todos os direitos reservados.</p>
</footer>`

  return `<style>${css}</style>\n${navHtml}\n${heroHtml}\n${sectionsHtml}\n${footerHtml}`.trim()
}

function esc(s: string): string {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!))
}

function renderSection(s: { type: string; data: Record<string, unknown> }, businessName: string): string {
  const d = s.data ?? {}
  const eyebrow = d.eyebrow ? `<span class="ai-eyebrow">${esc(String(d.eyebrow))}</span>` : ''
  const headline = esc(String(d.headline ?? ''))

  switch (s.type) {
    case 'benefits': {
      const items = (d.items as Array<{ icon?: string; title?: string; description?: string }>) ?? []
      return `<div class="ai-section">
  ${eyebrow}
  <h2>${headline}</h2>
  <div class="ai-benefits">
    ${items.map(i => `<div class="ai-benefit">${i.icon ? `<span class="ai-benefit-icon">${esc(i.icon)}</span>` : ''}<h3>${esc(i.title ?? '')}</h3><p>${esc(i.description ?? '')}</p></div>`).join('\n    ')}
  </div>
</div>`
    }
    case 'summary': {
      const items = (d.items as Array<string | { title?: string; description?: string }>) ?? []
      return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${eyebrow}
    <h2>${headline}</h2>
    <ul class="ai-summary-list">
      ${items.map(item => `<li>${esc(typeof item === 'string' ? item : (item.title ?? item.description ?? ''))}</li>`).join('\n      ')}
    </ul>
  </div>
</div>`
    }
    case 'comparison': {
      const rows = (d.rows as Array<{ feature: string; us: string; them: string }>) ?? []
      if (!rows.length) return ''
      return `<div class="ai-section">
  ${eyebrow}
  <h2>${headline}</h2>
  <div class="ai-comparison-wrap"><div class="ai-comparison">
    <table>
      <thead><tr><th>Recurso</th><th>Com ${esc(businessName)}</th><th>Alternativa</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${esc(r.feature)}</td><td class="us">${esc(r.us)}</td><td class="them">${esc(r.them)}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </div></div>
</div>`
    }
    case 'social_proof': {
      const items = (d.items as Array<{ text: string; author: string; role?: string; rating?: number }>) ?? []
      return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${eyebrow}
    <h2>${headline}</h2>
    <div class="ai-testimonials-grid">
      ${items.map(t => `<div class="ai-testimonial">${t.rating ? `<div class="ai-testimonial-stars">${'⭐'.repeat(t.rating)}</div>` : ''}<p>"${esc(t.text)}"</p><strong>${esc(t.author)}${t.role ? ` · ${esc(t.role)}` : ''}</strong></div>`).join('\n      ')}
    </div>
  </div>
</div>`
    }
    case 'pricing': {
      const plans = (d.plans as Array<{ name: string; price: string; features: string[]; highlighted?: boolean }>) ?? []
      if (!plans.length) return ''
      return `<div class="ai-section">
  ${eyebrow}
  <h2>${headline}</h2>
  <div class="ai-pricing">
    ${plans.map(p => `<div class="ai-plan${p.highlighted ? ' highlighted' : ''}">
      <div class="ai-plan-name">${esc(p.name)}</div>
      <div class="ai-plan-price">${esc(p.price)}</div>
      <ul class="ai-plan-features">${(p.features ?? []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>`).join('\n    ')}
  </div>
</div>`
    }
    case 'faq': {
      const items = (d.items as Array<{ q: string; a: string }>) ?? []
      return `<div class="ai-alt">
  <div class="ai-alt-inner">
    ${eyebrow}
    <h2>${headline || 'Perguntas frequentes'}</h2>
    <div class="ai-faq">
      ${items.map(i => `<details class="ai-faq-item"><summary>${esc(i.q)}</summary><div class="ai-faq-a">${esc(i.a)}</div></details>`).join('\n      ')}
    </div>
  </div>
</div>`
    }
    case 'offer': {
      const cta = String(d.cta ?? 'Quero começar agora')
      const description = String(d.description ?? '')
      return `<div class="ai-cta" id="cta">
  <h2>${headline}</h2>
  <p>${esc(description)}</p>
  <a href="#" class="ai-cta-btn">${esc(cta)}</a>
</div>`
    }
    default:
      return ''
  }
}
