from fastapi import FastAPI

from backend.routes import router

app = FastAPI(title="Dr Jev")
app.include_router(router)
