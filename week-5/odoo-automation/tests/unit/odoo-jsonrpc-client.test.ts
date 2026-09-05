import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { BOT_AUTOMATION_NOTE_MARKER } from '../../src/bot-note.js'
import { OdooJsonRpcClient } from '../../src/odoo-jsonrpc-client.js'

interface MockResponse {
  ok?: boolean
  status?: number
  statusText?: string
  json: unknown
}

interface CapturedRequest {
  url: string
  payload: any
}

function withMockFetch(
  responses: MockResponse[],
  run: (requests: CapturedRequest[]) => Promise<void>
): Promise<void> {
  const originalFetch = globalThis.fetch
  const queue = [...responses]
  const requests: CapturedRequest[] = []

  globalThis.fetch = (async (url: URL | RequestInfo, init?: RequestInit) => {
    const next = queue.shift()
    if (!next) {
      throw new Error('No mock response left in queue')
    }

    requests.push({
      url: String(url),
      payload: JSON.parse(String(init?.body ?? '{}')),
    })

    return {
      ok: next.ok ?? true,
      status: next.status ?? 200,
      statusText: next.statusText ?? 'OK',
      async json() {
        return next.json
      },
    } as Response
  }) as typeof fetch

  return run(requests).finally(() => {
    globalThis.fetch = originalFetch
  })
}

function makeClient(url = 'https://mindx-training.odoo.com/'): OdooJsonRpcClient {
  return new OdooJsonRpcClient({
    url,
    db: 'mindx-training',
    login: 'bot@mindx.edu.vn',
    apiKey: 'api-key',
  })
}

test('fetchTicketsByStage: calls /jsonrpc endpoint and maps ticket fields', async () => {
  await withMockFetch(
    [
      { json: { result: 7 } },
      {
        json: {
          result: [
            {
              id: 14,
              ticket_ref: '00014',
              name: 'Login issue',
              description: '<p>Invalid username or password</p>',
              partner_email: 'Teacher <teacher@mindx.edu.vn>',
              partner_name: '  Teacher A  ',
              stage_id: [1, 'New'],
              tag_ids: [3],
            },
          ],
        },
      },
      { json: { result: [{ id: 3, name: 'Login' }] } },
    ],
    async (requests) => {
      const client = makeClient('https://mindx-training.odoo.com/')
      const tickets = await client.fetchTicketsByStage(1)

      assert.equal(requests[0]?.url, 'https://mindx-training.odoo.com/jsonrpc')
      assert.equal(tickets.length, 1)
      assert.equal(tickets[0]?.ticketRef, '00014')
      assert.equal(tickets[0]?.description, 'Invalid username or password')
      assert.equal(tickets[0]?.emailFrom, 'teacher@mindx.edu.vn')
      assert.equal(tickets[0]?.customerName, 'Teacher A')
      assert.deepEqual(tickets[0]?.tags, ['Login'])
    }
  )
})

test('fetchTicketsByStage: falls back to padded ref and stage fallback when missing', async () => {
  await withMockFetch(
    [
      { json: { result: 7 } },
      {
        json: {
          result: [{ id: 9, description: 'No email here', tag_ids: [] }],
        },
      },
    ],
    async () => {
      const client = makeClient()
      const tickets = await client.fetchTicketsByStage(5)

      assert.equal(tickets[0]?.ticketRef, '00009')
      assert.equal(tickets[0]?.stageId, 5)
      assert.equal(tickets[0]?.stageName, 'stage:5')
      assert.equal(tickets[0]?.customerName, 'bạn')
    }
  )
})

test('fetchTicketById: returns null when no record is found', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: [] } }],
    async () => {
      const client = makeClient()
      const ticket = await client.fetchTicketById(999)
      assert.equal(ticket, null)
    }
  )
})

test('fetchTicketById: returns mapped ticket when record exists', async () => {
  await withMockFetch(
    [
      { json: { result: 7 } },
      {
        json: {
          result: [{ id: 21, name: 'Ticket 21', description: '<b>hi</b>', stage_id: [1, 'New'], tag_ids: [] }],
        },
      },
    ],
    async () => {
      const client = makeClient()
      const ticket = await client.fetchTicketById(21)
      assert.equal(ticket?.id, 21)
      assert.equal(ticket?.name, 'Ticket 21')
      assert.equal(ticket?.description, 'hi')
    }
  )
})

test('fetchTicketById: tolerates falsey Odoo fields and leaves email empty', async () => {
  await withMockFetch(
    [
      { json: { result: 7 } },
      {
        json: {
          result: [
            {
              id: 22,
              name: false,
              description: false,
              partner_email: false,
              partner_name: false,
              stage_id: false,
              tag_ids: false,
            },
          ],
        },
      },
    ],
    async () => {
      const client = makeClient()
      const ticket = await client.fetchTicketById(22)
      assert.equal(ticket?.id, 22)
      assert.equal(ticket?.name, '(no title)')
      assert.equal(ticket?.description, '')
      assert.equal(ticket?.emailFrom, '')
      assert.equal(ticket?.customerName, 'bạn')
      assert.equal(ticket?.stageName, 'stage:0')
      assert.deepEqual(ticket?.tags, [])
    }
  )
})

test('hasAutomationNote: returns true when at least one bot message exists', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: [{ id: 1 }] } }],
    async (requests) => {
      const client = makeClient()
      const found = await client.hasAutomationNote(14)
      assert.equal(found, true)

      const payload = requests[1]?.payload
      const domain = payload.params.args[5][0]
      assert.equal(domain[0][0], 'model')
      assert.equal(domain[2][2], BOT_AUTOMATION_NOTE_MARKER)
    }
  )
})

test('hasAutomationNote: returns false when search is empty', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: [] } }],
    async () => {
      const client = makeClient()
      const found = await client.hasAutomationNote(14)
      assert.equal(found, false)
    }
  )
})

test('postInternalNote: sends HTML note with note subtype', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: true } }],
    async (requests) => {
      const client = makeClient()
      await client.postInternalNote(14, "Line 1\n\nA&B<'\"")

      const kwargs = requests[1]?.payload.params.args[6]
      assert.equal(kwargs.subtype_xmlid, 'mail.mt_note')
      assert.equal(kwargs.body_is_html, true)
      assert.equal(String(kwargs.body).includes('<p>Line 1</p>'), true)
      assert.equal(String(kwargs.body).includes('&amp;'), true)
      assert.equal(String(kwargs.body).includes('&#39;'), true)
    }
  )
})

test('postCustomerReply: sends comment subtype and subject', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: true } }],
    async (requests) => {
      const client = makeClient()
      await client.postCustomerReply(14, 'Subject', 'Body')

      const kwargs = requests[1]?.payload.params.args[6]
      assert.equal(kwargs.subtype_xmlid, 'mail.mt_comment')
      assert.equal(kwargs.subject, 'Subject')
    }
  )
})

test('moveToStage: writes stage id to helpdesk ticket', async () => {
  await withMockFetch(
    [{ json: { result: 7 } }, { json: { result: true } }],
    async (requests) => {
      const client = makeClient()
      await client.moveToStage(14, 2)

      const args = requests[1]?.payload.params.args[5]
      assert.deepEqual(args, [[14], { stage_id: 2 }])
    }
  )
})

test('client reuses uid and authenticates only once across operations', async () => {
  await withMockFetch(
    [
      { json: { result: 7 } },
      { json: { result: [] } },
      { json: { result: true } },
    ],
    async (requests) => {
      const client = makeClient()
      await client.hasAutomationNote(14)
      await client.moveToStage(14, 2)

      const authCalls = requests.filter(
        (request) =>
          request.payload?.params?.service === 'common' && request.payload?.params?.method === 'authenticate'
      )
      assert.equal(authCalls.length, 1)
    }
  )
})

test('RPC throws clear error on HTTP failure', async () => {
  await withMockFetch(
    [{ ok: false, status: 500, statusText: 'Internal Server Error', json: {} }],
    async () => {
      const client = makeClient()
      await assert.rejects(() => client.fetchTicketById(1), /Odoo RPC HTTP error 500/)
    }
  )
})

test('RPC throws clear error on JSON-RPC error payload', async () => {
  await withMockFetch(
    [
      {
        json: {
          error: {
            message: 'Access denied',
            data: { debug: 'stack' },
          },
        },
      },
    ],
    async () => {
      const client = makeClient()
      await assert.rejects(() => client.fetchTicketById(1), /Odoo RPC error: Access denied/)
    }
  )
})

test('RPC throws when result field is missing', async () => {
  await withMockFetch(
    [{ json: {} }],
    async () => {
      const client = makeClient()
      await assert.rejects(() => client.fetchTicketById(1), /missing result field/)
    }
  )
})
