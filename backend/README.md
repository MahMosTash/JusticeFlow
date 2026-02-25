# Police Case Management System - Backend

Django REST Framework backend for the Police Case Management System.

## Setup

1. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser:**
```bash
python manage.py createsuperuser
```

6. **Create initial roles:**
```bash
python manage.py shell
>>> from apps.accounts.models import Role
>>> roles = ['System Administrator', 'Police Chief', 'Captain', 'Sergeant', 'Detective', 'Police Officer', 'Patrol Officer', 'Intern (Cadet)', 'Forensic Doctor', 'Judge', 'Complainant', 'Witness', 'Suspect', 'Criminal', 'Basic User']
>>> for role_name in roles:
...     Role.objects.get_or_create(name=role_name)
```

7. **Run development server:**
```bash
python manage.py runserver
```

## API Documentation

- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## Project Structure

```
backend/
├── config/          # Django project configuration
├── apps/            # Django applications
│   ├── accounts/   # User, Role, Authentication
│   ├── cases/      # Case management
│   ├── complaints/ # Complaint workflow
│   ├── evidence/   # Evidence management (5 types)
│   ├── investigations/ # Suspects, Interrogations, Guilt Scores
│   ├── detective_board/ # Visual case analysis
│   ├── trials/     # Trial and verdict
│   ├── rewards/    # Reward system
│   └── payments/   # Bail and fine payments
├── core/           # Shared utilities, permissions, models
└── tests/          # Integration tests
```

## Key Features

- **Dynamic RBAC:** Roles can be created/modified at runtime
- **Case Management:** Complaint-based and Crime Scene-based workflows
- **Evidence Management:** 5 evidence types with polymorphic structure
- **Detective Board:** Visual case analysis with connections
- **Investigation Tools:** Suspects, interrogations, guilt scoring
- **Trial Management:** Judge verdicts and punishments
- **Rewards System:** Information submission and approval
- **Audit Trails:** Complete logging of all actions

## Testing

```bash
pytest
```

## Development

Follow the development contracts in `/reports/01-development-contracts.md`.

