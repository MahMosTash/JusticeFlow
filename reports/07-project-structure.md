# Project Structure and Software Decisions

## Overview
This document outlines the complete project structure for the Police Case Management System and provides detailed reasoning for all software architecture and organizational decisions. This structure supports scalability, maintainability, and follows Django and React best practices.

---

## 1. Overall Project Structure

```
karagah-web/
├── backend/                 # Django backend application
├── frontend/                # React frontend application
├── reports/                 # Project documentation and reports
├── docker-compose.yml       # Docker Compose configuration
├── .github/                 # GitHub Actions CI/CD workflows
│   └── workflows/
│       └── ci.yml
├── .gitignore              # Git ignore rules
├── README.md               # Project overview and setup
└── prompt.md               # Project specification (source of truth)
```

**Rationale:**
- **Separation of Concerns:** Backend and frontend are completely separate, allowing independent development and deployment
- **Reports Folder:** Centralized documentation for easy access
- **Docker Compose:** Single file for local development environment
- **GitHub Actions:** Standard location for CI/CD workflows
- **Root Level:** Configuration files and documentation at root for visibility

---

## 2. Backend Structure (Django)

```
backend/
├── manage.py
├── requirements.txt
├── requirements-dev.txt
├── Dockerfile
├── .env.example
├── config/                  # Django project configuration
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Base settings (shared)
│   │   ├── development.py   # Development settings
│   │   ├── production.py    # Production settings
│   │   └── testing.py       # Testing settings
│   ├── urls.py              # Root URL configuration
│   └── wsgi.py
├── apps/                    # Django applications
│   ├── __init__.py
│   ├── accounts/            # User, Role, Authentication
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_permissions.py
│   ├── cases/              # Case management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   ├── workflows.py    # Approval workflow logic
│   │   └── tests/
│   ├── complaints/         # Complaint management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   └── tests/
│   ├── evidence/           # Evidence management
│   │   ├── __init__.py
│   │   ├── models.py       # Base + all evidence types
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   └── tests/
│   ├── investigations/    # Suspects, Interrogations, Guilt Scores
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── admin.py
│   │   └── tests/
│   ├── detective_board/   # Detective board functionality
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── trials/            # Trial and verdict management
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── rewards/           # Reward system
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── calculations.py # Reward calculation logic
│   │   └── tests/
│   └── payments/          # Bail and fine payments (optional)
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── tests/
├── core/                   # Shared utilities and base classes
│   ├── __init__.py
│   ├── permissions.py     # Base permission classes
│   ├── mixins.py          # Reusable mixins
│   ├── exceptions.py      # Custom exceptions
│   ├── pagination.py      # Custom pagination
│   └── utils.py           # Utility functions
├── media/                  # User-uploaded files (evidence images, etc.)
├── static/                 # Static files
└── tests/                  # Integration tests
    ├── __init__.py
    ├── test_workflows.py  # End-to-end workflow tests
    └── test_integration.py
```

### 2.1 Backend Structure Rationale

#### Apps Organization
**Decision:** Separate app for each major domain (accounts, cases, evidence, etc.)

**Reasoning:**
1. **Separation of Concerns:** Each app handles a specific domain
2. **Maintainability:** Easy to locate and modify related code
3. **Scalability:** New features can be added as new apps
4. **Django Convention:** Follows Django's app-based architecture
5. **Team Collaboration:** Multiple developers can work on different apps

#### Settings Split
**Decision:** Split settings into base, development, production, testing

**Reasoning:**
1. **Environment-Specific:** Different settings for different environments
2. **Security:** Production settings separate from development
3. **Testing:** Isolated test settings (use test database, disable migrations)
4. **Maintainability:** Clear separation of concerns
5. **Best Practice:** Django recommended pattern

#### Core Folder
**Decision:** Shared utilities in `core/` folder

**Reasoning:**
1. **Reusability:** Common code shared across apps
2. **Consistency:** Base classes ensure consistent patterns
3. **DRY Principle:** Don't repeat yourself
4. **Centralized:** Easy to find shared utilities

#### Tests Organization
**Decision:** Tests in each app + integration tests at root

**Reasoning:**
1. **App-Level Tests:** Unit tests close to code
2. **Integration Tests:** End-to-end tests at root level
3. **Django Convention:** Tests in app folders
4. **Test Discovery:** Easy for pytest to find tests

---

## 3. Frontend Structure (React)

```
frontend/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts          # Vite configuration (or CRA config)
├── .env.example
├── Dockerfile
├── public/
│   ├── index.html
│   └── favicon.ico
└── src/
    ├── main.tsx            # Application entry point
    ├── App.tsx             # Root component
    ├── index.css           # Global styles (minimal, as per spec)
    ├── components/         # Reusable components
    │   ├── common/        # Common UI components
    │   │   ├── Button/
    │   │   ├── Input/
    │   │   ├── Card/
    │   │   ├── Modal/
    │   │   ├── Table/
    │   │   ├── Loading/
    │   │   └── Skeleton/
    │   ├── cases/         # Case-related components
    │   │   ├── CaseCard/
    │   │   ├── CaseForm/
    │   │   ├── CaseList/
    │   │   └── CaseDetails/
    │   ├── evidence/      # Evidence-related components
    │   │   ├── EvidenceCard/
    │   │   ├── EvidenceForm/
    │   │   ├── EvidenceList/
    │   │   └── EvidenceTypeSelector/
    │   ├── complaints/    # Complaint components
    │   │   ├── ComplaintForm/
    │   │   ├── ComplaintCard/
    │   │   └── ComplaintStatus/
    │   ├── detective-board/ # Detective board components
    │   │   ├── DetectiveBoard/
    │   │   ├── EvidenceNode/
    │   │   ├── ConnectionLine/
    │   │   └── BoardToolbar/
    │   ├── suspects/      # Suspect components
    │   │   ├── SuspectCard/
    │   │   ├── SuspectList/
    │   │   └── MostWantedList/
    │   └── rewards/       # Reward components
    │       ├── RewardSubmissionForm/
    │       └── RewardCard/
    ├── pages/             # Page components
    │   ├── Home/
    │   ├── Login/
    │   ├── Register/
    │   ├── Dashboard/
    │   │   ├── AdminDashboard/
    │   │   ├── OfficerDashboard/
    │   │   ├── DetectiveDashboard/
    │   │   └── UserDashboard/
    │   ├── Cases/
    │   │   ├── CaseListPage/
    │   │   ├── CaseDetailPage/
    │   │   └── CaseCreatePage/
    │   ├── Evidence/
    │   │   ├── EvidenceListPage/
    │   │   └── EvidenceCreatePage/
    │   ├── DetectiveBoard/
    │   │   └── DetectiveBoardPage/
    │   ├── MostWanted/
    │   │   └── MostWantedPage/
    │   ├── Complaints/
    │   │   ├── ComplaintListPage/
    │   │   └── ComplaintSubmitPage/
    │   └── Reports/
    │       └── ReportsPage/
    ├── hooks/             # Custom React hooks
    │   ├── useAuth.ts
    │   ├── useCases.ts
    │   ├── useEvidence.ts
    │   ├── usePermissions.ts
    │   ├── useDetectiveBoard.ts
    │   └── useNotifications.ts
    ├── services/          # API service layer
    │   ├── api.ts         # Axios instance and interceptors
    │   ├── authService.ts
    │   ├── caseService.ts
    │   ├── evidenceService.ts
    │   ├── complaintService.ts
    │   ├── detectiveBoardService.ts
    │   └── rewardService.ts
    ├── store/             # Redux store
    │   ├── index.ts       # Store configuration
    │   ├── slices/
    │   │   ├── authSlice.ts
    │   │   ├── caseSlice.ts
    │   │   ├── evidenceSlice.ts
    │   │   └── uiSlice.ts
    │   └── types.ts
    ├── types/             # TypeScript type definitions
    │   ├── api.ts         # API response types
    │   ├── case.ts
    │   ├── evidence.ts
    │   ├── user.ts
    │   └── common.ts
    ├── utils/             # Utility functions
    │   ├── dateUtils.ts
    │   ├── formatUtils.ts
    │   ├── validation.ts
    │   └── constants.ts
    ├── constants/         # Application constants
    │   ├── routes.ts
    │   ├── roles.ts
    │   └── crimeSeverity.ts
    └── tests/             # Test files
        ├── components/
        ├── pages/
        ├── hooks/
        └── utils/
```

### 3.1 Frontend Structure Rationale

#### Component Organization
**Decision:** Components organized by feature/domain

**Reasoning:**
1. **Feature-Based:** Related components grouped together
2. **Scalability:** Easy to add new features
3. **Maintainability:** Easy to find and modify components
4. **Team Collaboration:** Multiple developers can work on different features
5. **Clear Structure:** Intuitive organization

#### Pages vs Components
**Decision:** Separate `pages/` and `components/` folders

**Reasoning:**
1. **Separation:** Pages are route-level, components are reusable
2. **Reusability:** Components can be used across pages
3. **Clarity:** Clear distinction between page and component
4. **Routing:** Pages map directly to routes

#### Hooks Folder
**Decision:** Custom hooks in dedicated `hooks/` folder

**Reasoning:**
1. **Reusability:** Hooks can be shared across components
2. **Organization:** Centralized location for custom logic
3. **Testing:** Easy to test hooks in isolation
4. **React Convention:** Standard location for hooks

#### Services Layer
**Decision:** API calls in dedicated `services/` folder

**Reasoning:**
1. **Separation:** Business logic separated from UI
2. **Reusability:** Services can be used by multiple components
3. **Testing:** Easy to mock services in tests
4. **Maintainability:** API changes isolated to services

#### Redux Store Structure
**Decision:** Slices-based Redux structure

**Reasoning:**
1. **Redux Toolkit:** Uses Redux Toolkit's slice pattern
2. **Modularity:** Each slice handles a domain
3. **Scalability:** Easy to add new slices
4. **Maintainability:** Clear organization

#### Type Definitions
**Decision:** Centralized type definitions in `types/` folder

**Reasoning:**
1. **Reusability:** Types shared across components
2. **Consistency:** Single source of truth for types
3. **Type Safety:** TypeScript benefits
4. **Documentation:** Types serve as documentation

---

## 4. Docker Structure

```
docker-compose.yml
├── services:
│   ├── db (PostgreSQL)
│   ├── backend (Django)
│   └── frontend (React)
```

**Rationale:**
- **Service Separation:** Each service in separate container
- **Development:** Easy local development setup
- **Consistency:** Same environment for all developers
- **Production-Ready:** Can be adapted for production

---

## 5. Software Architecture Decisions

### 5.1 Monolithic vs Microservices

**Decision:** Monolithic backend (Django), separate frontend

**Reasoning:**
1. **Student Project:** Microservices add unnecessary complexity
2. **Simplicity:** Easier to develop and deploy
3. **Django Convention:** Django works best as monolith
4. **Future-Proof:** Can be split later if needed
5. **Resource Efficiency:** Less overhead than microservices

### 5.2 Database Design

**Decision:** PostgreSQL with Django ORM

**Reasoning:**
1. **ACID Compliance:** Critical for police data integrity
2. **JSON Fields:** Support for flexible metadata (Identification Documents)
3. **Performance:** Excellent for complex queries
4. **Django Support:** First-class Django support
5. **Scalability:** Can handle growth

### 5.3 API Design

**Decision:** RESTful API with Django REST Framework

**Reasoning:**
1. **RESTful:** Standard, well-understood pattern
2. **DRF:** Excellent Django integration
3. **Swagger:** Built-in OpenAPI support
4. **Flexibility:** Easy to extend
5. **Documentation:** Auto-generated API docs

### 5.4 Authentication Strategy

**Decision:** Token-based authentication (JWT or DRF tokens)

**Reasoning:**
1. **Stateless:** No server-side session storage
2. **Scalability:** Works with multiple servers
3. **Security:** Tokens can be revoked
4. **DRF Support:** Built-in token authentication
5. **Frontend Integration:** Easy to use with React

### 5.5 State Management

**Decision:** Redux Toolkit for global state, React state for local

**Reasoning:**
1. **Complex State:** System has complex state requirements
2. **Predictability:** Redux provides predictable state updates
3. **DevTools:** Excellent debugging tools
4. **Scalability:** Handles application growth
5. **Ecosystem:** Large ecosystem and community

### 5.6 Styling Approach

**Decision:** Component library (MUI or Ant Design) + CSS Modules

**Reasoning:**
1. **Rapid Development:** Pre-built components
2. **Consistency:** Design system ensures consistency
3. **Accessibility:** Built-in accessibility features
4. **Customization:** Can customize with CSS Modules
5. **Specification:** Leave global styles for user (as per spec)

### 5.7 Testing Strategy

**Decision:** Comprehensive testing (unit, integration, E2E)

**Reasoning:**
1. **Quality:** Ensures code quality
2. **Confidence:** Enables safe refactoring
3. **Documentation:** Tests serve as documentation
4. **Requirements:** Meets minimum test requirements
5. **Best Practice:** Industry standard

### 5.8 CI/CD Strategy

**Decision:** GitHub Actions for CI/CD

**Reasoning:**
1. **Integration:** Native GitHub integration
2. **Free:** Free for public repositories
3. **Flexibility:** Supports complex workflows
4. **Requirements:** Meets specification requirement
5. **Industry Standard:** Widely used

---

## 6. Naming Conventions

See `01-development-contracts.md` for detailed naming conventions.

**Summary:**
- **Backend:** snake_case for variables, PascalCase for classes
- **Frontend:** camelCase for variables, PascalCase for components
- **Files:** Match component/class names
- **Constants:** UPPER_SNAKE_CASE

---

## 7. File Organization Principles

### 7.1 Co-location
- Related files grouped together
- Components with their styles and tests
- Models with serializers and views

### 7.2 Separation of Concerns
- Business logic separated from UI
- API calls in services layer
- Types in dedicated folder
- Utilities in utils folder

### 7.3 Scalability
- Structure supports growth
- Easy to add new features
- Clear organization patterns
- Minimal refactoring needed

### 7.4 Maintainability
- Easy to find code
- Clear file organization
- Consistent patterns
- Good documentation

---

## 8. Development Workflow

### 8.1 Local Development
1. Clone repository
2. Run `docker-compose up`
3. Backend: `http://localhost:8000`
4. Frontend: `http://localhost:3000`
5. Database: PostgreSQL on port 5432

### 8.2 Code Organization
1. Feature-based development
2. One feature per branch
3. Tests with code
4. Documentation updated

### 8.3 Deployment
1. CI/CD runs tests
2. Docker images built
3. Deployed to staging/production
4. Database migrations run

---

## 9. Future Considerations

### 9.1 Potential Expansions
- **Caching:** Redis for performance
- **Message Queue:** Celery for async tasks
- **Search:** Elasticsearch for case search
- **Monitoring:** Application monitoring
- **Analytics:** Usage analytics

### 9.2 Scalability
- **Database:** Read replicas
- **API:** API gateway
- **Frontend:** CDN for static assets
- **Caching:** Multi-level caching

---

## 10. Conclusion

The project structure follows Django and React best practices while meeting all specification requirements. Key principles:

1. **Separation of Concerns:** Clear boundaries between backend and frontend
2. **Modularity:** Feature-based organization
3. **Scalability:** Structure supports growth
4. **Maintainability:** Easy to understand and modify
5. **Best Practices:** Industry-standard patterns

This structure provides a solid foundation for the Police Case Management System and supports efficient development, testing, and deployment.

---

**Last Updated:** 2024
**Version:** 1.0

