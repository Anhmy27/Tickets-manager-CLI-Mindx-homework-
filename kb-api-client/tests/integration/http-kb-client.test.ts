import * as assert from 'node:assert/strict'
import { createServer, type IncomingMessage } from 'node:http'
import { test } from 'node:test'

import { HTTPKBClient } from '../../src/index.js'

test('HTTPKBClient integration: call real HTTP endpoints', async () => {
  const server = await startTestServer()
  const client = new HTTPKBClient({ baseUrl: server.baseUrl })

  try {
    const results = await client.search({ query: 'response', topK: 3 })
    const listed = await client.list({ nodePath: '/templates/email', limit: 10 })
    const doc = await client.retrieve('doc-001')
    const added = await client.add({
      title: 'SMS Template',
      content: 'Your verification code is 123456',
      nodePath: '/templates/sms',
      tags: ['sms'],
    })
    const retrievedAdded = await client.retrieve(added.id)

    assert.equal(results.length, 1)
    assert.equal(listed.length, 2)
    assert.equal(doc.id, 'doc-001')
    assert.equal(added.nodePath, '/templates/sms')
    assert.equal(retrievedAdded.id, added.id)
  } finally {
    await server.close()
  }
})

async function startTestServer(): Promise<{
  baseUrl: string
  close(): Promise<void>
}> {
  const documents = [
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
        const created = {
          id: `doc-${Date.now()}`,
          title: String(body.title),
          content: String(body.content),
          nodePath: String(body.nodePath),
          tags: Array.isArray(body.tags) ? body.tags.map((item) => String(item)) : [],
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
