import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { NotFoundError, ValidationError } from '../../src/errors/domain-errors.js'
import { InMemoryKbRepository } from '../../src/repositories/in-memory-kb-repository.js'
import { KbService } from '../../src/services/kb-service.js'

function createService(generateId?: () => string): KbService {
  const repository = new InMemoryKbRepository([
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
  ])

  return generateId === undefined
    ? new KbService(repository)
    : new KbService(repository, generateId)
}

test('KbService.search: finds by title/content and respects topK', () => {
  const service = createService()

  const result = service.search({ query: 'template', topK: 1 })

  assert.equal(result.length, 1)
  assert.equal(result[0]?.id, 'doc-001')
})

test('KbService.search: rejects invalid topK', () => {
  const service = createService()

  assert.throws(
    () => service.search({ query: 'template', topK: 0 }),
    (error: unknown) =>
      error instanceof ValidationError &&
      /topK must be a positive integer/i.test(error.message)
  )
})

test('KbService.list: filters by nodePath and limit', () => {
  const service = createService()

  const result = service.list({ nodePath: '/templates/email', limit: 1 })

  assert.equal(result.length, 1)
  assert.equal(result[0]?.nodePath, '/templates/email')
})

test('KbService.list: rejects missing nodePath', () => {
  const service = createService()

  assert.throws(
    () => service.list({ nodePath: '' }),
    (error: unknown) =>
      error instanceof ValidationError && /nodePath is required/i.test(error.message)
  )
})

test('KbService.retrieve: returns document by id', () => {
  const service = createService()

  const doc = service.retrieve({ docId: 'doc-001' })

  assert.equal(doc.id, 'doc-001')
  assert.equal(doc.title, 'Customer Response Template')
})

test('KbService.retrieve: throws not found for unknown id', () => {
  const service = createService()

  assert.throws(
    () => service.retrieve({ docId: 'missing-id' }),
    (error: unknown) =>
      error instanceof NotFoundError && /KB document not found/i.test(error.message)
  )
})

test('KbService.add: creates document and normalizes string tags', () => {
  const service = createService()

  const created = service.add({
    title: 'SMS Template',
    content: 'OTP content',
    nodePath: '/templates/sms',
    tags: 'sms, otp, ',
  })
  const retrieved = service.retrieve({ docId: created.id })

  assert.equal(retrieved.nodePath, '/templates/sms')
  assert.deepEqual(retrieved.tags, ['sms', 'otp'])
})

test('KbService.add: regenerates id when generated id already exists', () => {
  let calls = 0
  const service = createService(() => {
    calls += 1
    return calls === 1 ? 'doc-001' : 'doc-999'
  })

  const created = service.add({
    title: 'SMS Template',
    content: 'Body',
    nodePath: '/templates/sms',
  })

  assert.equal(created.id, 'doc-999')
  assert.equal(calls, 2)
  assert.equal(service.retrieve({ docId: 'doc-001' }).title, 'Customer Response Template')
})

test('KbService.add: rejects invalid tags type', () => {
  const service = createService()

  assert.throws(
    () =>
      service.add({
        title: 'Bad tags',
        content: 'Body',
        nodePath: '/templates/sms',
        tags: 123,
      }),
    (error: unknown) =>
      error instanceof ValidationError &&
      /tags must be a string or an array of strings/i.test(error.message)
  )
})
