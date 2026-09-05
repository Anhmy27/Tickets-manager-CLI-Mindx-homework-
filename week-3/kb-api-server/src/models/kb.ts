export interface KbDocument {
  id: string
  title: string
  content: string
  nodePath: string
  tags: string[]
}

export interface KbSearchRequest {
  query: string
  topK?: number
}

export interface KbListRequest {
  nodePath: string
  limit?: number
}

export interface KbRetrieveRequest {
  docId: string
}

export interface KbAddRequest {
  title: string
  content: string
  nodePath: string
  tags?: unknown
}

export interface KbSearchResult {
  id: string
  title: string
  nodePath: string
}
