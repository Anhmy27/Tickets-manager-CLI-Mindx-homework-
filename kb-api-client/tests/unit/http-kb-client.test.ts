import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  HTTPKBClient,
  KBClientNotFoundError,
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
