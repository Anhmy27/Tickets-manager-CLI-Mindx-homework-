import * as assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { runCli } from '../../src/cli.js'
import { MockKBClient } from '../../src/clients/mock-kb-client.js'

test('CLI kb search: finds template by query and respects --top-k', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'search', 'response', '--top-k', '3'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.match(io.stdout.output, /Customer Response Template/)
  assert.match(io.stdout.output, /doc-001/)
  assert.match(io.stdout.output, /\/templates\/email/)
})

test('CLI kb list: lists documents under --node and respects --limit', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'list', '--node', '/templates/email', '--limit', '10'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.match(io.stdout.output, /Customer Response Template/)
  assert.match(io.stdout.output, /Follow-up Email Template/)
  assert.doesNotMatch(io.stdout.output, /DevOps Team Members/)
})

test('CLI kb list: looks up team info by node path', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'list', '--node', '/team/devops'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.match(io.stdout.output, /DevOps Team Members/)
  assert.match(io.stdout.output, /doc-002/)
})

test('CLI kb retrieve: prints full document by id', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'retrieve', 'doc-001'], io, { kbClient })

  assert.equal(exitCode, 0)
  assert.match(io.stdout.output, /doc-001/)
  assert.match(io.stdout.output, /Customer Response Template/)
  assert.match(io.stdout.output, /reaching out/)
  assert.match(io.stdout.output, /\/templates\/email/)
})

test('CLI kb retrieve: prints not found error and exits 1', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'retrieve', 'missing-id'], io, { kbClient })

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /not found/i)
})

test('CLI kb add: reads markdown file and creates document', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kb-cli-'))
  const filePath = join(tempDir, 'new-template.md')
  const io = createIo()
  const kbClient = new MockKBClient()

  try {
    await writeFile(filePath, 'Your verification code is 123456', 'utf8')

    const exitCode = await runCli(
      [
        'kb',
        'add',
        '--file',
        filePath,
        '--path',
        '/templates/sms',
        '--tags',
        'sms',
      ],
      io,
      { kbClient }
    )

    assert.equal(exitCode, 0)
    assert.match(io.stdout.output, /Created document/)
    assert.match(io.stdout.output, /\/templates\/sms/)
    assert.match(io.stdout.output, /123456/)
    assert.match(io.stdout.output, /sms/)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI kb add: created document can be retrieved immediately', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'kb-cli-'))
  const filePath = join(tempDir, 'new-template.md')
  const addIo = createIo()
  const retrieveIo = createIo()
  const kbClient = new MockKBClient()

  try {
    await writeFile(filePath, 'Your verification code is 123456', 'utf8')

    const addExitCode = await runCli(
      [
        'kb',
        'add',
        '--file',
        filePath,
        '--path',
        '/templates/sms',
        '--tags',
        'sms',
      ],
      addIo,
      { kbClient }
    )

    const created = extractFirstJsonObject(addIo.stdout.output)
    const retrieveExitCode = await runCli(
      ['kb', 'retrieve', created.id],
      retrieveIo,
      { kbClient }
    )

    assert.equal(addExitCode, 0)
    assert.equal(retrieveExitCode, 0)
    assert.equal(created.nodePath, '/templates/sms')
    assert.match(retrieveIo.stdout.output, /123456/)
    assert.match(retrieveIo.stdout.output, new RegExp(created.id))
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('CLI kb add: prints clear error when file is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    [
      'kb',
      'add',
      '--file',
      'missing-template.md',
      '--path',
      '/templates/sms',
      '--tags',
      'sms',
    ],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /file/i)
})

test('CLI kb search: prints clear error when query is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'search', '--top-k', '3'], io, { kbClient })

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /query is required/i)
})

test('CLI kb list: prints clear error when node path is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'list', '--limit', '10'], io, { kbClient })

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /node/i)
})

test('CLI kb search: prints empty array when no match', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'search', 'zzzz-no-match'], io, { kbClient })

  assert.equal(exitCode, 0)
  assert.deepEqual(JSON.parse(io.stdout.output), [])
})

test('CLI kb search: --top-k limits the number of printed results', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'search', 'template', '--top-k', '1'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.equal(JSON.parse(io.stdout.output).length, 1)
})

test('CLI kb search: prints clear error for invalid --top-k', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'search', 'template', '--top-k', '0'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /top-k/i)
})

test('CLI kb list: --limit limits the number of printed documents', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'list', '--node', '/templates/email', '--limit', '1'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.equal(JSON.parse(io.stdout.output).length, 1)
})

test('CLI kb list: prints clear error for invalid --limit', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'list', '--node', '/templates/email', '--limit', 'abc'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /limit/i)
})

test('CLI kb retrieve: prints clear error when id is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'retrieve'], io, { kbClient })

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /id/i)
})

test('CLI kb add: prints clear error when --file is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'add', '--path', '/templates/sms'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /file is required/i)
})

test('CLI kb add: prints clear error when --path is missing', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(
    ['kb', 'add', '--file', 'new-template.md'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /path is required/i)
})

test('CLI kb: prints clear error for unknown subcommand', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['kb', 'foo'], io, { kbClient })

  assert.equal(exitCode, 1)
  assert.match(io.stderr.output, /unknown kb command/i)
})

test('CLI kb: accepts case-insensitive command and subcommand names', async () => {
  const io = createIo()
  const kbClient = new MockKBClient()

  const exitCode = await runCli(['KB', 'SEARCH', 'response'], io, { kbClient })

  assert.equal(exitCode, 0)
  assert.match(io.stdout.output, /Customer Response Template/)
})

interface WritableBuffer {
  output: string
  write(chunk: string): void
}

function createIo(): { stdout: WritableBuffer; stderr: WritableBuffer } {
  return {
    stdout: createWritableBuffer(),
    stderr: createWritableBuffer(),
  }
}

function createWritableBuffer(): WritableBuffer {
  const buffer: WritableBuffer = {
    output: '',
    write(chunk: string) {
      buffer.output += chunk
    },
  }

  return buffer
}

function extractFirstJsonObject(output: string): {
  id: string
  nodePath: string
} {
  const start = output.indexOf('{')
  const end = output.lastIndexOf('}')

  return JSON.parse(output.slice(start, end + 1)) as {
    id: string
    nodePath: string
  }
}
