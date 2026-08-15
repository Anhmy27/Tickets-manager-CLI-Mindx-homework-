/**
 * Command handlers and argument parsing for the CLI.
 */

import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  NotFoundError,
  StorageError,
  ValidationError,
} from '../models/errors.js'
import { TicketService } from '../services/ticket-service.js'
import {
  assertTicketUseCases,
  type TicketUseCases,
} from '../services/ticket-use-cases-contract.js'
import { JsonTicketRepository } from '../storage/json-ticket-repository.js'

type CliCommand = 'create' | 'list' | 'show' | 'update' | undefined | string

type CliFlagValue = string | true
type CliFlags = Record<string, CliFlagValue>

interface ParsedCliArguments {
  command: CliCommand
  positionals: string[]
  flags: CliFlags
  dataFile: string
}

interface WritableLike {
  write(chunk: string): void
}

interface CliIo {
  stdout?: WritableLike
  stderr?: WritableLike
}

interface CliDependencies {
  ticketUseCases?: TicketUseCases
}

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const DEFAULT_DATA_FILE = join(packageRoot, 'data', 'tickets.json')

export async function runCli(
  argv: string[],
  io: CliIo = {},
  dependencies: CliDependencies = {}
): Promise<number> {
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
  } catch (error: unknown) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof StorageError
    ) {
      stderr.write(`${error.message}\n`)
      return 1
    }

    stderr.write(`Unexpected error: ${toErrorMessage(error)}\n`)
    return 1
  }
}

function createDefaultTicketUseCases(dataFile: string): TicketUseCases {
  const repository = new JsonTicketRepository(resolve(dataFile))
  return new TicketService(repository)
}

export function parseCliArguments(argv: string[] = []): ParsedCliArguments {
  const [rawCommand, ...rest] = argv
  const command =
    typeof rawCommand === 'string' ? rawCommand.toLowerCase() : rawCommand
  const flags: CliFlags = {}
  const positionals: string[] = []

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (token === undefined) {
      continue
    }

    if (!token.startsWith('--')) {
      positionals.push(token)
      continue
    }

    const key = token.slice(2).toLowerCase()
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
        : DEFAULT_DATA_FILE,
  }
}

async function handleCreate(
  parsed: ParsedCliArguments,
  ticketUseCases: TicketUseCases,
  stdout: WritableLike
): Promise<number> {
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

async function handleList(
  parsed: ParsedCliArguments,
  ticketUseCases: TicketUseCases,
  stdout: WritableLike
): Promise<number> {
  const tickets = await ticketUseCases.listTickets({
    status: parsed.flags.status,
    priority: parsed.flags.priority,
    tags: parsed.flags.tags,
  })

  stdout.write(`${JSON.stringify(tickets, null, 2)}\n`)
  return 0
}

async function handleShow(
  parsed: ParsedCliArguments,
  ticketUseCases: TicketUseCases,
  stdout: WritableLike
): Promise<number> {
  const ticket = await ticketUseCases.showTicket(parsed.positionals[0])

  stdout.write(`${JSON.stringify(ticket, null, 2)}\n`)
  return 0
}

async function handleUpdate(
  parsed: ParsedCliArguments,
  ticketUseCases: TicketUseCases,
  stdout: WritableLike
): Promise<number> {
  const updatedTicket = await ticketUseCases.updateTicket(parsed.positionals[0], {
    status: parsed.flags.status,
  })

  stdout.write(`Updated ticket ${updatedTicket.id}\n`)
  stdout.write(`${JSON.stringify(updatedTicket, null, 2)}\n`)
  return 0
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
