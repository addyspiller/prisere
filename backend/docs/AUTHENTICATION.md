# Authentication Guide

## Overview

The backend uses **Clerk** for authentication with JWT token verification. Users authenticate through Clerk on the frontend, and the backend verifies JWT tokens using Clerk's JWKS (JSON Web Key Set).

## Authentication Flow

```
┌─────────┐                ┌───────┐                ┌─────────┐
│ Frontend│                │ Clerk │                │ Backend │
└────┬────┘                └───┬───┘                └────┬────┘
     │                         │                         │
     │ 1. Login/Sign up        │                         │
     ├────────────────────────►│                         │
     │                         │                         │
     │ 2. JWT Token            │                         │
     │◄────────────────────────┤                         │
     │                         │                         │
     │ 3. API Request + Token  │                         │
     ├─────────────────────────┼────────────────────────►│
     │                         │                         │
     │                         │ 4. Fetch JWKS (cached)  │
     │                         │◄────────────────────────┤
     │                         │                         │
     │                         │ 5. JWKS Response        │
     │                         ├────────────────────────►│
     │                         │                         │
     │                         │ 6. Verify Token         │
     │                         │         (internal)      │
     │                         │                         │
     │ 7. Response             │                         │
     │◄────────────────────────┼─────────────────────────┤
     │                         │                         │
```

## Implementation Details

### JWT Verification

**File:** `app/utils/clerk_auth.py`

1. **Extract token** from `Authorization: Bearer <token>` header
2. **Fetch JWKS** from Clerk (cached after first request)
3. **Find matching key** using `kid` (key ID) from token header
4. **Verify signature** using RS256 algorithm
5. **Validate expiration** and other claims
6. **Extract user info** from token claims

### User Creation

On first login, if user doesn't exist in database:
1. Extract user info from JWT claims (`sub`, `email`, `name`)
2. Create user record in PostgreSQL
3. Return user object

Subsequent logins return existing user from database.

## API Endpoints

### Authentication Endpoints

All under `/v1/auth`:

#### `GET /v1/auth/verify`

Verify authentication token is valid.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "authenticated": true,
  "user_id": "user_2abcdef123",
  "email": "user@example.com",
  "message": "Token is valid"
}
```

---

#### `GET /v1/auth/me`

Get current user's profile with statistics.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "user_2abcdef123",
  "email": "user@example.com",
  "name": "John Doe",
  "company_name": "Acme Corp",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "total_analyses": 5,
  "completed_analyses": 4
}
```

---

#### `PATCH /v1/auth/me`

Update current user's profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "company_name": "New Company Inc"
}
```

**Response (200 OK):**
```json
{
  "id": "user_2abcdef123",
  "email": "user@example.com",
  "name": "Jane Doe",
  "company_name": "New Company Inc",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:22:00Z"
}
```

---

#### `DELETE /v1/auth/me`

Delete current user's account and all associated data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:** `204 No Content`

**Warning:** This permanently deletes:
- User account
- All analysis jobs
- All analysis results

---

## Using Authentication in Code

### Protecting Endpoints

**Require authentication:**
```python
from fastapi import APIRouter, Depends
from app.models.user import User
from app.utils.clerk_auth import get_current_user

router = APIRouter()

@router.get("/protected")
async def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Hello {user.name}!", "user_id": user.id}
```

**Optional authentication:**
```python
from app.utils.clerk_auth import get_optional_user
from typing import Optional

@router.get("/optional-auth")
async def optional_route(user: Optional[User] = Depends(get_optional_user)):
    if user:
        return {"message": f"Hello {user.name}!"}
    else:
        return {"message": "Hello guest!"}
```

**Get user ID only:**
```python
from app.utils.clerk_auth import get_current_user_id

@router.get("/user-id-only")
async def user_id_route(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}
```

---

## Frontend Integration

### Making Authenticated Requests

**Using Clerk React SDK:**

```typescript
import { useAuth } from "@clerk/nextjs";

function MyComponent() {
  const { getToken } = useAuth();
  
  async function fetchData() {
    const token = await getToken();
    
    const response = await fetch("http://localhost:3001/v1/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await response.json();
    return data;
  }
  
  // ...
}
```

**Using fetch with Clerk session:**

```typescript
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const { getToken } = useAuth();
  const token = await getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
}
```

---

## Error Responses

### 401 Unauthorized

Token is invalid, expired, or missing.

```json
{
  "detail": "Invalid or expired token"
}
```

**Frontend action:** Redirect to login or refresh token.

---

### 403 Forbidden

No token provided.

```json
{
  "detail": "Not authenticated"
}
```

**Frontend action:** Redirect to login.

---

### 503 Service Unavailable

Unable to fetch Clerk JWKS (network issue).

```json
{
  "detail": "Unable to verify authentication. Please try again later."
}
```

**Frontend action:** Show retry message.

---

## Configuration

### Environment Variables

```env
# Clerk Configuration
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
```

**Note:** `CLERK_PUBLISHABLE_KEY` is for frontend use only. Backend only needs `CLERK_SECRET_KEY` for token verification.

---

## Security Considerations

### Token Verification

✅ **Always verify signature** using Clerk's public keys (JWKS)  
✅ **Check expiration** to prevent replay attacks  
✅ **Use HTTPS** in production to prevent token interception  
✅ **Cache JWKS** to reduce network requests  

### User Data

✅ **Store minimal data** - only ID, email, name, company  
✅ **Don't store passwords** - handled by Clerk  
✅ **Cascade deletes** - removing user deletes all related data  

### Rate Limiting

Consider adding rate limiting for:
- `/v1/auth/verify` (token verification)
- `/v1/auth/me` (profile updates)

---

## Testing

### Manual Testing with cURL

**Get token from Clerk** (use frontend login or Clerk dashboard)

**Test verify endpoint:**
```bash
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3001/v1/auth/verify
```

**Test get profile:**
```bash
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:3001/v1/auth/me
```

**Test update profile:**
```bash
curl -X PATCH \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Name", "company_name": "New Company"}' \
  http://localhost:3001/v1/auth/me
```

---

## Troubleshooting

### "Invalid token: Key not found"

**Cause:** JWKS cache is stale or key rotation occurred  
**Solution:** Restart server to refresh JWKS cache, or implement TTL-based cache invalidation

### "Invalid or expired token"

**Cause:** Token expired or signature invalid  
**Solution:** Frontend should refresh token using Clerk's `getToken({ skipCache: true })`

### "Unable to create user: Email not found in token"

**Cause:** Token missing email claim  
**Solution:** Check Clerk settings to ensure email is included in JWT

### User created on every request

**Cause:** User ID mismatch between token and database  
**Solution:** Verify `sub` claim in token matches database `users.id`

---

## Advanced: Custom Claims

If you need custom claims in the JWT:

1. **Configure in Clerk Dashboard** → Settings → Sessions → Customize session token
2. **Add custom claim** (e.g., `metadata.role`)
3. **Access in backend:**

```python
decoded = verify_clerk_token(token)
role = decoded.get("metadata", {}).get("role", "user")
```

---

## References

- [Clerk Documentation](https://clerk.com/docs)
- [JWT.io](https://jwt.io) - Decode and inspect JWTs
- [JWKS Specification](https://datatracker.ietf.org/doc/html/rfc7517)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

