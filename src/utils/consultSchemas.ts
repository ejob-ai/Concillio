import { z } from 'zod'

export const ConsultBodySchema = z.object({
  question: z.string().min(4),
  context: z.record(z.any()).default({}),
  preset_id: z.number().int().positive().optional(),
  lineup: z.object({
    roles: z.array(z.object({
      role_key: z.string().toUpperCase(),
      weight: z.number().min(0),
      position: z.number().int().min(0)
    })).min(3).max(8)
  }).optional()
}).refine(v => !!v.preset_id || !!v.lineup, { message: 'preset_id or lineup required' })

export type ConsultBody = z.infer<typeof ConsultBodySchema>
