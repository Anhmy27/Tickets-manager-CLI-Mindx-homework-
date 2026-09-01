import type { OdooTicket } from './types.js'

export function forceIntakeStage(ticket: OdooTicket, requiredStageId: number): OdooTicket {
  return {
    ...ticket,
    stageId: requiredStageId,
    stageName: `stage:${requiredStageId}`,
  }
}
