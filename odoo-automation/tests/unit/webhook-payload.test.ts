import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { extractTicketId } from '../../src/webhook-payload.js'

test('extractTicketId: reads numeric id from flat payload', () => {
  assert.equal(extractTicketId({ id: 14 }), 14)
})

test('extractTicketId: reads id from Odoo field tuple', () => {
  assert.equal(extractTicketId({ id: [14, 'TICK-14'] }), 14)
})

test('extractTicketId: reads nested payload.data.id', () => {
  assert.equal(extractTicketId({ data: { id: '18' } }), 18)
})

test('extractTicketId: returns null for invalid payload', () => {
  assert.equal(extractTicketId({ foo: 'bar' }), null)
  assert.equal(extractTicketId(null), null)
})

test('extractTicketId: rejects non-positive or non-integer ids', () => {
  assert.equal(extractTicketId({ id: 0 }), null)
  assert.equal(extractTicketId({ id: -1 }), null)
  assert.equal(extractTicketId({ id: 12.5 }), null)
  assert.equal(extractTicketId({ id: 'not-number' }), null)
})
