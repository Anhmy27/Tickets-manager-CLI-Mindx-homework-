import * as assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { dirname } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const cliRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))

test('E2E kb mock: search → list → retrieve against seed documents', async () => {
  const searchResult = await execCli(['kb', 'search', 'response', '--top-k', '3'])
  assert.match(searchResult.stdout, /Customer Response Template/)
  assert.match(searchResult.stdout, /doc-001/)

  const listResult = await execCli([
    'kb',
    'list',
    '--node',
    '/team/devops',
  ])
  assert.match(listResult.stdout, /DevOps Team Members/)
  assert.match(listResult.stdout, /doc-002/)

  const retrieveResult = await execCli(['kb', 'retrieve', 'doc-001'])
  assert.match(retrieveResult.stdout, /reaching out/)
  assert.match(retrieveResult.stdout, /\/templates\/email/)
})

test('E2E kb mock: retrieve unknown id exits 1', async () => {
  await assert.rejects(
    () => execCli(['kb', 'retrieve', 'missing-id']),
    (error: unknown) => {
      assert.ok(isExecError(error))
      assert.equal(error.code, 1)
      assert.match(error.stderr, /not found/i)
      return true
    }
  )
})

async function execCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(
    process.execPath,
    ['--import', 'tsx', 'src/cli.ts', ...args],
    {
      cwd: cliRoot,
    }
  )
}

function isExecError(
  error: unknown
): error is { code: number; stderr: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'stderr' in error &&
    typeof (error as { stderr: unknown }).stderr === 'string'
  )
}
