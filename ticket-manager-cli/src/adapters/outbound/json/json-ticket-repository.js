/**
 * Outbound adapter: store tickets in a local JSON file.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { StorageError } from '../../../domain/shared/errors.js'

export class JsonTicketRepository {
  constructor(filePath) {
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      throw new TypeError('A valid JSON ticket file path is required.')
    }

    this.filePath = filePath
  }

  async loadTickets() {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      const data = JSON.parse(raw)

      if (!Array.isArray(data)) {
        throw new StorageError('Ticket storage must be a JSON array.')
      }

      return data
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return []
      }

      if (error instanceof StorageError) {
        throw error
      }

      if (error instanceof SyntaxError) {
        throw new StorageError('Ticket storage is corrupted JSON.')
      }

      throw new StorageError(`Unable to load tickets: ${error.message}`)
    }
  }

  async saveTickets(tickets) {
    if (!Array.isArray(tickets)) {
      throw new StorageError('Tickets payload must be an array.')
    }

    try {
      await mkdir(dirname(this.filePath), { recursive: true })
      await writeFile(this.filePath, JSON.stringify(tickets, null, 2), 'utf8')
    } catch (error) {
      throw new StorageError(`Unable to save tickets: ${error.message}`)
    }
  }
}
