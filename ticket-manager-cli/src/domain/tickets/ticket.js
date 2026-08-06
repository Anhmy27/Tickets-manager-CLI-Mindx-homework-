/**
 * Domain rules for Ticket Manager CLI (Week 2).
 * Intentionally not implemented yet — TDD Red phase.
 *
 * Expected business rules (from Week 2 overview):
 * - create: title (required), description, status, priority, tags
 * - list: filter by status, priority, tags
 * - show: by id
 * - update: change status by id
 * - defaults: status = open, priority = medium, tags = []
 * - allowed status: open | in_progress | closed
 * - allowed priority: low | medium | high
 */

export const TICKET_STATUSES = ['open', 'in_progress', 'closed']
export const TICKET_PRIORITIES = ['low', 'medium', 'high']

export function validateCreateTicketInput(_input) {
  throw new Error('Not implemented: validateCreateTicketInput')
}

export function validateListFilters(_filters) {
  throw new Error('Not implemented: validateListFilters')
}

export function validateTicketId(_id) {
  throw new Error('Not implemented: validateTicketId')
}

export function validateUpdateTicketInput(_input) {
  throw new Error('Not implemented: validateUpdateTicketInput')
}
