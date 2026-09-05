import { readFileSync } from 'node:fs'

/**
 * Load KEY=VALUE pairs from a .env file into `env`.
 * Existing values in `env` win (shell / CI overrides file).
 */
export function loadEnvFile(
  filePath: string,
  env: NodeJS.ProcessEnv = process.env
): void {
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf8')
  } catch (error: unknown) {
    if (isEnoent(error)) {
      return
    }

    throw error
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim())

    if (key === '' || env[key] !== undefined) {
      continue
    }

    env[key] = value
  }
}

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  return value
}

function isEnoent(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'ENOENT'
  )
}
