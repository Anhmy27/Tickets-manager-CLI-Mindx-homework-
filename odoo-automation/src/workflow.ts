import { analyzeTicket } from './analyze-ticket.js'
import { buildBotInternalNote } from './bot-note.js'
import type { AutomationRuleSet, OdooClient, OdooTicket, WorkflowDeps, WorkflowResult } from './types.js'

function buildResolvedEmail(ticket: OdooTicket): { subject: string; body: string } {
  return {
    subject: `RE: ${ticket.name} - Đã xử lý - Ticket #${ticket.ticketRef}`,
    body: [
      `Chào ${ticket.customerName},`,
      '',
      'Cảm ơn bạn đã liên hệ team hỗ trợ.',
      '',
      'Team đã kiểm tra và xác nhận tài khoản LMS của bạn bị hệ thống tự động chuyển sang trạng thái tạm khóa (deactivate) do một thời gian không có hoạt động đăng nhập.',
      'Team đã kích hoạt lại tài khoản giúp bạn rồi ạ.',
      '',
      'Bạn vui lòng thử đăng nhập lại. Nếu vẫn chưa vào được, bạn chỉ cần phản hồi lại email này, team sẽ hỗ trợ tiếp ngay ạ.',
      '',
      'Trân trọng,',
      'MindX Support Team',
      `Ticket #${ticket.ticketRef}`,
    ].join('\n'),
  }
}

export async function processTicket(
  ticket: OdooTicket,
  rules: AutomationRuleSet,
  deps: WorkflowDeps
): Promise<WorkflowResult> {
  const analysis = analyzeTicket(ticket, rules)
  if (analysis.kind === 'skip') {
    return { decision: 'SKIP', reason: analysis.reason, needsHumanAck: false }
  }

  if (!hasValidEmail(ticket.emailFrom)) {
    return { decision: 'SKIP', reason: 'skip: missing customer email', needsHumanAck: false }
  }

  const [hrStatus, lmsStatus] = await Promise.all([
    deps.hrClient.getEmploymentStatusByEmail(ticket.emailFrom),
    deps.lmsClient.getAccountStatusByEmail(ticket.emailFrom),
  ])

  if (hrStatus === 'terminated') {
    const reason = 'ESCALATE_HR: employee terminated'
    const finalReason = await postBotNoteOnce(ticket, reason, deps.odooClient)
    return { decision: 'ESCALATE_HR', reason: finalReason, needsHumanAck: true }
  }

  if (lmsStatus === 'deactivated' && hrStatus === 'active') {
    const reason = 'AUTO_RESOLVE: deactivated + HR active'
    await deps.lmsClient.reactivateAccountByEmail(ticket.emailFrom)
    await deps.odooClient.moveToStage(ticket.id, rules.resolvedStageId)
    await deps.odooClient.postInternalNote(ticket.id, buildBotInternalNote(ticket, reason))
    const email = buildResolvedEmail(ticket)
    await deps.odooClient.postCustomerReply(ticket.id, email.subject, email.body)
    return { decision: 'AUTO_RESOLVE', reason, needsHumanAck: false }
  }

  const reason = `NEED_REVIEW: LMS=${lmsStatus}, HR=${hrStatus}`
  const finalReason = await postBotNoteOnce(ticket, reason, deps.odooClient)
  return { decision: 'NEED_REVIEW', reason: finalReason, needsHumanAck: true }
}

async function postBotNoteOnce(
  ticket: OdooTicket,
  reason: string,
  odooClient: OdooClient
): Promise<string> {
  if (await odooClient.hasAutomationNote(ticket.id)) {
    return `${reason} | already noted`
  }

  await odooClient.postInternalNote(ticket.id, buildBotInternalNote(ticket, reason))
  return reason
}

function hasValidEmail(value: string): boolean {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)
}
