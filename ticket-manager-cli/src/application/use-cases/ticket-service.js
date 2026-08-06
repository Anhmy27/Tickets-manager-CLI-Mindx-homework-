/**
 * Application use cases for tickets.
 * Intentionally not implemented yet — TDD Red phase.
 */

export class TicketService {
  constructor(_ticketRepository, _options = {}) {
    throw new Error('Not implemented: TicketService')
  }

  async createTicket(_input) {
    throw new Error('Not implemented: createTicket')
  }

  async listTickets(_filters = {}) {
    throw new Error('Not implemented: listTickets')
  }

  async showTicket(_id) {
    throw new Error('Not implemented: showTicket')
  }

  async updateTicket(_id, _input) {
    throw new Error('Not implemented: updateTicket')
  }
}
