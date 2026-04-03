'use client'

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'

export interface GrapesEditorHandle {
  getHtml: () => string
  undo: () => void
  redo: () => void
  setDevice: (device: 'Desktop' | 'Mobile') => void
}

interface Props {
  initialHtml: string | null
  onAutoSave: (html: string) => void
  onSaveStatus?: (status: 'saving' | 'saved' | 'idle') => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

export const GrapesEditor = forwardRef<GrapesEditorHandle, Props>(
  function GrapesEditor({ initialHtml, onAutoSave, onSaveStatus }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<AnyEditor>(null)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useImperativeHandle(ref, () => ({
      getHtml: () => {
        const e = editorRef.current
        if (!e) return ''
        const css = e.getCss({ avoidProtected: true })
        const html = e.getHtml()
        return css ? `<style>${css}</style>\n${html}` : html
      },
      undo: () => editorRef.current?.UndoManager?.undo(),
      redo: () => editorRef.current?.UndoManager?.redo(),
      setDevice: (device) => editorRef.current?.setDevice(device),
    }))

    useEffect(() => {
      if (!containerRef.current || editorRef.current) return

      let mounted = true

      const init = async () => {
        // Dynamic imports — GrapesJS must run client-side only
        const [{ default: grapesjs }, { default: gjsBlocksBasic }, { LANDING_BLOCKS }] =
          await Promise.all([
            import('grapesjs'),
            import('grapesjs-blocks-basic'),
            import('./blocks'),
          ])

        if (!mounted || !containerRef.current) return

        // Inject GrapesJS CSS once
        if (!document.getElementById('gjs-styles')) {
          const link = document.createElement('link')
          link.id = 'gjs-styles'
          link.rel = 'stylesheet'
          link.href = '/_next/static/css/grapes.css'
          // Fallback: use CDN if the bundled version isn't available
          link.onerror = () => {
            const cdn = document.createElement('link')
            cdn.rel = 'stylesheet'
            cdn.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
            document.head.appendChild(cdn)
          }
          document.head.appendChild(link)

          // Also inject inline to guarantee it works
          const style = document.createElement('style')
          style.textContent = GJS_THEME_CSS
          document.head.appendChild(style)
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gjsConfig: any = {
          container: containerRef.current,
          height: '100%',
          fromElement: false,
          storageManager: false,
          undoManager: { trackSelection: false },
          deviceManager: {
            devices: [
              { name: 'Desktop', width: '' },
              { name: 'Mobile', width: '390px', widthMedia: '480px' },
            ],
          },
          plugins: [gjsBlocksBasic],
          pluginsOpts: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [gjsBlocksBasic as any]: {
              flexGrid: true,
              category: 'Elementos',
              blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video'],
            },
          },
          components: initialHtml || EMPTY_PAGE_HINT,
          blockManager: { blocks: LANDING_BLOCKS },
          styleManager: {
            sectors: [
              {
                name: 'Dimensões', open: true,
                properties: [
                  'width', 'min-width', 'max-width', 'height', 'min-height',
                  { type: 'composite', property: 'margin', properties: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'] },
                  { type: 'composite', property: 'padding', properties: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] },
                ],
              },
              {
                name: 'Tipografia', open: false,
                properties: [
                  { property: 'font-family', type: 'select', defaults: 'system-ui, sans-serif',
                    options: [
                      { id: 'system-ui', value: 'system-ui, sans-serif', name: 'System UI' },
                      { id: 'arial', value: 'Arial, sans-serif', name: 'Arial' },
                      { id: 'georgia', value: 'Georgia, serif', name: 'Georgia' },
                      { id: 'roboto', value: "'Roboto', sans-serif", name: 'Roboto' },
                    ],
                  },
                  'font-size', 'font-weight', 'letter-spacing', 'line-height',
                  'color', 'text-align', 'text-decoration',
                ],
              },
              {
                name: 'Plano de fundo', open: false,
                properties: ['background-color', 'background-image', 'background-repeat', 'background-size', 'background-position'],
              },
              {
                name: 'Borda', open: false,
                properties: [
                  'border-radius',
                  { type: 'composite', property: 'border', properties: ['border-width', 'border-style', 'border-color'] },
                  'box-shadow',
                ],
              },
              {
                name: 'Avançado', open: false,
                properties: ['display', 'position', 'overflow', 'opacity', 'z-index', 'cursor'],
              },
            ],
          },
          // Remove default panels — we have our own top bar
          panels: { defaults: [] },
        }

        const editor: AnyEditor = grapesjs.init(gjsConfig)

        editorRef.current = editor

        // Auto-save with 2.5s debounce after changes
        editor.on('change:changesCount', () => {
          if (saveTimer.current) clearTimeout(saveTimer.current)
          onSaveStatus?.('saving')
          saveTimer.current = setTimeout(() => {
            const css = editor.getCss({ avoidProtected: true })
            const html = editor.getHtml()
            const full = css ? `<style>${css}</style>\n${html}` : html
            onAutoSave(full)
            onSaveStatus?.('saved')
            setTimeout(() => onSaveStatus?.('idle'), 2000)
          }, 2500)
        })
      }

      init().catch(console.error)

      return () => {
        mounted = false
        if (saveTimer.current) clearTimeout(saveTimer.current)
        if (editorRef.current) {
          editorRef.current.destroy()
          editorRef.current = null
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div
        ref={containerRef}
        style={{ height: '100%', width: '100%' }}
        className="gjs-custom-container"
      />
    )
  }
)

const EMPTY_PAGE_HINT = `
<div style="display:flex;align-items:center;justify-content:center;min-height:400px;font-family:system-ui,sans-serif;color:#94a3b8;text-align:center;padding:40px;">
  <div>
    <div style="width:64px;height:64px;margin:0 auto 20px;background:#f1f5f9;border-radius:16px;display:flex;align-items:center;justify-content:center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    </div>
    <p style="font-size:16px;font-weight:600;margin:0 0 8px;color:#64748b;">Página em branco</p>
    <p style="font-size:13px;margin:0;line-height:1.6;">Arraste blocos do painel esquerdo<br>para começar a construir</p>
  </div>
</div>
`

// Inline CSS to theme GrapesJS panels to match our Royal Blue palette
const GJS_THEME_CSS = `
  /* ── GrapesJS theme: Royal Blue ─────────────────────── */
  .gjs-one-bg { background-color: #1e2d4a !important; }
  .gjs-two-color { color: #c7d6f0 !important; }
  .gjs-three-bg { background-color: #253660 !important; }
  .gjs-four-color, .gjs-four-color-h:hover { color: #60a5fa !important; }

  /* Panel backgrounds */
  .gjs-pn-panel { background: #1e2d4a !important; }
  .gjs-pn-views-container { background: #1a2744 !important; }
  .gjs-pn-views { background: #1e2d4a !important; border-color: #2a3d6b !important; }
  .gjs-sm-sectors { background: #1a2744 !important; }
  .gjs-blocks-cs { background: #1a2744 !important; }
  .gjs-layer-no-chld { background: #1a2744 !important; }

  /* Block thumbnails */
  .gjs-block { background: #253660 !important; border-color: #2a3d6b !important; }
  .gjs-block:hover { border-color: #60a5fa !important; background: #2d4275 !important; }
  .gjs-block__media { color: #60a5fa !important; }
  .gjs-block-label { color: #c7d6f0 !important; }
  .gjs-block-category .gjs-title { color: #94b4d8 !important; background: #1a2744 !important; border-color: #2a3d6b !important; }

  /* Style manager */
  .gjs-sm-label { color: #94b4d8 !important; }
  .gjs-sm-sector-title { color: #c7d6f0 !important; background: #253660 !important; border-color: #2a3d6b !important; }
  .gjs-sm-field { background: #1a2744 !important; border-color: #2a3d6b !important; color: #e2eaf6 !important; }
  .gjs-sm-field input, .gjs-sm-field select { color: #e2eaf6 !important; background: transparent !important; }

  /* Trait manager */
  .gjs-trt-trait { color: #c7d6f0 !important; }
  .gjs-trt-header { background: #253660 !important; color: #94b4d8 !important; }

  /* Layer manager */
  .gjs-layer { border-color: #2a3d6b !important; color: #c7d6f0 !important; }
  .gjs-layer:hover, .gjs-layer.gjs-selected { background: #2d4275 !important; }

  /* Toolbar (top inline toolbar when element selected) */
  .gjs-toolbar { background: #1e3a8a !important; border-radius: 8px; }
  .gjs-toolbar-item { color: #e2eaf6 !important; }
  .gjs-toolbar-item:hover { background: #2563eb !important; }

  /* Rte toolbar */
  .gjs-rte-toolbar { background: #1e3a8a !important; border-radius: 8px; }

  /* Canvas frame */
  .gjs-cv-canvas { background: #e5e7eb !important; }

  /* Selected outline */
  .gjs-selected { outline: 2px solid #3b82f6 !important; }
  .gjs-hovered { outline: 1px dashed #93c5fd !important; }

  /* Remove panel commands (top bar) — we use our own */
  .gjs-pn-commands { display: none !important; }
  .gjs-pn-options { display: none !important; }

  /* Views switcher (tabs: Blocks / Styles / Layers / Traits) */
  .gjs-pn-views button, .panel__switcher button {
    color: #94b4d8 !important;
    border-bottom: 2px solid transparent !important;
  }
  .gjs-pn-views button.gjs-pn-active, .panel__switcher button.gjs-pn-active {
    color: #60a5fa !important;
    border-bottom-color: #60a5fa !important;
    background: transparent !important;
  }

  /* Scrollbar in panels */
  .gjs-pn-views-container ::-webkit-scrollbar { width: 4px; }
  .gjs-pn-views-container ::-webkit-scrollbar-track { background: #1a2744; }
  .gjs-pn-views-container ::-webkit-scrollbar-thumb { background: #334d7b; border-radius: 2px; }

  /* Custom container sizing */
  .gjs-custom-container .gjs-editor { height: 100% !important; }
  .gjs-custom-container .gjs-editor-cont { height: 100% !important; }
`
