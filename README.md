# Police Case Management System

A production-grade, auditable Police Case Management System built with Django REST Framework and React.

## 🏗️ Architecture

- **Backend:** Django + Django REST Framework
- **Frontend:** React + TypeScript + Vite
- **Database:** PostgreSQL
- **Deployment:** Docker Compose
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
karagah-web/
├── backend/          # Django backend application
├── frontend/         # React frontend application
├── reports/          # Project documentation and reports
├── implementation_logs/  # Development logs and progress
├── docker-compose.yml    # Docker Compose configuration
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Or: Python 3.12+, Node.js 18+, PostgreSQL

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API Docs: http://localhost:8000/swagger/
- Admin: http://localhost:8000/admin/

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py create_initial_roles
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Default Credentials

After setup, create a superuser:
```bash
python manage.py createsuperuser
```

## 📚 Documentation

- **API Documentation:** http://localhost:8000/swagger/
- **Backend README:** [backend/README.md](backend/README.md)
- **Frontend README:** [frontend/README.md](frontend/README.md)
- **Project Reports:** [reports/](reports/)
- **Implementation Logs:** [implementation_logs/](implementation_logs/)

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test --settings=config.settings.testing
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🐳 Docker

### Build Images

```bash
docker-compose build
```

### Run Services

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f [service_name]
```

### Stop Services

```bash
docker-compose down
```

### Clean Up

```bash
docker-compose down -v  # Removes volumes
```

## 🔄 CI/CD

GitHub Actions pipeline runs on:
- Push to `main` or `develop` branches
- Pull requests

Pipeline includes:
- Backend tests
- Frontend tests
- Docker build verification
- Docker Compose integration tests

## 📋 Features

- ✅ Dynamic Role-Based Access Control (RBAC)
- ✅ Case Management (Complaint-based and Crime Scene-based)
- ✅ Evidence Management (5 types)
- ✅ Detective Board (Visual case analysis)
- ✅ Investigation Tools (Suspects, Interrogations, Guilt Scoring)
- ✅ Trial Management
- ✅ Rewards System
- ✅ Most Wanted / Under Severe Surveillance
- ✅ Comprehensive API Documentation (Swagger)
- ✅ Full Test Coverage

## 🛠️ Development

See individual README files:
- [Backend Development](backend/README.md)
- [Frontend Development](frontend/README.md)

## 📝 License

Part of the Police Case Management System project.

## 🤝 Contributing

This is a student project. For questions or issues, refer to the documentation in the `reports/` folder.

