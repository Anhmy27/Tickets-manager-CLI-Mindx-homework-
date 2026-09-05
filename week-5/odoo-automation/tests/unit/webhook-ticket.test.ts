import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { forceIntakeStage } from '../../src/webhook-ticket.js'
import type { OdooTicket } from '../../src/types.js'

const sampleTicket: OdooTicket = {
  id: 99,
  ticketRef: '00099',
  customerName: 'Test User',
  name: 'Login issue',
  description: 'Cannot login',
  emailFrom: 'test@mindx.edu.vn',
  stageId: 5,
  stageName: 'Assigned',
  tags: ['Login'],
}

test('forceIntakeStage: overrides stage id and stage name for webhook processing', () => {
  const normalized = forceIntakeStage(sampleTicket, 1)

  assert.equal(normalized.stageId, 1)
  assert.equal(normalized.stageName, 'stage:1')
  assert.equal(normalized.id, sampleTicket.id)
  assert.equal(normalized.emailFrom, sampleTicket.emailFrom)
})
