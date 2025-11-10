from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Prisere Insurance Policy Comparison API",
    description="Backend API for comparing insurance policy renewals",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint to verify service is running."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "service": "prisere-api",
            "version": "1.0.0",
            "environment": settings.environment
        }
    )


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "message": "Prisere Insurance Policy Comparison API",
        "version": "1.0.0",
        "docs": "/docs" if settings.environment == "development" else "disabled"
    }


# Import and include routers
# Auth router disabled for testing without Clerk keys
# from app.routers import auth
# app.include_router(auth.router)

# Upload router (no auth required for testing)
from app.routers import uploads
app.include_router(uploads.router)


@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("=" * 60)
    logger.info("Prisere API Starting...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Port: {settings.port}")
    logger.info("Registered routes:")
    for route in app.routes:
        if hasattr(route, "path") and hasattr(route, "methods"):
            logger.info(f"  {list(route.methods)[0] if route.methods else 'GET'} {route.path}")
    logger.info("=" * 60)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.environment == "development"
    )

