import type { IncomingMessage, ServerResponse } from 'node:http'

import { ValidationError } from '../errors/domain-errors.js'

export async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    throw new ValidationError('request body must be valid JSON')
  }
}

export function sendJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { 'content-type': 'application/json' })
  response.end(JSON.stringify(payload))
}
