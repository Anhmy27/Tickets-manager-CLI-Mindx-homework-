import type { AutomationRuleSet, OdooTicket, TicketAnalysis } from './types.js'

function containsAny(text: string, values: string[]): boolean {
  const normalized = text.toLowerCase()
  return values.some((value) => normalized.includes(value.toLowerCase()))
}

function tagsContainAny(tags: string[], values: string[]): boolean {
  return tags.some((tag) => containsAny(tag, values))
}

export function analyzeTicket(ticket: OdooTicket, rules: AutomationRuleSet): TicketAnalysis {
  if (ticket.stageId !== rules.requiredStageId) {
    return {
      kind: 'skip',
      reason: `skip: stage_id ${ticket.stageId} is not ${rules.requiredStageId}`,
    }
  }

  const tagMatched = tagsContainAny(ticket.tags, rules.tagKeywords)
  if (!tagMatched) {
    return {
      kind: 'skip',
      reason: 'skip: missing login tag',
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
