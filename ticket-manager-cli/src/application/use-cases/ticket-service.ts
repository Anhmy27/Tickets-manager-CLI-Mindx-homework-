/**
 * Application use cases for tickets.
 */

import { NotFoundError } from '../../domain/shared/errors.js'
import {
  Ticket,
  type CreateTicketInput,
  type ListTicketFiltersInput,
  type NormalizedTicketFilters,
  type TicketSnapshot,
  type UpdateTicketInput,
  validateListFilters,
  validateTicketId,
  validateUpdateTicketInput,
} from '../../domain/tickets/ticket.js'
import {
  assertTicketRepository,
  type TicketRepositoryOutboundPort,
} from '../ports/ticket-repository-outbound-port.js'
import type { TicketUseCasesInboundPort } from '../ports/ticket-use-cases-inbound-port.js'

interface TicketServiceOptions {
  idGenerator?: () => string
  now?: () => string
}

export class TicketService implements TicketUseCasesInboundPort {
  private readonly ticketRepository: TicketRepositoryOutboundPort
  private readonly idGenerator: () => string
  private readonly now: () => string

  constructor(ticketRepository: unknown, options: TicketServiceOptions = {}) {
    assertTicketRepository(ticketRepository)

    this.ticketRepository = ticketRepository
    this.idGenerator = options.idGenerator ?? createDefaultId
    this.now = options.now ?? (() => new Date().toISOString())
  }

  async createTicket(input: CreateTicketInput): Promise<TicketSnapshot> {
    const createdTicket = Ticket.create({
      id: this.idGenerator(),
      input,
      timestamp: this.now(),
    }).toJSON()
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())

    await this.ticketRepository.saveTickets([...tickets, createdTicket])

    return createdTicket
  }

  async listTickets(
    filters: ListTicketFiltersInput = {}
  ): Promise<TicketSnapshot[]> {
    const validatedFilters = validateListFilters(filters)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())

    return tickets.filter((ticket) => matchesFilters(ticket, validatedFilters))
  }

  async showTicket(id: unknown): Promise<TicketSnapshot> {
    const validatedId = validateTicketId(id)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())
    const ticket = tickets.find((item) => item.id === validatedId)

    if (!ticket) {
      throw new NotFoundError(`Ticket ${validatedId} not found`)
    }

    return ticket
  }

  async updateTicket(
    id: unknown,
    input: UpdateTicketInput
  ): Promise<TicketSnapshot> {
    const validatedId = validateTicketId(id)
    validateUpdateTicketInput(input)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())
    const index = tickets.findIndex((item) => item.id === validatedId)

    if (index < 0) {
      throw new NotFoundError(`Ticket ${validatedId} not found`)
    }

    const updatedTicket = Ticket.fromPersistence(tickets[index]!)
      .updateStatus(input, this.now())
      .toJSON()

    const updatedTickets = [...tickets]
    updatedTickets[index] = updatedTicket

    await this.ticketRepository.saveTickets(updatedTickets)

    return updatedTicket
  }
}

function createDefaultId(): string {
  return `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function hydrateTickets(tickets: TicketSnapshot[]): TicketSnapshot[] {
  return tickets.map((ticket) => Ticket.fromPersistence(ticket).toJSON())
}

function matchesFilters(
  ticket: TicketSnapshot,
  filters: NormalizedTicketFilters
): boolean {
  if (filters.status !== undefined && ticket.status !== filters.status) {
    return false
  }

  if (filters.priority !== undefined && ticket.priority !== filters.priority) {
    return false
  }

  if (filters.tags !== undefined && filters.tags.length > 0) {
    const ticketTags = Array.isArray(ticket.tags) ? ticket.tags : []
    for (const tag of filters.tags) {
      if (!ticketTags.includes(tag)) {
        return false
      }
    }
  }

  return true
}
