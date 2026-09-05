import type { HrClient, HrStatus, LmsClient, LmsStatus, TicketDirectoryEntry } from './types.js'

function findEntry(email: string, entries: TicketDirectoryEntry[]): TicketDirectoryEntry | undefined {
  return entries.find((entry) => entry.email.toLowerCase() === email.toLowerCase())
}

export class MockHrClient implements HrClient {
  constructor(private readonly entries: TicketDirectoryEntry[]) {}

  async getEmploymentStatusByEmail(email: string): Promise<HrStatus> {
    return findEntry(email, this.entries)?.hrStatus ?? 'unknown'
  }
}

export class MockLmsClient implements LmsClient {
  constructor(private readonly entries: TicketDirectoryEntry[]) {}

  async getAccountStatusByEmail(email: string): Promise<LmsStatus> {
    return findEntry(email, this.entries)?.lmsStatus ?? 'unknown'
  }

  async reactivateAccountByEmail(email: string): Promise<void> {
    const entry = findEntry(email, this.entries)
    if (!entry) {
      return
    }
    entry.lmsStatus = 'active'
  }
}
