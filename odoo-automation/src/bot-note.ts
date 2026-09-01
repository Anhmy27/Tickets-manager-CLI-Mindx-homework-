import type { OdooTicket } from './types.js'

export const BOT_AUTOMATION_NOTE_MARKER = '[Bot] Odoo automation decision'

export function buildBotInternalNote(ticket: OdooTicket, reason: string): string {
  return [
    BOT_AUTOMATION_NOTE_MARKER,
    `- Ticket: #${ticket.ticketRef} - ${ticket.name}`,
    `- Email: ${ticket.emailFrom}`,
    `- Decision: ${reason}`,
  ].join('\n')
}
