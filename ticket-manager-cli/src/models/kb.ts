export interface KbDocument {
  id: string
  title: string
  content: string
  nodePath: string
  tags: string[]
}

export interface KbSearchResult {
  id: string
  title: string
  nodePath: string
}

export interface KbSearchInput {
  query: string
  topK?: number
  nodePath?: string
}

export interface KbListInput {
  nodePath: string
  limit?: number
}

export interface KbAddInput {
  title: string
  content: string
  nodePath: string
  tags?: string[] | string
}
