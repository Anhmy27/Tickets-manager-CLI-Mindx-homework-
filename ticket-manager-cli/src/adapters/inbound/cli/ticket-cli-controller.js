/**
 * Inbound adapter / controller for the CLI.
 */

import { resolve } from 'node:path'

import {
  NotFoundError,
  StorageError,
  ValidationError,
} from '../../../domain/shared/errors.js'
import { TicketService } from '../../../application/use-cases/ticket-service.js'
import { JsonTicketRepository } from '../../outbound/json/json-ticket-repository.js'

export async function runCli(argv, io = {}) {
  const stdout = io.stdout ?? process.stdout
  const stderr = io.stderr ?? process.stderr

  try {
    const parsed = parseCliArguments(argv)
    const repository = new JsonTicketRepository(resolve(parsed.dataFile))
    const service = new TicketService(repository)

    switch (parsed.command) {
      case 'create':
        return await handleCreate(parsed, service, stdout)
      case 'list':
        return await handleList(parsed, service, stdout)
      case 'show':
        return await handleShow(parsed, service, stdout)
      case 'update':
        return await handleUpdate(parsed, service, stdout)
      default:
        throw new ValidationError(
          'Unknown command. Use one of: create, list, show, update'
        )
    }
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof StorageError
    ) {
      stderr.write(`${error.message}\n`)
      return 1
    }

    stderr.write(`Unexpected error: ${error.message}\n`)
    return 1
  }
}

export function parseCliArguments(argv = []) {
  const [command, ...rest] = argv
  const flags = {}
  const positionals = []

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }

    const key = token.slice(2)
    const nextToken = rest[index + 1]

    if (nextToken === undefined || nextToken.startsWith('--')) {
      flags[key] = true
      continue
    }

    flags[key] = nextToken
    index += 1
  }

  return {
    command,
    positionals,
    flags,
    dataFile:
      typeof flags['data-file'] === 'string' && flags['data-file'].trim() !== ''
        ? flags['data-file']
        : 'data/tickets.json',
  }
}

async function handleCreate(parsed, service, stdout) {
  const createdTicket = await service.createTicket({
    title: parsed.flags.title,
    description: parsed.flags.description,
    status: parsed.flags.status,
    priority: parsed.flags.priority,
    tags: parsed.flags.tags,
  })

  stdout.write(`Created ticket ${createdTicket.id}\n`)
  stdout.write(`${JSON.stringify(createdTicket, null, 2)}\n`)
  return 0
}

async function handleList(parsed, service, stdout) {
  const tickets = await service.listTickets({
    status: parsed.flags.status,
    priority: parsed.flags.priority,
    tags: parsed.flags.tags,
  })

  stdout.write(`${JSON.stringify(tickets, null, 2)}\n`)
  return 0
}

async function handleShow(parsed, service, stdout) {
  const ticket = await service.showTicket(parsed.positionals[0])

  stdout.write(`${JSON.stringify(ticket, null, 2)}\n`)
  return 0
}

async function handleUpdate(parsed, service, stdout) {
  const updatedTicket = await service.updateTicket(parsed.positionals[0], {
    status: parsed.flags.status,
  })

  stdout.write(`Updated ticket ${updatedTicket.id}\n`)
  stdout.write(`${JSON.stringify(updatedTicket, null, 2)}\n`)
  return 0
}
