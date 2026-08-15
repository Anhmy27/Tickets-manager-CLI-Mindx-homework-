/**
 * Domain rules for Ticket Manager CLI (Week 2).
 */

import { ValidationError } from './errors.js'

export const TICKET_STATUSES = ['open', 'in_progress', 'closed'] as const
export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const

export type TicketStatus = (typeof TICKET_STATUSES)[number]
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export interface TicketSnapshot {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTicketInput {
  title?: unknown
  description?: unknown
  status?: unknown
  priority?: unknown
  tags?: unknown
}

export interface ListTicketFiltersInput {
  status?: unknown
  priority?: unknown
  tags?: unknown
}

export interface NormalizedTicketFilters {
  status?: TicketStatus
  priority?: TicketPriority
  tags?: string[]
}

export interface UpdateTicketInput {
  status?: unknown
}

export class Ticket {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly status: TicketStatus
  readonly priority: TicketPriority
  readonly tags: string[]
  readonly createdAt: string
  readonly updatedAt: string

  constructor({
    id,
    title,
    description,
    status,
    priority,
    tags,
    createdAt,
    updatedAt,
  }: TicketSnapshot) {
    const validatedInput = validateCreateTicketInput({
      title,
      description,
      status,
      priority,
      tags,
    })

    this.id = validateTicketId(id)
    this.title = validatedInput.title
    this.description = validatedInput.description
    this.status = validatedInput.status
    this.priority = validatedInput.priority
    this.tags = validatedInput.tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  static create({
    id,
    input,
    timestamp,
  }: {
    id: string
    input: CreateTicketInput
    timestamp: string
  }): Ticket {
    const validatedInput = validateCreateTicketInput(input)

    return new Ticket({
      id,
      ...validatedInput,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
  }

  static fromPersistence(data: TicketSnapshot): Ticket {
    return new Ticket(data)
  }

  updateStatus(input: UpdateTicketInput, timestamp: string): Ticket {
    const validatedInput = validateUpdateTicketInput(input)

    return new Ticket({
      ...this.toJSON(),
      status: validatedInput.status,
      updatedAt: timestamp,
    })
  }

  toJSON(): TicketSnapshot {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      priority: this.priority,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}

export function validateCreateTicketInput(
  input: CreateTicketInput = {}
): Omit<TicketSnapshot, 'id' | 'createdAt' | 'updatedAt'> {
  const title = normalizeRequiredText(input.title, 'title is required')
  const description = normalizeOptionalText(input.description)
  const status = normalizeEnumValue(
    input.status ?? 'open',
    TICKET_STATUSES,
    'status must be one of: open, in_progress, closed'
  )
  const priority = normalizeEnumValue(
    input.priority ?? 'medium',
    TICKET_PRIORITIES,
    'priority must be one of: low, medium, high'
  )
  const tags = normalizeTags(input.tags)

  return {
    title,
    description,
    status,
    priority,
    tags,
  }
}

export function validateListFilters(
  filters: ListTicketFiltersInput = {}
): NormalizedTicketFilters {
  const normalized: NormalizedTicketFilters = {}

  if (filters.status !== undefined) {
    normalized.status = normalizeEnumValue(
      filters.status,
      TICKET_STATUSES,
      'status must be one of: open, in_progress, closed'
    )
  }

  if (filters.priority !== undefined) {
    normalized.priority = normalizeEnumValue(
      filters.priority,
      TICKET_PRIORITIES,
      'priority must be one of: low, medium, high'
    )
  }

  if (filters.tags !== undefined) {
    normalized.tags = normalizeTags(filters.tags)
  }

  return normalized
}

export function validateTicketId(id: unknown): string {
  return normalizeRequiredText(id, 'ticket id is required')
}

export function validateUpdateTicketInput(
  input: UpdateTicketInput = {}
): { status: TicketStatus } {
  if (input.status === undefined) {
    throw new ValidationError('status is required')
  }

  return {
    status: normalizeEnumValue(
      input.status,
      TICKET_STATUSES,
      'status must be one of: open, in_progress, closed'
    ),
  }
}

function normalizeRequiredText(value: unknown, message: string): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) {
    throw new ValidationError(message)
  }

  return normalized
}

function normalizeOptionalText(value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }

  return String(value).trim()
}

function normalizeEnumValue<const T extends readonly string[]>(
  value: unknown,
  allowedValues: T,
  message: string
): T[number] {
  const normalized = normalizeRequiredText(value, message).toLowerCase()
  if (!allowedValues.includes(normalized as T[number])) {
    throw new ValidationError(message)
  }

  return normalized as T[number]
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
    const normalized = tags.map((tag) => {
      if (typeof tag !== 'string') {
        throw new ValidationError(
          'tags must be a string or an array of strings'
        )
      }

      return tag.trim()
    })

    return normalized.filter(Boolean)
  }

  throw new ValidationError('tags must be a string or an array of strings')
}
