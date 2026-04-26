'use client'

/**
 * Toolbar inline de formatação de texto.
 *
 * Aparece automaticamente quando o usuário seleciona texto dentro de um
 * elemento em modo de edição (contentEditable). Permite mudar cor, peso,
 * estilo, etc — APENAS do trecho selecionado, não do elemento inteiro.
 *
 * Uso: monta uma vez no LandingEditorV3. Listener global `selectionchange`
 * detecta seleções dentro de qualquer contentEditable do canvas.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bold, Italic, Underline, Strikethrough, Eraser, Link2 } from 'lucide-react'

interface Pos { top: number; left: number }

const TOOLBAR_H = 38
const GAP       = 8

// Paleta de cores rápida — combinacao com fundos dark e light comuns
const COLOR_PRESETS = [
  '#0f172a', '#ffffff', '#dc2626', '#f97316', '#fbbf24',
  '#16a34a', '#0ea5e9', '#3b82f6', '#7c3aed', '#ec4899',
]

export function InlineTextFormatBar() {
  const [pos, setPos]       = useState<Pos | null>(null)
  const [showColors, setShowColors] = useState(false)
  const [linkMode, setLinkMode] = useState(false)
  const [linkUrl, setLinkUrl] = useState('https://')
  const linkInputRef = useRef<HTMLInputElement>(null)
  // Range salvo: ao clicar no toolbar a seleção é perdida (focus muda).
  // Salvamos o range antes do click pra restaurar e aplicar comando.
  const savedRangeRef = useRef<Range | null>(null)

  // ─── Detecta seleção dentro de contentEditable ────────────────────────────
  useEffect(() => {
    const updatePos = () => {
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setPos(null)
        return
      }
      const range = sel.getRangeAt(0)
      // Está dentro de um contentEditable? (sobe pela árvore checando)
      let node: Node | null = range.commonAncestorContainer
      while (node) {
        if (node.nodeType === 1 && (node as HTMLElement).isContentEditable) break
        node = node.parentNode
      }
      if (!node) { setPos(null); return }

      const rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) { setPos(null); return }

      // Posiciona acima da seleção, ou abaixo se não couber em cima
      const showBelow = rect.top < TOOLBAR_H + GAP + 8
      setPos({
        top:  showBelow ? rect.bottom + GAP : rect.top - TOOLBAR_H - GAP,
        left: Math.max(8, rect.left + rect.width / 2),
      })
      savedRangeRef.current = range.cloneRange()
    }

    document.addEventListener('selectionchange', updatePos)
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      document.removeEventListener('selectionchange', updatePos)
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [])

  // Foca o input de link quando ativado
  useEffect(() => {
    if (linkMode) setTimeout(() => linkInputRef.current?.focus(), 30)
  }, [linkMode])

  // ─── Aplicar comando de formatação ────────────────────────────────────────
  const applyCmd = (cmd: string, val?: string) => {
    // Restaura seleção (focus pode ter saído ao clicar no toolbar)
    const range = savedRangeRef.current
    if (range) {
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    try {
      // styleWithCSS=true força execCommand a usar <span style="..."> em vez
      // de tags legacy como <font color>. <font> seria stripped pelo sanitize-html
      // (não está na whitelist), mas <span style> é preservado.
      document.execCommand('styleWithCSS', false, 'true')
      // execCommand está deprecated mas funciona em todos browsers e e' o
      // jeito mais simples de formatar contentEditable. Modern alternatives
      // exigiriam reescrever Selection API + DOM mutation manual.
      document.execCommand(cmd, false, val)
    } catch {
      /* alguns browsers podem throw em edge cases */
    }
  }

  if (!pos) return null

  return createPortal(
    <div
      onMouseDown={e => {
        // Importante: previne perder a seleção ao clicar no toolbar
        e.preventDefault()
      }}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '0 4px',
        height: TOOLBAR_H,
        boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      <Btn title="Negrito (Ctrl+B)"  onClick={() => applyCmd('bold')}>
        <Bold size={14} />
      </Btn>
      <Btn title="Itálico (Ctrl+I)"  onClick={() => applyCmd('italic')}>
        <Italic size={14} />
      </Btn>
      <Btn title="Sublinhado (Ctrl+U)"  onClick={() => applyCmd('underline')}>
        <Underline size={14} />
      </Btn>
      <Btn title="Tachado"           onClick={() => applyCmd('strikeThrough')}>
        <Strikethrough size={14} />
      </Btn>

      <Sep />

      {/* Color picker — clica e mostra paleta */}
      <div style={{ position: 'relative' }}>
        <Btn title="Cor do texto"
          onClick={() => setShowColors(s => !s)}
          active={showColors}>
          <span style={{
            display: 'inline-flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>A</span>
            <span style={{ width: 14, height: 3, background: '#fbbf24', borderRadius: 1 }} />
          </span>
        </Btn>
        {showColors && (
          <div
            onMouseDown={e => e.preventDefault()}
            style={{
              position: 'absolute', top: TOOLBAR_H + 4, left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f172a', border: '1px solid #334155',
              borderRadius: 8, padding: 8,
              boxShadow: '0 8px 28px rgba(0,0,0,0.5)',
              display: 'flex', flexDirection: 'column', gap: 8, width: 200,
            }}
          >
            {/* Grade de presets */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
            }}>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c}
                  onClick={() => { applyCmd('foreColor', c); setShowColors(false) }}
                  title={c}
                  style={{
                    width: 28, height: 28,
                    background: c,
                    border: c === '#ffffff' ? '1px solid #334155' : 'none',
                    borderRadius: 6, cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            {/* Picker custom */}
            <label style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#cbd5e1', cursor: 'pointer',
            }}>
              <input
                type="color"
                onChange={e => applyCmd('foreColor', e.target.value)}
                style={{
                  width: 28, height: 28, border: 'none', borderRadius: 6,
                  background: 'none', cursor: 'pointer', padding: 0,
                }}
              />
              <span>Cor personalizada</span>
            </label>
            {/* Limpar cor (volta pra cor herdada do elemento) */}
            <button
              onClick={() => { applyCmd('foreColor', 'inherit'); setShowColors(false) }}
              style={{
                fontSize: 11, color: '#94a3b8',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
                width: '100%',
              }}
            >
              Limpar cor
            </button>
          </div>
        )}
      </div>

      <Sep />

      {linkMode ? (
        <>
          <input
            ref={linkInputRef}
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => {
              e.stopPropagation()
              if (e.key === 'Enter') { applyCmd('createLink', linkUrl); setLinkMode(false) }
              if (e.key === 'Escape') setLinkMode(false)
            }}
            placeholder="https://..."
            style={{
              background: '#1e293b', border: '1px solid #3b82f6', borderRadius: 4,
              color: '#e2e8f0', fontSize: 11, padding: '4px 8px', outline: 'none', width: 170,
              marginRight: 4,
            }}
          />
          <button
            onClick={() => { applyCmd('createLink', linkUrl); setLinkMode(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#60a5fa', fontSize: 11, fontWeight: 700 }}
          >
            OK
          </button>
          <button
            onClick={() => setLinkMode(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', fontSize: 16, padding: '0 4px' }}
          >
            ×
          </button>
        </>
      ) : (
        <Btn title="Inserir link" onClick={() => setLinkMode(true)}>
          <Link2 size={14} />
        </Btn>
      )}

      <Sep />

      <Btn title="Remover formatação" onClick={() => applyCmd('removeFormat')}>
        <Eraser size={14} />
      </Btn>
    </div>,
    document.body,
  )
}

function Btn({
  children, title, onClick, active,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => e.preventDefault()}  // não perde seleção
      onClick={onClick}
      style={{
        height: 30, minWidth: 30,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: active ? '#1e293b' : 'transparent',
        color: active ? '#60a5fa' : '#cbd5e1',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        padding: '0 6px',
        transition: 'background .12s, color .12s',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = '#1e293b'
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div style={{
    width: 1, height: 18, background: '#334155',
    margin: '0 2px', flexShrink: 0,
  }} />
}
