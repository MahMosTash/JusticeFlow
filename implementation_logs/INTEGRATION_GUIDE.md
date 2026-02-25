# Backend-Frontend Integration Guide

## Overview

This guide explains how to run and integrate the backend and frontend of the Police Case Management System.

## Prerequisites

1. **Backend Requirements:**
   - Python 3.12+
   - PostgreSQL database
   - Virtual environment with all dependencies

2. **Frontend Requirements:**
   - Node.js 18+
   - npm

## Quick Start

### Option 1: Using the Start Script

```bash
# Make the script executable
chmod +x start-dev.sh

# Run both servers
./start-dev.sh
```

### Option 2: Manual Start

#### Start Backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 --settings=config.settings.development
```

#### Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

## Configuration

### Backend Configuration

1. **Database Setup:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py migrate
   python manage.py create_initial_roles
   python manage.py createsuperuser
   ```

2. **CORS Settings:**
   The backend is configured to allow requests from:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://localhost:5173` (Vite default)
   - `http://127.0.0.1:5173`

   To modify, edit `backend/config/settings/base.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       'http://localhost:3000',
       'http://127.0.0.1:3000',
       # Add more origins as needed
   ]
   ```

3. **Environment Variables:**
   Create a `.env` file in `backend/` directory:
   ```env
   SECRET_KEY=your-secret-key
   DEBUG=True
   DB_NAME=karagah_db
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   ```

### Frontend Configuration

1. **Environment Variables:**
   Create a `.env` file in `frontend/` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_NAME=Police Case Management System
   ```

2. **Vite Proxy:**
   The frontend is configured to proxy API requests to the backend:
   - Development: Uses Vite proxy (configured in `vite.config.ts`)
   - Production: Uses `VITE_API_BASE_URL` environment variable

## API Integration

### Authentication Flow

1. **Registration:**
   - Frontend: `POST /api/auth/users/register/`
   - Backend: Creates user and returns token
   - Frontend: Stores token in localStorage

2. **Login:**
   - Frontend: `POST /api/auth/users/login/`
   - Backend: Validates credentials and returns token
   - Frontend: Stores token in localStorage

3. **Authenticated Requests:**
   - Frontend: Adds `Authorization: Token <token>` header
   - Backend: Validates token and returns data

### API Endpoints

All API endpoints are documented at:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

#### Key Endpoints:

- **Authentication:**
  - `POST /api/auth/users/register/` - Register new user
  - `POST /api/auth/users/login/` - Login
  - `GET /api/auth/users/me/` - Get current user

- **Cases:**
  - `GET /api/cases/` - List cases
  - `POST /api/cases/` - Create case
  - `GET /api/cases/{id}/` - Get case details
  - `GET /api/cases/stats/` - Get statistics

- **Complaints:**
  - `GET /api/complaints/` - List complaints
  - `POST /api/complaints/` - Submit complaint

- **Evidence:**
  - `GET /api/evidence/` - List evidence
  - `POST /api/evidence/` - Create evidence

- **Investigations:**
  - `GET /api/investigations/suspects/` - List suspects
  - `GET /api/investigations/suspects/most_wanted/` - Most wanted list

- **Detective Board:**
  - `GET /api/detective-board/` - Get detective board
  - `POST /api/detective-board/` - Create/update board

## Testing the Integration

### 1. Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:8000/api/auth/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone_number": "1234567890",
    "national_id": "123456789",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "testpass123"
  }'
```

### 2. Test Frontend Connection

1. Open `http://localhost:3000` in your browser
2. Open browser DevTools → Network tab
3. Try to register/login
4. Check that API requests are successful (status 200/201)

### 3. Test Protected Routes

1. Login through the frontend
2. Navigate to protected pages (Dashboard, Cases, etc.)
3. Verify data loads correctly

## Common Issues and Solutions

### CORS Errors

**Problem:** Browser shows CORS errors when making API requests.

**Solution:**
1. Check that backend CORS settings include frontend origin
2. Verify backend is running on correct port
3. Check browser console for specific CORS error

### 401 Unauthorized

**Problem:** API requests return 401 even after login.

**Solution:**
1. Check that token is stored in localStorage
2. Verify token format: `Token <token>` (not `Bearer <token>`)
3. Check token hasn't expired
4. Verify user is authenticated in backend

### 404 Not Found

**Problem:** API endpoints return 404.

**Solution:**
1. Verify backend is running
2. Check API base URL in frontend config
3. Verify endpoint path matches backend URL configuration
4. Check Swagger docs for correct endpoint paths

### Connection Refused

**Problem:** Frontend can't connect to backend.

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/api/`
2. Check firewall settings
3. Verify backend is listening on `0.0.0.0:8000` (not just `127.0.0.1`)
4. Check Vite proxy configuration

## Development Workflow

1. **Start Backend:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Start Frontend (new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Make Changes:**
   - Backend changes: Restart Django server
   - Frontend changes: Hot reload (automatic)

4. **Test Changes:**
   - Use browser DevTools to inspect API calls
   - Check backend logs for errors
   - Use Swagger UI to test API endpoints directly

## Production Deployment

### Backend

1. Set `DEBUG=False` in production settings
2. Configure proper CORS origins
3. Use proper database (not SQLite)
4. Set up static file serving
5. Use environment variables for secrets

### Frontend

1. Build production bundle:
   ```bash
   cd frontend
   npm run build
   ```

2. Set `VITE_API_BASE_URL` to production API URL

3. Serve static files (nginx, Apache, or CDN)

## API Response Format

All API responses follow Django REST Framework format:

**Success Response:**
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2"
}
```

**Error Response:**
```json
{
  "detail": "Error message",
  "field_name": ["Error for this field"]
}
```

**Paginated Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Next Steps

1. ✅ Backend and Frontend are integrated
2. ✅ Authentication flow works
3. ✅ All major features are connected
4. 🔄 Test all workflows end-to-end
5. 🔄 Add error handling improvements
6. 🔄 Optimize API calls
7. 🔄 Add loading states
8. 🔄 Production deployment

## Support

- Backend API Docs: `http://localhost:8000/swagger/`
- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`

