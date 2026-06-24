# Vazhikal

React + Vite frontend and FastAPI + PostgreSQL backend, separated at the repository root.

## Run locally

1. Install Python 3.11+ and PostgreSQL, then create a virtual environment: `py -m venv backend/.venv`.
2. Install the API dependencies: `backend\\.venv\\Scripts\\python.exe -m pip install -r backend/requirements.txt`.
3. Create `backend/.env` from `backend/.env.example` and set a valid PostgreSQL `DATABASE_URL`.
4. In one terminal, run `backend\\.venv\\Scripts\\python.exe -m uvicorn backend.main:app --reload --port 8000`.
5. In a second terminal, run `npm run dev --prefix frontend`.

The frontend runs at `http://localhost:3000`; FastAPI runs at `http://localhost:8000`. Vite proxies `/api` to FastAPI during development. API documentation is available at `http://localhost:8000/docs`.
