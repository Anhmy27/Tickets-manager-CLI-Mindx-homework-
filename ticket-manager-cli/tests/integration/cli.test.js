import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runCli } from '../../src/cli.js'

test('CLI create: writes ticket fields to JSON and prints success', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(
      [
        'create',
        '--title',
        'Bug login',
        '--description',
        'cannot sign in',
        '--priority',
        'high',
        '--tags',
        'bug,auth',
        '--data-file',
        dataFile,
      ],
      io
    )

    const savedTickets = JSON.parse(await readFile(dataFile, 'utf8'))

    assert.equal(exitCode, 0)
    assert.match(io.stdout.output, /Created ticket/)
    assert.equal(savedTickets.length, 1)
    assert.equal(savedTickets[0].title, 'Bug login')
    assert.equal(savedTickets[0].description, 'cannot sign in')
    assert.equal(savedTickets[0].status, 'open')
    assert.equal(savedTickets[0].priority, 'high')
    assert.deepEqual(savedTickets[0].tags, ['bug', 'auth'])
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI create: prints clear error for invalid input and does not create ticket', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(['create', '--data-file', dataFile], io)

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /title is required/i)
    await assert.rejects(() => readFile(dataFile, 'utf8'), /ENOENT/)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI create: prints clear error for invalid priority', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(
      [
        'create',
        '--title',
        'Bug login',
        '--priority',
        'urgent',
        '--data-file',
        dataFile,
      ],
      io
    )

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /priority must be one of/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI list: filters tickets by status and prints matches', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    await writeFile(
      dataFile,
      JSON.stringify(
        [
          {
            id: '1',
            title: 'Bug login',
            status: 'open',
            priority: 'high',
            tags: ['bug'],
          },
          {
            id: '2',
            title: 'Docs update',
            status: 'closed',
            priority: 'low',
            tags: ['docs'],
          },
        ],
        null,
        2
      ),
      'utf8'
    )

    const exitCode = await runCli(
      ['list', '--status', 'open', '--data-file', dataFile],
      io
    )

    assert.equal(exitCode, 0)
    assert.match(io.stdout.output, /Bug login/)
    assert.doesNotMatch(io.stdout.output, /Docs update/)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI list: prints clear error for invalid status filter', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(
      ['list', '--status', 'done', '--data-file', dataFile],
      io
    )

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /status must be one of/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI list: prints clear error when JSON file is corrupted', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    await writeFile(dataFile, '{ not valid json', 'utf8')

    const exitCode = await runCli(['list', '--data-file', dataFile], io)

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /corrupted/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI show: prints clear not found error', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(
      ['show', 'missing-id', '--data-file', dataFile],
      io
    )

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /not found/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI show: prints clear error when id is missing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(['show', '--data-file', dataFile], io)

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /ticket id is required/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI update: rewrites ticket status in JSON file', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    await writeFile(
      dataFile,
      JSON.stringify(
        [
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
        ],
        null,
        2
      ),
      'utf8'
    )

    const exitCode = await runCli(
      ['update', '1', '--status', 'closed', '--data-file', dataFile],
      io
    )

    const savedTickets = JSON.parse(await readFile(dataFile, 'utf8'))

    assert.equal(exitCode, 0)
    assert.match(io.stdout.output, /Updated ticket 1/)
    assert.equal(savedTickets[0].status, 'closed')
    assert.equal(savedTickets[0].title, 'Bug login')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI update: prints clear error for invalid status', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    await writeFile(
      dataFile,
      JSON.stringify([{ id: '1', title: 'Bug login', status: 'open' }], null, 2),
      'utf8'
    )

    const exitCode = await runCli(
      ['update', '1', '--status', 'done', '--data-file', dataFile],
      io
    )

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /status must be one of/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI update: prints clear error when id is missing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(
      ['update', '--status', 'closed', '--data-file', dataFile],
      io
    )

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /ticket id is required/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI update: prints clear error when status is missing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-cli-'))
  const dataFile = join(tempDir, 'tickets.json')
  const io = createIo()

  try {
    const exitCode = await runCli(['update', '1', '--data-file', dataFile], io)

    assert.equal(exitCode, 1)
    assert.match(io.stderr.output, /status is required/i)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

function createIo() {
  return {
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer(),
  }
}

function createWritableBuffer() {
  return {
    output: '',
    write(chunk) {
      this.output += chunk
    },
  }
}
