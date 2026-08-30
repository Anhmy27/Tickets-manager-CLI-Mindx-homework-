import { loadConfig } from './config.js'
import { MockHrClient, MockLmsClient } from './mock-directory-clients.js'
import { OdooJsonRpcClient } from './odoo-jsonrpc-client.js'
import { processTicket } from './workflow.js'
import type { Decision } from './types.js'

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

  const tickets = await odooClient.fetchTicketsByStage(config.intakeStageId)
  console.log(`Scan stage_id "${config.intakeStageId}" - ${tickets.length} ticket(s)`)

  const counters: Record<Decision, number> = {
    AUTO_RESOLVE: 0,
    NEED_REVIEW: 0,
    ESCALATE_HR: 0,
    SKIP: 0,
  }

  for (const ticket of tickets) {
    const result = await processTicket(ticket, config.rules, { hrClient, lmsClient, odooClient })
    counters[result.decision] += 1
    const marker = markerFor(result.decision)
    const humanNextStep = result.needsHumanAck ? ' | NEEDS_AGENT_ACK' : ''
    console.log(
      `${marker} #${ticket.id} ${ticket.emailFrom} -> ${result.decision}${humanNextStep} | ${result.reason}`
    )
  }

  console.log(
    [
      'Done:',
      `AUTO_RESOLVE=${counters.AUTO_RESOLVE}`,
      `NEED_REVIEW=${counters.NEED_REVIEW}`,
      `ESCALATE_HR=${counters.ESCALATE_HR}`,
      `SKIP=${counters.SKIP}`,
    ].join(' ')
  )
}

function markerFor(decision: Decision): string {
  switch (decision) {
    case 'AUTO_RESOLVE':
      return 'OK'
    case 'NEED_REVIEW':
      return 'REVIEW'
    case 'ESCALATE_HR':
      return 'HR'
    case 'SKIP':
      return 'SKIP'
  }
}

main().catch((error) => {
  console.error('[odoo-automation] failed:', error)
  process.exitCode = 1
})
