import * as assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { StorageError } from '../../src/domain/shared/errors.js'
import { JsonTicketRepository } from '../../src/adapters/outbound/json/json-ticket-repository.js'
import type { TicketSnapshot } from '../../src/domain/tickets/ticket.js'

test('JsonTicketRepository: creates file and persists tickets', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-storage-'))
  const dataFile = join(tempDir, 'tickets.json')

  try {
    const repository = new JsonTicketRepository(dataFile)
    const tickets: TicketSnapshot[] = [
      {
        id: '1',
        title: 'Bug login',
        description: 'cannot sign in',
        status: 'open',
        priority: 'medium',
        tags: ['bug'],
        createdAt: '2026-08-06T10:00:00.000Z',
        updatedAt: '2026-08-06T10:00:00.000Z',
      },
    ]

    await repository.saveTickets(tickets)

    const loadedTickets = await repository.loadTickets()
    const savedFileContent = await readFile(dataFile, 'utf8')

    assert.deepEqual(loadedTickets, tickets)
    assert.match(savedFileContent, /Bug login/)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('JsonTicketRepository: returns empty list when file is missing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-storage-'))
  const dataFile = join(tempDir, 'missing.json')

  try {
    const repository = new JsonTicketRepository(dataFile)
    const tickets = await repository.loadTickets()

    assert.deepEqual(tickets, [])
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('JsonTicketRepository: throws clear error for corrupted JSON', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-storage-'))
  const dataFile = join(tempDir, 'tickets.json')

  try {
    await writeFile(dataFile, '{ not valid json', 'utf8')

    const repository = new JsonTicketRepository(dataFile)

    await assert.rejects(() => repository.loadTickets(), StorageError)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('JsonTicketRepository: throws clear error when JSON root is not an array', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-storage-'))
  const dataFile = join(tempDir, 'tickets.json')

  try {
    await writeFile(dataFile, JSON.stringify({ tickets: [] }), 'utf8')

    const repository = new JsonTicketRepository(dataFile)

    await assert.rejects(() => repository.loadTickets(), StorageError)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})
