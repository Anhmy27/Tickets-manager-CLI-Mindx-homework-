import {
  HTTPKBClient,
  KBClientNotFoundError,
  KBClientRequestError,
  KBClientValidationError,
  type KbAddInput as RealKbAddInput,
  type KbListInput as RealKbListInput,
  type KbSearchInput as RealKbSearchInput,
} from 'kb-api-client'
import { NotFoundError, StorageError, ValidationError } from '../models/errors.js'
import type {
  KbAddInput,
  KbDocument,
  KbListInput,
  KbSearchInput,
  KbSearchResult,
} from '../models/kb.js'
import type { KbClient } from './kb-client-contract.js'

interface HttpKbClientAdapterOptions {
  baseUrl: string
}

export class HttpKbClientAdapter implements KbClient {
  private readonly client: HTTPKBClient

  constructor(options: HttpKbClientAdapterOptions) {
    this.client = new HTTPKBClient({ baseUrl: options.baseUrl })
  }

  async search(input: KbSearchInput): Promise<KbSearchResult[]> {
    try {
      const payload: RealKbSearchInput = {
        query: input.query,
        ...(input.topK === undefined ? {} : { topK: input.topK }),
      }
      return await this.client.search(payload)
    } catch (error: unknown) {
      throw mapClientError(error)
    }
  }

  async list(input: KbListInput): Promise<KbDocument[]> {
    try {
      const payload: RealKbListInput = {
        nodePath: input.nodePath,
        ...(input.limit === undefined ? {} : { limit: input.limit }),
      }
      return await this.client.list(payload)
    } catch (error: unknown) {
      throw mapClientError(error)
    }
  }

  async retrieve(docId: string): Promise<KbDocument> {
    try {
      return await this.client.retrieve(docId)
    } catch (error: unknown) {
      throw mapClientError(error)
    }
  }

  async add(input: KbAddInput): Promise<KbDocument> {
    try {
      const payload: RealKbAddInput = {
        title: input.title,
        content: input.content,
        nodePath: input.nodePath,
        ...(input.tags === undefined ? {} : { tags: input.tags }),
      }
      return await this.client.add(payload)
    } catch (error: unknown) {
      throw mapClientError(error)
    }
  }
}

function mapClientError(error: unknown): Error {
  if (error instanceof KBClientValidationError) {
    return new ValidationError(error.message)
  }

  if (error instanceof KBClientNotFoundError) {
    return new NotFoundError(error.message)
  }

  if (error instanceof KBClientRequestError) {
    return new StorageError(error.message)
  }

  return error instanceof Error ? error : new StorageError(String(error))
}
