import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { analyzeTicket } from '../../src/analyze-ticket.js'
import type { AutomationRuleSet, OdooTicket } from '../../src/types.js'

const defaultRules: AutomationRuleSet = {
  requiredStageId: 1,
  titleKeywords: ['đăng nhập', 'login'],
  descriptionKeywords: ['invalid username or password', 'deactivate'],
  resolvedStageId: 4,
}

const baseTicket: OdooTicket = {
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

test('analyzeTicket: marks login candidate from strong title/description intent', () => {
  const analysis = analyzeTicket(baseTicket, defaultRules)

  assert.equal(analysis.kind, 'login_candidate')
  assert.equal(analysis.reason.includes('strong login intent'), true)
})

test('analyzeTicket: skips ticket when stage is not intake stage', () => {
  const analysis = analyzeTicket({ ...baseTicket, stageId: 2, stageName: 'In Progress' }, defaultRules)

  assert.equal(analysis.kind, 'skip')
  assert.equal(analysis.reason.includes('stage'), true)
})

test('analyzeTicket: skips ticket when login signals are missing', () => {
  const analysis = analyzeTicket(
    {
      ...baseTicket,
      name: 'CRM bị sai số điện thoại lead',
      description: 'Lỗi nhập liệu CRM',
      tags: ['CRM'],
    },
    defaultRules
  )

  assert.equal(analysis.kind, 'skip')
  assert.equal(analysis.reason.includes('no login signals'), true)
})

test('analyzeTicket: skips content/file issue because no login intent', () => {
  const analysis = analyzeTicket(
    {
      ...baseTicket,
      name: 'Khong tai duoc tai lieu bai 5',
      description: 'File PDF bai 5 loi 404, cac bai khac van ok.',
      tags: ['LMS', 'content'],
    },
    defaultRules
  )

  assert.equal(analysis.kind, 'skip')
  assert.equal(analysis.reason.includes('no login signals'), true)
})
