import type {
  CreateTicketInput,
  ListTicketFiltersInput,
  TicketSnapshot,
  UpdateTicketInput,
} from '../models/ticket.js'

/**
 * Service contract consumed by command handlers.
 */
export interface TicketUseCases {
  createTicket(input: CreateTicketInput): Promise<TicketSnapshot>
  listTickets(filters?: ListTicketFiltersInput): Promise<TicketSnapshot[]>
  showTicket(id: unknown): Promise<TicketSnapshot>
  updateTicket(id: unknown, input: UpdateTicketInput): Promise<TicketSnapshot>
}

export function assertTicketUseCases(
  useCases: unknown
): asserts useCases is TicketUseCases {
  if (!useCases) {
    throw new TypeError('Ticket use cases are required.')
  }

  for (const methodName of [
    'createTicket',
    'listTickets',
    'showTicket',
    'updateTicket',
  ] as const) {
    if (typeof (useCases as Record<string, unknown>)[methodName] !== 'function') {
      throw new TypeError(`Ticket use cases must implement ${methodName}().`)
    }
  }
}
