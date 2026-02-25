# Deployment Guide

## Docker Deployment

### Production Deployment

1. **Set Environment Variables**

   Create a `.env` file in the project root:
   ```env
   DEBUG=False
   SECRET_KEY=your-production-secret-key
   DB_NAME=karagah_db
   DB_USER=postgres
   DB_PASSWORD=strong-password-here
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

2. **Build and Start Services**

   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Create Superuser**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Create Initial Roles**

   ```bash
   docker-compose exec backend python manage.py create_initial_roles
   ```

### Development Deployment

Use `docker-compose.dev.yml` for development:

```bash
docker-compose -f docker-compose.dev.yml up
```

## Manual Deployment

### Backend

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up database:
   ```bash
   python manage.py migrate
   python manage.py create_initial_roles
   ```

3. Collect static files:
   ```bash
   python manage.py collectstatic
   ```

4. Run with Gunicorn:
   ```bash
   gunicorn config.wsgi:application --bind 0.0.0.0:8000
   ```

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. Serve with nginx or any static file server

## CI/CD

The GitHub Actions pipeline automatically:
- Runs tests on push/PR
- Builds Docker images
- Verifies Docker Compose setup

## Environment Variables

See `.env.example` for required environment variables.

## Security Notes

- Change `SECRET_KEY` in production
- Use strong database passwords
- Configure proper CORS origins
- Set `DEBUG=False` in production
- Use HTTPS in production
- Configure proper `ALLOWED_HOSTS`

