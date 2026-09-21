import { createInterface, type Interface } from 'node:readline/promises'
import type { Readable, Writable } from 'node:stream'

import type { KbClient } from '../clients/kb-client-contract.js'
import type { KbDocument, KbSearchResult } from '../models/kb.js'
import type { TicketSnapshot } from '../models/ticket.js'
import type { TicketUseCases } from '../services/ticket-use-cases-contract.js'

interface ConsoleIo {
  input: Readable
  output: Writable
  error: Writable
}

interface TicketConsoleDependencies {
  ticketUseCases: TicketUseCases
  kbClient: KbClient
}

export async function runTicketConsole(
  dependencies: TicketConsoleDependencies,
  io: ConsoleIo = {
    input: process.stdin,
    output: process.stdout,
    error: process.stderr,
  }
): Promise<number> {
  const rl = createInterface({
    input: io.input,
    output: io.output,
  })

  try {
    await printHeader(io.output)

    while (true) {
      const choice = await selectOption(rl, io.output, 'Main Menu', [
        'Tickets',
        'Knowledge Base',
        'Exit',
      ])

      if (choice === 0) {
        await runTicketMenu(rl, io.output, io.error, dependencies.ticketUseCases)
      } else if (choice === 1) {
        await runKbMenu(rl, io.output, io.error, dependencies.kbClient)
      } else {
        io.output.write('\nGoodbye!\n')
        return 0
      }
    }
  } finally {
    rl.close()
  }
}

async function printHeader(output: Writable): Promise<void> {
  const width = 39
  const title = 'Ticket manager consolo'
  const leftPad = Math.max(0, Math.floor((width - title.length) / 2))
  const rightPad = Math.max(0, width - title.length - leftPad)

  output.write('\n')
  output.write(`${'='.repeat(width)}\n`)
  output.write(`${' '.repeat(leftPad)}${title}${' '.repeat(rightPad)}\n`)
  output.write(`${'='.repeat(width)}\n`)
}

async function runTicketMenu(
  rl: Interface,
  output: Writable,
  error: Writable,
  ticketUseCases: TicketUseCases
): Promise<void> {
  while (true) {
    const choice = await selectOption(rl, output, 'Tickets', [
      'Create ticket',
      'List tickets',
      'Update status',
      'Back',
    ])

    if (choice === 3) {
      return
    }

    try {
      if (choice === 0) {
        await handleCreateTicket(rl, output, ticketUseCases)
      } else if (choice === 1) {
        await handleListTickets(rl, output, ticketUseCases)
      } else {
        await handleUpdateTicketStatus(rl, output, ticketUseCases)
      }
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error ? unknownError.message : String(unknownError)
      error.write(`Ticket action failed: ${message}\n`)
    }
  }
}

async function runKbMenu(
  rl: Interface,
  output: Writable,
  error: Writable,
  kbClient: KbClient
): Promise<void> {
  while (true) {
    const choice = await selectOption(rl, output, 'Knowledge Base', [
      'Search',
      'List by node',
      'Retrieve by id',
      'Back',
    ])

    if (choice === 3) {
      return
    }

    try {
      if (choice === 0) {
        await handleKbSearch(rl, output, kbClient)
      } else if (choice === 1) {
        await handleKbList(rl, output, kbClient)
      } else {
        await handleKbRetrieve(rl, output, kbClient)
      }
    } catch (unknownError: unknown) {
      const message =
        unknownError instanceof Error ? unknownError.message : String(unknownError)
      error.write(`KB action failed: ${message}\n`)
    }
  }
}

async function handleCreateTicket(
  rl: Interface,
  output: Writable,
  ticketUseCases: TicketUseCases
): Promise<void> {
  output.write('\nCreate Ticket\n')
  const title = await askRequired(rl, 'Title: ')
  const description = await askOptional(rl, 'Description (optional): ')
  const priority = await askOptional(
    rl,
    'Priority [low|medium|high] (default: medium): '
  )
  const status = await askOptional(
    rl,
    'Status [open|in_progress|closed] (default: open): '
  )
  const tags = await askOptional(rl, 'Tags comma-separated (optional): ')

  const createdTicket = await ticketUseCases.createTicket({
    title,
    description,
    priority,
    status,
    tags,
  })

  output.write(`\nCreated ticket ${createdTicket.id}\n`)
  output.write(`${JSON.stringify(createdTicket, null, 2)}\n\n`)
}

async function handleListTickets(
  rl: Interface,
  output: Writable,
  ticketUseCases: TicketUseCases
): Promise<void> {
  output.write('\nList Tickets\n')
  const status = await askOptional(rl, 'Filter status (optional): ')
  const priority = await askOptional(rl, 'Filter priority (optional): ')
  const tags = await askOptional(rl, 'Filter tags (optional): ')

  const tickets = await ticketUseCases.listTickets({
    status,
    priority,
    tags,
  })

  if (tickets.length === 0) {
    output.write('\nNo tickets found.\n\n')
    return
  }

  output.write('\nResults:\n')
  printTicketTable(output, tickets)
  output.write('\n')
}

async function handleUpdateTicketStatus(
  rl: Interface,
  output: Writable,
  ticketUseCases: TicketUseCases
): Promise<void> {
  output.write('\nUpdate Ticket Status\n')
  const id = await askRequired(rl, 'Ticket id: ')
  const status = await askRequired(rl, 'New status [open|in_progress|closed]: ')

  const updatedTicket = await ticketUseCases.updateTicket(id, { status })
  output.write(`\nUpdated ticket ${updatedTicket.id}\n`)
  output.write(`${JSON.stringify(updatedTicket, null, 2)}\n\n`)
}

async function handleKbSearch(
  rl: Interface,
  output: Writable,
  kbClient: KbClient
): Promise<void> {
  output.write('\nKB Search\n')
  const query = await askRequired(rl, 'Query: ')
  const topKInput = await askOptional(rl, 'Top K (optional): ')
  const topK = parseOptionalPositiveInteger(topKInput, 'topK')

  const results = await kbClient.search({
    query,
    ...(topK === undefined ? {} : { topK }),
  })

  printKbSearchResults(output, results)
}

async function handleKbList(
  rl: Interface,
  output: Writable,
  kbClient: KbClient
): Promise<void> {
  output.write('\nKB List\n')
  const rawNodePath = await askRequired(rl, 'Node path (e.g. /templates/email): ')
  const nodePath = normalizeNodePath(rawNodePath)
  const limitInput = await askOptional(rl, 'Limit (optional): ')
  const limit = parseOptionalPositiveInteger(limitInput, 'limit')

  const documents = await kbClient.list({
    nodePath,
    ...(limit === undefined ? {} : { limit }),
  })

  printKbDocuments(output, documents, nodePath)
}

async function handleKbRetrieve(
  rl: Interface,
  output: Writable,
  kbClient: KbClient
): Promise<void> {
  output.write('\nKB Retrieve\n')
  const id = await askRequired(rl, 'Document id: ')
  const document = await kbClient.retrieve(id)
  output.write(`${JSON.stringify(document, null, 2)}\n\n`)
}

function printTicketTable(output: Writable, tickets: TicketSnapshot[]): void {
  output.write('ID       STATUS       PRIORITY  TITLE\n')
  output.write('---------------------------------------------\n')
  for (const ticket of tickets) {
    const row = [
      pad(ticket.id, 8),
      pad(ticket.status, 12),
      pad(ticket.priority, 8),
      ticket.title,
    ].join('  ')
    output.write(`${row}\n`)
  }
}

function printKbSearchResults(output: Writable, results: KbSearchResult[]): void {
  if (results.length === 0) {
    output.write('\nNo KB document matched your query.\n')
    output.write('Try a broader keyword (example: "login", "email", "template").\n\n')
    return
  }

  output.write('\nResults:\n')
  for (const result of results) {
    output.write(`- ${result.id} | ${result.nodePath} | ${result.title}\n`)
  }
  output.write('\n')
}

function printKbDocuments(
  output: Writable,
  documents: KbDocument[],
  nodePath: string
): void {
  if (documents.length === 0) {
    output.write(`\nNode path not found: ${nodePath}\n\n`)
    return
  }

  output.write('\nDocuments:\n')
  for (const document of documents) {
    output.write(`- ${document.id} | ${document.nodePath} | ${document.title}\n`)
  }
  output.write('\n')
}

function pad(value: string, length: number): string {
  return value.length >= length ? value.slice(0, length) : value.padEnd(length)
}

async function selectOption(
  rl: Interface,
  output: Writable,
  title: string,
  options: string[]
): Promise<number> {
  while (true) {
    output.write(`\n${title}\n`)
    options.forEach((option, index) => {
      output.write(`${index + 1}. ${option}\n`)
    })

    const answer = (await rl.question('Choose an option: ')).trim()
    const selectedIndex = Number(answer) - 1

    if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < options.length) {
      return selectedIndex
    }

    output.write('Invalid choice. Please try again.\n')
  }
}

async function askRequired(rl: Interface, label: string): Promise<string> {
  while (true) {
    const value = (await rl.question(label)).trim()
    if (value !== '') {
      return value
    }
  }
}

async function askOptional(rl: Interface, label: string): Promise<string | undefined> {
  const value = (await rl.question(label)).trim()
  return value === '' ? undefined : value
}

function parseOptionalPositiveInteger(
  value: string | undefined,
  fieldName: string
): number | undefined {
  if (value === undefined) {
    return undefined
  }

  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${fieldName} must be a positive integer (example: 5)`)
  }
  return parsedValue
}

function normalizeNodePath(nodePath: string): string {
  const trimmed = nodePath.trim()
  if (trimmed === '') {
    return trimmed
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
