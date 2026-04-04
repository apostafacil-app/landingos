import { NextRequest, NextResponse } from 'next/server'

// Max 5 MB per image
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo recebido' }, { status: 400 })
    }

    const urls: string[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `Arquivo muito grande (máx 5 MB): ${file.name}` },
          { status: 413 }
        )
      }

      // Convert to base64 data URL — works without any external storage
      const buffer = Buffer.from(await file.arrayBuffer())
      const mime   = file.type || 'image/png'
      const base64 = buffer.toString('base64')
      urls.push(`data:${mime};base64,${base64}`)
    }

    // GrapesJS expects: { data: ['url1', 'url2', ...] }
    return NextResponse.json({ data: urls })
  } catch (err) {
    console.error('[upload] error:', err)
    return NextResponse.json({ error: 'Erro ao processar upload' }, { status: 500 })
  }
}
