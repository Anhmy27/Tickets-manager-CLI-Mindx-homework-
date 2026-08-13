/**
 * Outbound adapter: store tickets in a local JSON file.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { TicketRepositoryOutboundPort } from '../../../application/ports/ticket-repository-outbound-port.js'
import { StorageError } from '../../../domain/shared/errors.js'
import type { TicketSnapshot } from '../../../domain/tickets/ticket.js'

export class JsonTicketRepository implements TicketRepositoryOutboundPort {
  private readonly filePath: string

  constructor(filePath: string) {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      throw new TypeError('A valid JSON ticket file path is required.')
    }

    this.filePath = filePath
  }

  async loadTickets(): Promise<TicketSnapshot[]> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const data: unknown = JSON.parse(raw)

      if (!Array.isArray(data)) {
        throw new StorageError('Ticket storage must be a JSON array.')
      }

      return data as TicketSnapshot[]
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return []
      }

      if (error instanceof StorageError) {
        throw error
      }

      if (error instanceof SyntaxError) {
        throw new StorageError('Ticket storage is corrupted JSON.')
      }

      throw new StorageError(`Unable to load tickets: ${toErrorMessage(error)}`)
    }
  }

  async saveTickets(tickets: TicketSnapshot[]): Promise<void> {
    if (!Array.isArray(tickets)) {
      throw new StorageError('Tickets payload must be an array.')
    }

    try {
      await mkdir(dirname(this.filePath), { recursive: true })
      await writeFile(this.filePath, JSON.stringify(tickets, null, 2), 'utf8')
    } catch (error: unknown) {
      throw new StorageError(`Unable to save tickets: ${toErrorMessage(error)}`)
    }
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
