import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { MockKBClient } from '../../src/clients/mock-kb-client.js'
import { NotFoundError, ValidationError } from '../../src/models/errors.js'

test('search: returns matches by title', async () => {
  const client = new MockKBClient()
  const results = await client.search({ query: 'Customer Response' })

  assert.equal(results.length, 1)
  assert.equal(results[0]?.id, 'doc-001')
  assert.equal(results[0]?.title, 'Customer Response Template')
  assert.equal(results[0]?.nodePath, '/templates/email')
})

test('search: returns matches by content', async () => {
  const client = new MockKBClient()
  const results = await client.search({ query: 'on-call' })

  assert.equal(results.length, 1)
  assert.equal(results[0]?.id, 'doc-002')
  assert.equal(results[0]?.title, 'DevOps Team Members')
})

test('search: supports nodePath filter', async () => {
  const client = new MockKBClient()
  const results = await client.search({
    query: 'template',
    nodePath: '/templates/email',
  })

  assert.ok(results.length >= 1)
  for (const result of results) {
    assert.equal(result.nodePath, '/templates/email')
  }
})

test('search: respects topK', async () => {
  const client = new MockKBClient()
  const results = await client.search({ query: 'template', topK: 1 })

  assert.equal(results.length, 1)
})

test('search: returns empty array when no match', async () => {
  const client = new MockKBClient()
  const results = await client.search({ query: 'zzzz-no-match' })

  assert.deepEqual(results, [])
})

test('list: returns docs in nodePath', async () => {
  const client = new MockKBClient()
  const documents = await client.list({ nodePath: '/templates/email' })

  assert.ok(documents.length >= 2)
  for (const document of documents) {
    assert.equal(document.nodePath, '/templates/email')
  }
})

test('list: respects limit', async () => {
  const client = new MockKBClient()
  const documents = await client.list({
    nodePath: '/templates/email',
    limit: 1,
  })

  assert.equal(documents.length, 1)
})

test('list: returns empty when nodePath not found', async () => {
  const client = new MockKBClient()
  const documents = await client.list({ nodePath: '/missing/path' })

  assert.deepEqual(documents, [])
})

test('retrieve: returns full doc by id', async () => {
  const client = new MockKBClient()
  const document = await client.retrieve('doc-001')

  assert.equal(document.id, 'doc-001')
  assert.equal(document.title, 'Customer Response Template')
  assert.equal(document.nodePath, '/templates/email')
  assert.ok(document.content.includes('reaching out'))
  assert.deepEqual(document.tags, ['template', 'email'])
})

test('retrieve: throws not found for unknown id', async () => {
  const client = new MockKBClient()

  await assert.rejects(() => client.retrieve('missing-id'), NotFoundError)
})

test('add: creates doc with generated id', async () => {
  const client = new MockKBClient()
  const created = await client.add({
    title: 'SMS Template',
    content: 'Your code is 123456',
    nodePath: '/templates/sms',
    tags: ['template', 'sms'],
  })

  assert.equal(typeof created.id, 'string')
  assert.ok(created.id.length > 0)
  assert.notEqual(created.id, 'doc-001')
  assert.equal(created.title, 'SMS Template')
  assert.equal(created.content, 'Your code is 123456')
  assert.equal(created.nodePath, '/templates/sms')
  assert.deepEqual(created.tags, ['template', 'sms'])
})

test('add: persists doc in in-memory dataset for next queries', async () => {
  const client = new MockKBClient()
  const created = await client.add({
    title: 'SMS Template',
    content: 'Your code is 123456',
    nodePath: '/templates/sms',
    tags: ['sms'],
  })

  const retrieved = await client.retrieve(created.id)
  const listed = await client.list({ nodePath: '/templates/sms' })
  const searched = await client.search({ query: '123456' })

  assert.equal(retrieved.id, created.id)
  assert.equal(listed.length, 1)
  assert.equal(listed[0]?.id, created.id)
  assert.equal(searched.length, 1)
  assert.equal(searched[0]?.id, created.id)
})

test('add: rejects duplicated id if id is provided manually', async () => {
  const client = new MockKBClient()

  await assert.rejects(
    () =>
      client.add({
        id: 'doc-001',
        title: 'Duplicate Template',
        content: 'Should not be added',
        nodePath: '/templates/email',
        tags: ['template'],
      }),
    ValidationError
  )
})

test('search: rejects empty query', async () => {
  const client = new MockKBClient()

  await assert.rejects(() => client.search({ query: '   ' }), ValidationError)
})

test('search: rejects invalid topK', async () => {
  const client = new MockKBClient()

  await assert.rejects(
    () => client.search({ query: 'template', topK: 0 }),
    ValidationError
  )
  await assert.rejects(
    () => client.search({ query: 'template', topK: 1.5 }),
    ValidationError
  )
})

test('list: rejects missing nodePath', async () => {
  const client = new MockKBClient()

  await assert.rejects(() => client.list({ nodePath: '' }), ValidationError)
})

test('retrieve: rejects empty id', async () => {
  const client = new MockKBClient()

  await assert.rejects(() => client.retrieve('   '), ValidationError)
})

test('add: rejects missing title, content, or nodePath', async () => {
  const client = new MockKBClient()

  await assert.rejects(
    () =>
      client.add({
        title: '',
        content: 'body',
        nodePath: '/templates/sms',
      }),
    ValidationError
  )
  await assert.rejects(
    () =>
      client.add({
        title: 'SMS Template',
        content: '',
        nodePath: '/templates/sms',
      }),
    ValidationError
  )
  await assert.rejects(
    () =>
      client.add({
        title: 'SMS Template',
        content: 'body',
        nodePath: '',
      }),
    ValidationError
  )
})

test('add: normalizes tags from comma string', async () => {
  const client = new MockKBClient()
  const created = await client.add({
    title: 'SMS Template',
    content: 'Your code is 123456',
    nodePath: '/templates/sms',
    tags: 'sms, template, ',
  })

  assert.deepEqual(created.tags, ['sms', 'template'])
})
