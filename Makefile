.PHONY: dev dev-backend dev-frontend setup seed test docker-up docker-down

# ── Development ──────────────────────────────────────────────

setup:
	cd backend && python -m venv .venv && .venv/bin/pip install -r requirements.txt
	cd frontend && npm install

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

seed:
	cd backend && python seed.py

test:
	cd backend && python -m pytest tests/ -v

test-matching:
	cd backend && python -m pytest tests/test_matching.py -v

# ── Docker ───────────────────────────────────────────────────

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-seed:
	docker compose exec backend python seed.py

# ── Database ─────────────────────────────────────────────────

db-migrate:
	cd backend && alembic revision --autogenerate -m "$(msg)"

db-upgrade:
	cd backend && alembic upgrade head

db-downgrade:
	cd backend && alembic downgrade -1
