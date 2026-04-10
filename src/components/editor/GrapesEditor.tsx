'use client'

import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ImagePickerModal } from './ImagePickerModal'

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
  onEditorReady?: (editor: AnyEditor) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEditor = any

export const GrapesEditor = forwardRef<GrapesEditorHandle, Props>(
  function GrapesEditor({ initialHtml, onAutoSave, onSaveStatus, onEditorReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null)
    const editorRef = useRef<AnyEditor>(null)
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [imagePickerOpen, setImagePickerOpen] = useState(false)
    const imageSelectCallbackRef = useRef<((url: string) => void) | null>(null)

    useImperativeHandle(ref, () => ({
      getHtml: () => {
        const e = editorRef.current
        if (!e) return ''
        const css = e.getCss({ avoidProtected: true })
        const html = e.getHtml()
        return css ? `<style>${css}</style>\n${html}` : html
      },
      undo: () => {
        const e = editorRef.current
        if (!e) return
        try { e.UndoManager?.undo() } catch { /* */ }
        try { e.runCommand('core:undo') } catch { /* */ }
      },
      redo: () => {
        const e = editorRef.current
        if (!e) return
        try { e.UndoManager?.redo() } catch { /* */ }
        try { e.runCommand('core:redo') } catch { /* */ }
      },
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

        // Inject GrapesJS CSS uma única vez via CDN (mais confiável que path interno)
        if (!document.getElementById('gjs-styles')) {
          const link = document.createElement('link')
          link.id = 'gjs-styles'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css'
          document.head.appendChild(link)

          const style = document.createElement('style')
          style.id = 'gjs-theme'
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
          assetManager: {
            assets: [],
            upload: '/api/upload',      // API route que retorna base64
            showUrlInput: true,
            multiUpload: false,
            inputPlaceholder: 'Cole a URL da imagem aqui…',
          },
          i18n: {
            locale: 'pt',
            detectLocale: false,
            localeFallback: 'en',
            messages: {
              pt: {
                assetManager: {
                  addButton:   'Adicionar',
                  inputUrl:    'Cole a URL da imagem…',
                  modalTitle:  'Selecionar Imagem',
                  uploadTitle: 'Solte arquivos aqui ou clique para fazer upload',
                },
                domComponents: {
                  img: { name: 'Imagem' },
                  text: { name: 'Texto' },
                  link: { name: 'Link' },
                  video: { name: 'Vídeo' },
                  label: { name: 'Rótulo' },
                  default: { name: 'Componente' },
                  wrapper: { name: 'Página' },
                },
                styleManager: {
                  empty: 'Selecione um elemento para editar os estilos',
                  layer: 'Camada',
                },
                traitManager: {
                  empty: 'Selecione um elemento para editar as propriedades',
                  label: 'Atributos do componente',
                },
                panels: { buttons: { titles: {
                  preview:       'Pré-visualizar',
                  fullscreen:    'Tela cheia',
                  'sw-visibility': 'Mostrar bordas',
                  'export-template': 'Exportar',
                  'open-sm':     'Estilos',
                  'open-tm':     'Propriedades',
                  'open-layers': 'Camadas',
                  'open-blocks': 'Blocos',
                } } },
              },
            },
          },
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
          // No built-in views panel — we use our own BlocksDrawer React component
          panels: { defaults: [] },
        }

        const editor: AnyEditor = grapesjs.init(gjsConfig)

        editorRef.current = editor
        onEditorReady?.(editor)

        // ── Move-up / move-down commands ──────────────────────────────────
        editor.Commands.add('custom:move-up', {
          run: (ed: AnyEditor) => {
            const comp = ed.getSelected()
            if (!comp) return
            const parent = comp.parent?.()
            if (!parent) return
            const coll = parent.components()
            const idx = coll.indexOf(comp)
            if (idx <= 0) return
            coll.remove(comp, { temporary: true })
            coll.add(comp, { at: idx - 1 })
            ed.select(comp)
            ed.trigger('change:changesCount')
          },
        })
        editor.Commands.add('custom:move-down', {
          run: (ed: AnyEditor) => {
            const comp = ed.getSelected()
            if (!comp) return
            const parent = comp.parent?.()
            if (!parent) return
            const coll = parent.components()
            const idx = coll.indexOf(comp)
            if (idx >= coll.length - 1) return
            coll.remove(comp, { temporary: true })
            coll.add(comp, { at: idx + 1 })
            ed.select(comp)
            ed.trigger('change:changesCount')
          },
        })

        // Inject ↑↓ buttons into toolbar — replace any existing move buttons to avoid duplicates
        const MOVE_CMDS = new Set(['core:component-prev', 'core:component-next', 'custom:move-up', 'custom:move-down'])
        editor.on('component:selected', (comp: AnyEditor) => {
          try {
            const toolbar: AnyEditor[] = comp.get('toolbar') ?? []
            // Strip any previous move buttons (ours or native GrapesJS)
            const rest = toolbar.filter((t: AnyEditor) => !MOVE_CMDS.has(t.command))
            comp.set('toolbar', [
              { attributes: { title: 'Mover para cima' },  label: '↑', command: 'custom:move-up'   },
              { attributes: { title: 'Mover para baixo' }, label: '↓', command: 'custom:move-down' },
              ...rest,
            ])
          } catch { /* silent */ }
        })


        // ── RTE: inject color picker into the RTE toolbar after it renders ──
        // GrapesJS 0.22.x RichTextEditor.add() requires DOM Node icons,
        // so we patch the toolbar via 'rteToolbarShow' event instead.
        editor.on('rteToolbarShow', ({ el }: AnyEditor) => {
          if (!el) return
          // Avoid duplicates
          if (el.querySelector('.gjs-rte-color-wrap')) return

          const makeColorBtn = (title: string, cmd: string, defaultColor: string) => {
            const wrap = document.createElement('div')
            wrap.className = 'gjs-rte-color-wrap gjs-rte-action'
            wrap.title = title
            wrap.style.cssText = 'display:inline-flex;align-items:center;gap:1px;padding:2px 4px;cursor:pointer;'

            const label = document.createElement('b')
            label.style.cssText = `font-size:13px;${cmd === 'hiliteColor' ? 'background:#facc15;color:#000;padding:0 2px;' : 'color:#fff;'}`
            label.textContent = 'A'

            const inp = document.createElement('input')
            inp.type = 'color'
            inp.value = defaultColor
            inp.style.cssText = 'width:14px;height:14px;border:none;background:none;cursor:pointer;padding:0;'
            inp.addEventListener('input', (e) => {
              e.stopPropagation()
              const sel = editor.Canvas.getWindow()?.getSelection()
              if (sel && !sel.isCollapsed) {
                editor.Canvas.getDocument()?.execCommand('styleWithCSS', false, 'true')
                editor.Canvas.getDocument()?.execCommand(cmd, false, inp.value)
              }
            })
            inp.addEventListener('click', (e) => e.stopPropagation())

            wrap.appendChild(label)
            wrap.appendChild(inp)
            return wrap
          }

          el.appendChild(makeColorBtn('Cor do texto', 'foreColor', '#ffffff'))
          el.appendChild(makeColorBtn('Fundo do texto', 'hiliteColor', '#facc15'))
        })

        // ── Register custom TraitManager type for CSS properties ──────────────
        editor.TraitManager.addType('css-prop', {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          createInput({ trait }: any) {
            const kind = trait.get('inputType') || 'text'
            if (kind === 'color') {
              const wrap = document.createElement('div')
              wrap.style.cssText = 'display:flex;align-items:center;gap:8px;'
              const inp = document.createElement('input')
              inp.type = 'color'
              inp.style.cssText = 'width:38px;height:30px;border:1px solid #2a3d6b;border-radius:6px;background:#1a2744;cursor:pointer;padding:2px;'
              const hex = document.createElement('span')
              hex.style.cssText = 'font-size:11px;color:#94b4d8;font-family:monospace;'
              wrap.appendChild(inp)
              wrap.appendChild(hex)
              inp.addEventListener('input', () => { hex.textContent = inp.value })
              return wrap
            }
            if (kind === 'select') {
              const sel = document.createElement('select')
              sel.style.cssText = 'width:100%;background:#1a2744;color:#c7d6f0;border:1px solid #2a3d6b;border-radius:6px;padding:5px;font-size:12px;'
              const opts: { v: string; l: string }[] = trait.get('selectOptions') || []
              opts.forEach(({ v, l }) => {
                const o = document.createElement('option')
                o.value = v
                o.textContent = l
                sel.appendChild(o)
              })
              return sel
            }
            // number / text
            const inp = document.createElement('input')
            inp.type = kind === 'number' ? 'number' : 'text'
            inp.style.cssText = 'width:100%;background:#1a2744;color:#c7d6f0;border:1px solid #2a3d6b;border-radius:6px;padding:5px;font-size:12px;'
            return inp
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEvent({ elInput, component, trait }: any) {
            const prop = trait.get('cssProp') as string
            const suffix = (trait.get('cssSuffix') as string) || ''
            const kind = trait.get('inputType') || 'text'
            let rawInput: HTMLInputElement | HTMLSelectElement | null = null
            if (kind === 'color') {
              rawInput = elInput.querySelector('input[type="color"]')
            } else {
              rawInput = elInput
            }
            if (prop && rawInput) {
              const val = rawInput.value
              if (val !== undefined && val !== '') {
                component.addStyle({ [prop]: val + suffix })
              }
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onUpdate({ elInput, component, trait }: any) {
            const prop = trait.get('cssProp') as string
            const suffix = (trait.get('cssSuffix') as string) || ''
            const kind = trait.get('inputType') || 'text'
            let current = (component.getStyle(prop) as string) || (trait.get('defaultVal') as string) || ''
            if (suffix && current.endsWith(suffix)) current = current.slice(0, -suffix.length)
            let rawInput: HTMLInputElement | HTMLSelectElement | null = null
            if (kind === 'color') {
              rawInput = elInput.querySelector('input[type="color"]')
              const span = elInput.querySelector('span')
              if (span) span.textContent = current || ''
            } else {
              rawInput = elInput
            }
            if (rawInput && current) (rawInput as HTMLInputElement).value = current
          },
        })

        // ── Enable resizable on image components (new ones) ──────────────────
        editor.DomComponents.addType('image', {
          model: { defaults: { resizable: true } },
        })
        // Also activate resizable on every image already in the HTML on load
        editor.on('component:add', (comp: AnyEditor) => {
          if (comp.get('type') === 'image') comp.set('resizable', true)
        })

        // ── Override asset manager with our custom image picker ──────────────
        editor.on('run:open-assets', () => {
          editor.stopCommand('open-assets')
          const selected = editor.getSelected()
          imageSelectCallbackRef.current = (url: string) => {
            if (!selected) {
              // Sem elemento selecionado — inserir imagem dentro de uma section de container
              editor.getWrapper()?.append({
                tagName: 'section',
                style: {
                  'padding': '40px 20px',
                  'text-align': 'center',
                  'background': 'transparent',
                },
                components: [{
                  type: 'image',
                  attributes: { src: url, alt: '' },
                  style: {
                    'width': '100%',
                    'max-width': '800px',
                    'height': 'auto',
                    'display': 'block',
                    'margin': '0 auto',
                  },
                }],
              })
            } else if (selected.get('type') === 'image') {
              selected.set('src', url)
              selected.set('attributes', { ...selected.get('attributes'), src: url })
            } else {
              selected.addStyle({ 'background-image': `url("${url}")` })
            }
            setTimeout(() => editor.trigger('change:changesCount'), 100)
          }
          setImagePickerOpen(true)
        })

        editor.on('load', () => {
          // ── Panels hidden via CSS (GJS_THEME_CSS) — no JS needed ─────────────
          // Refresh so GrapesJS recalculates canvas bounds with correct layout
          // (critical for resize coordinate calculations to work correctly)
          setTimeout(() => { try { editor.refresh() } catch { /* silent */ } }, 50)

          // ── Remove EMPTY_PAGE_HINT from already-saved pages ───────────────
          // (For new pages it shows the hint; once any block is added it was
          //  previously saved together with the hint. Strip it on every load.)
          try {
            const wrapper = editor.getWrapper()
            wrapper.components().each((c: AnyEditor) => {
              const el = c.getEl?.()
              if (el && el.textContent?.includes('Página em branco')) {
                setTimeout(() => { try { c.remove() } catch { /* silent */ } }, 0)
              }
            })
          } catch { /* silent */ }

          // ── Activate resizable on ALL existing image components ───────────
          try {
            const walkComponents = (comp: AnyEditor) => {
              if (comp.get?.('type') === 'image') comp.set('resizable', true)
              comp.components?.()?.each?.((c: AnyEditor) => walkComponents(c))
            }
            walkComponents(editor.getWrapper())
          } catch { /* silent */ }

          // ── Add CSS Traits to component types ─────────────────────────────
          const TEXT_TRAITS = [
            { type: 'css-prop', name: 'trait-color',    label: '🎨 Cor do texto',   cssProp: 'color',       inputType: 'color', defaultVal: '#000000' },
            { type: 'css-prop', name: 'trait-fontsize',  label: '📏 Tamanho (px)',   cssProp: 'font-size',   inputType: 'number', cssSuffix: 'px', defaultVal: '16' },
            { type: 'css-prop', name: 'trait-fontweight', label: '⚡ Peso da fonte', cssProp: 'font-weight', inputType: 'select', defaultVal: '400',
              selectOptions: [{ v: '300', l: 'Light' }, { v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'SemiBold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'ExtraBold' }] },
            { type: 'css-prop', name: 'trait-textalign', label: '↔ Alinhamento',    cssProp: 'text-align',  inputType: 'select', defaultVal: 'left',
              selectOptions: [{ v: 'left', l: 'Esquerda' }, { v: 'center', l: 'Centro' }, { v: 'right', l: 'Direita' }, { v: 'justify', l: 'Justificado' }] },
            { type: 'css-prop', name: 'trait-lineheight', label: '↕ Altura de linha', cssProp: 'line-height', inputType: 'text', defaultVal: '1.5' },
            { type: 'css-prop', name: 'trait-letterspacing', label: '↔ Espaçamento letras', cssProp: 'letter-spacing', inputType: 'text', defaultVal: '0' },
          ]

          const BG_TRAITS = [
            { type: 'css-prop', name: 'trait-bgcolor',   label: '🎨 Cor de fundo',   cssProp: 'background-color', inputType: 'color',  defaultVal: '#ffffff' },
            { type: 'css-prop', name: 'trait-opacity',   label: '👁 Opacidade (0-1)', cssProp: 'opacity',          inputType: 'number', defaultVal: '1' },
            { type: 'css-prop', name: 'trait-padtop',    label: '↑ Padding topo',    cssProp: 'padding-top',      inputType: 'number', cssSuffix: 'px', defaultVal: '0' },
            { type: 'css-prop', name: 'trait-padbottom', label: '↓ Padding base',    cssProp: 'padding-bottom',   inputType: 'number', cssSuffix: 'px', defaultVal: '0' },
            { type: 'css-prop', name: 'trait-borderrad', label: '⬜ Borda arredondada', cssProp: 'border-radius', inputType: 'number', cssSuffix: 'px', defaultVal: '0' },
          ]

          const BTN_EXTRA_TRAITS = [
            { type: 'css-prop', name: 'trait-btncolor',    label: '🎨 Cor texto botão',    cssProp: 'color',            inputType: 'color',  defaultVal: '#ffffff' },
            { type: 'css-prop', name: 'trait-btnbg',       label: '🎨 Fundo botão',        cssProp: 'background-color', inputType: 'color',  defaultVal: '#2563eb' },
            { type: 'css-prop', name: 'trait-btnpadh',     label: '↔ Padding horizontal',  cssProp: 'padding-left',     inputType: 'number', cssSuffix: 'px', defaultVal: '24' },
            { type: 'css-prop', name: 'trait-btnpadv',     label: '↕ Padding vertical',    cssProp: 'padding-top',      inputType: 'number', cssSuffix: 'px', defaultVal: '12' },
            { type: 'css-prop', name: 'trait-btnrad',      label: '⬜ Borda arredondada',  cssProp: 'border-radius',    inputType: 'number', cssSuffix: 'px', defaultVal: '8' },
          ]

          // Apply to text component
          editor.DomComponents.addType('text', {
            model: { defaults: { traits: TEXT_TRAITS } },
          })

          // Apply to default (wrapper/section) components
          editor.DomComponents.addType('default', {
            model: { defaults: { traits: BG_TRAITS } },
          })

          // Apply to wrapper
          editor.DomComponents.addType('wrapper', {
            model: { defaults: { traits: BG_TRAITS } },
          })

          // Apply to link (button)
          editor.DomComponents.addType('link', {
            model: { defaults: { traits: [...BTN_EXTRA_TRAITS, ...BG_TRAITS] } },
          })

          // ── Inject animation keyframes into canvas iframe ──────────────────
          try {
            const canvasDoc = editor.Canvas.getDocument()
            if (canvasDoc) {
              const style = canvasDoc.createElement('style')
              style.id = 'gjs-animation-keyframes'
              style.textContent = ANIMATION_KEYFRAMES_CSS
              canvasDoc.head.appendChild(style)

              // Pre-load Google Fonts in canvas
              const fontsLink = canvasDoc.createElement('link')
              fontsLink.rel = 'stylesheet'
              fontsLink.href = GOOGLE_FONTS_URL
              canvasDoc.head.appendChild(fontsLink)
            }
          } catch {
            // canvas may not be ready on some edge cases
          }

          // ── Quick access sector: Cor e Fundo ─────────────────────────────
          editor.StyleManager.addSector('gjs-quick', {
            name: '✦ Cor e Fundo',
            open: true,
            properties: [
              { name: 'Cor do texto',       property: 'color',            type: 'color',   defaults: '#000000' },
              { name: 'Cor de fundo',       property: 'background-color', type: 'color',   defaults: '' },
              { name: 'Opacidade',          property: 'opacity',          type: 'slider',  defaults: '1', min: 0, max: 1, step: 0.05 },
              { name: 'Tamanho da fonte',   property: 'font-size',        type: 'integer', defaults: '16', units: ['px', 'em', 'rem', 'vw'] },
              { name: 'Alinhamento',        property: 'text-align',       type: 'radio',   defaults: 'left',
                list: [{ value: 'left', name: '⬛' }, { value: 'center', name: '⬛' }, { value: 'right', name: '⬛' }, { value: 'justify', name: '⬛' }] },
              { name: 'Borda arredondada',  property: 'border-radius',    type: 'integer', defaults: '0',  units: ['px'] },
              { name: 'Padding',            property: 'padding',          type: 'integer', defaults: '0',  units: ['px', 'em'] },
            ],
          })

          // ── Google Fonts sector ───────────────────────────────────────────
          editor.StyleManager.addSector('gjs-fonts', {
            name: '🔤 Fonte Google',
            open: true,
            properties: [
              {
                name: 'Família da fonte',
                property: 'font-family',
                type: 'select',
                defaults: '',
                list: GOOGLE_FONTS_LIST,
                onChange({ value }: { value: string }) {
                  // Dynamically load the font in the canvas iframe
                  try {
                    const canvasDoc = editor.Canvas.getDocument()
                    if (canvasDoc && value) {
                      const fontName = value.replace(/['"]/g, '').trim()
                      const linkId = `gfont-${fontName.replace(/\s/g, '-')}`
                      if (!canvasDoc.getElementById(linkId)) {
                        const link = canvasDoc.createElement('link')
                        link.id = linkId
                        link.rel = 'stylesheet'
                        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`
                        canvasDoc.head.appendChild(link)
                      }
                    }
                  } catch {
                    // silent
                  }
                },
              },
              {
                name: 'Tamanho',
                property: 'font-size',
                type: 'integer',
                defaults: '16',
                units: ['px', 'em', 'rem', 'vw'],
              },
              {
                name: 'Peso',
                property: 'font-weight',
                type: 'select',
                defaults: '400',
                list: [
                  { value: '300', name: 'Light 300' },
                  { value: '400', name: 'Regular 400' },
                  { value: '500', name: 'Medium 500' },
                  { value: '600', name: 'SemiBold 600' },
                  { value: '700', name: 'Bold 700' },
                  { value: '800', name: 'ExtraBold 800' },
                ],
              },
              {
                name: 'Altura de linha',
                property: 'line-height',
                type: 'integer',
                defaults: '1',
                units: ['', 'px', 'em'],
              },
              {
                name: 'Espaçamento letras',
                property: 'letter-spacing',
                type: 'integer',
                defaults: '0',
                units: ['px', 'em'],
              },
              {
                name: 'Cor do texto',
                property: 'color',
                type: 'color',
                defaults: '#000000',
              },
            ],
          })

          // ── CSS Animations sector ─────────────────────────────────────────
          editor.StyleManager.addSector('gjs-animations', {
            name: '🎬 Animação',
            open: false,
            properties: [
              {
                name: 'Efeito',
                property: 'animation-name',
                type: 'select',
                defaults: 'none',
                list: [
                  { value: 'none', name: 'Nenhum' },
                  { value: 'gjs-fadeIn', name: 'Aparecer (Fade In)' },
                  { value: 'gjs-fadeInUp', name: 'Subir aparecendo' },
                  { value: 'gjs-fadeInDown', name: 'Descer aparecendo' },
                  { value: 'gjs-fadeInLeft', name: 'Entrar da esquerda' },
                  { value: 'gjs-fadeInRight', name: 'Entrar da direita' },
                  { value: 'gjs-zoomIn', name: 'Zoom In' },
                  { value: 'gjs-bounceIn', name: 'Pular (Bounce In)' },
                  { value: 'gjs-slideInUp', name: 'Deslizar para cima' },
                ],
              },
              {
                name: 'Duração (s)',
                property: 'animation-duration',
                type: 'integer',
                defaults: '1',
                units: ['s'],
              },
              {
                name: 'Atraso (s)',
                property: 'animation-delay',
                type: 'integer',
                defaults: '0',
                units: ['s'],
              },
              {
                name: 'Repetições',
                property: 'animation-iteration-count',
                type: 'select',
                defaults: '1',
                list: [
                  { value: '1', name: '1×' },
                  { value: '2', name: '2×' },
                  { value: '3', name: '3×' },
                  { value: 'infinite', name: 'Infinito' },
                ],
              },
              {
                name: 'Aceleração',
                property: 'animation-timing-function',
                type: 'select',
                defaults: 'ease',
                list: [
                  { value: 'ease', name: 'Ease (padrão)' },
                  { value: 'ease-in', name: 'Ease In' },
                  { value: 'ease-out', name: 'Ease Out' },
                  { value: 'ease-in-out', name: 'Ease In-Out' },
                  { value: 'linear', name: 'Linear' },
                ],
              },
              {
                name: 'Estado final',
                property: 'animation-fill-mode',
                type: 'select',
                defaults: 'both',
                list: [
                  { value: 'both', name: 'Manter (both)' },
                  { value: 'forwards', name: 'Manter frente (forwards)' },
                  { value: 'backwards', name: 'Manter início (backwards)' },
                  { value: 'none', name: 'Nenhum' },
                ],
              },
            ],
          })

          // ── Image Filters sector ──────────────────────────────────────────
          editor.StyleManager.addSector('gjs-image-filters', {
            name: '🖼 Filtros de Imagem',
            open: false,
            properties: [
              {
                name: 'Opacidade',
                property: 'opacity',
                type: 'slider',
                defaults: '1',
                min: 0,
                max: 1,
                step: 0.05,
              },
              {
                name: 'Brilho (%)',
                property: '--gjs-brightness',
                type: 'integer',
                defaults: '100',
                min: 0,
                max: 200,
                units: [''],
              },
              {
                name: 'Contraste (%)',
                property: '--gjs-contrast',
                type: 'integer',
                defaults: '100',
                min: 0,
                max: 200,
                units: [''],
              },
              {
                name: 'Saturação (%)',
                property: '--gjs-saturate',
                type: 'integer',
                defaults: '100',
                min: 0,
                max: 200,
                units: [''],
              },
              {
                name: 'Escala de cinza (%)',
                property: '--gjs-grayscale',
                type: 'integer',
                defaults: '0',
                min: 0,
                max: 100,
                units: [''],
              },
              {
                name: 'Sépia (%)',
                property: '--gjs-sepia',
                type: 'integer',
                defaults: '0',
                min: 0,
                max: 100,
                units: [''],
              },
              {
                name: 'Desfoque (px)',
                property: '--gjs-blur',
                type: 'integer',
                defaults: '0',
                min: 0,
                max: 20,
                units: [''],
              },
            ],
          })

          // Watch CSS var changes and compile to filter property
          editor.on('styleManager:change', () => {
            const selected = editor.getSelected()
            if (!selected) return
            const style = selected.getStyle()
            const brightness = style['--gjs-brightness'] ?? '100'
            const contrast = style['--gjs-contrast'] ?? '100'
            const saturate = style['--gjs-saturate'] ?? '100'
            const grayscale = style['--gjs-grayscale'] ?? '0'
            const sepia = style['--gjs-sepia'] ?? '0'
            const blur = style['--gjs-blur'] ?? '0'

            const filterVal = [
              `brightness(${brightness}%)`,
              `contrast(${contrast}%)`,
              `saturate(${saturate}%)`,
              `grayscale(${grayscale}%)`,
              `sepia(${sepia}%)`,
              `blur(${blur}px)`,
            ].join(' ')

            const isDefault = filterVal === 'brightness(100%) contrast(100%) saturate(100%) grayscale(0%) sepia(0%) blur(0px)'
            if (!isDefault) {
              selected.addStyle({ filter: filterVal })
            }
          })

          // ── Hover state for buttons ───────────────────────────────────────
          editor.StyleManager.addSector('gjs-hover', {
            name: '🖱 Hover (ao passar o mouse)',
            open: false,
            properties: [
              {
                name: 'Cor de fundo hover',
                property: '--gjs-hover-bg',
                type: 'color',
                defaults: '',
              },
              {
                name: 'Cor do texto hover',
                property: '--gjs-hover-color',
                type: 'color',
                defaults: '',
              },
              {
                name: 'Borda hover',
                property: '--gjs-hover-border',
                type: 'color',
                defaults: '',
              },
            ],
          })

          // Inject hover styles into canvas on change
          editor.on('styleManager:change', () => {
            const selected = editor.getSelected()
            if (!selected) return
            const style = selected.getStyle()
            const hoverBg = style['--gjs-hover-bg']
            const hoverColor = style['--gjs-hover-color']
            const hoverBorder = style['--gjs-hover-border']

            if (!hoverBg && !hoverColor && !hoverBorder) return

            // Build a :hover rule and inject into canvas
            try {
              const canvasDoc = editor.Canvas.getDocument()
              if (!canvasDoc) return
              const cls = [...(selected.getClasses?.() || [])].find(Boolean)
              if (!cls) return
              const styleId = `gjs-hover-style-${cls}`
              let el = canvasDoc.getElementById(styleId)
              if (!el) {
                el = canvasDoc.createElement('style')
                el.id = styleId
                canvasDoc.head.appendChild(el)
              }
              const rules: string[] = []
              if (hoverBg) rules.push(`background-color:${hoverBg}`)
              if (hoverColor) rules.push(`color:${hoverColor}`)
              if (hoverBorder) rules.push(`border-color:${hoverBorder}`)
              el.textContent = `.${cls}:hover{${rules.join(';')}}`
            } catch {
              // silent
            }
          })
        })

        // -- Remove EMPTY_PAGE_HINT when first real block added --
        editor.on('component:add', (comp: AnyEditor) => {
          try {
            const wrapper = editor.getWrapper()
            if (wrapper.components().length < 2) return
            wrapper.components().each((c: AnyEditor) => {
              if (c === comp) return
              const el = c.getEl?.()
              if (el && el.textContent?.includes('P�gina em branco')) {
                setTimeout(() => { try { c.remove() } catch { /* silent */ } }, 0)
              }
            })
          } catch { /* silent */ }
        })

        // -- Refresh canvas after add/remove so page height adapts --
        editor.on('component:add',    () => setTimeout(() => { try { editor.refresh() } catch { /* */ } }, 150))
        editor.on('component:remove', () => setTimeout(() => { try { editor.refresh() } catch { /* */ } }, 150))

        // -- Forward mouse-wheel to canvas iframe --
        editor.on('canvas:frame:load', () => {
          try {
            const canvasEl = editor.Canvas.getElement() as HTMLElement | null
            if (!canvasEl) return
            canvasEl.addEventListener('wheel', (e: WheelEvent) => {
              try {
                const iframeWin = editor.Canvas.getWindow() as Window | null
                if (iframeWin) { iframeWin.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' }); e.stopPropagation() }
              } catch { /* silent */ }
            }, { passive: true })
          } catch { /* silent */ }
        })

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
      <>
        <div
          ref={containerRef}
          className="gjs-custom-container absolute inset-0"
        />

        {imagePickerOpen && typeof document !== 'undefined' &&
          createPortal(
            <ImagePickerModal
              onSelect={(url) => {
                imageSelectCallbackRef.current?.(url)
                setImagePickerOpen(false)
              }}
              onClose={() => setImagePickerOpen(false)}
            />,
            document.body
          )
        }
      </>
    )
  }
)

// ── Google Fonts ────────────────────────────────────────────────────────────

const GOOGLE_FONTS_LIST = [
  { value: '', name: '— Padrão do sistema —' },
  { value: "'Inter', sans-serif", name: 'Inter' },
  { value: "'Roboto', sans-serif", name: 'Roboto' },
  { value: "'Open Sans', sans-serif", name: 'Open Sans' },
  { value: "'Lato', sans-serif", name: 'Lato' },
  { value: "'Montserrat', sans-serif", name: 'Montserrat' },
  { value: "'Poppins', sans-serif", name: 'Poppins' },
  { value: "'Nunito', sans-serif", name: 'Nunito' },
  { value: "'Raleway', sans-serif", name: 'Raleway' },
  { value: "'Oswald', sans-serif", name: 'Oswald' },
  { value: "'Source Sans 3', sans-serif", name: 'Source Sans 3' },
  { value: "'Ubuntu', sans-serif", name: 'Ubuntu' },
  { value: "'Noto Sans', sans-serif", name: 'Noto Sans' },
  { value: "'PT Sans', sans-serif", name: 'PT Sans' },
  { value: "'Mulish', sans-serif", name: 'Mulish' },
  { value: "'DM Sans', sans-serif", name: 'DM Sans' },
  { value: "'Rubik', sans-serif", name: 'Rubik' },
  { value: "'Outfit', sans-serif", name: 'Outfit' },
  { value: "'Figtree', sans-serif", name: 'Figtree' },
  { value: "'Plus Jakarta Sans', sans-serif", name: 'Plus Jakarta Sans' },
  { value: "'Manrope', sans-serif", name: 'Manrope' },
  { value: "'Work Sans', sans-serif", name: 'Work Sans' },
  { value: "'Barlow', sans-serif", name: 'Barlow' },
  { value: "'Karla', sans-serif", name: 'Karla' },
  { value: "'Quicksand', sans-serif", name: 'Quicksand' },
  { value: "'Josefin Sans', sans-serif", name: 'Josefin Sans' },
  { value: "'Playfair Display', serif", name: 'Playfair Display' },
  { value: "'Merriweather', serif", name: 'Merriweather' },
  { value: "'Lora', serif", name: 'Lora' },
  { value: "'PT Serif', serif", name: 'PT Serif' },
  { value: "'Crimson Text', serif", name: 'Crimson Text' },
]

// Pre-load most popular fonts in one CSS import
const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Open+Sans:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&family=Raleway:wght@300;400;500;600;700&family=Oswald:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@300;400;700&family=Lora:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Figtree:wght@300;400;500;600;700&display=swap`

// ── Animation keyframes injected in canvas iframe ───────────────────────────

const ANIMATION_KEYFRAMES_CSS = `
@keyframes gjs-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes gjs-fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gjs-fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gjs-fadeInLeft {
  from { opacity: 0; transform: translateX(-40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gjs-fadeInRight {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes gjs-zoomIn {
  from { opacity: 0; transform: scale(0.75); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes gjs-bounceIn {
  0%   { opacity: 0; transform: scale(0.3); }
  50%  { opacity: 1; transform: scale(1.05); }
  70%  { transform: scale(0.9); }
  100% { transform: scale(1); }
}
@keyframes gjs-slideInUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
`

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
    <p style="font-size:13px;margin:0;line-height:1.6;">Clique no ícone <strong>⊞</strong> na lateral esquerda<br>para adicionar seções e elementos</p>
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

  /* Hide built-in panels — layout via CSS so GrapesJS sees correct canvas dims from start */
  .gjs-pn-views,
  .gjs-pn-views-container,
  .gjs-pn-commands,
  .gjs-pn-options { display: none !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; }
  .gjs-pn-panels { width: 0 !important; min-width: 0 !important; overflow: hidden !important; position: absolute !important; }
  /* Canvas fills full editor area since panels are gone */
  .gjs-cv-canvas { left: 0 !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; }

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

  /* Resize handles — visíveis e fáceis de arrastar */
  .gjs-resizer-h {
    width: 12px !important;
    height: 12px !important;
    background: #3b82f6 !important;
    border: 2px solid #fff !important;
    border-radius: 3px !important;
    z-index: 9999 !important;
  }
  .gjs-resizer-h:hover { background: #60a5fa !important; }

  /* Asset Manager — estilo melhorado */
  .gjs-mdl-title { font-size: 15px !important; font-weight: 600 !important; }
  .gjs-am-assets-header { padding: 8px 10px !important; }
  .gjs-am-asset { cursor: pointer !important; border-radius: 6px !important; transition: background .15s; }
  .gjs-am-asset:hover { background: rgba(96,165,250,.15) !important; }
  .gjs-am-asset-image { border-radius: 4px !important; }
  /* Dica "clique para inserir" abaixo de cada asset */
  .gjs-am-assets::before {
    content: '👆 Clique na imagem para inserir na página';
    display: block;
    font-size: 11px;
    color: #60a5fa;
    text-align: center;
    padding: 6px 8px 2px;
    opacity: .8;
  }

  /* Rte toolbar */
  .gjs-rte-toolbar { background: #1e3a8a !important; border-radius: 8px; }

  /* Canvas frame */
  .gjs-cv-canvas { background: #e5e7eb !important; }

  /* Selected outline */
  .gjs-selected { outline: 2px solid #3b82f6 !important; }
  .gjs-hovered { outline: 1px dashed #93c5fd !important; }

  /* Remove ALL GrapesJS built-in panels — we use our own toolbar + BlocksDrawer */
  .gjs-pn-commands { display: none !important; }
  .gjs-pn-options { display: none !important; }
  .gjs-pn-views { display: none !important; width: 0 !important; min-width: 0 !important; }
  .gjs-pn-views-container { display: none !important; width: 0 !important; min-width: 0 !important; overflow: hidden !important; }
  .gjs-pn-panels { right: 0 !important; left: 0 !important; width: 0 !important; }

  /* Force canvas to fill entire container — GrapesJS reserves space for panels internally */
  .gjs-editor-cont { width: 100% !important; }
  .gjs-editor { width: 100% !important; }
  .gjs-cv-canvas { left: 0 !important; right: 0 !important; width: 100% !important; }

  /* Views switcher (single Blocks tab) */
  .gjs-pn-views button, .panel__switcher button {
    color: #94b4d8 !important;
    border-bottom: 2px solid transparent !important;
    padding: 8px 10px !important;
    font-size: 18px !important;
    min-width: 44px !important;
  }
  .gjs-pn-views button.gjs-pn-active, .panel__switcher button.gjs-pn-active {
    color: #60a5fa !important;
    border-bottom-color: #60a5fa !important;
    background: rgba(96,165,250,0.08) !important;
    border-radius: 4px !important;
  }

  /* Trait manager labels */
  .gjs-trt-trait .gjs-label { color: #94b4d8 !important; font-size: 11px !important; margin-bottom: 2px !important; }
  .gjs-trt-traits { padding: 8px !important; }
  .gjs-trt-trait { margin-bottom: 10px !important; }
  .gjs-trt-trait input[type="color"] { cursor: pointer !important; }
  .gjs-trt-trait input, .gjs-trt-trait select {
    background: #1a2744 !important;
    color: #e2eaf6 !important;
    border: 1px solid #2a3d6b !important;
    border-radius: 6px !important;
    padding: 5px !important;
    width: 100% !important;
    font-size: 12px !important;
  }

  /* Style manager sector headers */
  .gjs-sm-sector .gjs-sm-sector-title {
    cursor: pointer !important;
    padding: 8px 12px !important;
  }
  .gjs-sm-sector .gjs-sm-sector-title:hover { background: #2d4275 !important; }

  /* Color swatch in style manager */
  .gjs-sm-field.gjs-sm-color { width: 40px !important; height: 30px !important; }

  /* RTE toolbar */
  .gjs-rte-toolbar {
    background: #1e3a8a !important;
    border-radius: 8px !important;
    padding: 4px !important;
    display: flex !important;
    align-items: center !important;
    gap: 2px !important;
    flex-wrap: nowrap !important;
  }
  .gjs-rte-actionbar .gjs-rte-action {
    padding: 4px 6px !important;
    border-radius: 4px !important;
    color: #e2eaf6 !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
  }
  .gjs-rte-actionbar .gjs-rte-action:hover { background: rgba(96,165,250,0.2) !important; }
  .gjs-rte-actionbar .gjs-rte-action.gjs-rte-active { background: rgba(96,165,250,0.3) !important; }

  /* Scrollbar in panels */
  .gjs-pn-views-container ::-webkit-scrollbar { width: 4px; }
  .gjs-pn-views-container ::-webkit-scrollbar-track { background: #1a2744; }
  .gjs-pn-views-container ::-webkit-scrollbar-thumb { background: #334d7b; border-radius: 2px; }

  /* Custom container sizing — absolute inset-0 no container raiz */
  .gjs-custom-container { position: absolute; inset: 0; }
  .gjs-custom-container .gjs-editor { height: 100% !important; width: 100% !important; }
  .gjs-custom-container .gjs-editor-cont { height: 100% !important; }
  .gjs-custom-container .gjs-cv-canvas { height: 100% !important; }
`
