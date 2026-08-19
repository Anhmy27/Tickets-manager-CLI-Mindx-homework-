import * as assert from 'node:assert/strict'
import { access, mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
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

async function withTempRepository(
  run: (context: { dataDir: string; repository: FileSystemKbRepository }) => Promise<void>
): Promise<void> {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-fs-repo-'))

  try {
    const repository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    await run({ dataDir, repository })
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
}

test('FileSystemKbRepository: initializes index and markdown files from seed', async () => {
  await withTempRepository(async ({ dataDir, repository }) => {
    const loaded = repository.listAll()

    assert.equal(loaded.length, 2)
    await access(join(dataDir, 'index.json'), constants.F_OK)
    await access(join(dataDir, 'templates', 'email', 'doc-001.md'), constants.F_OK)
    await access(join(dataDir, 'team', 'devops', 'doc-002.md'), constants.F_OK)
  })
})

test('FileSystemKbRepository.listAll: hydrates content from markdown files', async () => {
  await withTempRepository(async ({ repository }) => {
    const loaded = repository.listAll()

    assert.equal(loaded.length, 2)
    assert.equal(loaded[0]?.content, 'Thank you for reaching out. We will respond shortly.')
    assert.equal(loaded[1]?.nodePath, '/team/devops')
  })
})

test('FileSystemKbRepository.findById: returns full document when id exists', async () => {
  await withTempRepository(async ({ repository }) => {
    const found = repository.findById('doc-001')

    assert.ok(found)
    assert.equal(found.title, 'Customer Response Template')
    assert.equal(found.content, 'Thank you for reaching out. We will respond shortly.')
    assert.deepEqual(found.tags, ['template', 'email'])
  })
})

test('FileSystemKbRepository.findById: returns undefined when id is missing', async () => {
  await withTempRepository(async ({ repository }) => {
    assert.equal(repository.findById('missing-id'), undefined)
  })
})

test('FileSystemKbRepository.hasById: reflects whether document exists', async () => {
  await withTempRepository(async ({ repository }) => {
    assert.equal(repository.hasById('doc-002'), true)
    assert.equal(repository.hasById('missing-id'), false)
  })
})

test('FileSystemKbRepository.listAll: includes documents added via create', async () => {
  await withTempRepository(async ({ repository }) => {
    repository.create({
      id: 'doc-003',
      title: 'Guide',
      content: 'Persist me',
      nodePath: '/docs/guides',
      tags: ['guide'],
    })

    const loaded = repository.listAll()

    assert.equal(loaded.length, 3)
    assert.ok(loaded.some((document) => document.id === 'doc-003'))
  })
})

test('FileSystemKbRepository.create: writes markdown content to expected path', async () => {
  await withTempRepository(async ({ dataDir, repository }) => {
    repository.create({
      id: 'doc-010',
      title: 'Disk Body Check',
      content: 'Body on disk',
      nodePath: '/templates/email',
      tags: ['template'],
    })

    const markdown = await readFile(
      join(dataDir, 'templates', 'email', 'doc-010.md'),
      'utf8'
    )
    assert.equal(markdown, 'Body on disk')
  })
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
  await withTempRepository(async ({ dataDir, repository }) => {
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
  })
})

test('FileSystemKbRepository: skips re-seeding when index.json already exists', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-fs-repo-'))

  try {
    const firstRepository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })
    firstRepository.create({
      id: 'doc-custom',
      title: 'Custom Doc',
      content: 'Only this should remain',
      nodePath: '/templates/sms',
      tags: ['sms'],
    })

    await writeFile(
      join(dataDir, 'templates', 'email', 'doc-001.md'),
      'stale seed content',
      'utf8'
    )

    const secondRepository = new FileSystemKbRepository({
      dataDir,
      seedDocuments,
    })

    assert.equal(secondRepository.listAll().length, 3)
    assert.equal(secondRepository.findById('doc-custom')?.content, 'Only this should remain')
    assert.equal(
      secondRepository.findById('doc-001')?.content,
      'stale seed content'
    )
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})
