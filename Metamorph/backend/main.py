from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        from app.config.database import init_db
        init_db()
        logger.info("Database initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
    yield
    # Shutdown
    logger.info("Application shutdown")

app = FastAPI(
    title="Urban Planning GNN API",
    description="Backend API for Generative Urban City Planner with GNN optimization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://metamorph-frontend.onrender.com",
        "https://*.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
try:
    from app.routes import projects, analysis, gnn
    app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
    app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
    app.include_router(gnn.router, prefix="/api/gnn", tags=["gnn"])
except ImportError as e:
    logger.warning(f"Some routes could not be imported: {e}")

@app.get("/")
async def root():
    return {"message": "Urban Planning GNN API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "urban-planning-api"}

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)