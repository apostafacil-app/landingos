'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Search } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

/* SVG thumbnails representing each block category / type */
const BLOCK_ICONS: Record<string, string> = {
  // ── Hero ─────────────────────────────────────────────────────
  'hero-simples': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1e40af"/><rect x="30" y="12" width="60" height="8" rx="2" fill="white" opacity=".9"/><rect x="40" y="24" width="40" height="5" rx="2" fill="white" opacity=".5"/><rect x="42" y="34" width="36" height="5" rx="2" fill="white" opacity=".5"/><rect x="44" y="46" width="32" height="10" rx="5" fill="#f59e0b"/></svg>`,
  'hero-dois-col': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="8" y="14" width="50" height="7" rx="2" fill="white" opacity=".9"/><rect x="8" y="25" width="42" height="4" rx="2" fill="white" opacity=".4"/><rect x="8" y="32" width="38" height="4" rx="2" fill="white" opacity=".4"/><rect x="8" y="42" width="28" height="8" rx="4" fill="#f59e0b"/><rect x="66" y="12" width="46" height="48" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/><text x="89" y="40" text-anchor="middle" fill="#475569" font-size="8">📷</text></svg>`,
  'hero-claro': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="20" y="10" width="80" height="9" rx="2" fill="#0f172a" opacity=".85"/><rect x="30" y="23" width="60" height="5" rx="2" fill="#64748b" opacity=".6"/><rect x="35" y="31" width="50" height="5" rx="2" fill="#64748b" opacity=".4"/><rect x="40" y="43" width="40" height="11" rx="5" fill="#2563eb"/></svg>`,
  'hero-captura': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1a2e5a"/><rect x="8" y="10" width="60" height="8" rx="2" fill="white" opacity=".9"/><rect x="8" y="22" width="50" height="4" rx="2" fill="white" opacity=".4"/><rect x="8" y="30" width="44" height="4" rx="2" fill="white" opacity=".4"/><rect x="70" y="8" width="44" height="56" rx="6" fill="#1e3a8a"/><rect x="75" y="16" width="34" height="7" rx="2" fill="#3b82f6" opacity=".3"/><rect x="75" y="27" width="34" height="7" rx="2" fill="#3b82f6" opacity=".3"/><rect x="75" y="38" width="34" height="10" rx="2" fill="#f59e0b"/></svg>`,
  // ── Benefícios ────────────────────────────────────────────────
  'beneficios-3col': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="8" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="8" y="42" width="32" height="5" rx="2" fill="#94a3b8"/><rect x="44" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="44" y="42" width="32" height="5" rx="2" fill="#94a3b8"/><rect x="80" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="80" y="42" width="32" height="5" rx="2" fill="#94a3b8"/><text x="24" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text><text x="60" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text><text x="96" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text></svg>`,
  'beneficios-lista': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="16" cy="20" r="6" fill="#dcfce7"/><rect x="27" y="17" width="50" height="4" rx="2" fill="#1e293b"/><rect x="27" y="24" width="35" height="3" rx="2" fill="#94a3b8"/><circle cx="16" cy="40" r="6" fill="#dcfce7"/><rect x="27" y="37" width="55" height="4" rx="2" fill="#1e293b"/><rect x="27" y="44" width="40" height="3" rx="2" fill="#94a3b8"/><circle cx="16" cy="60" r="6" fill="#dcfce7"/><rect x="27" y="57" width="45" height="4" rx="2" fill="#1e293b"/><text x="16" y="24" text-anchor="middle" fill="#16a34a" font-size="8">✓</text><text x="16" y="44" text-anchor="middle" fill="#16a34a" font-size="8">✓</text><text x="16" y="64" text-anchor="middle" fill="#16a34a" font-size="8">✓</text></svg>`,
  'beneficios-dark': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="8" y="8" width="32" height="30" rx="4" fill="#1e293b"/><rect x="44" y="8" width="32" height="30" rx="4" fill="#1e293b"/><rect x="80" y="8" width="32" height="30" rx="4" fill="#1e293b"/><rect x="8" y="42" width="32" height="4" rx="2" fill="#475569"/><rect x="44" y="42" width="32" height="4" rx="2" fill="#475569"/><rect x="80" y="42" width="32" height="4" rx="2" fill="#475569"/><text x="24" y="28" text-anchor="middle" fill="#60a5fa" font-size="12">★</text><text x="60" y="28" text-anchor="middle" fill="#60a5fa" font-size="12">★</text><text x="96" y="28" text-anchor="middle" fill="#60a5fa" font-size="12">★</text></svg>`,
  'beneficios-horizontal': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="20" cy="24" r="10" fill="#eff6ff"/><rect x="36" y="18" width="72" height="5" rx="2" fill="#1e293b"/><rect x="36" y="26" width="50" height="3" rx="2" fill="#94a3b8"/><circle cx="20" cy="52" r="10" fill="#eff6ff"/><rect x="36" y="46" width="65" height="5" rx="2" fill="#1e293b"/><rect x="36" y="54" width="45" height="3" rx="2" fill="#94a3b8"/><text x="20" y="28" text-anchor="middle" fill="#2563eb" font-size="10">⚡</text><text x="20" y="56" text-anchor="middle" fill="#2563eb" font-size="10">🎯</text></svg>`,
  // ── Depoimentos ───────────────────────────────────────────────
  'depoimentos-cards': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="6" y="10" width="50" height="52" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="64" y="10" width="50" height="52" rx="6" fill="white" stroke="#e2e8f0" stroke-width="1"/><text x="12" y="30" fill="#f59e0b" font-size="10">❝</text><rect x="12" y="33" width="38" height="3" rx="2" fill="#94a3b8"/><rect x="12" y="40" width="30" height="3" rx="2" fill="#94a3b8"/><circle cx="20" cy="54" r="5" fill="#e2e8f0"/><rect x="28" y="51" width="22" height="3" rx="2" fill="#cbd5e1"/><text x="70" y="30" fill="#f59e0b" font-size="10">❝</text><rect x="70" y="33" width="38" height="3" rx="2" fill="#94a3b8"/><rect x="70" y="40" width="30" height="3" rx="2" fill="#94a3b8"/><circle cx="78" cy="54" r="5" fill="#e2e8f0"/><rect x="86" y="51" width="22" height="3" rx="2" fill="#cbd5e1"/></svg>`,
  'depoimento-destaque': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1e40af"/><text x="20" y="28" fill="white" font-size="16" opacity=".3">❝</text><rect x="20" y="30" width="80" height="5" rx="2" fill="white" opacity=".8"/><rect x="25" y="38" width="70" height="5" rx="2" fill="white" opacity=".6"/><rect x="30" y="46" width="60" height="5" rx="2" fill="white" opacity=".4"/><circle cx="50" cy="62" r="5" fill="white" opacity=".7"/><rect x="58" y="59" width="30" height="3" rx="2" fill="white" opacity=".5"/></svg>`,
  'depoimentos-lista': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="16" cy="18" r="7" fill="#dbeafe"/><rect x="28" y="14" width="70" height="4" rx="2" fill="#1e293b"/><rect x="28" y="21" width="50" height="3" rx="2" fill="#94a3b8"/><line x1="8" y1="33" x2="112" y2="33" stroke="#e2e8f0" stroke-width="1"/><circle cx="16" cy="45" r="7" fill="#fce7f3"/><rect x="28" y="41" width="65" height="4" rx="2" fill="#1e293b"/><rect x="28" y="48" width="45" height="3" rx="2" fill="#94a3b8"/><line x1="8" y1="58" x2="112" y2="58" stroke="#e2e8f0" stroke-width="1"/></svg>`,
  // ── Estatísticas ──────────────────────────────────────────────
  'estatisticas-3col': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="10" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><rect x="45" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><rect x="80" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><text x="25" y="36" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">98%</text><text x="60" y="36" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">2k+</text><text x="95" y="36" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">★5</text><rect x="14" y="40" width="22" height="3" rx="2" fill="#93c5fd"/><rect x="49" y="40" width="22" height="3" rx="2" fill="#93c5fd"/><rect x="84" y="40" width="22" height="3" rx="2" fill="#93c5fd"/></svg>`,
  'estatisticas-dark': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="10" y="20" width="30" height="32" rx="4" fill="#1e293b"/><rect x="45" y="20" width="30" height="32" rx="4" fill="#1e293b"/><rect x="80" y="20" width="30" height="32" rx="4" fill="#1e293b"/><text x="25" y="36" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="bold">98%</text><text x="60" y="36" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="bold">2k+</text><text x="95" y="36" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="bold">★5</text></svg>`,
  // ── Formulários ───────────────────────────────────────────────
  'formulario-captura': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1a2e5a"/><rect x="8" y="10" width="50" height="7" rx="2" fill="white" opacity=".9"/><rect x="66" y="8" width="46" height="56" rx="6" fill="white"/><rect x="71" y="16" width="36" height="8" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="71" y="28" width="36" height="8" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="71" y="40" width="36" height="10" rx="3" fill="#2563eb"/><text x="89" y="48" text-anchor="middle" fill="white" font-size="6">Enviar →</text></svg>`,
  'formulario-claro': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="25" y="8" width="70" height="7" rx="2" fill="#1e293b"/><rect x="30" y="19" width="60" height="4" rx="2" fill="#94a3b8"/><rect x="20" y="28" width="80" height="9" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="20" y="41" width="80" height="9" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="30" y="54" width="60" height="10" rx="5" fill="#2563eb"/><text x="60" y="62" text-anchor="middle" fill="white" font-size="6">Quero me cadastrar →</text></svg>`,
  // ── CTA ───────────────────────────────────────────────────────
  'cta-simples': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#2563eb"/><rect x="20" y="16" width="80" height="8" rx="2" fill="white" opacity=".9"/><rect x="30" y="28" width="60" height="5" rx="2" fill="white" opacity=".5"/><rect x="35" y="44" width="50" height="13" rx="6" fill="#f59e0b"/><text x="60" y="54" text-anchor="middle" fill="#1a1a1a" font-size="7" font-weight="bold">COMEÇAR AGORA →</text></svg>`,
  'cta-urgencia': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#dc2626"/><rect x="20" y="10" width="80" height="8" rx="2" fill="white" opacity=".9"/><rect x="25" y="22" width="70" height="5" rx="2" fill="white" opacity=".5"/><rect x="35" y="30" width="50" height="10" rx="3" fill="#fef2f2"/><text x="60" y="38" text-anchor="middle" fill="#dc2626" font-size="7" font-weight="bold">⏰ 23:59:59</text><rect x="30" y="46" width="60" height="13" rx="6" fill="#f59e0b"/><text x="60" y="56" text-anchor="middle" fill="#1a1a1a" font-size="7" font-weight="bold">GARANTIR VAGA →</text></svg>`,
  'cta-duplo': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="15" y="12" width="90" height="8" rx="2" fill="#1e293b"/><rect x="25" y="24" width="70" height="4" rx="2" fill="#94a3b8"/><rect x="8" y="38" width="50" height="12" rx="6" fill="#2563eb"/><rect x="62" y="38" width="50" height="12" rx="6" stroke="#2563eb" stroke-width="1.5" fill="white"/></svg>`,
  // ── FAQ ───────────────────────────────────────────────────────
  'faq': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="8" y="8" width="104" height="12" rx="4" fill="#f1f5f9"/><rect x="12" y="12" width="60" height="4" rx="2" fill="#1e293b"/><text x="106" y="18" text-anchor="middle" fill="#94a3b8" font-size="10">+</text><rect x="8" y="24" width="104" height="12" rx="4" fill="#eff6ff"/><rect x="12" y="28" width="70" height="4" rx="2" fill="#1d4ed8"/><text x="106" y="34" text-anchor="middle" fill="#2563eb" font-size="10">−</text><rect x="8" y="40" width="104" height="12" rx="4" fill="#f1f5f9"/><rect x="12" y="44" width="55" height="4" rx="2" fill="#1e293b"/><text x="106" y="50" text-anchor="middle" fill="#94a3b8" font-size="10">+</text><rect x="8" y="56" width="104" height="12" rx="4" fill="#f1f5f9"/><rect x="12" y="60" width="65" height="4" rx="2" fill="#1e293b"/><text x="106" y="66" text-anchor="middle" fill="#94a3b8" font-size="10">+</text></svg>`,
  'faq-dark': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="8" y="8" width="104" height="12" rx="4" fill="#1e293b"/><rect x="12" y="12" width="60" height="4" rx="2" fill="#e2e8f0"/><text x="106" y="18" text-anchor="middle" fill="#475569" font-size="10">+</text><rect x="8" y="24" width="104" height="12" rx="4" fill="#1e3a8a"/><rect x="12" y="28" width="70" height="4" rx="2" fill="#93c5fd"/><text x="106" y="34" text-anchor="middle" fill="#60a5fa" font-size="10">−</text><rect x="8" y="40" width="104" height="12" rx="4" fill="#1e293b"/><rect x="12" y="44" width="55" height="4" rx="2" fill="#94a3b8"/><text x="106" y="50" text-anchor="middle" fill="#475569" font-size="10">+</text><rect x="8" y="56" width="104" height="12" rx="4" fill="#1e293b"/><rect x="12" y="60" width="65" height="4" rx="2" fill="#94a3b8"/></svg>`,
  // ── Vídeo ─────────────────────────────────────────────────────
  'video-youtube': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="10" y="10" width="100" height="52" rx="6" fill="#1e293b"/><circle cx="60" cy="36" r="14" fill="#ff0000" opacity=".9"/><polygon points="55,29 55,43 70,36" fill="white"/></svg>`,
  'video-com-texto': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="8" y="8" width="55" height="56" rx="6" fill="#1e293b"/><circle cx="35" cy="36" r="10" fill="#ff0000" opacity=".8"/><polygon points="31,30 31,42 42,36" fill="white"/><rect x="68" y="14" width="44" height="6" rx="2" fill="#1e293b"/><rect x="68" y="24" width="38" height="4" rx="2" fill="#94a3b8"/><rect x="68" y="31" width="36" height="4" rx="2" fill="#94a3b8"/><rect x="68" y="50" width="36" height="10" rx="5" fill="#2563eb"/></svg>`,
  // ── Timer ─────────────────────────────────────────────────────
  'timer-urgencia': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#dc2626"/><rect x="15" y="8" width="90" height="7" rx="2" fill="white" opacity=".9"/><rect x="8" y="22" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="36" y="22" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="64" y="22" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="92" y="22" width="24" height="22" rx="4" fill="#fef2f2"/><text x="20" y="37" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold">23</text><text x="48" y="37" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold">59</text><text x="76" y="37" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold">59</text><text x="104" y="37" text-anchor="middle" fill="#dc2626" font-size="10" font-weight="bold">00</text><rect x="30" y="52" width="60" height="12" rx="6" fill="#f59e0b"/></svg>`,
  'timer-simples': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="60" cy="30" r="20" stroke="#2563eb" stroke-width="2" fill="#eff6ff"/><line x1="60" y1="30" x2="60" y2="18" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/><line x1="60" y1="30" x2="70" y2="30" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/><rect x="30" y="56" width="60" height="10" rx="5" fill="#2563eb"/></svg>`,
  // ── Planos ────────────────────────────────────────────────────
  'planos-3cols': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="4" y="8" width="34" height="56" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="43" y="4" width="34" height="64" rx="4" fill="#1d4ed8"/><rect x="82" y="8" width="34" height="56" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><text x="21" y="30" text-anchor="middle" fill="#64748b" font-size="7">Básico</text><text x="60" y="28" text-anchor="middle" fill="white" font-size="7" font-weight="bold">Pro</text><text x="99" y="30" text-anchor="middle" fill="#64748b" font-size="7">Premium</text><text x="21" y="42" text-anchor="middle" fill="#1e293b" font-size="9" font-weight="bold">R$47</text><text x="60" y="42" text-anchor="middle" fill="white" font-size="9" font-weight="bold">R$97</text><text x="99" y="42" text-anchor="middle" fill="#1e293b" font-size="9" font-weight="bold">R$197</text></svg>`,
  'planos-simples': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="20" y="8" width="80" height="56" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/><text x="60" y="28" text-anchor="middle" fill="#1d4ed8" font-size="8" font-weight="bold">Plano Único</text><text x="60" y="42" text-anchor="middle" fill="#1e293b" font-size="14" font-weight="bold">R$97</text><rect x="30" y="50" width="60" height="10" rx="5" fill="#2563eb"/></svg>`,
  // ── Sobre ─────────────────────────────────────────────────────
  'sobre-bio': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="30" cy="30" r="20" fill="#f1f5f9"/><circle cx="30" cy="26" r="8" fill="#cbd5e1"/><ellipse cx="30" cy="42" rx="14" ry="8" fill="#cbd5e1"/><rect x="58" y="12" width="54" height="6" rx="2" fill="#1e293b"/><rect x="58" y="22" width="48" height="4" rx="2" fill="#94a3b8"/><rect x="58" y="29" width="44" height="4" rx="2" fill="#94a3b8"/><rect x="58" y="36" width="50" height="4" rx="2" fill="#94a3b8"/><rect x="58" y="50" width="40" height="10" rx="5" fill="#2563eb"/></svg>`,
  'sobre-empresa': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="8" y="8" width="55" height="40" rx="4" fill="#e2e8f0"/><text x="35" y="32" text-anchor="middle" fill="#94a3b8" font-size="14">🏢</text><rect x="68" y="12" width="44" height="6" rx="2" fill="#1e293b"/><rect x="68" y="22" width="38" height="4" rx="2" fill="#94a3b8"/><rect x="68" y="29" width="36" height="4" rx="2" fill="#94a3b8"/><rect x="8" y="54" width="104" height="5" rx="2" fill="#e2e8f0"/></svg>`,
  // ── Timeline ──────────────────────────────────────────────────
  'timeline': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><line x1="60" y1="8" x2="60" y2="64" stroke="#e2e8f0" stroke-width="2"/><circle cx="60" cy="16" r="5" fill="#2563eb"/><rect x="66" y="12" width="46" height="4" rx="2" fill="#1e293b"/><rect x="66" y="18" width="34" height="3" rx="2" fill="#94a3b8"/><circle cx="60" cy="36" r="5" fill="#2563eb"/><rect x="8" y="32" width="46" height="4" rx="2" fill="#1e293b"/><rect x="8" y="38" width="34" height="3" rx="2" fill="#94a3b8"/><circle cx="60" cy="56" r="5" fill="#2563eb"/><rect x="66" y="52" width="46" height="4" rx="2" fill="#1e293b"/><rect x="66" y="58" width="30" height="3" rx="2" fill="#94a3b8"/></svg>`,
  // ── Galeria ───────────────────────────────────────────────────
  'galeria': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="6" y="10" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="44" y="10" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="82" y="10" width="32" height="24" rx="3" fill="#e2e8f0"/><rect x="6" y="38" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="44" y="38" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="82" y="38" width="32" height="24" rx="3" fill="#e2e8f0"/><text x="23" y="26" text-anchor="middle" fill="#94a3b8" font-size="10">🖼</text><text x="61" y="26" text-anchor="middle" fill="#94a3b8" font-size="10">🖼</text><text x="98" y="26" text-anchor="middle" fill="#94a3b8" font-size="10">🖼</text></svg>`,
  // ── Garantia ──────────────────────────────────────────────────
  'garantia': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><path d="M60 8 L80 16 L80 40 Q80 56 60 64 Q40 56 40 40 L40 16 Z" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/><text x="60" y="42" text-anchor="middle" fill="#16a34a" font-size="18">✓</text></svg>`,
  'garantia-30dias': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f0fdf4"/><circle cx="60" cy="36" r="26" fill="white" stroke="#16a34a" stroke-width="2"/><text x="60" y="32" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="bold">30</text><text x="60" y="44" text-anchor="middle" fill="#16a34a" font-size="7">DIAS</text></svg>`,
  // ── Logos ─────────────────────────────────────────────────────
  'logos': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="8" y="24" width="22" height="24" rx="3" fill="#f1f5f9"/><rect x="34" y="24" width="22" height="24" rx="3" fill="#f1f5f9"/><rect x="60" y="24" width="22" height="24" rx="3" fill="#f1f5f9"/><rect x="86" y="24" width="26" height="24" rx="3" fill="#f1f5f9"/></svg>`,
  // ── Rodapé ────────────────────────────────────────────────────
  'rodape': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="8" y="10" width="104" height="38" rx="4" fill="#0f172a"/><rect x="8" y="10" width="25" height="6" rx="2" fill="#475569"/><rect x="8" y="20" width="18" height="3" rx="2" fill="#334155"/><rect x="8" y="26" width="16" height="3" rx="2" fill="#334155"/><rect x="50" y="10" width="20" height="4" rx="2" fill="#475569"/><rect x="50" y="18" width="15" height="3" rx="2" fill="#334155"/><rect x="50" y="24" width="18" height="3" rx="2" fill="#334155"/><rect x="85" y="10" width="20" height="4" rx="2" fill="#475569"/><rect x="85" y="18" width="15" height="3" rx="2" fill="#334155"/><line x1="8" y1="55" x2="112" y2="55" stroke="#1e293b" stroke-width="1"/><rect x="30" y="60" width="60" height="4" rx="2" fill="#334155"/></svg>`,
  'rodape-completo': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1e293b"/><rect x="8" y="8" width="25" height="5" rx="2" fill="#64748b"/><rect x="8" y="17" width="18" height="3" rx="2" fill="#475569"/><rect x="8" y="23" width="16" height="3" rx="2" fill="#475569"/><rect x="40" y="8" width="18" height="4" rx="2" fill="#64748b"/><rect x="40" y="16" width="14" height="3" rx="2" fill="#475569"/><rect x="40" y="22" width="16" height="3" rx="2" fill="#475569"/><rect x="68" y="8" width="18" height="4" rx="2" fill="#64748b"/><rect x="68" y="16" width="14" height="3" rx="2" fill="#475569"/><rect x="92" y="8" width="20" height="20" rx="3" fill="#334155"/><line x1="8" y1="40" x2="112" y2="40" stroke="#334155" stroke-width="1"/><rect x="20" y="46" width="80" height="3" rx="2" fill="#475569"/><rect x="30" y="54" width="60" height="3" rx="2" fill="#334155"/></svg>`,
  // ── Elementos ─────────────────────────────────────────────────
  'divisor': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><line x1="10" y1="36" x2="110" y2="36" stroke="#e2e8f0" stroke-width="2"/></svg>`,
  'espacador': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><line x1="60" y1="10" x2="60" y2="62" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 3"/><line x1="10" y1="10" x2="110" y2="10" stroke="#e2e8f0" stroke-width="1"/><line x1="10" y1="62" x2="110" y2="62" stroke="#e2e8f0" stroke-width="1"/><text x="60" y="40" text-anchor="middle" fill="#94a3b8" font-size="8">↕ espaço</text></svg>`,
  'aviso-destaque': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="8" y="20" width="104" height="32" rx="6" fill="#fffbeb" stroke="#fbbf24" stroke-width="1.5"/><text x="22" y="40" fill="#f59e0b" font-size="14">⚠</text><rect x="36" y="28" width="68" height="5" rx="2" fill="#92400e" opacity=".7"/><rect x="36" y="37" width="52" height="4" rx="2" fill="#92400e" opacity=".4"/></svg>`,
}

/* Default icon by category when no specific icon exists */
const CATEGORY_ICONS: Record<string, string> = {
  'Hero':         `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#1e40af"/><rect x="20" y="18" width="80" height="9" rx="2" fill="white" opacity=".9"/><rect x="30" y="31" width="60" height="5" rx="2" fill="white" opacity=".5"/><rect x="40" y="46" width="40" height="12" rx="6" fill="#f59e0b"/></svg>`,
  'Benefícios':   `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="8" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="44" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="80" y="8" width="32" height="30" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><text x="24" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text><text x="60" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text><text x="96" y="28" text-anchor="middle" fill="#2563eb" font-size="12">✓</text></svg>`,
  'Depoimentos':  `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><text x="16" y="36" fill="#f59e0b" font-size="24">❝</text><rect x="36" y="20" width="76" height="5" rx="2" fill="#94a3b8"/><rect x="36" y="28" width="60" height="5" rx="2" fill="#94a3b8"/><rect x="36" y="50" width="30" height="4" rx="2" fill="#cbd5e1"/></svg>`,
  'Formulários':  `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="15" y="12" width="90" height="10" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="15" y="26" width="90" height="10" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="15" y="40" width="90" height="10" rx="3" stroke="#e2e8f0" stroke-width="1" fill="white"/><rect x="30" y="55" width="60" height="12" rx="6" fill="#2563eb"/></svg>`,
  'CTA':          `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#2563eb"/><rect x="20" y="20" width="80" height="8" rx="2" fill="white" opacity=".9"/><rect x="35" y="42" width="50" height="14" rx="7" fill="#f59e0b"/></svg>`,
  'FAQ':          `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="8" y="8" width="104" height="12" rx="3" fill="#f1f5f9"/><rect x="8" y="24" width="104" height="12" rx="3" fill="#eff6ff"/><rect x="8" y="40" width="104" height="12" rx="3" fill="#f1f5f9"/><rect x="8" y="56" width="104" height="12" rx="3" fill="#f1f5f9"/></svg>`,
  'Vídeo':        `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="10" y="10" width="100" height="52" rx="6" fill="#1e293b"/><circle cx="60" cy="36" r="14" fill="#ff0000" opacity=".9"/><polygon points="55,29 55,43 70,36" fill="white"/></svg>`,
  'Garantia':     `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><path d="M60 8 L82 17 L82 42 Q82 58 60 66 Q38 58 38 42 L38 17 Z" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/><text x="60" y="44" text-anchor="middle" fill="#16a34a" font-size="20">✓</text></svg>`,
  'Timer':        `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#dc2626"/><rect x="10" y="20" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="38" y="20" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="66" y="20" width="24" height="22" rx="4" fill="#fef2f2"/><rect x="94" y="20" width="16" height="22" rx="4" fill="#fef2f2"/><text x="22" y="36" text-anchor="middle" fill="#dc2626" font-size="9" font-weight="bold">23</text><text x="50" y="36" text-anchor="middle" fill="#dc2626" font-size="9" font-weight="bold">59</text><text x="78" y="36" text-anchor="middle" fill="#dc2626" font-size="9" font-weight="bold">59</text></svg>`,
  'Planos':       `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="4" y="8" width="34" height="56" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/><rect x="43" y="4" width="34" height="64" rx="4" fill="#1d4ed8"/><rect x="82" y="8" width="34" height="56" rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/></svg>`,
  'Sobre':        `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><circle cx="30" cy="32" r="18" fill="#f1f5f9"/><circle cx="30" cy="26" r="8" fill="#cbd5e1"/><ellipse cx="30" cy="44" rx="14" ry="8" fill="#cbd5e1"/><rect x="56" y="16" width="56" height="6" rx="2" fill="#1e293b"/><rect x="56" y="26" width="48" height="4" rx="2" fill="#94a3b8"/><rect x="56" y="34" width="44" height="4" rx="2" fill="#94a3b8"/></svg>`,
  'Estatísticas': `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="10" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><rect x="45" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><rect x="80" y="20" width="30" height="32" rx="4" fill="#eff6ff"/><text x="25" y="38" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">98%</text><text x="60" y="38" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">2k+</text><text x="95" y="38" text-anchor="middle" fill="#1d4ed8" font-size="9" font-weight="bold">★5</text></svg>`,
  'Timeline':     `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><line x1="60" y1="8" x2="60" y2="64" stroke="#e2e8f0" stroke-width="2"/><circle cx="60" cy="18" r="5" fill="#2563eb"/><circle cx="60" cy="36" r="5" fill="#2563eb"/><circle cx="60" cy="54" r="5" fill="#2563eb"/><rect x="66" y="14" width="46" height="4" rx="2" fill="#1e293b"/><rect x="8" y="32" width="46" height="4" rx="2" fill="#1e293b"/><rect x="66" y="50" width="46" height="4" rx="2" fill="#1e293b"/></svg>`,
  'Galeria':      `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#f8fafc"/><rect x="6" y="10" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="44" y="10" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="82" y="10" width="32" height="24" rx="3" fill="#e2e8f0"/><rect x="6" y="38" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="44" y="38" width="34" height="24" rx="3" fill="#e2e8f0"/><rect x="82" y="38" width="32" height="24" rx="3" fill="#e2e8f0"/></svg>`,
  'Rodapé':       `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="#0f172a"/><rect x="8" y="10" width="104" height="38" rx="4" fill="#0f172a"/><rect x="8" y="10" width="25" height="5" rx="2" fill="#475569"/><rect x="50" y="10" width="20" height="4" rx="2" fill="#475569"/><rect x="85" y="10" width="20" height="4" rx="2" fill="#475569"/><line x1="8" y1="52" x2="112" y2="52" stroke="#1e293b" stroke-width="1"/><rect x="30" y="58" width="60" height="4" rx="2" fill="#334155"/></svg>`,
  'Elementos':    `<svg viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="72" rx="4" fill="white"/><rect x="10" y="10" width="46" height="24" rx="4" stroke="#e2e8f0" stroke-width="1.5" fill="#f8fafc"/><rect x="64" y="10" width="46" height="24" rx="4" fill="#2563eb"/><line x1="10" y1="50" x2="110" y2="50" stroke="#e2e8f0" stroke-width="2"/><circle cx="30" cy="62" r="6" stroke="#e2e8f0" stroke-width="1.5" fill="none"/><rect x="44" y="58" width="32" height="8" rx="3" fill="#f1f5f9"/></svg>`,
}

function getBlockIcon(id: string, category: string): string {
  return BLOCK_ICONS[id] ?? CATEGORY_ICONS[category] ?? CATEGORY_ICONS['Elementos']
}

interface Block {
  id: string
  label: string
  category: string
  media: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

interface Props {
  editor: AnyEditor | null
  open: boolean
  onClose: () => void
}

export function BlocksModal({ editor, open, onClose }: Props) {
  const [blocks, setBlocks]           = useState<Block[]>([])
  const [categories, setCategories]   = useState<string[]>([])
  const [activeCategory, setActive]   = useState<string>('')
  const [search, setSearch]           = useState('')
  const overlayRef                    = useRef<HTMLDivElement>(null)

  /* Load blocks from GrapesJS */
  useEffect(() => {
    if (!editor || !open) return

    const load = () => {
      try {
        const bm   = editor.BlockManager
        const coll = bm.getAll()
        // Support both .models (Backbone) and iterable / array
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arr: AnyEditor[] = coll.models
          ?? (Array.isArray(coll) ? coll : Array.from(coll as Iterable<AnyEditor>))

        if (!arr || arr.length === 0) return   // not ready yet, retry

        const list: Block[] = arr.map((b) => {
          const cat = b.get('category')
          return {
            id:       b.id as string,
            label:    (b.get('label') as string) || (b.id as string),
            category: typeof cat === 'object' && cat !== null
              ? (cat.label as string)
              : (cat as string) || 'Outros',
            media:   (b.get('media') as string) || '',
            content:  b.get('content'),
          }
        })
        const cats = Array.from(new Set(list.map((b) => b.category)))
        setBlocks(list)
        setCategories(cats)
        setActive((prev) => prev || cats[0] || '')
      } catch {
        // silent
      }
    }

    // Try immediately
    load()

    // Retry after 300ms in case blocks weren't registered yet
    const t1 = setTimeout(load, 300)
    const t2 = setTimeout(load, 800)

    // Also listen to block:add in case blocks register after init
    editor.on('block:add', load)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      try { editor.off('block:add', load) } catch { /* */ }
    }
  }, [editor, open])

  /* Close on overlay click */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  /* Close on Escape */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const addBlock = (block: Block) => {
    if (!editor) return
    try { editor.addComponents(block.content) } catch { /* silent */ }
    onClose()
  }

  /* Filter by search + category */
  const q = search.toLowerCase()
  const visible = blocks.filter((b) => {
    if (q) return b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    return b.category === activeCategory
  })

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[860px] max-w-[96vw] h-[90vh] max-h-[640px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Blocos</h2>
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 w-52">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar bloco…"
                className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Left: category list */}
          {!search && (
            <div className="w-48 shrink-0 border-r border-slate-200 overflow-y-auto py-2 bg-slate-50">
              <p className="px-4 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                Seções
              </p>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: activeCategory === cat ? '600' : '400',
                    color: activeCategory === cat ? '#2563eb' : '#374151',
                    background: activeCategory === cat ? '#eff6ff' : 'transparent',
                    borderLeft: activeCategory === cat ? '3px solid #2563eb' : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Right: blocks grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                Nenhum bloco encontrado
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {visible.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => addBlock(block)}
                    className="group text-left border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all duration-150"
                  >
                    {/* Thumbnail area — SVG preview */}
                    <div
                      className="h-[88px] overflow-hidden [&_svg]:w-full [&_svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: getBlockIcon(block.id, block.category) }}
                    />
                    {/* Label */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                        {block.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
