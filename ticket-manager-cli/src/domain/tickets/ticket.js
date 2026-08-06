/**
 * Domain rules for Ticket Manager CLI (Week 2).
 */

import { ValidationError } from '../shared/errors.js'

export const TICKET_STATUSES = ['open', 'in_progress', 'closed']
export const TICKET_PRIORITIES = ['low', 'medium', 'high']

export function validateCreateTicketInput(input = {}) {
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

export function validateListFilters(filters = {}) {
  const normalized = {}

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

export function validateTicketId(id) {
  return normalizeRequiredText(id, 'ticket id is required')
}

export function validateUpdateTicketInput(input = {}) {
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

function normalizeRequiredText(value, message) {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) {
    throw new ValidationError(message)
  }

  return normalized
}

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return ''
  }

  return String(value).trim()
}

function normalizeEnumValue(value, allowedValues, message) {
  const normalized = normalizeRequiredText(value, message).toLowerCase()
  if (!allowedValues.includes(normalized)) {
    throw new ValidationError(message)
  }

  return normalized
}

function normalizeTags(tags) {
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
