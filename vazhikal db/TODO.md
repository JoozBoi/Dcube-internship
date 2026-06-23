# TODO - FastAPI/Frontend API Alignment Fixes

## Completed
- [ ] 

## To do
1. [ ] Update FastAPI `src/backend/main.py`:
   - [ ] Add `GET /api/users/{uid}`
   - [ ] Add `PUT /api/users/{uid}`
2. [ ] Update FastAPI CORS in `src/backend/main.py`:
   - [ ] Allow only localhost:3000 / 127.0.0.1:3000 (with credentials)
3. [ ] Add duplicate insert protection:
   - [ ] Catch SQLAlchemy unique/PK conflicts and return HTTP 400 for relevant POST endpoints
4. [ ] Update frontend `src/frontend/App.jsx`:
   - [ ] Introduce `API_BASE_URL = 'http://127.0.0.1:8000'`
   - [ ] Replace all `/api/...` and relative `/api/...` calls with `${API_BASE_URL}/api/...`
5. [ ] Run backend/frontend and smoke test endpoints.

