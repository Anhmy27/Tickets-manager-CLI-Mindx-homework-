import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { routeKbRequest } from '../../src/routes/kb-routes.js'

test('routeKbRequest: returns 405 for non-POST method', () => {
  const response = routeKbRequest('GET', '/search', {}, {} as never)

  assert.equal(response.status, 405)
  assert.deepEqual(response.payload, { error: 'Method not allowed' })
})

test('routeKbRequest: returns 404 for unknown path', () => {
  const response = routeKbRequest('POST', '/unknown', {}, {} as never)

  assert.equal(response.status, 404)
  assert.deepEqual(response.payload, { error: 'Not found' })
})

test('routeKbRequest: dispatches /search and returns service payload', () => {
  let received: unknown = null
  const service = {
    search(input: unknown) {
      received = input
      return [{ id: 'doc-001', title: 'A', nodePath: '/a' }]
    },
    list() {
      throw new Error('not used')
    },
    retrieve() {
      throw new Error('not used')
    },
    add() {
      throw new Error('not used')
    },
  }

  const body = { query: 'response', topK: 3 }
  const response = routeKbRequest('POST', '/search', body, service as never)

  assert.deepEqual(received, body)
  assert.equal(response.status, 200)
  assert.deepEqual(response.payload, [{ id: 'doc-001', title: 'A', nodePath: '/a' }])
})

test('routeKbRequest: dispatches /add and returns service payload', () => {
  let received: unknown = null
  const service = {
    search() {
      throw new Error('not used')
    },
    list() {
      throw new Error('not used')
    },
    retrieve() {
      throw new Error('not used')
    },
    add(input: unknown) {
      received = input
      return { id: 'doc-010', title: 'Created', content: 'Body', nodePath: '/x', tags: [] }
    },
  }

  const body = { title: 'Created', content: 'Body', nodePath: '/x' }
  const response = routeKbRequest('POST', '/add', body, service as never)

  assert.deepEqual(received, body)
  assert.equal(response.status, 200)
  assert.deepEqual(response.payload, {
    id: 'doc-010',
    title: 'Created',
    content: 'Body',
    nodePath: '/x',
    tags: [],
  })
})
