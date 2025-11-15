"""
Logging configuration for Prisere backend.
"""
import logging
import sys
from datetime import datetime
from typing import Any


class CustomFormatter(logging.Formatter):
    """
    Custom formatter with color coding for different log levels (terminal only).
    """
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',     # Cyan
        'INFO': '\033[32m',      # Green
        'WARNING': '\033[33m',   # Yellow
        'ERROR': '\033[31m',     # Red
        'CRITICAL': '\033[35m',  # Magenta
    }
    RESET = '\033[0m'
    
    def __init__(self, *args, use_colors: bool = True, **kwargs):
        """
        Initialize the formatter.
        
        Args:
            use_colors: Whether to use ANSI color codes (disable for file output)
        """
        super().__init__(*args, **kwargs)
        self.use_colors = use_colors
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format the log record with optional color coding.
        
        Args:
            record: The log record to format
            
        Returns:
            Formatted log string
        """
        # Add color if enabled
        if self.use_colors and record.levelname in self.COLORS:
            record.levelname = f"{self.COLORS[record.levelname]}{record.levelname}{self.RESET}"
        
        return super().format(record)


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure structured logging for the application.
    
    Sets up:
    - Console handler with colored output
    - File handler for persistent logs
    - Structured format with timestamps
    - Request tracking
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Convert string level to logging constant
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(numeric_level)
    console_formatter = CustomFormatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        use_colors=True
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handler for persistent logs (no colors)
    try:
        from pathlib import Path
        log_dir = Path(__file__).parent.parent.parent / "logs"
        log_dir.mkdir(exist_ok=True)
        
        log_file = log_dir / f"prisere_{datetime.now().strftime('%Y%m%d')}.log"
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(numeric_level)
        file_formatter = CustomFormatter(
            fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            use_colors=False
        )
        file_handler.setFormatter(file_formatter)
        root_logger.addHandler(file_handler)
        
        logging.info(f"Logging to file: {log_file}")
    except Exception as e:
        logging.warning(f"Could not set up file logging: {e}")
    
    # Configure third-party library loggers
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)  # Reduce SQL query noise
    logging.getLogger("boto3").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    logging.info(f"Logging configured with level: {log_level}")


def log_request(method: str, path: str, status_code: int, duration_ms: float) -> None:
    """
    Log HTTP request with structured data.
    
    Args:
        method: HTTP method (GET, POST, etc.)
        path: Request path
        status_code: Response status code
        duration_ms: Request duration in milliseconds
    """
    logger = logging.getLogger("app.requests")
    
    log_data = {
        "method": method,
        "path": path,
        "status_code": status_code,
        "duration_ms": round(duration_ms, 2),
    }
    
    # Choose log level based on status code
    if status_code >= 500:
        logger.error(f"{method} {path} {status_code} ({duration_ms:.2f}ms)", extra=log_data)
    elif status_code >= 400:
        logger.warning(f"{method} {path} {status_code} ({duration_ms:.2f}ms)", extra=log_data)
    else:
        logger.info(f"{method} {path} {status_code} ({duration_ms:.2f}ms)", extra=log_data)

