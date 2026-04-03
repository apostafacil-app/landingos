'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Search, X, Loader2, ImageIcon, ChevronRight } from 'lucide-react'

interface ImageItem {
  url: string
  name?: string
  thumb?: string
  photographer?: string
  alt?: string
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

type Tab = 'mine' | 'pexels'

export function ImagePickerModal({ onSelect, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('mine')
  const [myImages, setMyImages] = useState<ImageItem[]>([])
  const [pexelsImages, setPexelsImages] = useState<ImageItem[]>([])
  const [pexelsQuery, setPexelsQuery] = useState('business')
  const [pexelsPage, setPexelsPage] = useState(1)
  const [pexelsHasMore, setPexelsHasMore] = useState(false)
  const [pexelsError, setPexelsError] = useState('')
  const [loadingMine, setLoadingMine] = useState(false)
  const [loadingPexels, setLoadingPexels] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pexelsInitialized = useRef(false)

  // Load my images on mount
  useEffect(() => {
    loadMyImages()
  }, [])

  const loadMyImages = async () => {
    setLoadingMine(true)
    try {
      const res = await fetch('/api/images/list')
      const data = await res.json()
      setMyImages(data.images || [])
    } catch {
      // silent
    } finally {
      setLoadingMine(false)
    }
  }

  const searchPexels = useCallback(async (query: string, page = 1) => {
    if (!query.trim()) return
    setLoadingPexels(true)
    setPexelsError('')
    try {
      const res = await fetch(`/api/pexels?q=${encodeURIComponent(query)}&page=${page}`)
      const data = await res.json()
      if (data.error) {
        setPexelsError(data.error)
        return
      }
      if (page === 1) {
        setPexelsImages(data.photos || [])
      } else {
        setPexelsImages((prev) => [...prev, ...(data.photos || [])])
      }
      setPexelsHasMore(data.hasMore)
      setPexelsPage(page)
    } catch {
      setPexelsError('Erro ao buscar imagens')
    } finally {
      setLoadingPexels(false)
    }
  }, [])

  // Init Pexels tab on first open
  const handlePexelsTab = () => {
    setTab('pexels')
    if (!pexelsInitialized.current) {
      pexelsInitialized.current = true
      searchPexels('business', 1)
    }
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const newImages: ImageItem[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) newImages.push({ url: data.url, name: data.name || file.name })
      } catch {
        // silent per file
      }
    }
    if (newImages.length > 0) {
      setMyImages((prev) => [...newImages, ...prev])
    }
    setUploading(false)
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleUpload(e.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[900px] max-w-[96vw] h-[620px] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900 text-base">Gerenciador de Imagens</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 border-b border-gray-100 shrink-0">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'mine'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Minhas imagens
            {myImages.length > 0 && (
              <span className="ml-1.5 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                {myImages.length}
              </span>
            )}
          </button>
          <button
            onClick={handlePexelsTab}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === 'pexels'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Banco gratuito (Pexels)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ─── MY IMAGES TAB ─── */}
          {tab === 'mine' && (
            <div className="space-y-4">
              {/* Upload area */}
              <div
                className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-blue-600">
                    <Loader2 size={22} className="animate-spin" />
                    <p className="text-sm font-medium">Enviando imagens…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Upload size={18} className="text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Clique ou arraste para{' '}
                      <span className="text-blue-600">enviar imagens</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, SVG, WEBP ou GIF — máx. 10 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Grid */}
              {loadingMine ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-gray-300" />
                </div>
              ) : myImages.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ImageIcon size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhuma imagem ainda.</p>
                  <p className="text-xs mt-1">Faça seu primeiro upload acima.</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2.5">
                  {myImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => onSelect(img.url)}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all group focus:outline-none focus:border-blue-500"
                      title={img.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.name || 'imagem'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/15 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── PEXELS TAB ─── */}
          {tab === 'pexels' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar em inglês: business, nature, team…"
                    value={pexelsQuery}
                    onChange={(e) => setPexelsQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') searchPexels(pexelsQuery, 1)
                    }}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />
                </div>
                <button
                  onClick={() => searchPexels(pexelsQuery, 1)}
                  disabled={loadingPexels}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                >
                  {loadingPexels && pexelsImages.length === 0 ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Search size={14} />
                  )}
                  Buscar
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex gap-1.5 flex-wrap">
                {['business', 'nature', 'team', 'technology', 'city', 'food', 'health'].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => { setPexelsQuery(s); searchPexels(s, 1) }}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-colors capitalize"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>

              {/* Error */}
              {pexelsError && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  {pexelsError}
                </div>
              )}

              {/* Grid */}
              {loadingPexels && pexelsImages.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-gray-300" />
                </div>
              ) : pexelsImages.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Search size={28} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Busque imagens acima.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2.5">
                    {pexelsImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => onSelect(img.url)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all group focus:outline-none focus:border-blue-500"
                        title={img.photographer ? `📷 ${img.photographer}` : img.alt}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.thumb || img.url}
                          alt={img.alt || 'pexels photo'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/15 transition-all" />
                        {img.photographer && (
                          <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 text-white text-[9px] opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {img.photographer}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {pexelsHasMore && (
                    <button
                      onClick={() => searchPexels(pexelsQuery, pexelsPage + 1)}
                      disabled={loadingPexels}
                      className="w-full py-2.5 text-sm text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {loadingPexels ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                      Carregar mais
                    </button>
                  )}

                  <p className="text-center text-[11px] text-gray-400 pt-1">
                    Imagens por{' '}
                    <a
                      href="https://pexels.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-gray-600"
                    >
                      Pexels
                    </a>{' '}
                    — gratuitas para uso comercial
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
