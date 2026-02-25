# Project Structure

## Final Project Organization

```
karagah-web/
├── backend/                    # Django backend application
│   ├── apps/                   # Django apps
│   │   ├── accounts/           # Authentication & user management
│   │   ├── cases/              # Case management
│   │   ├── complaints/         # Complaint handling
│   │   ├── detective_board/    # Detective board
│   │   ├── evidence/            # Evidence management
│   │   ├── investigations/     # Suspects, interrogations, guilt scores
│   │   ├── payments/           # Bail & fine payments
│   │   ├── rewards/             # Rewards system
│   │   └── trials/             # Trial management
│   ├── config/                 # Django settings
│   ├── core/                   # Core utilities, permissions, models
│   ├── tests/                  # Global tests
│   ├── Dockerfile              # Backend Docker image
│   ├── manage.py               # Django management script
│   ├── requirements.txt        # Production dependencies
│   ├── requirements-dev.txt    # Development dependencies
│   └── README.md               # Backend documentation
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── store/              # Redux store
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript types
│   │   ├── utils/              # Utility functions
│   │   ├── constants/          # Application constants
│   │   └── tests/             # Test files
│   ├── public/                 # Static assets
│   ├── Dockerfile              # Frontend Docker image
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json            # Node dependencies
│   └── README.md               # Frontend documentation
│
├── reports/                    # Project documentation
│   ├── 01-development-contracts.md
│   ├── 02-key-system-entities.md
│   ├── 03-npm-packages.md
│   ├── 04-ai-frontend-development.md
│   ├── 05-ai-backend-development.md
│   ├── 06-requirement-analysis.md
│   └── 07-project-structure.md
│
├── implementation_logs/        # Development logs
│   ├── BACKEND_COMPLETE.md
│   ├── BACKEND_PROGRESS.md
│   ├── FRONTEND_COMPLETE.md
│   ├── FRONTEND_TESTS_COMPLETE.md
│   ├── INTEGRATION_COMPLETE.md
│   ├── INTEGRATION_GUIDE.md
│   ├── TEST_RESULTS.md
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
│
├── docker-compose.yml          # Production Docker Compose
├── docker-compose.dev.yml       # Development Docker Compose
├── .dockerignore               # Docker ignore patterns
├── .gitignore                  # Git ignore patterns
├── .env.example                # Environment variables template
├── Makefile                    # Development commands
├── start-dev.sh                # Development startup script
├── README.md                   # Main project README
├── DEPLOYMENT.md               # Deployment guide
├── PROJECT_STRUCTURE.md        # This file
└── prompt.md                   # Project specification (source of truth)
```

## Key Files

### Docker & Deployment
- `docker-compose.yml` - Production Docker Compose configuration
- `docker-compose.dev.yml` - Development Docker Compose configuration
- `backend/Dockerfile` - Backend Docker image
- `frontend/Dockerfile` - Frontend Docker image
- `frontend/nginx.conf` - Nginx configuration for frontend

### CI/CD
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline

### Configuration
- `.gitignore` - Root Git ignore patterns
- `.dockerignore` - Docker ignore patterns
- `.env.example` - Environment variables template
- `Makefile` - Development commands

### Documentation
- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `prompt.md` - Project specification (source of truth)
- `reports/` - Project analysis and documentation
- `implementation_logs/` - Development logs and progress

## Clean Structure

All final production files are in their respective folders:
- **Backend**: Only Django application files and configuration
- **Frontend**: Only React application files and configuration
- **Reports**: Project documentation and analysis
- **Implementation Logs**: Development history and progress

No temporary or development-only files in production folders.

