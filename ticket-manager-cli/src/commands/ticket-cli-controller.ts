/**
 * Command handlers and argument parsing for the CLI.
 */

import { readFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { assertKbClient, type KbClient } from '../clients/kb-client-contract.js'
import { createKbClientFromEnv } from '../clients/create-kb-client.js'
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
  kbClient?: KbClient
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

    if (parsed.command === 'kb') {
      const kbClient = dependencies.kbClient ?? createKbClientFromEnv()
      assertKbClient(kbClient)
      return await handleKbCommand(parsed, kbClient, stdout)
    }

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
          'Unknown command. Use one of: create, list, show, update, kb'
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

async function handleKbCommand(
  parsed: ParsedCliArguments,
  kbClient: KbClient,
  stdout: WritableLike
): Promise<number> {
  const subcommand =
    typeof parsed.positionals[0] === 'string'
      ? parsed.positionals[0].toLowerCase()
      : parsed.positionals[0]

  switch (subcommand) {
    case 'search':
      return await handleKbSearch(parsed, kbClient, stdout)
    case 'list':
      return await handleKbList(parsed, kbClient, stdout)
    case 'retrieve':
      return await handleKbRetrieve(parsed, kbClient, stdout)
    case 'add':
      return await handleKbAdd(parsed, kbClient, stdout)
    default:
      throw new ValidationError(
        'Unknown kb command. Use one of: search, list, retrieve, add'
      )
  }
}

async function handleKbSearch(
  parsed: ParsedCliArguments,
  kbClient: KbClient,
  stdout: WritableLike
): Promise<number> {
  const query = parsed.positionals[1]
  if (typeof query !== 'string' || query.trim() === '') {
    throw new ValidationError('query is required')
  }

  const topK = parseOptionalPositiveInteger(parsed.flags['top-k'], 'top-k')
  const results = await kbClient.search({
    query,
    ...(topK === undefined ? {} : { topK }),
  })

  stdout.write(`${JSON.stringify(results, null, 2)}\n`)
  return 0
}

async function handleKbList(
  parsed: ParsedCliArguments,
  kbClient: KbClient,
  stdout: WritableLike
): Promise<number> {
  const nodePath = parsed.flags.node
  if (typeof nodePath !== 'string' || nodePath.trim() === '') {
    throw new ValidationError('node path is required')
  }

  const limit = parseOptionalPositiveInteger(parsed.flags.limit, 'limit')
  const documents = await kbClient.list({
    nodePath,
    ...(limit === undefined ? {} : { limit }),
  })

  stdout.write(`${JSON.stringify(documents, null, 2)}\n`)
  return 0
}

async function handleKbRetrieve(
  parsed: ParsedCliArguments,
  kbClient: KbClient,
  stdout: WritableLike
): Promise<number> {
  const document = await kbClient.retrieve(parsed.positionals[1] ?? '')

  stdout.write(`${JSON.stringify(document, null, 2)}\n`)
  return 0
}

async function handleKbAdd(
  parsed: ParsedCliArguments,
  kbClient: KbClient,
  stdout: WritableLike
): Promise<number> {
  const filePath = parsed.flags.file
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new ValidationError('file is required')
  }

  const nodePath = parsed.flags.path
  if (typeof nodePath !== 'string' || nodePath.trim() === '') {
    throw new ValidationError('path is required')
  }

  const content = await readKbFile(filePath)
  const tags = parsed.flags.tags
  const createdDocument = await kbClient.add({
    title: titleFromFilePath(filePath),
    content,
    nodePath,
    ...(typeof tags === 'string' ? { tags } : {}),
  })

  stdout.write(`Created document ${createdDocument.id}\n`)
  stdout.write(`${JSON.stringify(createdDocument, null, 2)}\n`)
  return 0
}

async function readKbFile(filePath: string): Promise<string> {
  try {
    return await readFile(resolve(filePath), 'utf8')
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new StorageError(`KB file not found: ${filePath}`)
    }

    throw new StorageError(
      `Unable to read KB file: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

function titleFromFilePath(filePath: string): string {
  return basename(filePath).replace(/\.[^.]+$/, '')
}

function parseOptionalPositiveInteger(
  value: CliFlagValue | undefined,
  fieldName: string
): number | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a positive integer`)
  }

  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`)
  }

  return parsed
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error
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
