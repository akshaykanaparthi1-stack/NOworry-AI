import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.db import engine, Base, init_db_schema, SessionLocal
from backend.app.models.transaction import Transaction
from backend.app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all DB tables including Profile are created
    init_db_schema()
    try:
        db = SessionLocal()
        tx_count = db.query(Transaction).count()
        if tx_count == 0:
            from data.seed_demo_data import seed_demo_data
            seed_demo_data(db)
        db.close()
    except Exception as e:
        print("Auto-seed on startup note:", e)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Explicit CORS Origins for browser compatibility with credentials
cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "https://noworry-ai.vercel.app",
    "https://noworry-ai-api.onrender.com",
]
if settings.cors_origins:
    cors_origins.extend(settings.cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(set(cors_origins)),
    allow_origin_regex=r"(chrome-extension://.*|https://.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "product": "NoWorry AI — Autonomous Revenue Recovery Agent",
        "tagline": "Detect. Decide. Recover.",
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
