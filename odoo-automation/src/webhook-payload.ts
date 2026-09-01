function toPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim())
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed
    }
  }

  return null
}

function idFromRecordLike(record: unknown): number | null {
  if (!record || typeof record !== 'object') {
    return null
  }

  const candidate = (record as { id?: unknown }).id
  if (Array.isArray(candidate)) {
    return toPositiveInt(candidate[0])
  }

  return toPositiveInt(candidate)
}

export function extractTicketId(payload: unknown): number | null {
  const direct = idFromRecordLike(payload)
  if (direct !== null) {
    return direct
  }

  if (payload && typeof payload === 'object') {
    const envelopeId = toPositiveInt((payload as { _id?: unknown })._id)
    if (envelopeId !== null) {
      return envelopeId
    }

    const nested = idFromRecordLike((payload as { data?: unknown }).data)
    if (nested !== null) {
      return nested
    }
  }

  return null
}
