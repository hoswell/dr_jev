import logging

from fastapi import FastAPI

from backend.routes import router

logging.basicConfig(level=logging.INFO, format="%(levelname)s:     %(name)s - %(message)s")

app = FastAPI(title="Dr Jev")
app.include_router(router)
