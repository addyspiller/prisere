"""
Custom exception handlers for FastAPI application.
"""
import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError

from app.utils.legal import get_legal_disclaimer

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions (404, 403, etc.) with legal disclaimer.
    
    Args:
        request: The FastAPI request object
        exc: The HTTP exception raised
        
    Returns:
        JSONResponse with error details and legal disclaimer
    """
    logger.warning(
        f"HTTP {exc.status_code} error on {request.method} {request.url.path}: {exc.detail}",
        extra={
            "status_code": exc.status_code,
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "type": "http_error",
                "status_code": exc.status_code,
                "message": exc.detail,
                "path": str(request.url.path),
            },
            "disclaimer": get_legal_disclaimer(),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle validation errors (invalid request body, query params, etc.) with legal disclaimer.
    
    Args:
        request: The FastAPI request object
        exc: The validation exception raised
        
    Returns:
        JSONResponse with validation error details and legal disclaimer
    """
    # Extract validation errors
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(
        f"Validation error on {request.method} {request.url.path}: {len(errors)} error(s)",
        extra={
            "method": request.method,
            "path": request.url.path,
            "errors": errors,
            "client": request.client.host if request.client else None,
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "validation_error",
                "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "The request contains invalid data. Please check the fields below.",
                "path": str(request.url.path),
                "validation_errors": errors,
            },
            "disclaimer": get_legal_disclaimer(),
        },
    )


async def pydantic_validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors with legal disclaimer.
    
    Args:
        request: The FastAPI request object
        exc: The Pydantic validation exception raised
        
    Returns:
        JSONResponse with validation error details and legal disclaimer
    """
    # Extract validation errors
    errors = []
    for error in exc.errors():
        errors.append({
            "field": " -> ".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"],
        })
    
    logger.warning(
        f"Pydantic validation error on {request.method} {request.url.path}: {len(errors)} error(s)",
        extra={
            "method": request.method,
            "path": request.url.path,
            "errors": errors,
            "client": request.client.host if request.client else None,
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "type": "validation_error",
                "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "message": "Data validation failed. Please check the fields below.",
                "path": str(request.url.path),
                "validation_errors": errors,
            },
            "disclaimer": get_legal_disclaimer(),
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions with legal disclaimer.
    
    This is the catch-all handler for any unhandled exceptions.
    It logs the full exception and returns a generic error response.
    
    Args:
        request: The FastAPI request object
        exc: The exception raised
        
    Returns:
        JSONResponse with generic error message and legal disclaimer
    """
    # Log the full exception with stack trace
    logger.exception(
        f"Unexpected error on {request.method} {request.url.path}: {str(exc)}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "error_type": type(exc).__name__,
            "client": request.client.host if request.client else None,
        },
        exc_info=exc,
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "type": "internal_error",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": "An unexpected error occurred while processing your request. Please try again later.",
                "path": str(request.url.path),
                # Only include error details in development mode
                # "details": str(exc),  # Uncomment for debugging
            },
            "disclaimer": get_legal_disclaimer(),
        },
    )

