import * as assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { chdir, cwd } from 'node:process'
import { test } from 'node:test'

import { loadConfig } from '../../src/config.js'

function writeFile(baseDir: string, relativePath: string, contents: string): void {
  const absolutePath = join(baseDir, relativePath)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, contents, 'utf8')
}

function withTempProject(
  files: Record<string, string>,
  run: (projectDir: string) => void
): void {
  const projectDir = mkdtempSync(join(tmpdir(), 'odoo-config-test-'))
  const previousCwd = cwd()
  const previousEnv = { ...process.env }

  for (const [path, contents] of Object.entries(files)) {
    writeFile(projectDir, path, contents)
  }

  try {
    chdir(projectDir)
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }
    Object.assign(process.env, previousEnv)
    run(projectDir)
  } finally {
    chdir(previousCwd)
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }
    Object.assign(process.env, previousEnv)
    rmSync(projectDir, { recursive: true, force: true })
  }
}

const baseRules = JSON.stringify(
  {
    requiredStageId: 1,
    resolvedStageId: 2,
    tagKeywords: ['login'],
    titleKeywords: ['login'],
    descriptionKeywords: ['invalid username or password'],
  },
  null,
  2
)

const baseDirectory = JSON.stringify([{ email: 'a@mindx.edu.vn', hrStatus: 'active', lmsStatus: 'active' }], null, 2)

test('loadConfig: loads defaults from .env and root json files', () => {
  withTempProject(
    {
      '.env': [
        'ODOO_URL=https://mindx-training.odoo.com',
        'ODOO_DB=mindx-training',
        'ODOO_LOGIN=bot@mindx.edu.vn',
        'ODOO_API_KEY=secret',
      ].join('\n'),
      'ticket-rules.json': baseRules,
      'mock-users.json': baseDirectory,
    },
    () => {
      const config = loadConfig()
      assert.equal(config.odooUrl, 'https://mindx-training.odoo.com')
      assert.equal(config.odooDb, 'mindx-training')
      assert.equal(config.intakeStageId, 1)
      assert.equal(config.rules.resolvedStageId, 2)
      assert.equal(config.directory.length, 1)
    }
  )
})

test('loadConfig: supports custom rules and directory file names', () => {
  withTempProject(
    {
      '.env': [
        'ODOO_URL=https://custom.odoo.com',
        'ODOO_DB=custom-db',
        'ODOO_LOGIN=agent@custom.io',
        'ODOO_API_KEY=abc',
        'RULES_FILE=config/rules.login.json',
        'MOCK_USERS_FILE=data/directory.json',
      ].join('\n'),
      'config/rules.login.json': baseRules,
      'data/directory.json': baseDirectory,
    },
    () => {
      const config = loadConfig()
      assert.equal(config.odooUrl, 'https://custom.odoo.com')
      assert.equal(config.rules.tagKeywords[0], 'login')
      assert.equal(config.directory[0]?.email, 'a@mindx.edu.vn')
    }
  )
})

test('loadConfig: throws when required env var is missing', () => {
  withTempProject(
    {
      '.env': ['ODOO_URL=https://x', 'ODOO_DB=db', 'ODOO_LOGIN=user'].join('\n'),
      'ticket-rules.json': baseRules,
      'mock-users.json': baseDirectory,
    },
    () => {
      assert.throws(() => loadConfig(), /Missing required env var: ODOO_API_KEY/)
    }
  )
})

test('loadConfig: throws when requiredStageId is invalid', () => {
  const invalidRules = JSON.stringify(
    {
      requiredStageId: 0,
      resolvedStageId: 2,
      tagKeywords: ['login'],
      titleKeywords: ['login'],
      descriptionKeywords: ['invalid'],
    },
    null,
    2
  )
  withTempProject(
    {
      '.env': ['ODOO_URL=https://x', 'ODOO_DB=db', 'ODOO_LOGIN=user', 'ODOO_API_KEY=key'].join('\n'),
      'ticket-rules.json': invalidRules,
      'mock-users.json': baseDirectory,
    },
    () => {
      assert.throws(() => loadConfig(), /requiredStageId must be a positive integer/)
    }
  )
})

test('loadConfig: throws when resolvedStageId is invalid', () => {
  const invalidRules = JSON.stringify(
    {
      requiredStageId: 1,
      resolvedStageId: -1,
      tagKeywords: ['login'],
      titleKeywords: ['login'],
      descriptionKeywords: ['invalid'],
    },
    null,
    2
  )
  withTempProject(
    {
      '.env': ['ODOO_URL=https://x', 'ODOO_DB=db', 'ODOO_LOGIN=user', 'ODOO_API_KEY=key'].join('\n'),
      'ticket-rules.json': invalidRules,
      'mock-users.json': baseDirectory,
    },
    () => {
      assert.throws(() => loadConfig(), /resolvedStageId must be a positive integer/)
    }
  )
})

test('loadConfig: throws when tagKeywords is empty', () => {
  const invalidRules = JSON.stringify(
    {
      requiredStageId: 1,
      resolvedStageId: 2,
      tagKeywords: [],
      titleKeywords: ['login'],
      descriptionKeywords: ['invalid'],
    },
    null,
    2
  )
  withTempProject(
    {
      '.env': ['ODOO_URL=https://x', 'ODOO_DB=db', 'ODOO_LOGIN=user', 'ODOO_API_KEY=key'].join('\n'),
      'ticket-rules.json': invalidRules,
      'mock-users.json': baseDirectory,
    },
    () => {
      assert.throws(() => loadConfig(), /tagKeywords must be a non-empty string array/)
    }
  )
})
