# Backend

Run `uv sync` then `uv run uvicorn app.main:app --reload` from this directory.
API documentation: http://localhost:8000/docs.
Run tests with `uv run python -m unittest discover -s tests`.
The legacy CLI remains available via `uv run python main.py`; only that CLI writes files.
