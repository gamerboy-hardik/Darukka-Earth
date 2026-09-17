from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, projects, metrics

app = FastAPI(
    title="Darukaa.Earth API",
    description="Backend API for Darukaa.Earth geospatial dashboard",
    version="0.1.0"
)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "API is healthy"}
