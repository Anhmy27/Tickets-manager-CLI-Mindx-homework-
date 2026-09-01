import * as assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { test } from 'node:test'

import { loadEnvFile } from '../../src/load-env.js'

function withTempEnvFile(contents: string, run: (filePath: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'odoo-env-test-'))
  const filePath = join(dir, '.env')
  writeFileSync(filePath, contents, 'utf8')
  try {
    run(filePath)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('loadEnvFile: loads keys and strips quotes', () => {
  withTempEnvFile("ODOO_URL='https://example.odoo.com'\nODOO_DB=\"my-db\"", (filePath) => {
    const env: NodeJS.ProcessEnv = {}
    loadEnvFile(filePath, env)

    assert.equal(env.ODOO_URL, 'https://example.odoo.com')
    assert.equal(env.ODOO_DB, 'my-db')
  })
})

test('loadEnvFile: ignores comments, empty lines, and malformed entries', () => {
  withTempEnvFile('# comment\n\nNO_SEPARATOR\n=bad\nGOOD_KEY=value', (filePath) => {
    const env: NodeJS.ProcessEnv = {}
    loadEnvFile(filePath, env)

    assert.deepEqual(env, { GOOD_KEY: 'value' })
  })
})

test('loadEnvFile: does not override existing env values', () => {
  withTempEnvFile('ODOO_DB=from-file\nNEW_KEY=file-value', (filePath) => {
    const env: NodeJS.ProcessEnv = { ODOO_DB: 'existing' }
    loadEnvFile(filePath, env)

    assert.equal(env.ODOO_DB, 'existing')
    assert.equal(env.NEW_KEY, 'file-value')
  })
})

test('loadEnvFile: keeps values containing additional equals signs', () => {
  withTempEnvFile('SECRET=abc=def=ghi', (filePath) => {
    const env: NodeJS.ProcessEnv = {}
    loadEnvFile(filePath, env)

    assert.equal(env.SECRET, 'abc=def=ghi')
  })
})

test('loadEnvFile: missing file is ignored', () => {
  const env: NodeJS.ProcessEnv = { EXISTS: 'yes' }
  loadEnvFile('Z:/this/path/should/not/exist/.env', env)
  assert.equal(env.EXISTS, 'yes')
})
