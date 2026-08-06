# Ticket Manager CLI

CLI tool to manage tickets stored locally in JSON files.

Built in Week 2 of MindX Engineer Onboarding using TDD (Red → Green → Refactor).

## Status

TDD **Red** phase: tests are written against Week 2 requirements; implementations are intentionally stubbed and should fail until Green.

## Commands

| Command | Description |
|---------|-------------|
| `tickets create` | Create a ticket (title, description, status, priority, tags) |
| `tickets list` | List tickets with filters (status, priority, tags) |
| `tickets show <id>` | Show ticket details |
| `tickets update <id>` | Update ticket status |

## Folder structure

```text
ticket-manager-cli/
├── src/
│   ├── cli.js                           # Thin entry point
│   ├── domain/                          # Core business rules
│   │   ├── shared/errors.js
│   │   └── tickets/ticket.js
│   ├── application/                     # Use cases and ports
│   │   ├── ports/ticket-repository.js
│   │   └── use-cases/ticket-service.js
│   └── adapters/                        # Inbound/outbound adapters
│       ├── inbound/cli/ticket-cli-controller.js
│       └── outbound/json/json-ticket-repository.js
├── tests/
│   ├── unit/                            # Domain and use-case tests
│   ├── integration/                     # Real JSON adapter and CLI wiring
│   └── e2e/                             # Run real CLI commands
├── data/                                # Local ticket storage (gitignored JSON)
├── package.json
└── README.md
```

## Setup

```bash
cd ticket-manager-cli
npm test
```

## Usage

```bash
node src/cli.js --help
```

By default, runtime data is stored in `data/tickets.json`. During tests, a temporary JSON file is used instead of the real `data/` folder.

### Create a ticket

```bash
node src/cli.js create --title "Bug login"
node src/cli.js create --title "API timeout" --priority high --tags api,backend
```

### List tickets

```bash
node src/cli.js list
node src/cli.js list --status open
node src/cli.js list --priority high --tags api
```

### Show a ticket

```bash
node src/cli.js show <id>
```

### Update ticket status

```bash
node src/cli.js update <id> --status closed
```

### Use a custom data file

```bash
node src/cli.js create --title "Bug login" --data-file ./tmp/tickets.json
```

## Testing

```bash
npm test                 # all tests
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Week 2 goals

- Practice TDD: failing test → implement → pass → refactor
- Practice a simple hexagonal structure: adapters → application → domain
- Cover happy paths and error cases (invalid input, not found, missing/corrupt JSON)

## Test stack

- `node:test`
- `node:assert/strict`
- `node:fs/promises`, `node:os`, `node:path` for temp files
- `node:child_process` for E2E CLI execution
