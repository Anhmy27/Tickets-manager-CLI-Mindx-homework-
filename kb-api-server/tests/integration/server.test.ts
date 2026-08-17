import * as assert from 'node:assert/strict'
import { access, mkdtemp, rm, readFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { startKbApiServer } from '../../src/server.js'

test('KB API server: search/list/retrieve/add happy path', async () => {
  await withServer(async (baseUrl) => {
    const searchResponse = await postJson(baseUrl, '/search', {
      query: 'response',
      topK: 3,
    })
    const listResponse = await postJson(baseUrl, '/list', {
      nodePath: '/templates/email',
      limit: 10,
    })
    const retrieveResponse = await postJson(baseUrl, '/retrieve', {
      docId: 'doc-001',
    })
    const addResponse = await postJson(baseUrl, '/add', {
      title: 'SMS Template',
      content: 'Your verification code is 123456',
      nodePath: '/templates/sms',
      tags: ['sms'],
    })
    const retrieveAddedResponse = await postJson(baseUrl, '/retrieve', {
      docId: (addResponse.body as { id: string }).id,
    })

    assert.equal(searchResponse.status, 200)
    assert.equal(listResponse.status, 200)
    assert.equal(retrieveResponse.status, 200)
    assert.equal(addResponse.status, 200)
    assert.equal(retrieveAddedResponse.status, 200)

    const searchBody = searchResponse.body as Array<{ id: string }>
    assert.equal(searchBody[0]?.id, 'doc-001')

    const listBody = listResponse.body as Array<{ id: string }>
    assert.equal(listBody.length, 2)

    const retrieveBody = retrieveResponse.body as { id: string }
    assert.equal(retrieveBody.id, 'doc-001')

    const addedBody = addResponse.body as { id: string; nodePath: string }
    assert.match(addedBody.id, /^doc-/)
    assert.equal(addedBody.nodePath, '/templates/sms')
  })
})

test('KB API server: returns 400 for invalid payload', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/search', { query: '' })
    assert.equal(response.status, 400)
    assert.match(String((response.body as { error: string }).error), /query is required/i)
  })
})

test('KB API server: returns 400 when search query missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/search', {})
    assertError(response, 400, /query is required/i)
  })
})

test('KB API server: returns 400 when topK is zero', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/search', {
      query: 'response',
      topK: 0,
    })
    assertError(response, 400, /topK must be a positive integer/i)
  })
})

test('KB API server: returns 400 when topK is non-integer', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/search', {
      query: 'response',
      topK: 1.5,
    })
    assertError(response, 400, /topK must be a positive integer/i)
  })
})

test('KB API server: returns 400 when list nodePath missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/list', {})
    assertError(response, 400, /nodePath is required/i)
  })
})

test('KB API server: returns 400 when limit is invalid', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/list', {
      nodePath: '/templates/email',
      limit: -1,
    })
    assertError(response, 400, /limit must be a positive integer/i)
  })
})

test('KB API server: list returns empty array for unknown node', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/list', {
      nodePath: '/missing/node',
    })
    assert.equal(response.status, 200)
    assert.deepEqual(response.body, [])
  })
})

test('KB API server: returns 404 for missing document', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/retrieve', { docId: 'missing-id' })
    assert.equal(response.status, 404)
    assert.match(String((response.body as { error: string }).error), /not found/i)
  })
})

test('KB API server: returns 400 when retrieve docId missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/retrieve', {})
    assertError(response, 400, /document id is required/i)
  })
})

test('KB API server: returns 400 when retrieve docId is empty', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/retrieve', { docId: '   ' })
    assertError(response, 400, /document id is required/i)
  })
})

test('KB API server: returns 400 when add title missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      content: 'body',
      nodePath: '/templates/sms',
    })
    assertError(response, 400, /title is required/i)
  })
})

test('KB API server: returns 400 when add content missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      title: 'SMS template',
      nodePath: '/templates/sms',
    })
    assertError(response, 400, /content is required/i)
  })
})

test('KB API server: returns 400 when add nodePath missing', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      title: 'SMS template',
      content: 'Body',
    })
    assertError(response, 400, /nodePath is required/i)
  })
})

test('KB API server: returns 400 when add tags type invalid', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      title: 'SMS template',
      content: 'Body',
      nodePath: '/templates/sms',
      tags: 123,
    })
    assertError(response, 400, /tags must be a string or an array of strings/i)
  })
})

test('KB API server: returns 400 when add duplicate id', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      id: 'doc-001',
      title: 'Duplicated',
      content: 'Body',
      nodePath: '/templates/sms',
    })
    assertError(response, 400, /document id already exists/i)
  })
})

test('KB API server: add normalizes comma-separated tags', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/add', {
      title: 'SMS template',
      content: 'Body',
      nodePath: '/templates/sms',
      tags: 'sms, otp,  ',
    })

    assert.equal(response.status, 200)
    const body = response.body as { tags: string[] }
    assert.deepEqual(body.tags, ['sms', 'otp'])
  })
})

test('KB API server: returns 405 for non-POST methods', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/search`, { method: 'GET' })
    assert.equal(response.status, 405)
  })
})

test('KB API server: returns 404 for unknown route', async () => {
  await withServer(async (baseUrl) => {
    const response = await postJson(baseUrl, '/unknown', { any: 'payload' })
    assertError(response, 404, /not found/i)
  })
})

test('KB API server: returns 400 for invalid JSON body', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/search`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"query":',
    })
    const payload = (await response.json()) as { error?: string }
    assert.equal(response.status, 400)
    assert.match(payload.error ?? '', /valid json/i)
  })
})

test('KB API server: persists added document across server restart', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-server-data-'))
  const serverA = await startKbApiServer({ port: 0, dataDir })

  try {
    const addResponse = await postJson(serverA.baseUrl, '/add', {
      title: 'Persistent Template',
      content: 'This content should survive restart.',
      nodePath: '/templates/email',
      tags: ['template'],
    })
    assert.equal(addResponse.status, 200)
    const created = addResponse.body as { id: string }

    await serverA.close()
    const serverB = await startKbApiServer({ port: 0, dataDir })
    try {
      const retrieveResponse = await postJson(serverB.baseUrl, '/retrieve', {
        docId: created.id,
      })
      assert.equal(retrieveResponse.status, 200)
      const retrieved = retrieveResponse.body as { id: string; content: string }
      assert.equal(retrieved.id, created.id)
      assert.match(retrieved.content, /survive restart/i)
    } finally {
      await serverB.close()
    }
  } finally {
    await rm(dataDir, { recursive: true, force: true })
  }
})

test('KB API server: writes index and markdown file on add', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-server-data-'))
  const server = await startKbApiServer({ port: 0, dataDir })

  try {
    const addResponse = await postJson(server.baseUrl, '/add', {
      id: 'doc-custom',
      title: 'Disk Layout Check',
      content: 'Disk content body',
      nodePath: '/team/devops',
      tags: ['ops'],
    })
    assert.equal(addResponse.status, 200)

    await access(join(dataDir, 'index.json'), constants.F_OK)
    await access(join(dataDir, 'team', 'devops', 'doc-custom.md'), constants.F_OK)

    const indexRaw = await readFile(join(dataDir, 'index.json'), 'utf8')
    assert.match(indexRaw, /doc-custom/)
  } finally {
    await server.close()
    await rm(dataDir, { recursive: true, force: true })
  }
})

async function withServer(task: (baseUrl: string) => Promise<void>): Promise<void> {
  const dataDir = await mkdtemp(join(tmpdir(), 'kb-server-test-'))
  const server = await startKbApiServer({ port: 0, dataDir })
  try {
    await task(server.baseUrl)
  } finally {
    await server.close()
    await rm(dataDir, { recursive: true, force: true })
  }
}

function assertError(
  response: { status: number; body: unknown },
  expectedStatus: number,
  expectedMessage: RegExp
): void {
  assert.equal(response.status, expectedStatus)
  const body = response.body as { error?: unknown }
  assert.match(String(body.error ?? ''), expectedMessage)
}

async function postJson(
  baseUrl: string,
  path: string,
  payload: unknown
): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = (await response.json()) as unknown
  return { status: response.status, body }
}
