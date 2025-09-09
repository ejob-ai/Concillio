// Registrera roller här
import * as Example from './roles/example-role'

export const rolesRegistry = {
  EXAMPLE: Example, // key → modul
  // STRATEGIST: *din modul*,
  // FUTURIST: *din modul*,
  // ...
}

export type RoleKey = keyof typeof rolesRegistry
