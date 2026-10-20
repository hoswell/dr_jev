# dr_jev
F&amp;C apprenticeship app

## Backend

FastAPI app in `backend/`. Requires [uv](https://docs.astral.sh/uv/) (Python 3.13 is installed automatically).

### Configure

Assessments come from the Jev model via [TypeSafe](https://docs.typesafe.ai). Create an API key in the TypeSafe console and put it in `backend/.env`:

```sh
TYPESAFE_API_KEY=your-key-here
```

The file is loaded automatically on startup (`.env` is gitignored).

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

`POST /sessions/{session_id}/answers` takes free-text answers:

```sh
curl -X POST localhost:8000/sessions/1/answers \
  -H 'Content-Type: application/json' \
  -d '{"answers": [{"question_id": "q1", "answer": "Crushing chest pain"}]}'
```

The response contains `criticality` and `patient_honesty` (0–9 scores), `call_ambulance` and `kick_out_office` (booleans), `treatment` and `patient_emotion`.

### Tests

```sh
cd backend
uv run pytest   # Jev is mocked, no API key needed
```
