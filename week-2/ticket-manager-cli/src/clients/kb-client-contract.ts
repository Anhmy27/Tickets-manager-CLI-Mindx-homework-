import type {
  KbAddInput,
  KbDocument,
  KbListInput,
  KbSearchInput,
  KbSearchResult,
} from '../models/kb.js'

/**
 * KB client contract used by both mock and HTTP implementations.
 */
export interface KbClient {
  search(input: KbSearchInput): Promise<KbSearchResult[]>
  list(input: KbListInput): Promise<KbDocument[]>
  retrieve(docId: string): Promise<KbDocument>
  add(input: KbAddInput): Promise<KbDocument>
}

export function assertKbClient(client: unknown): asserts client is KbClient {
  if (!client) {
    throw new TypeError('A KB client implementation is required.')
  }

  for (const methodName of ['search', 'list', 'retrieve', 'add'] as const) {
    if (typeof (client as Record<string, unknown>)[methodName] !== 'function') {
      throw new TypeError(`KB client must implement ${methodName}().`)
    }
  }
}
