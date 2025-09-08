import { z } from 'zod'

// Expandable role key union: include current + allow more uppercase keys
// If you want to strictly enumerate, list all keys here.
export const RoleKey = z.enum([
  'STRATEGIST','FUTURIST','PSYCHOLOGIST','ADVISOR','CFO','CTO','CMO','COO','CRO','CPO'
]).or(z.string().regex(/^[A-Z0-9_]+$/))

export const RoleWeight = z.object({
  role_key: RoleKey,
  weight: z.number().min(0),
  position: z.number().int()
})

export const LineupPreset = z.object({
  id: z.number().int(),
  name: z.string(),
  audience: z.string().nullable().optional(),
  focus: z.string().nullable().optional(),
  roles: z.array(RoleWeight)
})

export const UserLineup = z.object({
  id: z.number().int(),
  owner_uid: z.string(),
  name: z.string(),
  is_public: z.number().int().optional(),
  roles: z.array(RoleWeight),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
})

export type RoleKey = z.infer<typeof RoleKey>
export type RoleWeight = z.infer<typeof RoleWeight>
export type LineupPreset = z.infer<typeof LineupPreset>
export type UserLineup = z.infer<typeof UserLineup>
