import type { TicketSnapshot } from '../models/ticket.js'

/**
 * Storage contract for tickets in layered architecture.
 */
export interface TicketStorage {
  loadTickets(): Promise<TicketSnapshot[]>
  saveTickets(tickets: TicketSnapshot[]): Promise<void>
}

export function assertTicketStorage(
  storage: unknown
): asserts storage is TicketStorage {
  if (!storage) {
    throw new TypeError('A ticket storage implementation is required.')
  }

  for (const methodName of ['loadTickets', 'saveTickets'] as const) {
    if (typeof (storage as Record<string, unknown>)[methodName] !== 'function') {
      throw new TypeError(
        `Ticket storage implementation must provide ${methodName}().`
      )
    }
  }
}
