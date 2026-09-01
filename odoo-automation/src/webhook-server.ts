import express from 'express'

import { loadConfig } from './config.js'
import { MockHrClient, MockLmsClient } from './mock-directory-clients.js'
import { OdooJsonRpcClient } from './odoo-jsonrpc-client.js'
import { extractTicketId } from './webhook-payload.js'
import { forceIntakeStage } from './webhook-ticket.js'
import { processTicket } from './workflow.js'

function readPort(): number {
  const raw = process.env.PORT?.trim()
  if (!raw) {
    return 3000
  }

  const port = Number(raw)
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer')
  }

  return port
}

async function main(): Promise<void> {
  const config = loadConfig()
  const odooClient = new OdooJsonRpcClient({
    url: config.odooUrl,
    db: config.odooDb,
    login: config.odooLogin,
    apiKey: config.odooApiKey,
  })
  const hrClient = new MockHrClient(config.directory)
  const lmsClient = new MockLmsClient(config.directory)

  const app = express()
  app.use(express.json({ limit: '256kb' }))

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  app.post('/webhook', async (req, res) => {
    const ticketId = extractTicketId(req.body)
    if (!ticketId) {
      res.status(400).json({ ok: false, error: 'invalid payload: ticket id is required' })
      return
    }

    try {
      const ticket = await odooClient.fetchTicketById(ticketId)
      if (!ticket) {
        res.status(404).json({ ok: false, error: `ticket not found: ${ticketId}` })
        return
      }

      const normalizedTicket = forceIntakeStage(ticket, config.rules.requiredStageId)
      const result = await processTicket(normalizedTicket, config.rules, { hrClient, lmsClient, odooClient })
      console.log(`WEBHOOK #${normalizedTicket.ticketRef} -> ${result.decision} | ${result.reason}`)
      res.status(200).json({ ok: true, ticketId, decision: result.decision, reason: result.reason })
    } catch (error) {
      console.error('[webhook] failed:', error)
      res.status(500).json({ ok: false, error: 'internal error' })
    }
  })

  const port = readPort()
  app.listen(port, () => {
    console.log(`Webhook server listening on port ${port}`)
    console.log('Endpoint: POST /webhook')
  })
}

main().catch((error) => {
  console.error('[webhook] startup failed:', error)
  process.exitCode = 1
})
