import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { processTicket } from '../../src/workflow.js'
import type {
  AutomationRuleSet,
  HrClient,
  LmsClient,
  OdooClient,
  OdooTicket,
  TicketDirectoryEntry,
} from '../../src/types.js'

const rules: AutomationRuleSet = {
  requiredStageId: 1,
  titleKeywords: ['đăng nhập', 'login'],
  descriptionKeywords: ['invalid username or password', 'deactivate'],
  resolvedStageId: 4,
}

const ticket: OdooTicket = {
  id: 14,
  ticketRef: '00014',
  customerName: 'Trần Thị B',
  name: 'Không đăng nhập được LMS - Giáo viên Trần Thị B',
  description:
    'Em không đăng nhập được LMS từ sáng nay, báo lỗi "Invalid username or password".',
  emailFrom: 'tran.thi.b@mindx.edu.vn',
  stageId: 1,
  stageName: 'New',
  tags: ['LMS', 'Login'],
}

function createDeps(directory: TicketDirectoryEntry) {
  const events: string[] = []

  const hrClient: HrClient = {
    async getEmploymentStatusByEmail() {
      return directory.hrStatus
    },
  }

  const lmsClient: LmsClient = {
    async getAccountStatusByEmail() {
      return directory.lmsStatus
    },
    async reactivateAccountByEmail(email) {
      events.push(`reactivate:${email}`)
    },
  }

  const odooClient: OdooClient = {
    async postInternalNote(ticketId, body) {
      events.push(`note:${ticketId}:${body}`)
    },
    async postCustomerReply(ticketId, subject, body) {
      events.push(`mail:${ticketId}:${subject}:${body}`)
    },
    async moveToStage(ticketId, stageId) {
      events.push(`move:${ticketId}:${stageId}`)
    },
  }

  return { hrClient, lmsClient, odooClient, events }
}

test('processTicket: auto resolves deactivated account when HR is active', async () => {
  const deps = createDeps({ email: ticket.emailFrom, hrStatus: 'active', lmsStatus: 'deactivated' })

  const result = await processTicket(ticket, rules, deps)

  assert.equal(result.decision, 'AUTO_RESOLVE')
  assert.equal(result.needsHumanAck, false)
  assert.equal(deps.events.some((item) => item.startsWith('reactivate:')), true)
  assert.equal(deps.events.some((item) => item.startsWith('note:')), true)
  assert.equal(deps.events.some((item) => item.includes('#00014')), true)
  assert.equal(deps.events.some((item) => item.includes('Chào Trần Thị B,')), true)
  assert.equal(deps.events.some((item) => item.startsWith('mail:')), true)
  assert.equal(deps.events.some((item) => item.startsWith('move:')), true)
})

test('processTicket: escalates when HR status is terminated', async () => {
  const deps = createDeps({ email: ticket.emailFrom, hrStatus: 'terminated', lmsStatus: 'deactivated' })

  const result = await processTicket(ticket, rules, deps)

  assert.equal(result.decision, 'ESCALATE_HR')
  assert.equal(result.needsHumanAck, true)
  assert.equal(deps.events.some((item) => item.startsWith('reactivate:')), false)
  assert.equal(deps.events.some((item) => item.startsWith('mail:')), false)
  assert.equal(deps.events.some((item) => item.startsWith('note:')), true)
})

test('processTicket: marks review when LMS is active', async () => {
  const deps = createDeps({ email: ticket.emailFrom, hrStatus: 'active', lmsStatus: 'active' })

  const result = await processTicket(ticket, rules, deps)

  assert.equal(result.decision, 'NEED_REVIEW')
  assert.equal(result.needsHumanAck, true)
  assert.equal(deps.events.some((item) => item.startsWith('reactivate:')), false)
  assert.equal(deps.events.some((item) => item.startsWith('mail:')), false)
  assert.equal(deps.events.some((item) => item.startsWith('note:')), true)
})

test('processTicket: skips non-login ticket without side effects', async () => {
  const deps = createDeps({ email: ticket.emailFrom, hrStatus: 'active', lmsStatus: 'deactivated' })

  const result = await processTicket(
    {
      ...ticket,
      name: 'CRM import bị lỗi',
      description: 'Không liên quan đến đăng nhập',
      tags: ['CRM'],
    },
    rules,
    deps
  )

  assert.equal(result.decision, 'SKIP')
  assert.equal(result.needsHumanAck, false)
  assert.deepEqual(deps.events, [])
})
