import type { TicketSnapshot } from '../../domain/tickets/ticket.js'

/**
 * Outbound port: persistence for tickets.
 * Any adapter (JSON file, later Mongo, etc.) must implement these methods.
 */
export interface TicketRepositoryOutboundPort {
  loadTickets(): Promise<TicketSnapshot[]>
  saveTickets(tickets: TicketSnapshot[]): Promise<void>
}

export function assertTicketRepository(
  ticketRepository: unknown
): asserts ticketRepository is TicketRepositoryOutboundPort {
  if (!ticketRepository) {
    throw new TypeError('A ticket repository adapter is required.')
  }

  for (const methodName of ['loadTickets', 'saveTickets'] as const) {
    if (typeof (ticketRepository as Record<string, unknown>)[methodName] !== 'function') {
      throw new TypeError(
        `Ticket repository adapter must implement ${methodName}().`
      )
    }
  }
}
