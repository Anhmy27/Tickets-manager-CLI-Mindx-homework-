import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { runCli } from '../../src/cli.js'
import type { KbClient } from '../../src/clients/kb-client-contract.js'

test('CLI kb search: forwards query and topK to injected KbClient', async () => {
  const calls: Array<{ query: string; topK?: number }> = []
  const kbClient: KbClient = {
    async search(input) {
      calls.push(input)
      return []
    },
    async list() {
      return []
    },
    async retrieve() {
      return {
        id: 'doc-001',
        title: 'Doc',
        content: 'Body',
        nodePath: '/templates/email',
        tags: [],
      }
    },
    async add() {
      return {
        id: 'doc-100',
        title: 'Doc',
        content: 'Body',
        nodePath: '/templates/email',
        tags: [],
      }
    },
  }

  const io = createIo()
  const exitCode = await runCli(
    ['kb', 'search', 'response', '--top-k', '3'],
    io,
    { kbClient }
  )

  assert.equal(exitCode, 0)
  assert.deepEqual(calls, [{ query: 'response', topK: 3 }])
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
