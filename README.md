# DevToolBox

Gerador de passwords com React, Vite e shadcn/ui, servido por uma API FastAPI.
A API gera uma password por pedido com `secrets`, usa o mesmo algoritmo do CLI em `backend/commands/password.py` e não guarda passwords em ficheiros ou base de dados. A UI mantém apenas o resultado atual em memória.

## Desenvolvimento

Requisitos: Python 3.14, uv, Node.js 24 e npm.

```sh
cd backend
uv sync
cd ../frontend/DevToolBox
npm ci
```

Na raiz, abrir dois terminais:

```sh
make backend
```

```sh
make frontend
```

Abrir http://localhost:5173. O Vite encaminha `/api` para o backend em `127.0.0.1:8000`, mantendo a mesma origem e dispensando CORS.
Swagger: http://localhost:8000/docs.

## API

`POST /api/passwords/generate`

```json
{"length":16,"letters":true,"digits":true,"punctuation":true}
```

Resposta: `{"password":"..."}` com `Cache-Control: no-store`.
Comprimento máximo: 128. É obrigatório selecionar pelo menos um tipo e um comprimento entre 1 e 128. Os tipos escolhidos definem o conjunto de caracteres possíveis; não é garantida a presença de todos os tipos no resultado. Pedidos inválidos devolvem 422.
`GET /api/health` devolve `{"status":"ok"}`.

## Verificação

```sh
make test
make check
cd frontend/DevToolBox && npm run build
```

## Docker Compose: dev e produção

Há dois serviços: `backend` (FastAPI) e `nginx` (serve o build do frontend e faz reverse proxy para a API). Só publica `127.0.0.1:80`; o backend não publica portas no host em nenhum ambiente.

| Ambiente | Comando | Frontend | Swagger |
| --- | --- | --- | --- |
| Dev | `docker compose up -d --build` | http://localhost | http://localhost/docs |
| Produção | `docker compose -f compose.prod.yaml up -d --build` | http://localhost | Desativado (404) |

Em dev, http://localhost/openapi.json serve o schema e http://localhost/redoc serve o ReDoc. O backend recarrega alterações em `backend/app` e `backend/commands`. Para atualizar o frontend, repetir o comando com `--build` (para HMR, usar o Vite local descrito acima).

Em produção, `ENABLE_DOCS=false` desativa a documentação no FastAPI e o Nginx bloqueia essas rotas. `/api` continua acessível pelo Nginx para a UI gerar passwords. Há um limite de 5 pedidos/segundo por IP, com burst de 10 e resposta 429 ao excedê-lo.

`compose.yaml` é desenvolvimento. `compose.prod.yaml` é produção. São independentes, sem overrides nem `extends`.

Dev e produção usam a mesma porta e devem correr alternadamente. Parar o ambiente atual antes de mudar:

```sh
docker compose down
# ou
docker compose -f compose.prod.yaml down
```

Na VPS, esta configuração fica acessível apenas no próprio servidor, não pelo IP público. Para aceder a partir do teu computador sem a publicar, usar um túnel SSH:

```sh
ssh -L 8080:127.0.0.1:80 utilizador@vps
```

Depois abrir http://localhost:8080 no computador. Uma publicação futura com domínio e HTTPS exige configurar explicitamente a entrada pública; não está ativada nestes ficheiros.

O CLI original continua disponível com `cd backend && uv run python main.py`; esse fluxo ainda grava ficheiros em `backend/passwords/`, ignorados pelo Git.

## Referências

- [shadcn/ui: instalação](https://ui.shadcn.com/docs/installation)
- [FastAPI em Docker](https://fastapi.tiangolo.com/deployment/docker/)
