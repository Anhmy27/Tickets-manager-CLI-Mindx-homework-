import { NotFoundError, ValidationError } from '../models/errors.js'
import type {
  KbAddInput,
  KbDocument,
  KbListInput,
  KbSearchInput,
  KbSearchResult,
} from '../models/kb.js'
import type { KbClient } from './kb-client-contract.js'

const DEFAULT_TOP_K = 5
const DEFAULT_LIST_LIMIT = 10

export function createDefaultKbDocuments(): KbDocument[] {
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

export class MockKBClient implements KbClient {
  private readonly documents: KbDocument[]

  constructor(documents: KbDocument[] = createDefaultKbDocuments()) {
    this.documents = documents.map((document) => cloneDocument(document))
  }

  async search(input: KbSearchInput): Promise<KbSearchResult[]> {
    const query = normalizeRequiredText(input.query, 'query is required').toLowerCase()
    const topK = normalizePositiveInteger(input.topK ?? DEFAULT_TOP_K, 'topK')
    const nodePath =
      input.nodePath === undefined
        ? undefined
        : normalizeRequiredText(input.nodePath, 'nodePath is required')

    return this.documents
      .filter((document) => {
        if (nodePath !== undefined && document.nodePath !== nodePath) {
          return false
        }

        return (
          document.title.toLowerCase().includes(query) ||
          document.content.toLowerCase().includes(query)
        )
      })
      .slice(0, topK)
      .map((document) => ({
        id: document.id,
        title: document.title,
        nodePath: document.nodePath,
      }))
  }

  async list(input: KbListInput): Promise<KbDocument[]> {
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')
    const limit = normalizePositiveInteger(input.limit ?? DEFAULT_LIST_LIMIT, 'limit')

    return this.documents
      .filter((document) => document.nodePath === nodePath)
      .slice(0, limit)
      .map((document) => cloneDocument(document))
  }

  async retrieve(docId: string): Promise<KbDocument> {
    const validatedId = normalizeRequiredText(docId, 'document id is required')
    const document = this.documents.find((item) => item.id === validatedId)

    if (!document) {
      throw new NotFoundError(`Document ${validatedId} not found`)
    }

    return cloneDocument(document)
  }

  async add(input: KbAddInput): Promise<KbDocument> {
    const title = normalizeRequiredText(input.title, 'title is required')
    const content = normalizeRequiredText(input.content, 'content is required')
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')
    const tags = normalizeTags(input.tags)
    const id =
      input.id === undefined
        ? this.createId()
        : normalizeRequiredText(input.id, 'document id is required')

    if (this.documents.some((document) => document.id === id)) {
      throw new ValidationError(`Document ${id} already exists`)
    }

    const created: KbDocument = {
      id,
      title,
      content,
      nodePath,
      tags,
    }

    this.documents.push(created)
    return cloneDocument(created)
  }

  private createId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

function cloneDocument(document: KbDocument): KbDocument {
  return {
    ...document,
    tags: [...document.tags],
  }
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
    return tags.map((tag) => {
      if (typeof tag !== 'string') {
        throw new ValidationError('tags must be a string or an array of strings')
      }

      return tag.trim()
    }).filter(Boolean)
  }

  throw new ValidationError('tags must be a string or an array of strings')
}
