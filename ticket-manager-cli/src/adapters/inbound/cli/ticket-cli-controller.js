/**
 * Inbound adapter / controller for the CLI.
 */

import { resolve } from 'node:path'

import {
  NotFoundError,
  StorageError,
  ValidationError,
} from '../../../domain/shared/errors.js'
import { assertTicketUseCases } from '../../../application/ports/ticket-use-cases-inbound-port.js'
import { TicketService } from '../../../application/use-cases/ticket-service.js'
import { JsonTicketRepository } from '../../outbound/json/json-ticket-repository.js'

export async function runCli(argv, io = {}, dependencies = {}) {
  const stdout = io.stdout ?? process.stdout
  const stderr = io.stderr ?? process.stderr

  try {
    const parsed = parseCliArguments(argv)
    const ticketUseCases =
      dependencies.ticketUseCases ?? createDefaultTicketUseCases(parsed.dataFile)

    assertTicketUseCases(ticketUseCases)

    switch (parsed.command) {
      case 'create':
        return await handleCreate(parsed, ticketUseCases, stdout)
      case 'list':
        return await handleList(parsed, ticketUseCases, stdout)
      case 'show':
        return await handleShow(parsed, ticketUseCases, stdout)
      case 'update':
        return await handleUpdate(parsed, ticketUseCases, stdout)
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

function createDefaultTicketUseCases(dataFile) {
  const repository = new JsonTicketRepository(resolve(dataFile))
  return new TicketService(repository)
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

async function handleCreate(parsed, ticketUseCases, stdout) {
  const createdTicket = await ticketUseCases.createTicket({
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

async function handleList(parsed, ticketUseCases, stdout) {
  const tickets = await ticketUseCases.listTickets({
    status: parsed.flags.status,
    priority: parsed.flags.priority,
    tags: parsed.flags.tags,
  })

  stdout.write(`${JSON.stringify(tickets, null, 2)}\n`)
  return 0
}

async function handleShow(parsed, ticketUseCases, stdout) {
  const ticket = await ticketUseCases.showTicket(parsed.positionals[0])

  stdout.write(`${JSON.stringify(ticket, null, 2)}\n`)
  return 0
}

async function handleUpdate(parsed, ticketUseCases, stdout) {
  const updatedTicket = await ticketUseCases.updateTicket(parsed.positionals[0], {
    status: parsed.flags.status,
  })

  stdout.write(`Updated ticket ${updatedTicket.id}\n`)
  stdout.write(`${JSON.stringify(updatedTicket, null, 2)}\n`)
  return 0
}
