# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fullstack product management app — FastAPI backend + React frontend (Vite + TypeScript + Tailwind + shadcn/ui). Backend is complete; frontend is partially initialized.

**Deployment:** Backend → Railway, Frontend → Vercel (single repo)

## Commands

### Backend (all commands run from `backend/` directory)
```bash
cd backend
# Activate venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Run server (with auto-reload)
venv/Scripts/uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run all tests
venv/Scripts/pytest -v

# Run a single test file
venv/Scripts/pytest tests/test_auth.py -v

# Run a single test
venv/Scripts/pytest tests/test_auth.py::test_login_success -v

# Check typing
venv/Scripts/python -m mypy main.py

# Seed admin user (runs automatically on startup, but can run manually)
venv/Scripts/python -m database.seed
```

### Frontend (run from `frontend/` directory)
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Architecture

### Backend (monolithic FastAPI)

```
backend/
├── main.py                    # FastAPI app with lifespan handler
├── routers/                   # API routes (auth, categories, products, dashboard, reports)
├── models/                   # Pydantic v2 schemas
├── services/                 # Business logic (one per domain)
├── database/                 # MongoDB (Motor) + repositories + seed script
├── auth/                     # JWT (python-jose) + bcrypt password hashing
├── tests/                   # Unit tests (mocked services, 20 tests passing)
└── .env                      # Environment config (gitignored)
```

**Key patterns:**
- **Lifespan events** (not deprecated `on_event`) — `main.py` uses `@asynccontextmanager` lifespan to init services + seed admin
- **Service initialization** — all 5 services (`AuthService`, `CategoryService`, `ProductService`, `DashboardService`, `ReportService`) initialized in lifespan, not per-request
- **Repository pattern** — each service uses a repository for MongoDB operations
- **UUID foreign keys** — `category_id` in products must be valid UUID (validated in Pydantic `@field_validator`)
- **JWT auth** — HS256, 24h expiry, `get_current_user_id` dependency injects `user_id` into all protected routes
- **Admin seed** — `database/seed.py` creates initial admin user from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars

**Environment (`.env`):**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/product_management
JWT_SECRET_KEY=<secret>
ADMIN_USERNAME=...
ADMIN_PASSWORD=...  # Max 72 bytes (bcrypt limit)
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/verify` | Validate token |
| GET/POST/PUT/DELETE | `/api/categories` + `/{id}` | Category CRUD |
| GET/POST/PUT/DELETE | `/api/products` + `/{id}` | Product CRUD (filter by `?category_id=`) |
| GET | `/api/dashboard/stats` | Stats: total products, categories, inventory value, low stock |
| GET | `/api/reports/products` | Export products as CSV |

### Frontend (partially initialized)

```
frontend/
├── src/
│   ├── components/ui/         # shadcn/ui components (button.tsx exists)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Tailwind directives + CSS variables
├── tailwind.config.ts
├── postcss.config.js
└── .env                        # VITE_API_URL=http://localhost:8000
```

**Frontend stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui (class-variance-authority for component variants)

## Pydantic v2 Migration Notes

Some models still use Pydantic v1 style (deprecation warnings in tests):
- `@validator` → use `@field_validator` from `pydantic`
- `class Config` → use `model_config = ConfigDict(...)`

## MongoDB Notes

- **Atlas (cloud):** URI format `mongodb+srv://...` — Motor handles both `mongodb://` and `mongodb+srv://`
- **Local:** `mongodb://localhost:27017`
- **bcrypt limit:** Passwords must be ≤ 72 bytes, truncate if needed
