import * as assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const cliRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

test('E2E happy path: create → list → show → update against temp JSON', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'ticket-e2e-'))
  const dataFile = join(tempDir, 'tickets.json')

  try {
    const createResult = await execCli([
      'create',
      '--title',
      'Bug login',
      '--description',
      'cannot sign in',
      '--tags',
      'bug,auth',
      '--data-file',
      dataFile,
    ])

    const createdTicket = extractFirstJsonObject(createResult.stdout)

    assert.match(createResult.stdout, /Created ticket/)
    assert.equal(createdTicket.title, 'Bug login')
    assert.equal(createdTicket.description, 'cannot sign in')
    assert.equal(createdTicket.status, 'open')
    assert.deepEqual(createdTicket.tags, ['bug', 'auth'])

    const listResult = await execCli(['list', '--status', 'open', '--data-file', dataFile])

    assert.match(listResult.stdout, /Bug login/)

    const showResult = await execCli(['show', createdTicket.id, '--data-file', dataFile])

    assert.match(showResult.stdout, new RegExp(createdTicket.id))

    const updateResult = await execCli([
      'update',
      createdTicket.id,
      '--status',
      'closed',
      '--data-file',
      dataFile,
    ])

    const updatedTicket = extractFirstJsonObject(updateResult.stdout)
    const storedTickets = JSON.parse(await readFile(dataFile, 'utf8'))

    assert.match(updateResult.stdout, /Updated ticket/)
    assert.equal(updatedTicket.status, 'closed')
    assert.equal(storedTickets[0].status, 'closed')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

async function execCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(
    process.execPath,
    ['--import', 'tsx', 'src/cli.ts', ...args],
    {
      cwd: cliRoot,
    }
  )
}

interface TicketJson {
  id: string
  title: string
  description: string
  status: string
  tags: string[]
}

function extractFirstJsonObject(output: string): TicketJson {
  const start = output.indexOf('{')
  const end = output.lastIndexOf('}')

  return JSON.parse(output.slice(start, end + 1)) as TicketJson
}
