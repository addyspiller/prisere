#!/usr/bin/env python
"""
Create a new Alembic migration.
Usage: python scripts/create_migration.py "Description of changes"
"""
import sys
import os
import subprocess

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/create_migration.py \"Description of changes\"")
        sys.exit(1)
    
    message = sys.argv[1]
    
    # Run alembic revision command
    cmd = ["alembic", "revision", "--autogenerate", "-m", message]
    
    print(f"Creating migration: {message}")
    result = subprocess.run(cmd, cwd=os.path.dirname(os.path.dirname(__file__)))
    
    if result.returncode == 0:
        print("✅ Migration created successfully!")
        print("Review the generated migration file in alembic/versions/")
        print("Then run: alembic upgrade head")
    else:
        print("❌ Failed to create migration")
        sys.exit(1)


if __name__ == "__main__":
    main()

