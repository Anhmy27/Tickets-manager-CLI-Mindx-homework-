#!/usr/bin/env node

import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export {
  parseCliArguments,
  runCli,
} from './adapters/inbound/cli/ticket-cli-controller.js'

function resolveExistingPath(filePath: string): string {
  try {
    return realpathSync(resolve(filePath))
  } catch {
    return resolve(filePath)
  }
}

const currentFilePath = resolveExistingPath(fileURLToPath(import.meta.url))
const isDirectRun =
  Boolean(process.argv[1]) &&
  resolveExistingPath(process.argv[1]!) === currentFilePath

if (isDirectRun) {
  const { runCli } = await import('./adapters/inbound/cli/ticket-cli-controller.js')
  const exitCode = await runCli(process.argv.slice(2))
  process.exit(exitCode)
}
