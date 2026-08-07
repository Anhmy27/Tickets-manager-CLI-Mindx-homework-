/**
 * Outbound port: persistence for tickets.
 * Any adapter (JSON file, later Mongo, etc.) must implement these methods.
 */
export function assertTicketRepository(ticketRepository) {
  if (!ticketRepository) {
    throw new TypeError('A ticket repository adapter is required.')
  }

  for (const methodName of ['loadTickets', 'saveTickets']) {
    if (typeof ticketRepository[methodName] !== 'function') {
      throw new TypeError(
        `Ticket repository adapter must implement ${methodName}().`
      )
    }
  }
}
