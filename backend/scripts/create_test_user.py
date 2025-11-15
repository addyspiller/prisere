#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import get_db_context
from app.models.user import User

with get_db_context() as db:
    user = db.query(User).filter(User.id == 'test_user_123').first()
    if not user:
        user = User(id='test_user_123', email='test@example.com', name='Test User')
        db.add(user)
        db.commit()
        print('✅ Test user created!')
    else:
        print('✅ User already exists')