import { ValidationError } from '../models/errors.js'
import type { KbClient } from './kb-client-contract.js'
import { HttpKbClientAdapter } from './http-kb-client-adapter.js'
import { MockKBClient } from './mock-kb-client.js'

export function createKbClientFromEnv(
  env: NodeJS.ProcessEnv = process.env
): KbClient {
  const mode = normalizeMode(env.KB_CLIENT_MODE)

  if (mode === 'http') {
    const baseUrl = env.KB_API_BASE_URL
    if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
      throw new ValidationError(
        'KB_API_BASE_URL is required when KB_CLIENT_MODE=http'
      )
    }

    return new HttpKbClientAdapter({ baseUrl })
  }

  return new MockKBClient()
}

function normalizeMode(rawMode: string | undefined): 'mock' | 'http' {
  if (rawMode === undefined || rawMode.trim() === '') {
    return 'mock'
  }

  const normalized = rawMode.trim().toLowerCase()
  if (normalized !== 'mock' && normalized !== 'http') {
    throw new ValidationError('KB_CLIENT_MODE must be "mock" or "http"')
  }

  return normalized
}
