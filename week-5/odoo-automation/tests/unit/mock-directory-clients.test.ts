import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { MockHrClient, MockLmsClient } from '../../src/mock-directory-clients.js'
import type { TicketDirectoryEntry } from '../../src/types.js'

const entries: TicketDirectoryEntry[] = [
  { email: 'tran.thi.b@mindx.edu.vn', hrStatus: 'active', lmsStatus: 'deactivated' },
  { email: 'cu.nhan.vien@mindx.edu.vn', hrStatus: 'terminated', lmsStatus: 'deactivated' },
]

test('MockHrClient: matches email case-insensitively', async () => {
  const client = new MockHrClient(entries)
  const status = await client.getEmploymentStatusByEmail('TRAN.THI.B@MINDX.EDU.VN')
  assert.equal(status, 'active')
})

test('MockHrClient: returns unknown for missing email', async () => {
  const client = new MockHrClient(entries)
  const status = await client.getEmploymentStatusByEmail('not-found@mindx.edu.vn')
  assert.equal(status, 'unknown')
})

test('MockLmsClient: reactivates known user account', async () => {
  const localEntries: TicketDirectoryEntry[] = [
    { email: 'test.user@mindx.edu.vn', hrStatus: 'active', lmsStatus: 'deactivated' },
  ]
  const client = new MockLmsClient(localEntries)

  await client.reactivateAccountByEmail('test.user@mindx.edu.vn')
  const status = await client.getAccountStatusByEmail('test.user@mindx.edu.vn')
  assert.equal(status, 'active')
})

test('MockLmsClient: ignores reactivation for unknown user', async () => {
  const localEntries: TicketDirectoryEntry[] = [
    { email: 'known.user@mindx.edu.vn', hrStatus: 'active', lmsStatus: 'deactivated' },
  ]
  const client = new MockLmsClient(localEntries)

  await client.reactivateAccountByEmail('other.user@mindx.edu.vn')
  const status = await client.getAccountStatusByEmail('known.user@mindx.edu.vn')
  assert.equal(status, 'deactivated')
})
