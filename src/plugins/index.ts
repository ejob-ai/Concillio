// Registrera roller här
import * as Example from './roles/example-role'
import * as Strategist from './roles/strategist'
import * as Futurist from './roles/futurist'
import * as Psychologist from './roles/psychologist'
import * as Advisor from './roles/advisor'

export const rolesRegistry = {
  EXAMPLE: Example,
  STRATEGIST: Strategist,
  FUTURIST: Futurist,
  PSYCHOLOGIST: Psychologist,
  ADVISOR: Advisor,
}

export type RoleKey = keyof typeof rolesRegistry
