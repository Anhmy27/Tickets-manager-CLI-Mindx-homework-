import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { NotFoundError, ValidationError } from '../../src/domain/shared/errors.js'
import { TicketService } from '../../src/application/use-cases/ticket-service.js'

test('createTicket: creates ticket with id, defaults, and saves once', async () => {
  const savedPayloads: unknown[] = []
  const repository = {
    async loadTickets() {
      return []
    },
    async saveTickets(tickets: unknown) {
      savedPayloads.push(tickets)
    },
  }

  const service = new TicketService(repository, {
    idGenerator: () => 'ticket-1',
    now: () => '2026-08-06T11:00:00.000Z',
  })

  const ticket = await service.createTicket({
    title: 'Bug login',
    description: 'cannot sign in',
    tags: ['bug'],
  })

  assert.equal(ticket.id, 'ticket-1')
  assert.equal(ticket.title, 'Bug login')
  assert.equal(ticket.description, 'cannot sign in')
  assert.equal(ticket.status, 'open')
  assert.equal(ticket.priority, 'medium')
  assert.deepEqual(ticket.tags, ['bug'])
  assert.equal(ticket.createdAt, '2026-08-06T11:00:00.000Z')
  assert.equal(ticket.updatedAt, '2026-08-06T11:00:00.000Z')
  assert.equal(savedPayloads.length, 1)
  assert.equal((savedPayloads[0] as Array<{ id: string }>)[0]?.id, 'ticket-1')
})

test('createTicket: rejects invalid input before saving', async () => {
  const repository = {
    async loadTickets() {
      return []
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(() => service.createTicket({ title: '' }), ValidationError)
})

test('listTickets: returns only tickets matching status, priority, and tags', async () => {
  const repository = {
    async loadTickets() {
      return [
        {
          id: '1',
          title: 'Bug login',
          description: '',
          status: 'open',
          priority: 'high',
          tags: ['bug', 'auth'],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
        {
          id: '2',
          title: 'Docs update',
          description: '',
          status: 'closed',
          priority: 'low',
          tags: ['docs'],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
        {
          id: '3',
          title: 'API timeout',
          description: '',
          status: 'open',
          priority: 'high',
          tags: ['api'],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
      ]
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)
  const tickets = await service.listTickets({
    status: 'open',
    priority: 'high',
    tags: ['bug'],
  })

  assert.equal(tickets.length, 1)
  assert.equal(tickets[0]?.id, '1')
})

test('listTickets: rejects invalid filters before reading repository data', async () => {
  const repository = {
    async loadTickets() {
      throw new Error('loadTickets should not be called')
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(() => service.listTickets({ status: 'done' }), ValidationError)
})

test('showTicket: returns the matching ticket', async () => {
  const repository = {
    async loadTickets() {
      return [
        {
          id: '1',
          title: 'Bug login',
          description: '',
          status: 'open',
          priority: 'medium',
          tags: [],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
      ]
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)
  const ticket = await service.showTicket('1')

  assert.equal(ticket.id, '1')
  assert.equal(ticket.title, 'Bug login')
})

test('showTicket: throws not found when ticket does not exist', async () => {
  const repository = {
    async loadTickets() {
      return []
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(() => service.showTicket('missing-id'), NotFoundError)
})

test('showTicket: rejects empty id before reading repository data', async () => {
  const repository = {
    async loadTickets() {
      throw new Error('loadTickets should not be called')
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(() => service.showTicket(' '), ValidationError)
})

test('updateTicket: updates only the target ticket status and preserves other fields', async () => {
  let savedTickets: Array<{ status: string }> = []
  const repository = {
    async loadTickets() {
      return [
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
        {
          id: '2',
          title: 'Docs update',
          description: '',
          status: 'open',
          priority: 'low',
          tags: [],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
      ]
    },
    async saveTickets(tickets: Array<{ status: string }>) {
      savedTickets = tickets
    },
  }

  const service = new TicketService(repository, {
    now: () => '2026-08-06T11:00:00.000Z',
  })

  const ticket = await service.updateTicket('1', { status: 'closed' })

  assert.equal(ticket.status, 'closed')
  assert.equal(ticket.title, 'Bug login')
  assert.equal(ticket.description, 'cannot sign in')
  assert.deepEqual(ticket.tags, ['bug'])
  assert.equal(ticket.updatedAt, '2026-08-06T11:00:00.000Z')
  assert.equal(savedTickets[0]?.status, 'closed')
  assert.equal(savedTickets[1]?.status, 'open')
})

test('updateTicket: throws not found when ticket does not exist', async () => {
  const repository = {
    async loadTickets() {
      return []
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(
    () => service.updateTicket('missing-id', { status: 'closed' }),
    NotFoundError
  )
})

test('updateTicket: rejects invalid status before saving', async () => {
  const repository = {
    async loadTickets() {
      return [
        {
          id: '1',
          title: 'Bug login',
          description: '',
          status: 'open',
          priority: 'medium',
          tags: [],
          createdAt: '2026-08-06T10:00:00.000Z',
          updatedAt: '2026-08-06T10:00:00.000Z',
        },
      ]
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(
    () => service.updateTicket('1', { status: 'done' }),
    ValidationError
  )
})

test('updateTicket: rejects missing status before loading repository data', async () => {
  const repository = {
    async loadTickets() {
      throw new Error('loadTickets should not be called')
    },
    async saveTickets() {
      throw new Error('saveTickets should not be called')
    },
  }

  const service = new TicketService(repository)

  await assert.rejects(() => service.updateTicket('1', {}), ValidationError)
})
