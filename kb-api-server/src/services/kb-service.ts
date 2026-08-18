import { NotFoundError, ValidationError } from '../errors/domain-errors.js'
import type {
  KbAddRequest,
  KbDocument,
  KbListRequest,
  KbRetrieveRequest,
  KbSearchRequest,
  KbSearchResult,
} from '../models/kb.js'
import { FileSystemKbRepository } from '../repositories/file-system-kb-repository.js'
import { type KbRepository } from '../repositories/in-memory-kb-repository.js'

const MAX_ID_GENERATION_ATTEMPTS = 32

type GenerateId = () => string

function generateDocumentId(): string {
  return `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

export class KbService {
  constructor(
    private readonly repository: KbRepository,
    private readonly generateId: GenerateId = generateDocumentId
  ) {}

  search(input: KbSearchRequest): KbSearchResult[] {
    const query = normalizeRequiredText(input.query, 'query is required').toLowerCase()
    const topK =
      input.topK === undefined ? undefined : normalizePositiveInteger(input.topK, 'topK')

    const matches = this.repository.listAll().filter((document) => {
      const searchable = `${document.title}\n${document.content}\n${document.nodePath}`.toLowerCase()
      return searchable.includes(query)
    })

    const sliced = topK === undefined ? matches : matches.slice(0, topK)
    return sliced.map((document) => ({
      id: document.id,
      title: document.title,
      nodePath: document.nodePath,
    }))
  }

  list(input: KbListRequest): KbDocument[] {
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')
    const limit =
      input.limit === undefined ? undefined : normalizePositiveInteger(input.limit, 'limit')

    const matches = this.repository
      .listAll()
      .filter((document) => document.nodePath === nodePath)

    return limit === undefined ? matches : matches.slice(0, limit)
  }

  retrieve(input: KbRetrieveRequest): KbDocument {
    const docId = normalizeRequiredText(input.docId, 'document id is required')
    const found = this.repository.findById(docId)
    if (!found) {
      throw new NotFoundError('KB document not found')
    }

    return found
  }

  add(input: KbAddRequest): KbDocument {
    const title = normalizeRequiredText(input.title, 'title is required')
    const content = normalizeRequiredText(input.content, 'content is required')
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')

    const created: KbDocument = {
      id: this.allocateUniqueId(),
      title,
      content,
      nodePath,
      tags: normalizeTags(input.tags),
    }

    this.repository.create(created)
    return created
  }

  private allocateUniqueId(): string {
    for (let attempt = 0; attempt < MAX_ID_GENERATION_ATTEMPTS; attempt += 1) {
      const id = this.generateId()
      if (!this.repository.hasById(id)) {
        return id
      }
    }

    throw new ValidationError('unable to generate a unique document id')
  }
}

interface CreateDefaultKbServiceOptions {
  dataDir: string
  seedDocuments?: KbDocument[]
}

export function createDefaultKbService(
  options: CreateDefaultKbServiceOptions
): KbService {
  const seedDocuments = options.seedDocuments ?? defaultSeedDocuments()
  return new KbService(
    new FileSystemKbRepository({
      dataDir: options.dataDir,
      seedDocuments,
    })
  )
}

function defaultSeedDocuments(): KbDocument[] {
  return [
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
  ]
}

function normalizeRequiredText(value: unknown, message: string): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) {
    throw new ValidationError(message)
  }

  return normalized
}

function normalizePositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`)
  }

  return value
}

function normalizeTags(tags: unknown): string[] {
  if (tags === undefined || tags === null || tags === '') {
    return []
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => {
        if (typeof tag !== 'string') {
          throw new ValidationError('tags must be a string or an array of strings')
        }
        return tag.trim()
      })
      .filter(Boolean)
  }

  throw new ValidationError('tags must be a string or an array of strings')
}
