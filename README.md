# DevToolBox

A password generator built with React, Vite, and shadcn/ui, backed by a FastAPI API.
The API generates one password per request using `secrets`, shares the CLI algorithm in `backend/commands/password.py`, and does not store passwords in files or a database. The UI keeps only the current result in memory.

## Development

Requirements: Python 3.14, uv, Node.js 24, and npm.

```sh
cd backend
uv sync
cd ../frontend/DevToolBox
npm ci
```

From the project root, open two terminals:

```sh
make backend
```

```sh
make frontend
```

Open http://localhost:5173. Vite proxies `/api` to the backend at `127.0.0.1:8000`, keeping requests on the same origin and avoiding the need for CORS configuration.
Swagger: http://localhost:8000/docs.

## API

`POST /api/passwords/generate`

```json
{"length":16,"letters":true,"digits":true,"punctuation":true}
```

Response: `{"password":"..."}` with `Cache-Control: no-store`.
Maximum length: 128. At least one character type must be selected, and the length must be between 1 and 128. Selected types define the pool of possible characters; the result is not guaranteed to contain every selected type. Invalid requests return 422.
`GET /api/health` returns `{"status":"ok"}`.

## Verification

```sh
make test
make check
cd frontend/DevToolBox && npm run build
```

## Docker Compose: development and production

There are two services: `backend` (FastAPI) and `nginx` (serves the frontend build and acts as a reverse proxy for the API). In development, Nginx publishes `127.0.0.1:80`. In production, neither service publishes ports; only Nginx joins the external `vps-proxy` network. The backend stays on the project's own network.

| Environment | Command | Frontend | Swagger |
| --- | --- | --- | --- |
| Development | `docker compose up -d --build` | http://localhost | http://localhost/docs |
| Production | `docker compose -p devtoolbox -f compose.prod.yaml up -d --build` | https://devtoolbox.pedrocrlx.pt after integration | Disabled (404) |

In development, http://localhost/openapi.json serves the schema and http://localhost/redoc serves ReDoc. The backend reloads changes in `backend/app` and `backend/commands`. To update the frontend, run the command again with `--build` (for HMR, use the local Vite setup described above).

In production, `ENABLE_DOCS=false` disables FastAPI documentation, and Nginx blocks those routes. `/api` remains accessible through Nginx so the UI can generate passwords. Requests are limited to 5 per second per IP, with a burst of 10 and a 429 response when exceeded.

`compose.yaml` is for development. `compose.prod.yaml` is for production. They are independent, with no overrides or `extends`.

To deploy on the VPS alongside MidnightLibrary, follow [ops/DEPLOY.md](ops/DEPLOY.md). It covers network creation and the required changes to the existing Nginx configuration. Cloning and starting DevToolBox does not automatically make the subdomain publicly accessible.

The original CLI remains available through `cd backend && uv run python main.py`; this flow still writes files to `backend/passwords/`, which Git ignores.

## References

- [shadcn/ui installation](https://ui.shadcn.com/docs/installation)
- [FastAPI in Docker](https://fastapi.tiangolo.com/deployment/docker/)
