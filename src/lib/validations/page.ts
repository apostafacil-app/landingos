import { z } from 'zod'

export const generatePageSchema = z.object({
  pageName:            z.string().min(1).max(100),
  businessName:        z.string().min(1).max(100),
  segment:             z.string().min(1).max(100),
  targetAudience:      z.string().min(1).max(500),
  painPoint:           z.string().min(1).max(500),
  desire:              z.string().min(1).max(500),
  offer:               z.string().min(1).max(500),
  websiteUrl:          z.string().url().max(2000).optional().or(z.literal('')),
  colorPalette:        z.string().max(50).optional().or(z.literal('')),
  colorMode:           z.string().max(10).optional().or(z.literal('')),
  // Campos avançados opcionais (framework de quebra de objeções)
  objections:          z.string().max(800).optional().or(z.literal('')),
  guarantee:           z.string().max(200).optional().or(z.literal('')),
  competitors:         z.string().max(500).optional().or(z.literal('')),
  price:               z.string().max(200).optional().or(z.literal('')),
})

export type GeneratePageInput = z.infer<typeof generatePageSchema>
