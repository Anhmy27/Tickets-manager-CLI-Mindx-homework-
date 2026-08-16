import { createServer, type Server } from 'node:http'

import { handleKbRequest } from './controllers/kb-controller.js'
import type { KbDocument } from './models/kb.js'
import { createDefaultKbService } from './services/kb-service.js'

interface ServerOptions {
  host?: string
  port?: number
  seedDocuments?: KbDocument[]
}

interface RunningServer {
  baseUrl: string
  close(): Promise<void>
}

export async function startKbApiServer(options: ServerOptions = {}): Promise<RunningServer> {
  const host = options.host ?? '127.0.0.1'
  const port = options.port ?? 4100
  const service = createDefaultKbService(options.seedDocuments)

  const server = createServer(async (request, response) => {
    try {
      await handleKbRequest(request, response, service)
    } catch (error: unknown) {
      response.writeHead(500, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          error: `Internal server error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        })
      )
    }
  })

  await listenServer(server, host, port)

  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Unable to determine KB server address')
  }

  return {
    baseUrl: `http://${host}:${address.port}`,
    async close() {
      await closeServer(server)
    },
  }
}

function listenServer(server: Server, host: string, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => {
      server.off('error', reject)
      resolve()
    })
  })
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
