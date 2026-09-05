import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { createKbClientFromEnv } from '../../src/clients/create-kb-client.js'
import { HttpKbClientAdapter } from '../../src/clients/http-kb-client-adapter.js'
import { MockKBClient } from '../../src/clients/mock-kb-client.js'
import { ValidationError } from '../../src/models/errors.js'

test('createKbClientFromEnv: default mode returns MockKBClient', () => {
  const client = createKbClientFromEnv({})

  assert.ok(client instanceof MockKBClient)
})

test('createKbClientFromEnv: http mode returns HttpKbClientAdapter', () => {
  const client = createKbClientFromEnv({
    KB_CLIENT_MODE: 'http',
    KB_API_BASE_URL: 'http://127.0.0.1:4100',
  })

  assert.ok(client instanceof HttpKbClientAdapter)
})

test('createKbClientFromEnv: invalid config throws ValidationError', () => {
  assert.throws(
    () =>
      createKbClientFromEnv({
        KB_CLIENT_MODE: 'http',
      }),
    ValidationError
  )
})
