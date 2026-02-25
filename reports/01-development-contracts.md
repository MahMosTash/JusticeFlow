# Development Contracts

## Overview
This document outlines the development standards, conventions, and practices that all team members must follow throughout the Police Case Management System project. These contracts ensure consistency, maintainability, and collaboration efficiency.

---

## 1. Naming Conventions

### 1.1 Backend (Django)

#### Models
- **Format:** `PascalCase` (singular noun)
- **Examples:**
  - `Case`, `Evidence`, `Complaint`, `Suspect`, `User`
  - `WitnessStatement`, `BiologicalEvidence`, `VehicleEvidence`
- **Rationale:** Django convention; models represent singular entities

#### Model Fields
- **Format:** `snake_case`
- **Examples:**
  - `created_date`, `recorded_by`, `national_id`, `phone_number`
  - `license_plate`, `serial_number`, `guilt_score`
- **Rationale:** Python PEP 8 standard; improves readability

#### Views (ViewSets/APIViews)
- **Format:** `PascalCase` + `ViewSet` or `APIView` suffix
- **Examples:**
  - `CaseViewSet`, `EvidenceViewSet`, `ComplaintAPIView`
  - `AuthenticationViewSet`, `RewardViewSet`
- **Rationale:** Clear distinction between views and models

#### Serializers
- **Format:** `PascalCase` + `Serializer` suffix
- **Examples:**
  - `CaseSerializer`, `EvidenceSerializer`, `UserSerializer`
  - `ComplaintCreateSerializer`, `EvidenceUpdateSerializer`
- **Rationale:** Explicit naming indicates purpose

#### URLs
- **Format:** `kebab-case` (hyphenated)
- **Examples:**
  - `/api/cases/`, `/api/evidence/`, `/api/complaints/`
  - `/api/case-requests/`, `/api/most-wanted/`
- **Rationale:** URL-friendly, readable, SEO-friendly

#### Permissions Classes
- **Format:** `PascalCase` + `Permission` suffix
- **Examples:**
  - `CaseCreatePermission`, `EvidenceViewPermission`
  - `DetectiveBoardPermission`, `RewardApprovePermission`
- **Rationale:** Clear permission class identification

#### Test Files
- **Format:** `test_<module_name>.py`
- **Examples:**
  - `test_models.py`, `test_views.py`, `test_serializers.py`
  - `test_permissions.py`, `test_workflows.py`
- **Rationale:** Python testing convention; pytest discovery

#### Test Functions
- **Format:** `test_<description>`
- **Examples:**
  - `test_case_creation_by_police_officer`
  - `test_evidence_requires_forensic_verification`
  - `test_complaint_approval_workflow`
- **Rationale:** Descriptive test names improve debugging

### 1.2 Frontend (React)

#### Components
- **Format:** `PascalCase` (matches file name)
- **Examples:**
  - `CaseCard.tsx`, `EvidenceForm.tsx`, `DetectiveBoard.tsx`
  - `MostWantedList.tsx`, `RewardSubmission.tsx`
- **Rationale:** React convention; component names must be capitalized

#### Component Files
- **Format:** `PascalCase.tsx` or `PascalCase.jsx`
- **Examples:**
  - `LoginForm.tsx`, `CaseDetails.tsx`, `Dashboard.tsx`
- **Rationale:** One component per file; matches component name

#### Hooks
- **Format:** `camelCase` starting with `use`
- **Examples:**
  - `useAuth.ts`, `useCaseData.ts`, `usePermissions.ts`
  - `useDetectiveBoard.ts`, `useNotifications.ts`
- **Rationale:** React hooks convention

#### Utility Functions
- **Format:** `camelCase`
- **Examples:**
  - `formatDate.ts`, `calculateReward.ts`, `validateForm.ts`
- **Rationale:** JavaScript/TypeScript convention

#### Constants
- **Format:** `UPPER_SNAKE_CASE`
- **Examples:**
  - `API_BASE_URL`, `MAX_FILE_SIZE`, `CRIME_SEVERITY_LEVELS`
- **Rationale:** Universal constant naming convention

#### CSS Modules / Styled Components
- **Format:** `camelCase` for CSS modules, `PascalCase` for styled components
- **Examples:**
  - `caseCard.module.css` → `.caseCard`
  - `StyledButton`, `StyledCard`, `StyledForm`
- **Rationale:** Clear distinction between CSS modules and styled components

#### API Service Files
- **Format:** `camelCase` + `Service` or `API` suffix
- **Examples:**
  - `caseService.ts`, `authService.ts`, `evidenceAPI.ts`
- **Rationale:** Clear service layer identification

### 1.3 Database

#### Tables
- **Format:** `snake_case` (plural)
- **Examples:**
  - `cases`, `evidence`, `complaints`, `suspects`, `users`
  - `witness_statements`, `biological_evidence`, `vehicle_evidence`
- **Rationale:** Django ORM convention; plural for tables

#### Columns
- **Format:** `snake_case`
- **Examples:**
  - `created_date`, `national_id`, `phone_number`, `guilt_score`
- **Rationale:** Consistent with Django field naming

#### Foreign Keys
- **Format:** `snake_case` + `_id` suffix
- **Examples:**
  - `case_id`, `user_id`, `evidence_id`, `complaint_id`
- **Rationale:** Django convention for foreign key fields

---

## 2. Commit Message Format

### 2.1 Format Structure
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2.2 Commit Types
- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, no logic change)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks (dependencies, config)
- **perf:** Performance improvements
- **ci:** CI/CD changes
- **build:** Build system changes

### 2.3 Scope Examples
- `backend`, `frontend`, `api`, `models`, `auth`, `ui`, `tests`, `docker`

### 2.4 Examples

#### Feature Commit
```
feat(backend): add complaint approval workflow

- Implement Intern review logic
- Add Police Officer approval endpoint
- Track submission count for rejection threshold
- Add tests for approval workflow

Closes #123
```

#### Bug Fix
```
fix(frontend): resolve detective board drag-drop issue

- Fix connection line rendering on board export
- Update state management for evidence positions
- Add error handling for invalid evidence connections

Fixes #456
```

#### Documentation
```
docs(reports): add development contracts document

- Define naming conventions for backend and frontend
- Establish commit message format
- Document code style guidelines
```

#### Refactoring
```
refactor(backend): optimize case query performance

- Add database indexes on frequently queried fields
- Implement select_related for foreign key queries
- Reduce N+1 query issues in case list endpoint
```

---

## 3. Code Style Guidelines

### 3.1 Python (Backend)

#### PEP 8 Compliance
- Maximum line length: **88 characters** (Black formatter default)
- Use 4 spaces for indentation (no tabs)
- Use double quotes for strings (Black default)

#### Imports Order
1. Standard library imports
2. Third-party imports
3. Local application imports

#### Example:
```python
# Standard library
from datetime import datetime
from typing import List, Optional

# Third-party
from django.db import models
from rest_framework import serializers

# Local
from apps.cases.models import Case
from apps.evidence.models import Evidence
```

#### Docstrings
- Use Google-style docstrings
- Required for all classes, methods, and functions

#### Example:
```python
def create_case_from_complaint(complaint_id: int, officer_id: int) -> Case:
    """
    Create a case from an approved complaint.
    
    Args:
        complaint_id: The ID of the approved complaint
        officer_id: The ID of the approving police officer
        
    Returns:
        The created Case instance
        
    Raises:
        Complaint.DoesNotExist: If complaint not found
        PermissionError: If officer lacks approval permission
    """
    # Implementation
```

### 3.2 TypeScript/JavaScript (Frontend)

#### ESLint Configuration
- Use Airbnb style guide as base
- Maximum line length: **100 characters**
- Use 2 spaces for indentation

#### TypeScript
- Always use TypeScript for new files
- Define interfaces for all API responses
- Avoid `any` type; use `unknown` if type is truly unknown

#### Example:
```typescript
interface Case {
  id: number;
  title: string;
  severity: CrimeSeverity;
  status: CaseStatus;
  createdDate: string;
  createdBy: User;
}

const fetchCase = async (id: number): Promise<Case> => {
  const response = await api.get<Case>(`/api/cases/${id}/`);
  return response.data;
};
```

#### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Case } from '@/types';
import { caseService } from '@/services';

// 2. Types/Interfaces
interface CaseCardProps {
  case: Case;
  onUpdate: (id: number) => void;
}

// 3. Component
export const CaseCard: React.FC<CaseCardProps> = ({ case, onUpdate }) => {
  // 4. State
  const [loading, setLoading] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    onUpdate(case.id);
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

---

## 4. File Organization

### 4.1 Backend Structure
```
backend/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   └── urls.py
├── apps/
│   ├── accounts/
│   ├── cases/
│   ├── evidence/
│   ├── complaints/
│   └── rewards/
├── core/
│   ├── permissions.py
│   └── mixins.py
└── tests/
```

### 4.2 Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── cases/
│   │   └── evidence/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── constants/
├── public/
└── tests/
```

---

## 5. Git Workflow

### 5.1 Branch Naming
- **Format:** `<type>/<description>`
- **Examples:**
  - `feature/complaint-approval-workflow`
  - `fix/detective-board-export`
  - `refactor/evidence-serializers`
  - `docs/api-documentation`

### 5.2 Branch Strategy
- **main:** Production-ready code
- **develop:** Integration branch for features
- **feature/***: New features
- **fix/***: Bug fixes
- **hotfix/***: Critical production fixes

### 5.3 Pull Request Requirements
1. All tests must pass
2. Code must be reviewed by at least one team member
3. PR description must follow template
4. Related issues must be linked
5. Screenshots required for UI changes

---

## 6. Testing Standards

### 6.1 Backend
- Minimum 80% code coverage
- All API endpoints must have tests
- All permission classes must be tested
- Use `pytest` and `pytest-django`

### 6.2 Frontend
- Component tests using React Testing Library
- Integration tests for critical workflows
- E2E tests for user journeys (Playwright)
- Minimum 70% code coverage

---

## 7. Documentation Requirements

### 7.1 Code Documentation
- All public functions/methods must have docstrings
- Complex logic must include inline comments
- API endpoints must have Swagger/OpenAPI documentation

### 7.2 README Files
- Each app/module must have a README
- Include setup instructions
- Document environment variables
- Provide usage examples

---

## 8. Security Guidelines

### 8.1 Backend
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user inputs
- Use Django's built-in security features
- Implement rate limiting for authentication endpoints

### 8.2 Frontend
- Never expose API keys in client code
- Sanitize user inputs before rendering
- Implement proper authentication token storage
- Use HTTPS in production

---

## 9. Performance Guidelines

### 9.1 Backend
- Use `select_related` and `prefetch_related` to avoid N+1 queries
- Implement pagination for list endpoints
- Add database indexes for frequently queried fields
- Use caching where appropriate

### 9.2 Frontend
- Implement code splitting
- Lazy load components when possible
- Optimize images and assets
- Use React.memo for expensive components

---

## 10. Review Checklist

Before submitting code, ensure:
- [ ] Code follows naming conventions
- [ ] Commit message follows format
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console.logs or debug code
- [ ] Code is properly formatted (Black/Prettier)
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

---

**Last Updated:** 2024
**Version:** 1.0

