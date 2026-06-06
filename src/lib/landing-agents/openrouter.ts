/**
 * Cliente OpenRouter — hub único para Claude, GPT, Perplexity e Gemini.
 *
 * Por que OpenRouter: 1 API key serve todos os provedores, cada agente
 * escolhe o melhor modelo pra sua tarefa sem precisar de N SDKs.
 */

const API_URL = 'https://openrouter.ai/api/v1/chat/completions'

function headers(): Record<string, string> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada')
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://landingos.vercel.app',
    'X-Title': 'LandingOS',
  }
}

export type ChatInput = {
  model: string
  system?: string
  prompt: string
  temperature?: number
  maxTokens?: number
}

export type ChatOutput = {
  text: string
  citations: string[]
  raw: unknown
}

/**
 * Chat/texto. Retorna { text, citations, raw }.
 * `citations` vem populado em modelos Perplexity (sonar*).
 */
export async function chat({
  model, system, prompt, temperature = 0.5, maxTokens = 4000,
}: ChatInput): Promise<ChatOutput> {
  const messages: Array<{ role: string; content: string }> = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenRouter ${res.status} (${model}): ${body.slice(0, 500)}`)
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }>; citations?: string[] } }>
    citations?: string[]
  }
  const msg = data.choices?.[0]?.message ?? {}
  const text = typeof msg.content === 'string'
    ? msg.content
    : (Array.isArray(msg.content) ? msg.content.map(p => p.text ?? '').join('') : '')

  // Perplexity devolve citações no nível da resposta ou da mensagem
  const citations = data.citations || msg.citations || []

  return { text: text.trim(), citations, raw: data }
}

export type ImageOutput = {
  dataUrls: string[]
  text: string
  raw: unknown
}

/**
 * Geração de imagem via OpenRouter `modalities: ["image","text"]`.
 * Modelos como Gemini Nano Banana / GPT-5-image devolvem base64 (data URL).
 *
 * Inclui retry automático (1x) em caso de erro 5xx ou timeout. Gemini Nano
 * Banana costuma estabilizar em 8-15s mas eventualmente passa de 60s.
 */
export async function generateImage({
  model, prompt, n = 1, timeoutMs = 90_000,
}: { model: string; prompt: string; n?: number; timeoutMs?: number }): Promise<ImageOutput> {
  // 1 retry quando a 1ª tentativa cai
  let lastError: Error | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await tryGenerateImage({ model, prompt, n, timeoutMs })
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
      // Loga o erro pra Vercel capturar — sem isso o try/catch do agente
      // mascara o problema e a página sai sem imagem sem aviso.
      console.warn(`[generateImage] attempt ${attempt + 1} failed (${model}):`, lastError.message)
    }
  }
  throw lastError ?? new Error('generateImage falhou sem erro')
}

async function tryGenerateImage(
  { model, prompt, n, timeoutMs }: { model: string; prompt: string; n: number; timeoutMs: number },
): Promise<ImageOutput> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text'],
      }),
      signal: ctl.signal,
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`OpenRouter image ${res.status} (${model}): ${body.slice(0, 300)}`)
    }

    const data = await res.json() as {
      choices?: Array<{ message?: {
        content?: string
        images?: Array<{ image_url?: { url?: string }; url?: string }>
      } }>
    }
    const msg = data.choices?.[0]?.message ?? {}
    const images = msg.images || []
    const dataUrls = images
      .map(img => img?.image_url?.url || img?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, n)

    if (!dataUrls.length) {
      throw new Error(`OpenRouter image (${model}): resposta sem imagem`)
    }

    const text = typeof msg.content === 'string' ? msg.content : ''
    return { dataUrls, text, raw: data }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Utilitário: tenta extrair o primeiro bloco JSON de uma resposta de texto.
 * Modelos às vezes envolvem o JSON em prosa ou markdown ```json ... ```.
 */
export function parseJSON<T = unknown>(text: string): T | null {
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fenced?.[1] ?? text.match(/\{[\s\S]*\}/)?.[0]
    if (!candidate) return null
    return JSON.parse(candidate) as T
  } catch {
    return null
  }
}
