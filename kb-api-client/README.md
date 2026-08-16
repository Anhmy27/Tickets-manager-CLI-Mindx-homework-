# KB API Client

`kb-api-client` là package client thật để gọi Knowledge Base API qua HTTP.

## Scope

- Chỉ xử lý HTTP request/response cho 4 endpoint:
  - `POST /search`
  - `POST /list`
  - `POST /retrieve`
  - `POST /add`
- Không chứa logic CLI.
- Không chứa mock in-memory của `ticket-manager-cli`.

## API của package

Package export:

- `HTTPKBClient`
- `KBClientValidationError`
- `KBClientNotFoundError`
- `KBClientRequestError`

Ví dụ:

```ts
import { HTTPKBClient } from 'kb-api-client'

const client = new HTTPKBClient({ baseUrl: 'http://127.0.0.1:4100' })
const results = await client.search({ query: 'response', topK: 3 })
```

## Chạy test

```bash
cd kb-api-client
npm install
npm test
```

## Ghi chú

- Test của package này kiểm tra nội bộ HTTP client (unit + integration trong chính folder này).
- Test gọi từ CLI sang client thật nằm ở `ticket-manager-cli/tests`.
