/**
 * Outbound adapter: store tickets in a local JSON file.
 * Intentionally not implemented yet — TDD Red phase.
 */

export class JsonTicketRepository {
  constructor(_filePath) {
    throw new Error('Not implemented: JsonTicketRepository')
  }

  async loadTickets() {
    throw new Error('Not implemented: loadTickets')
  }

  async saveTickets(_tickets) {
    throw new Error('Not implemented: saveTickets')
  }
}
