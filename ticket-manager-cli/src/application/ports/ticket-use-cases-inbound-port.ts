import type {
  CreateTicketInput,
  ListTicketFiltersInput,
  TicketSnapshot,
  UpdateTicketInput,
} from '../../domain/tickets/ticket.js'

/**
 * Inbound port: ticket use cases exposed by the application layer.
 * Inbound adapters (CLI, HTTP, etc.) should call this contract instead of
 * depending on domain entities directly.
 */
export interface TicketUseCasesInboundPort {
  createTicket(input: CreateTicketInput): Promise<TicketSnapshot>
  listTickets(filters?: ListTicketFiltersInput): Promise<TicketSnapshot[]>
  showTicket(id: unknown): Promise<TicketSnapshot>
  updateTicket(id: unknown, input: UpdateTicketInput): Promise<TicketSnapshot>
}

export function assertTicketUseCases(
  ticketUseCases: unknown
): asserts ticketUseCases is TicketUseCasesInboundPort {
  if (!ticketUseCases) {
    throw new TypeError('Ticket use cases are required.')
  }

  for (const methodName of [
    'createTicket',
    'listTickets',
    'showTicket',
    'updateTicket',
  ] as const) {
    if (typeof (ticketUseCases as Record<string, unknown>)[methodName] !== 'function') {
      throw new TypeError(`Ticket use cases must implement ${methodName}().`)
    }
  }
}
