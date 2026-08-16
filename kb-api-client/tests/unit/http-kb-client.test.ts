import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  HTTPKBClient,
  KBClientNotFoundError,
  KBClientRequestError,
  KBClientValidationError,
} from '../../src/index.js'

test('HTTPKBClient search: sends POST /search with query/topK', async () => {
  const calls: Array<{ url: string; body: unknown }> = []
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async (input, init) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? '{}')),
      })
      return jsonResponse(200, [
        {
          id: 'doc-001',
          title: 'Customer Response Template',
          nodePath: '/templates/email',
        },
      ])
    },
  })

  const results = await client.search({ query: 'response', topK: 3 })

  assert.equal(calls[0]?.url, 'http://localhost:4100/search')
  assert.deepEqual(calls[0]?.body, { query: 'response', topK: 3 })
  assert.equal(results[0]?.id, 'doc-001')
})

test('HTTPKBClient retrieve: maps 404 to KBClientNotFoundError', async () => {
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async () => jsonResponse(404, { error: 'Document missing-id not found' }),
  })

  await assert.rejects(() => client.retrieve('missing-id'), KBClientNotFoundError)
})

test('HTTPKBClient: maps 400 to KBClientValidationError', async () => {
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async () => jsonResponse(400, { error: 'nodePath is required' }),
  })

  await assert.rejects(
    () => client.list({ nodePath: '' }),
    KBClientValidationError
  )
})

test('HTTPKBClient list: sends POST /list with nodePath and limit', async () => {
  const calls: Array<{ url: string; body: unknown }> = []
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100/',
    fetchImpl: async (input, init) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? '{}')),
      })
      return jsonResponse(200, [])
    },
  })

  const result = await client.list({ nodePath: '/templates/email', limit: 2 })

  assert.deepEqual(result, [])
  assert.equal(calls[0]?.url, 'http://localhost:4100/list')
  assert.deepEqual(calls[0]?.body, { nodePath: '/templates/email', limit: 2 })
})

test('HTTPKBClient retrieve: sends POST /retrieve with docId', async () => {
  const calls: Array<{ url: string; body: unknown }> = []
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async (input, init) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? '{}')),
      })
      return jsonResponse(200, {
        id: 'doc-001',
        title: 'Customer Response Template',
        content: 'Thank you for reaching out.',
        nodePath: '/templates/email',
        tags: ['template', 'email'],
      })
    },
  })

  const doc = await client.retrieve('doc-001')

  assert.equal(doc.id, 'doc-001')
  assert.equal(calls[0]?.url, 'http://localhost:4100/retrieve')
  assert.deepEqual(calls[0]?.body, { docId: 'doc-001' })
})

test('HTTPKBClient add: normalizes comma tags before POST /add', async () => {
  const calls: Array<{ url: string; body: unknown }> = []
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async (input, init) => {
      calls.push({
        url: String(input),
        body: JSON.parse(String(init?.body ?? '{}')),
      })
      return jsonResponse(200, {
        id: 'doc-100',
        title: 'new-template',
        content: 'Body',
        nodePath: '/templates/sms',
        tags: ['sms', 'template'],
      })
    },
  })

  const created = await client.add({
    title: 'new-template',
    content: 'Body',
    nodePath: '/templates/sms',
    tags: 'sms, template, ',
  })

  assert.equal(calls[0]?.url, 'http://localhost:4100/add')
  assert.deepEqual(calls[0]?.body, {
    title: 'new-template',
    content: 'Body',
    nodePath: '/templates/sms',
    tags: ['sms', 'template'],
  })
  assert.deepEqual(created.tags, ['sms', 'template'])
})

test('HTTPKBClient: network error maps to KBClientRequestError', async () => {
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async () => {
      throw new Error('ECONNREFUSED')
    },
  })

  await assert.rejects(() => client.search({ query: 'response' }), KBClientRequestError)
})

test('HTTPKBClient: maps 500 to KBClientRequestError', async () => {
  const client = new HTTPKBClient({
    baseUrl: 'http://localhost:4100',
    fetchImpl: async () => jsonResponse(500, { error: 'Internal server error' }),
  })

  await assert.rejects(
    () => client.search({ query: 'response' }),
    KBClientRequestError
  )
})

function jsonResponse(status: number, payload: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload
    },
    async text() {
      return JSON.stringify(payload)
    },
  } as Response
}
