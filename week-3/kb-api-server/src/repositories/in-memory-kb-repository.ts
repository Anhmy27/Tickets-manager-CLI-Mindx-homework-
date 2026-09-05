import type { KbDocument } from '../models/kb.js'

export interface KbRepository {
  listAll(): KbDocument[]
  findById(id: string): KbDocument | undefined
  hasById(id: string): boolean
  create(document: KbDocument): void
}

export class InMemoryKbRepository implements KbRepository {
  private readonly documents: KbDocument[]

  constructor(seedDocuments: KbDocument[]) {
    this.documents = seedDocuments.map((document) => ({
      ...document,
      tags: [...document.tags],
    }))
  }

  listAll(): KbDocument[] {
    return this.documents.map((document) => ({ ...document, tags: [...document.tags] }))
  }

  findById(id: string): KbDocument | undefined {
    const found = this.documents.find((document) => document.id === id)
    return found ? { ...found, tags: [...found.tags] } : undefined
  }

  hasById(id: string): boolean {
    return this.documents.some((document) => document.id === id)
  }

  create(document: KbDocument): void {
    this.documents.push({ ...document, tags: [...document.tags] })
  }
}
