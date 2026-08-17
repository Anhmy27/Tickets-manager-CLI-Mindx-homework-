# KB API Server

KB API server for Week 3 integration. This service exposes 4 HTTP endpoints used by `ticket-manager-cli` when `KB_CLIENT_MODE=http`.

## Run

```bash
cd kb-api-server
npm install
npm start
```

Default listen address:

- `KB_API_HOST=127.0.0.1`
- `KB_API_PORT=4100`

Override if needed:

```powershell
$env:KB_API_PORT="5000"
npm start
```

## API Contract

All endpoints use `POST` with JSON body:

- `POST /search` body `{ "query": "response", "topK": 3 }`
- `POST /list` body `{ "nodePath": "/templates/email", "limit": 10 }`
- `POST /retrieve` body `{ "docId": "doc-001" }`
- `POST /add` body `{ "title": "...", "content": "...", "nodePath": "...", "tags": ["sms"] }`

Error format:

```json
{ "error": "message" }
```

## Data Persistence

KB documents are persisted on disk under `kb-api-server/data`:

- `data/index.json`: metadata index (`id`, `title`, `nodePath`, `tags`, `filePath`)
- `data/<nodePath>/<id>.md`: markdown content file (for example `data/templates/email/doc-001.md`)

The server reads and writes these files automatically, so documents remain available after server restart.

## Source Layout

- `src/server.ts`: HTTP bootstrap (`startKbApiServer`)
- `src/controllers/`: HTTP request lifecycle + error mapping
- `src/routes/`: path-to-use-case routing (`/search`, `/list`, `/retrieve`, `/add`)
- `src/services/`: KB business logic (validation, search/list/retrieve/add)
- `src/repositories/`: persistence implementations (`file-system` + in-memory for unit tests)
- `src/models/`: request/document types
- `src/errors/`: domain error classes
- `src/utils/`: HTTP JSON helpers
- `src/config/`: environment parsing helpers
