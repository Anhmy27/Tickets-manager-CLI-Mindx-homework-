import type { IncomingMessage, ServerResponse } from 'node:http'

import { NotFoundError, ValidationError } from '../errors/domain-errors.js'
import { routeKbRequest } from '../routes/kb-routes.js'
import type { KbService } from '../services/kb-service.js'
import { readJsonBody, sendJson } from '../utils/http-json.js'

export async function handleKbRequest(
  request: IncomingMessage,
  response: ServerResponse,
  service: KbService
): Promise<void> {
  let body: Record<string, unknown>
  try {
    body = await readJsonBody(request)
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      sendJson(response, 400, { error: error.message })
      return
    }
    throw error
  }

  try {
    const result = routeKbRequest(request.method, request.url, body, service)
    sendJson(response, result.status, result.payload)
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      sendJson(response, 400, { error: error.message })
      return
    }

    if (error instanceof NotFoundError) {
      sendJson(response, 404, { error: error.message })
      return
    }

    throw error
  }
}
