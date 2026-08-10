import test from 'node:test'
import assert from 'node:assert/strict'

import { ValidationError } from '../../src/domain/shared/errors.js'
import {
  validateCreateTicketInput,
  validateListFilters,
  validateTicketId,
  validateUpdateTicketInput,
} from '../../src/domain/tickets/ticket.js'

test('create validation: valid title normalizes defaults and optional fields', () => {
  const input = validateCreateTicketInput({
    title: '  Bug login  ',
    description: '  cannot sign in  ',
    tags: 'bug, auth',
  })

  assert.deepEqual(input, {
    title: 'Bug login',
    description: 'cannot sign in',
    status: 'open',
    priority: 'medium',
    tags: ['bug', 'auth'],
  })
})

test('create validation: accepts explicit status, priority, and tags array', () => {
  const input = validateCreateTicketInput({
    title: 'API timeout',
    description: 'slow endpoint',
    status: 'in_progress',
    priority: 'high',
    tags: ['api', 'backend'],
  })

  assert.equal(input.status, 'in_progress')
  assert.equal(input.priority, 'high')
  assert.deepEqual(input.tags, ['api', 'backend'])
})

test('create validation: normalizes status and priority casing', () => {
  const input = validateCreateTicketInput({
    title: 'API timeout',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
  })

  assert.equal(input.status, 'in_progress')
  assert.equal(input.priority, 'high')
})

test('create validation: rejects missing title', () => {
  assert.throws(
    () => validateCreateTicketInput({}),
    (error) =>
      error instanceof ValidationError && /title is required/i.test(error.message)
  )
})

test('create validation: rejects empty title', () => {
  assert.throws(
    () => validateCreateTicketInput({ title: '   ' }),
    (error) =>
      error instanceof ValidationError && /title is required/i.test(error.message)
  )
})

test('create validation: rejects invalid status', () => {
  assert.throws(
    () => validateCreateTicketInput({ title: 'Bug login', status: 'done' }),
    (error) =>
      error instanceof ValidationError && /status must be one of/i.test(error.message)
  )
})

test('create validation: rejects invalid priority', () => {
  assert.throws(
    () => validateCreateTicketInput({ title: 'Bug login', priority: 'urgent' }),
    (error) =>
      error instanceof ValidationError && /priority must be one of/i.test(error.message)
  )
})

test('create validation: rejects tags with unsupported type', () => {
  assert.throws(
    () => validateCreateTicketInput({ title: 'Bug login', tags: 123 }),
    (error) =>
      error instanceof ValidationError &&
      /tags must be a string or an array of strings/i.test(error.message)
  )
})

test('list validation: accepts valid status, priority, and tags filters', () => {
  const filters = validateListFilters({
    status: 'open',
    priority: 'high',
    tags: 'bug,auth',
  })

  assert.deepEqual(filters, {
    status: 'open',
    priority: 'high',
    tags: ['bug', 'auth'],
  })
})

test('list validation: rejects unsupported status filter', () => {
  assert.throws(
    () => validateListFilters({ status: 'done' }),
    (error) =>
      error instanceof ValidationError && /status must be one of/i.test(error.message)
  )
})

test('list validation: rejects unsupported priority filter', () => {
  assert.throws(
    () => validateListFilters({ priority: 'urgent' }),
    (error) =>
      error instanceof ValidationError && /priority must be one of/i.test(error.message)
  )
})

test('list validation: rejects tags filter with unsupported type', () => {
  assert.throws(
    () => validateListFilters({ tags: { name: 'bug' } }),
    (error) =>
      error instanceof ValidationError &&
      /tags must be a string or an array of strings/i.test(error.message)
  )
})

test('show validation: rejects missing ticket id', () => {
  assert.throws(
    () => validateTicketId(' '),
    (error) =>
      error instanceof ValidationError && /ticket id is required/i.test(error.message)
  )
})

test('update validation: requires a valid status', () => {
  assert.throws(
    () => validateUpdateTicketInput({}),
    (error) =>
      error instanceof ValidationError && /status is required/i.test(error.message)
  )

  assert.throws(
    () => validateUpdateTicketInput({ status: 'done' }),
    (error) =>
      error instanceof ValidationError && /status must be one of/i.test(error.message)
  )
})

test('update validation: accepts allowed status values', () => {
  assert.deepEqual(validateUpdateTicketInput({ status: 'closed' }), {
    status: 'closed',
  })
})
