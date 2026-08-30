import type { OdooClient, OdooTicket } from './types.js'

interface RpcEnvelope {
  jsonrpc: '2.0'
  method: 'call'
  params: {
    service: string
    method: string
    args: unknown[]
  }
  id: number
}

interface OdooAuthConfig {
  url: string
  db: string
  login: string
  apiKey: string
}

interface OdooTicketRecord {
  id: number
  name?: string
  description?: string
  partner_email?: string
  partner_name?: string
  stage_id?: [number, string]
  tag_ids?: number[]
}

export class OdooJsonRpcClient implements OdooClient {
  private uid: number | null = null
  private requestId = 1
  private readonly endpoint: string

  constructor(private readonly config: OdooAuthConfig) {
    this.endpoint = `${config.url.replace(/\/$/, '')}/jsonrpc`
  }

  async fetchTicketsByStage(stageId: number, limit = 30): Promise<OdooTicket[]> {
    const records = await this.executeKw<OdooTicketRecord[]>(
      'helpdesk.ticket',
      'search_read',
      [[['stage_id', '=', stageId]]],
      {
        fields: ['id', 'name', 'description', 'partner_email', 'partner_name', 'stage_id', 'tag_ids'],
        order: 'id asc',
        limit,
      }
    )

    const tagIds = Array.from(
      new Set(records.flatMap((record) => record.tag_ids ?? []).filter((value) => Number.isInteger(value)))
    ) as number[]
    const tagMap = await this.readTagNames(tagIds)

    return records.map((record) => ({
      id: record.id,
      name: record.name ?? '(no title)',
      description: stripHtml(record.description ?? ''),
      emailFrom: extractEmail(record.partner_email ?? record.description ?? ''),
      stageId: record.stage_id?.[0] ?? stageId,
      stageName: record.stage_id?.[1] ?? `stage:${stageId}`,
      tags: (record.tag_ids ?? []).map((id) => tagMap.get(id) ?? `tag:${id}`),
    }))
  }

  async postInternalNote(ticketId: number, body: string): Promise<void> {
    await this.executeKw('helpdesk.ticket', 'message_post', [[ticketId]], {
      body: toHtml(body),
      message_type: 'comment',
      subtype_xmlid: 'mail.mt_note',
    })
  }

  async postCustomerReply(ticketId: number, subject: string, body: string): Promise<void> {
    await this.executeKw('helpdesk.ticket', 'message_post', [[ticketId]], {
      subject,
      body: toHtml(body),
      message_type: 'comment',
      subtype_xmlid: 'mail.mt_comment',
    })
  }

  async moveToStage(ticketId: number, stageId: number): Promise<void> {
    await this.executeKw('helpdesk.ticket', 'write', [[ticketId], { stage_id: stageId }])
  }

  private async readTagNames(tagIds: number[]): Promise<Map<number, string>> {
    if (tagIds.length === 0) {
      return new Map<number, string>()
    }

    const rows = await this.executeKw<Array<{ id: number; name: string }>>(
      'helpdesk.tag',
      'read',
      [tagIds],
      { fields: ['id', 'name'] }
    )

    return new Map(rows.map((row) => [row.id, row.name]))
  }

  private async executeKw<T>(
    model: string,
    method: string,
    args: unknown[],
    kwargs?: Record<string, unknown>
  ): Promise<T> {
    const uid = await this.authenticate()
    const payloadArgs: unknown[] = [this.config.db, uid, this.config.apiKey, model, method, args]
    if (kwargs) {
      payloadArgs.push(kwargs)
    }

    return this.rpc<T>('object', 'execute_kw', payloadArgs)
  }

  private async authenticate(): Promise<number> {
    if (this.uid !== null) {
      return this.uid
    }

    const uid = await this.rpc<number>('common', 'authenticate', [
      this.config.db,
      this.config.login,
      this.config.apiKey,
      {},
    ])

    if (!uid) {
      throw new Error('Odoo authenticate failed. Please verify ODOO_LOGIN and ODOO_API_KEY.')
    }

    this.uid = uid
    return uid
  }

  private async rpc<T>(service: string, method: string, args: unknown[]): Promise<T> {
    const payload: RpcEnvelope = {
      jsonrpc: '2.0',
      method: 'call',
      params: { service, method, args },
      id: this.requestId++,
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Odoo RPC HTTP error ${response.status}: ${response.statusText}`)
    }

    const json = (await response.json()) as { result?: T; error?: { message?: string; data?: unknown } }
    if (json.error) {
      const details =
        typeof json.error.data === 'object' && json.error.data !== null
          ? JSON.stringify(json.error.data)
          : String(json.error.data ?? '')
      throw new Error(`Odoo RPC error: ${json.error.message ?? 'unknown'} ${details}`)
    }

    if (!('result' in json)) {
      throw new Error('Odoo RPC error: missing result field')
    }

    return json.result as T
  }
}

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('<br/>')
}

function extractEmail(value: string): string {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  return match?.[0] ?? value.trim()
}
