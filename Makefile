check: # Run the linter
	uv run ruff check --fix .

format: # Run the formatter
	uv run ruff format .
