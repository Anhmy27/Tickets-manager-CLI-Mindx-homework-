/**
 * Application use cases for tickets.
 */

import { NotFoundError } from '../../domain/shared/errors.js'
import {
  Ticket,
  validateListFilters,
  validateTicketId,
  validateUpdateTicketInput,
} from '../../domain/tickets/ticket.js'
import { assertTicketRepository } from '../ports/ticket-repository-outbound-port.js'

export class TicketService {
  constructor(ticketRepository, options = {}) {
    assertTicketRepository(ticketRepository)

    this.ticketRepository = ticketRepository
    this.idGenerator = options.idGenerator ?? createDefaultId
    this.now = options.now ?? (() => new Date().toISOString())
  }

  async createTicket(input) {
    const createdTicket = Ticket.create({
      id: this.idGenerator(),
      input,
      timestamp: this.now(),
    }).toJSON()
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())

    await this.ticketRepository.saveTickets([...tickets, createdTicket])

    return createdTicket
  }

  async listTickets(filters = {}) {
    const validatedFilters = validateListFilters(filters)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())

    return tickets.filter((ticket) => matchesFilters(ticket, validatedFilters))
  }

  async showTicket(id) {
    const validatedId = validateTicketId(id)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())
    const ticket = tickets.find((item) => item.id === validatedId)

    if (!ticket) {
      throw new NotFoundError(`Ticket ${validatedId} not found`)
    }

    return ticket
  }

  async updateTicket(id, input) {
    const validatedId = validateTicketId(id)
    validateUpdateTicketInput(input)
    const tickets = hydrateTickets(await this.ticketRepository.loadTickets())
    const index = tickets.findIndex((item) => item.id === validatedId)

    if (index < 0) {
      throw new NotFoundError(`Ticket ${validatedId} not found`)
    }

    const updatedTicket = Ticket.fromPersistence(tickets[index])
      .updateStatus(input, this.now())
      .toJSON()

    const updatedTickets = [...tickets]
    updatedTickets[index] = updatedTicket

    await this.ticketRepository.saveTickets(updatedTickets)

    return updatedTicket
  }
}

function createDefaultId() {
  return `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function hydrateTickets(tickets) {
  return tickets.map((ticket) => Ticket.fromPersistence(ticket).toJSON())
}

function matchesFilters(ticket, filters) {
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
