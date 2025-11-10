#!/usr/bin/env python
"""
Initialize database by creating all tables.
This is useful for development - use Alembic migrations in production.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import init_db, check_db_connection, engine
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    logger.info(f"Connecting to database: {settings.database_url.split('@')[-1]}")  # Hide password
    
    if not check_db_connection():
        logger.error("Failed to connect to database. Check your DATABASE_URL in .env")
        sys.exit(1)
    
    try:
        init_db()
        logger.info("✅ Database initialized successfully!")
        logger.info("All tables created.")
    except Exception as e:
        logger.error(f"❌ Failed to initialize database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

