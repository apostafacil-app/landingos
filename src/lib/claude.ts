import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface PageGenerationInput {
  businessName: string
  businessDescription: string
  targetAudience: string
  painPoint: string
  desire: string
  offer: string
  websiteUrl?: string
  websiteContext?: string
}

const SYSTEM_PROMPT = `Você é um especialista em criação de landing pages de alta conversão.
Sua função é gerar o conteúdo estruturado de uma landing page com base nos dados do negócio fornecidos.

Retorne um JSON válido com a seguinte estrutura:
{
  "headline": "título principal impactante",
  "subheadline": "subtítulo de apoio",
  "sections": [
    {
      "type": "hero" | "benefits" | "social_proof" | "offer" | "faq" | "cta",
      "content": { ... }
    }
  ],
  "cta": { "text": "texto do botão", "urgency": "texto de urgência opcional" },
  "seo": { "title": "...", "description": "..." }
}

Regras:
- Linguagem: português brasileiro, tom persuasivo mas honesto
- Foque na dor do cliente e na transformação que o produto oferece
- Inclua pelo menos: hero, 3 benefícios, prova social, oferta e CTA
- Nunca invente dados ou depoimentos — marque como placeholder onde necessário`

export async function generatePageContent(input: PageGenerationInput): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Dados do negócio para criação da landing page:\n${JSON.stringify(input, null, 2)}`,
      },
    ],
    system: SYSTEM_PROMPT,
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Resposta inesperada da IA')
  return content.text
}
