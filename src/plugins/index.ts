// Registrera roller här
// import * as Example from './roles/example-role'
import * as STRATEGIST from './roles/strategist'
import * as FUTURIST from './roles/futurist'
import * as PSYCHOLOGIST from './roles/psychologist'
import * as SENIOR_ADVISOR from './roles/senior_advisor'
import * as RISK_OFFICER from './roles/risk_officer'
import * as FINANCIAL_ANALYST from './roles/financial_analyst'
import * as CUSTOMER_ADVOCATE from './roles/customer_advocate'
import * as INNOVATION_CATALYST from './roles/innovation_catalyst'
import * as DATA_SCIENTIST from './roles/data_scientist'
import * as LEGAL_ADVISOR from './roles/legal_advisor'
import * as ADVISOR from './roles/advisor'
import * as SUMMARIZER from './roles/summarizer'

export const rolesRegistry = {
  STRATEGIST: STRATEGIST,
  FUTURIST: FUTURIST,
  PSYCHOLOGIST: PSYCHOLOGIST,
  SENIOR_ADVISOR: SENIOR_ADVISOR,
  RISK_OFFICER: RISK_OFFICER,
  FINANCIAL_ANALYST: FINANCIAL_ANALYST,
  CUSTOMER_ADVOCATE: CUSTOMER_ADVOCATE,
  INNOVATION_CATALYST: INNOVATION_CATALYST,
  DATA_SCIENTIST: DATA_SCIENTIST,
  LEGAL_ADVISOR: LEGAL_ADVISOR,
  ADVISOR: ADVISOR,
  SUMMARIZER: SUMMARIZER,
}

export type RoleKey = keyof typeof rolesRegistry
