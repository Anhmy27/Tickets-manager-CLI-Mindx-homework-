import { startKbApiServer } from './server.js'
import { readPort } from './config/env.js'

const host = process.env.KB_API_HOST?.trim() || '127.0.0.1'
const port = readPort(process.env.KB_API_PORT)

const server = await startKbApiServer({ host, port })

console.log(`KB API server is listening at ${server.baseUrl}`)
