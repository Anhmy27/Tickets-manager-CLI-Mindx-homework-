import type { AutomationRuleSet, OdooTicket, TicketAnalysis } from './types.js'

function containsAny(text: string, values: string[]): boolean {
  const normalized = text.toLowerCase()
  return values.some((value) => normalized.includes(value.toLowerCase()))
}

export function analyzeTicket(ticket: OdooTicket, rules: AutomationRuleSet): TicketAnalysis {
  if (ticket.stageId !== rules.requiredStageId) {
    return {
      kind: 'skip',
      reason: `skip: stage_id ${ticket.stageId} is not ${rules.requiredStageId}`,
    }
  }

  const titleMatched = containsAny(ticket.name, rules.titleKeywords)
  const descriptionMatched = containsAny(ticket.description, rules.descriptionKeywords)

  if (titleMatched || descriptionMatched) {
    return {
      kind: 'login_candidate',
      reason: 'matched strong login intent (title/description)',
    }
  }

  return {
    kind: 'skip',
    reason: 'skip: no login signals',
  }
}
