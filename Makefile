backend:
	cd backend && uv run uvicorn app.main:app --reload

frontend:
	cd frontend/DevToolBox && npm run dev

check:
	cd backend && uv run ruff check app tests
	cd frontend/DevToolBox && npm run lint

test:
	cd backend && uv run python -m unittest discover -s tests

format:
	cd backend && uv run ruff format app tests

up:
	docker compose up -d --build

down:
	docker compose down

prod-up:
	docker compose -p devtoolbox -f compose.prod.yaml up -d --build

prod-down:
	docker compose -p devtoolbox -f compose.prod.yaml down
