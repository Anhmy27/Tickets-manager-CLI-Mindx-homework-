import * as assert from 'node:assert/strict'
import { access, mkdtemp, rm, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import type { KbDocument } from '../../src/models/kb.js'
import { FileSystemKbRepository } from '../../src/repositories/file-system-kb-repository.js'

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

test('FileSystemKbRepository: initializes index and markdown files from seed', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-fs-repo-'))

  try {
    const repository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    const loaded = repository.listAll()

    assert.equal(loaded.length, 2)
    await access(join(dataDir, 'index.json'), constants.F_OK)
    await access(join(dataDir, 'templates', 'email', 'doc-001.md'), constants.F_OK)
    await access(join(dataDir, 'team', 'devops', 'doc-002.md'), constants.F_OK)
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})

test('FileSystemKbRepository: create persists across repository re-instantiation', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-fs-repo-'))

  try {
    const repository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    repository.create({
      id: 'doc-003',
      title: 'Guide',
      content: 'Persist me',
      nodePath: '/docs/guides',
      tags: ['guide'],
    })

    const restartedRepository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    const loaded = restartedRepository.findById('doc-003')

    assert.ok(loaded)
    assert.equal(loaded.content, 'Persist me')
    await access(join(dataDir, 'docs', 'guides', 'doc-003.md'), constants.F_OK)
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})

test('FileSystemKbRepository: stores metadata in index.json', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-fs-repo-'))

  try {
    const repository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    repository.create({
      id: 'doc-010',
      title: 'Metadata Check',
      content: 'Body',
      nodePath: '/templates/email',
      tags: ['template'],
    })

    const rawIndex = await readFile(join(dataDir, 'index.json'), 'utf8')
    assert.match(rawIndex, /doc-010/)
    assert.match(rawIndex, /templates\/email/)
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})
