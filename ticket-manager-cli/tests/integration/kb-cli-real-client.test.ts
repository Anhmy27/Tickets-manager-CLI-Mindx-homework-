import * as assert from 'node:assert/strict'
import { createServer, type IncomingMessage } from 'node:http'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { runCli } from '../../src/cli.js'
import { HttpKbClientAdapter } from '../../src/clients/http-kb-client-adapter.js'

test('CLI kb real client: search/list/retrieve from HTTP server', async () => {
  const server = await startTestKbApiServer()
  const kbClient = new HttpKbClientAdapter({ baseUrl: server.baseUrl })
  const searchIo = createIo()
  const listIo = createIo()
  const retrieveIo = createIo()

  try {
    const searchExit = await runCli(
      ['kb', 'search', 'response', '--top-k', '3'],
      searchIo,
      { kbClient }
    )
    const listExit = await runCli(
      ['kb', 'list', '--node', '/templates/email', '--limit', '10'],
      listIo,
      { kbClient }
    )
    const retrieveExit = await runCli(['kb', 'retrieve', 'doc-001'], retrieveIo, {
      kbClient,
    })

    assert.equal(searchExit, 0)
    assert.equal(listExit, 0)
    assert.equal(retrieveExit, 0)
    assert.match(searchIo.stdout.output, /Customer Response Template/)
    assert.match(listIo.stdout.output, /Follow-up Email Template/)
    assert.match(retrieveIo.stdout.output, /reaching out/)
  } finally {
    await server.close()
  }
})

test('CLI kb real client: add persists for next retrieve', async () => {
  const server = await startTestKbApiServer()
  const kbClient = new HttpKbClientAdapter({ baseUrl: server.baseUrl })
  const tempDir = await mkdtemp(join(tmpdir(), 'kb-http-cli-'))
  const markdownPath = join(tempDir, 'new-template.md')
  const addIo = createIo()
  const retrieveIo = createIo()

  try {
    await writeFile(markdownPath, 'Your verification code is 123456', 'utf8')
    const addExitCode = await runCli(
      ['kb', 'add', '--file', markdownPath, '--path', '/templates/sms', '--tags', 'sms'],
      addIo,
      { kbClient }
    )

    const created = extractFirstJsonObject(addIo.stdout.output)
    const retrieveExitCode = await runCli(['kb', 'retrieve', created.id], retrieveIo, {
      kbClient,
    })

    assert.equal(addExitCode, 0)
    assert.equal(retrieveExitCode, 0)
    assert.equal(created.nodePath, '/templates/sms')
    assert.match(retrieveIo.stdout.output, /123456/)
  } finally {
    await server.close()
    await rm(tempDir, { recursive: true, force: true })
  }
})

interface KbDoc {
  id: string
  title: string
  content: string
  nodePath: string
  tags: string[]
}

async function startTestKbApiServer(): Promise<{
  baseUrl: string
  close(): Promise<void>
}> {
  const documents: KbDoc[] = [
    {
      id: 'doc-001',
      title: 'Customer Response Template',
      content: 'Thank you for reaching out. We will respond shortly.',
      nodePath: '/templates/email',
      tags: ['template', 'email'],
    },
    {
      id: 'doc-002',
      title: 'DevOps Team Members',
      content: 'On-call schedule and team roster.',
      nodePath: '/team/devops',
      tags: ['team', 'devops'],
    },
    {
      id: 'doc-003',
      title: 'Follow-up Email Template',
      content: 'Please reply to this follow-up email.',
      nodePath: '/templates/email',
      tags: ['template', 'email'],
    },
  ]

  const server = createServer(async (request, response) => {
    if (request.method !== 'POST') {
      response.writeHead(405, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Method not allowed' }))
      return
    }

    const body = await readJsonBody(request)
    switch (request.url) {
      case '/search': {
        const query = String(body.query ?? '').toLowerCase()
        const topK = Number(body.topK ?? 5)
        const result = documents
          .filter((doc) => {
            return (
              doc.title.toLowerCase().includes(query) ||
              doc.content.toLowerCase().includes(query)
            )
          })
          .slice(0, topK)
          .map((doc) => ({
            id: doc.id,
            title: doc.title,
            nodePath: doc.nodePath,
          }))
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(result))
        return
      }
      case '/list': {
        const nodePath = String(body.nodePath ?? '')
        const limit = Number(body.limit ?? 10)
        const result = documents.filter((doc) => doc.nodePath === nodePath).slice(0, limit)
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(result))
        return
      }
      case '/retrieve': {
        const docId = String(body.docId ?? '')
        const found = documents.find((doc) => doc.id === docId)
        if (!found) {
          response.writeHead(404, { 'content-type': 'application/json' })
          response.end(JSON.stringify({ error: `Document ${docId} not found` }))
          return
        }
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(found))
        return
      }
      case '/add': {
        const created: KbDoc = {
          id: `doc-${Date.now()}`,
          title: String(body.title ?? ''),
          content: String(body.content ?? ''),
          nodePath: String(body.nodePath ?? ''),
          tags: Array.isArray(body.tags) ? body.tags.map((tag) => String(tag)) : [],
        }
        documents.push(created)
        response.writeHead(200, { 'content-type': 'application/json' })
        response.end(JSON.stringify(created))
        return
      }
      default:
        response.writeHead(404, { 'content-type': 'application/json' })
        response.end(JSON.stringify({ error: 'Not found' }))
    }
  })

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine test server address')
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }
          resolve()
        })
      })
    },
  }
}

async function readJsonBody(
  request: IncomingMessage
): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

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
