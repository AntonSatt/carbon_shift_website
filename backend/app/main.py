"""
CarbonShift Simulator - FastAPI Application

Main entry point for the backend API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.simulation import router as simulation_router

app = FastAPI(
    title="CarbonShift Simulator API",
    description="Simulate and compare carbon emissions and costs across cloud regions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",  # For Vercel deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(simulation_router, prefix="/api/v1", tags=["simulation"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "CarbonShift Simulator API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
