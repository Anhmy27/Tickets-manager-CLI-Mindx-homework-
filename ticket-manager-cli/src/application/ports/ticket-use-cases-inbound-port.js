/**
 * Inbound port: ticket use cases exposed by the application layer.
 * Inbound adapters (CLI, HTTP, etc.) should call this contract instead of
 * depending on domain entities directly.
 */
export function assertTicketUseCases(ticketUseCases) {
  if (!ticketUseCases) {
    throw new TypeError('Ticket use cases are required.')
  }

  for (const methodName of [
    'createTicket',
    'listTickets',
    'showTicket',
    'updateTicket',
  ]) {
    if (typeof ticketUseCases[methodName] !== 'function') {
      throw new TypeError(
        `Ticket use cases must implement ${methodName}().`
      )
    }
  }
}
