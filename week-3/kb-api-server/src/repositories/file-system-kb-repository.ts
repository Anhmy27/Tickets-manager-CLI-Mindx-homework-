import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'

import type { KbDocument } from '../models/kb.js'
import type { KbRepository } from './in-memory-kb-repository.js'

interface FileSystemKbRepositoryOptions {
  dataDir: string
  seedDocuments: KbDocument[]
}

interface KbIndexEntry {
  id: string
  title: string
  nodePath: string
  tags: string[]
  filePath: string
}

export class FileSystemKbRepository implements KbRepository {
  private readonly dataDir: string
  private readonly indexPath: string

  constructor(options: FileSystemKbRepositoryOptions) {
    this.dataDir = options.dataDir
    this.indexPath = join(this.dataDir, 'index.json')
    this.initializeStorage(options.seedDocuments)
  }

  listAll(): KbDocument[] {
    const index = this.readIndex()
    return index.map((entry) => this.hydrateDocument(entry))
  }

  findById(id: string): KbDocument | undefined {
    const index = this.readIndex()
    const entry = index.find((item) => item.id === id)
    return entry ? this.hydrateDocument(entry) : undefined
  }

  hasById(id: string): boolean {
    const index = this.readIndex()
    return index.some((entry) => entry.id === id)
  }

  create(document: KbDocument): void {
    const index = this.readIndex()
    const entry = this.toIndexEntry(document)

    this.writeDocumentContent(entry.filePath, document.content)
    index.push(entry)
    this.writeIndex(index)
  }

  private initializeStorage(seedDocuments: KbDocument[]): void {
    mkdirSync(this.dataDir, { recursive: true })

    if (existsSync(this.indexPath)) {
      return
    }

    const index: KbIndexEntry[] = []
    for (const document of seedDocuments) {
      const entry = this.toIndexEntry(document)
      this.writeDocumentContent(entry.filePath, document.content)
      index.push(entry)
    }

    this.writeIndex(index)
  }

  private toIndexEntry(document: KbDocument): KbIndexEntry {
    const relativeDirectory = nodePathToRelativeDirectory(document.nodePath)
    return {
      id: document.id,
      title: document.title,
      nodePath: document.nodePath,
      tags: [...document.tags],
      filePath: `${relativeDirectory}/${document.id}.md`,
    }
  }

  private hydrateDocument(entry: KbIndexEntry): KbDocument {
    const absolutePath = join(this.dataDir, ...entry.filePath.split('/'))
    const content = readFileSync(absolutePath, 'utf8')

    return {
      id: entry.id,
      title: entry.title,
      content,
      nodePath: entry.nodePath,
      tags: [...entry.tags],
    }
  }

  private writeDocumentContent(relativePath: string, content: string): void {
    const absolutePath = join(this.dataDir, ...relativePath.split('/'))
    const directory = dirname(absolutePath)
    mkdirSync(directory, { recursive: true })
    writeFileSync(absolutePath, content, 'utf8')
  }

  private readIndex(): KbIndexEntry[] {
    const raw = readFileSync(this.indexPath, 'utf8')
    const parsed = JSON.parse(raw) as KbIndexEntry[]

    return parsed.map((entry) => ({
      ...entry,
      tags: [...entry.tags],
    }))
  }

  private writeIndex(index: KbIndexEntry[]): void {
    const normalized = index.map((entry) => ({
      ...entry,
      tags: [...entry.tags],
    }))
    writeFileSync(this.indexPath, JSON.stringify(normalized, null, 2), 'utf8')
  }
}

function nodePathToRelativeDirectory(nodePath: string): string {
  const parts = nodePath
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    throw new Error('nodePath must contain at least one segment')
  }

  for (const part of parts) {
    if (part === '.' || part === '..') {
      throw new Error('nodePath must not include "." or ".." segments')
    }
    if (!/^[A-Za-z0-9_-]+$/.test(part)) {
      throw new Error('nodePath contains unsupported characters')
    }
  }

  return parts.join('/')
}
