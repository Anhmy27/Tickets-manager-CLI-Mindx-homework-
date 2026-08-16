import * as assert from 'node:assert/strict'
import { test } from 'node:test'

import { readPort } from '../../src/config/env.js'

test('readPort: uses fallback when raw is undefined', () => {
  assert.equal(readPort(undefined), 4100)
  assert.equal(readPort(undefined, 5000), 5000)
})

test('readPort: parses valid integer port', () => {
  assert.equal(readPort('4100'), 4100)
  assert.equal(readPort('65535'), 65535)
})

test('readPort: rejects invalid port values', () => {
  assert.throws(() => readPort('0'), /integer between 1 and 65535/i)
  assert.throws(() => readPort('-1'), /integer between 1 and 65535/i)
  assert.throws(() => readPort('99999'), /integer between 1 and 65535/i)
  assert.throws(() => readPort('3.14'), /integer between 1 and 65535/i)
  assert.throws(() => readPort('abc'), /integer between 1 and 65535/i)
})
