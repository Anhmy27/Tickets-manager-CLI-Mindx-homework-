import {
  KBClientNotFoundError,
  KBClientRequestError,
  KBClientValidationError,
} from './errors.js'
import type {
  KbAddInput,
  KbDocument,
  KbListInput,
  KbSearchInput,
  KbSearchResult,
} from './types.js'

type FetchLike = typeof fetch

interface HttpKbClientOptions {
  baseUrl: string
  fetchImpl?: FetchLike
}

export class HTTPKBClient {
  private readonly baseUrl: string
  private readonly fetchImpl: FetchLike

  constructor(options: HttpKbClientOptions) {
    this.baseUrl = normalizeBaseUrl(options.baseUrl)
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  async search(input: KbSearchInput): Promise<KbSearchResult[]> {
    const query = normalizeRequiredText(input.query, 'query is required')
    const topK =
      input.topK === undefined
        ? undefined
        : normalizePositiveInteger(input.topK, 'topK')

    return await this.postJson<KbSearchResult[]>('/search', {
      query,
      ...(topK === undefined ? {} : { topK }),
    })
  }

  async list(input: KbListInput): Promise<KbDocument[]> {
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')
    const limit =
      input.limit === undefined
        ? undefined
        : normalizePositiveInteger(input.limit, 'limit')

    return await this.postJson<KbDocument[]>('/list', {
      nodePath,
      ...(limit === undefined ? {} : { limit }),
    })
  }

  async retrieve(docId: string): Promise<KbDocument> {
    const validatedId = normalizeRequiredText(docId, 'document id is required')

    return await this.postJson<KbDocument>('/retrieve', { docId: validatedId })
  }

  async add(input: KbAddInput): Promise<KbDocument> {
    const title = normalizeRequiredText(input.title, 'title is required')
    const content = normalizeRequiredText(input.content, 'content is required')
    const nodePath = normalizeRequiredText(input.nodePath, 'nodePath is required')
    const tags = normalizeTags(input.tags)

    return await this.postJson<KbDocument>('/add', {
      title,
      content,
      nodePath,
      tags,
    })
  }

  private async postJson<T>(path: string, payload: unknown): Promise<T> {
    let response: Response
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error: unknown) {
      throw new KBClientRequestError(
        `KB API request failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }

    const body = await readResponseBody(response)

    if (response.status === 404) {
      throw new KBClientNotFoundError(readErrorMessage(body, 'KB document not found'))
    }

    if (response.status === 400) {
      throw new KBClientValidationError(
        readErrorMessage(body, 'KB request is invalid')
      )
    }

    if (!response.ok) {
      throw new KBClientRequestError(
        `KB API request failed with status ${response.status}: ${readErrorMessage(body, 'Unknown error')}`
      )
    }

    return body as T
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, '')
  if (!normalized) {
    throw new KBClientValidationError('KB API base URL is required')
  }

  return normalized
}

function normalizeRequiredText(value: unknown, message: string): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) {
    throw new KBClientValidationError(message)
  }

  return normalized
}

function normalizePositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new KBClientValidationError(`${fieldName} must be a positive integer`)
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
          throw new KBClientValidationError(
            'tags must be a string or an array of strings'
          )
        }

        return tag.trim()
      })
      .filter(Boolean)
  }

  throw new KBClientValidationError('tags must be a string or an array of strings')
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return await response.text()
  }
}

function readErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const text = (body as { error: unknown }).error
    if (typeof text === 'string' && text.trim() !== '') {
      return text
    }
  }

  if (typeof body === 'string' && body.trim() !== '') {
    return body
  }

  return fallback
}
