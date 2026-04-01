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
})

export type GeneratePageInput = z.infer<typeof generatePageSchema>
