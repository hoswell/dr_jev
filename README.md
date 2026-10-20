# dr_jev
F&amp;C apprenticeship app

## Backend

FastAPI app in `backend/`. Requires [uv](https://docs.astral.sh/uv/) (Python 3.13 is installed automatically).

### Run

```sh
cd backend
uv run backend   # installs dependencies on first run, starts the server with auto-reload
```

The API is served at http://127.0.0.1:8000 and the interactive docs (Swagger UI) at http://127.0.0.1:8000/docs.

Sessions are stored in memory, so they reset whenever the server restarts.

### Endpoints

| Method | Path                           | Description                                                        |
| ------ | ------------------------------ | ------------------------------------------------------------------ |
| POST   | `/sessions`                    | Create a session, returns `{"session_id": 1}`                      |
| GET    | `/questions`                   | List the questions (`[{"id": "q1", "text": "..."}]`)               |
| POST   | `/sessions/{session_id}/answers` | Submit answers, returns Jev's assessment                         |

### Tests

```sh
cd backend
uv run pytest
```
