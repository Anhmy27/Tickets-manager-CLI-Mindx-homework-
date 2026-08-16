import * as assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { loadEnvFile } from '../../src/config/load-env.js'

test('loadEnvFile: reads KEY=VALUE and skips comments', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'cli-env-'))
  const envFile = join(tempDir, '.env')
  const env: NodeJS.ProcessEnv = {}

  try {
    await writeFile(
      envFile,
      '# comment\nKB_CLIENT_MODE=http\nKB_API_BASE_URL="http://127.0.0.1:4100"\n',
      'utf8'
    )

    loadEnvFile(envFile, env)

    assert.equal(env.KB_CLIENT_MODE, 'http')
    assert.equal(env.KB_API_BASE_URL, 'http://127.0.0.1:4100')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('loadEnvFile: does not override existing env values', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'cli-env-'))
  const envFile = join(tempDir, '.env')
  const env: NodeJS.ProcessEnv = {
    KB_CLIENT_MODE: 'mock',
  }

  try {
    await writeFile(envFile, 'KB_CLIENT_MODE=http\n', 'utf8')

    loadEnvFile(envFile, env)

    assert.equal(env.KB_CLIENT_MODE, 'mock')
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
})

test('loadEnvFile: missing file is ignored', () => {
  const env: NodeJS.ProcessEnv = {}

  loadEnvFile(join(tmpdir(), 'missing-cli-env.env'), env)

  assert.deepEqual(env, {})
})
