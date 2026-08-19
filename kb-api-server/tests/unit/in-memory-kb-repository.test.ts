import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import type { KbDocument } from '../../src/models/kb.js'
import { InMemoryKbRepository } from '../../src/repositories/in-memory-kb-repository.js'

const seedDocuments: KbDocument[] = [
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
]

function createRepository(): InMemoryKbRepository {
  return new InMemoryKbRepository(seedDocuments)
}

test('InMemoryKbRepository.listAll: returns seeded documents', () => {
  const repository = createRepository()

  const loaded = repository.listAll()

  assert.equal(loaded.length, 2)
  assert.equal(loaded[0]?.id, 'doc-001')
  assert.equal(loaded[1]?.id, 'doc-002')
})

test('InMemoryKbRepository.findById: returns document when id exists', () => {
  const repository = createRepository()

  const found = repository.findById('doc-001')

  assert.ok(found)
  assert.equal(found.title, 'Customer Response Template')
  assert.equal(found.content, 'Thank you for reaching out. We will respond shortly.')
  assert.deepEqual(found.tags, ['template', 'email'])
})

test('InMemoryKbRepository.findById: returns undefined when id is missing', () => {
  const repository = createRepository()

  assert.equal(repository.findById('missing-id'), undefined)
})

test('InMemoryKbRepository.hasById: reflects whether document exists', () => {
  const repository = createRepository()

  assert.equal(repository.hasById('doc-002'), true)
  assert.equal(repository.hasById('missing-id'), false)
})

test('InMemoryKbRepository.create: persists document for listAll and findById', () => {
  const repository = createRepository()

  repository.create({
    id: 'doc-003',
    title: 'Guide',
    content: 'Persist me',
    nodePath: '/docs/guides',
    tags: ['guide'],
  })

  assert.equal(repository.listAll().length, 3)
  const found = repository.findById('doc-003')
  assert.ok(found)
  assert.equal(found.content, 'Persist me')
  assert.equal(repository.hasById('doc-003'), true)
})
