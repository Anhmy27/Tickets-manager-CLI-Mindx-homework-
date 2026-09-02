export type HrStatus = 'active' | 'terminated' | 'unknown'
export type LmsStatus = 'active' | 'deactivated' | 'unknown'

export type Decision = 'AUTO_RESOLVE' | 'NEED_REVIEW' | 'SKIP'

export interface OdooTicket {
  id: number
  ticketRef: string
  customerName: string
  name: string
  description: string
  emailFrom: string
  stageId: number
  stageName: string
  tags: string[]
}

export interface TicketAnalysis {
  kind: 'login_candidate' | 'skip'
  reason: string
}

export interface AutomationRuleSet {
  requiredStageId: number
  resolvedStageId: number
  tagKeywords: string[]
  titleKeywords: string[]
  descriptionKeywords: string[]
}

export interface HrClient {
  getEmploymentStatusByEmail(email: string): Promise<HrStatus>
}

export interface LmsClient {
  getAccountStatusByEmail(email: string): Promise<LmsStatus>
  reactivateAccountByEmail(email: string): Promise<void>
}

export interface OdooClient {
  hasAutomationNote(ticketId: number): Promise<boolean>
  postInternalNote(ticketId: number, body: string): Promise<void>
  postCustomerReply(ticketId: number, subject: string, body: string): Promise<void>
  moveToStage(ticketId: number, stageId: number): Promise<void>
}

export interface TicketDirectoryEntry {
  email: string
  hrStatus: HrStatus
  lmsStatus: LmsStatus
  displayName?: string
}

export interface WorkflowDeps {
  hrClient: HrClient
  lmsClient: LmsClient
  odooClient: OdooClient
}

export interface WorkflowResult {
  decision: Decision
  reason: string
  needsHumanAck: boolean
}
