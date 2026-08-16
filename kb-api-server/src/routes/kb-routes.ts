import type { KbAddRequest, KbListRequest, KbRetrieveRequest, KbSearchRequest } from '../models/kb.js'
import type { KbService } from '../services/kb-service.js'

export interface RouteResponse {
  status: number
  payload: unknown
}

export function routeKbRequest(
  method: string | undefined,
  path: string | undefined,
  body: Record<string, unknown>,
  service: KbService
): RouteResponse {
  if (method !== 'POST') {
    return { status: 405, payload: { error: 'Method not allowed' } }
  }

  switch (path ?? '/') {
    case '/search':
      return {
        status: 200,
        payload: service.search(body as unknown as KbSearchRequest),
      }
    case '/list':
      return {
        status: 200,
        payload: service.list(body as unknown as KbListRequest),
      }
    case '/retrieve':
      return {
        status: 200,
        payload: service.retrieve(body as unknown as KbRetrieveRequest),
      }
    case '/add':
      return {
        status: 200,
        payload: service.add(body as unknown as KbAddRequest),
      }
    default:
      return { status: 404, payload: { error: 'Not found' } }
  }
}
