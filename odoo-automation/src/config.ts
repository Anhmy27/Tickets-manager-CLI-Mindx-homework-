import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { loadEnvFile } from './load-env.js'
import type { AutomationRuleSet, TicketDirectoryEntry } from './types.js'

export interface AppConfig {
  odooUrl: string
  odooDb: string
  odooLogin: string
  odooApiKey: string
  intakeStageId: number
  rules: AutomationRuleSet
  directory: TicketDirectoryEntry[]
}

export function loadConfig(): AppConfig {
  loadEnvFile(resolve(process.cwd(), '.env'))

  const odooUrl = requiredEnv('ODOO_URL')
  const odooDb = requiredEnv('ODOO_DB')
  const odooLogin = requiredEnv('ODOO_LOGIN')
  const odooApiKey = requiredEnv('ODOO_API_KEY')
  const rulesPath = resolve(process.cwd(), process.env.RULES_FILE ?? 'ticket-rules.json')
  const directoryPath = resolve(process.cwd(), process.env.MOCK_USERS_FILE ?? 'mock-users.json')

  const rules = readJsonFile<AutomationRuleSet>(rulesPath)
  const intakeStageId = rules.requiredStageId
  if (!Number.isInteger(intakeStageId) || intakeStageId <= 0) {
    throw new Error('ticket-rules.json: requiredStageId must be a positive integer')
  }
  if (!Number.isInteger(rules.resolvedStageId) || rules.resolvedStageId <= 0) {
    throw new Error('ticket-rules.json: resolvedStageId must be a positive integer')
  }

  return {
    odooUrl,
    odooDb,
    odooLogin,
    odooApiKey,
    intakeStageId,
    rules,
    directory: readJsonFile<TicketDirectoryEntry[]>(directoryPath),
  }
}

function readJsonFile<T>(filePath: string): T {
  const content = readFileSync(filePath, 'utf8')
  return JSON.parse(content) as T
}

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}
