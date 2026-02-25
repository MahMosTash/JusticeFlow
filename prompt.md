# 🧠 Cursor Master Prompt  
## Police Case Management System (Full & Complete Spec)

> Build a **production-grade, auditable Police Case Management System** exactly according to the following specification.  
> Start with **data modeling**, then **RBAC**, then **REST APIs**, then **frontend UI**.  
> This system must satisfy **all functional, UI, testing, and deployment requirements** below.

---

## 1️⃣ Tech Stack & Constraints

### Mandatory Stack
- **Backend:** Django + Django REST Framework
- **Frontend:** React
- **Database:** PostgreSQL (recommended)
- **Auth:** Django auth + custom RBAC
- **Deployment:** Docker Compose
- **CI/CD:** GitHub Actions

❌ No alternative frameworks are allowed.

---

## 2️⃣ Core Architecture Rules

- Models are the **foundation** of the system
- Endpoints must be **derived from models**
- RBAC must be **data-driven**, not hardcoded
- Permissions enforced at:
  - Model
  - Serializer
  - View / Endpoint
- Every endpoint must have:
  - Proper HTTP status codes
  - Meaningful error messages
  - Role-aware access control
- Full **Swagger / OpenAPI documentation** is mandatory. The swagger documentation should be very complete and descriptive.

---

## 3️⃣ User Roles (Dynamic)

Initial roles (must be editable without code changes):

- System Administrator
- Police Chief
- Captain
- Sergeant
- Detective
- Police Officer
- Patrol Officer
- Intern (Cadet)
- Forensic Doctor
- Judge
- Complainant
- Witness
- Suspect
- Criminal
- Basic User

⚠️ **Critical:**  
Admin can **create, delete, or modify roles at runtime** without redeploying backend.

---

## 4️⃣ Crime Severity Levels

| Level | Description |
|-----|------------|
| Level 3 | Minor crimes (petty theft, small fraud) |
| Level 2 | Major crimes (vehicle theft) |
| Level 1 | Severe crimes (murder) |
| Critical | Terrorism, serial murder, assassination |

---

## 5️⃣ Authentication & Registration

### Registration Fields
- Username (unique)
- Password
- Email (unique)
- Phone number (unique)
- First name
- Last name
- National ID (unique)

Default role: **Basic User**

### Login
Login using **password + one of**:
- Username
- National ID
- Email
- Phone number

---

## 6️⃣ Case Creation Workflows

### A) Complaint-Based Case

1. Complainant submits case request
2. Intern reviews:
   - If incomplete → returned with error message
   - If valid → forwarded to Police Officer
3. Police Officer:
   - Approves → case created
   - Rejects → returns to Intern

Rules:
- Max **3 invalid submissions** → case permanently rejected
- Multiple complainants allowed
- Each complainant reviewed independently

---

### B) Crime Scene-Based Case

- Created by Police Officer / Patrol Officer
- Includes:
  - Incident date & time
  - Witness national ID + phone
- Only **one superior approval required**
- If Police Chief creates → no approval needed
- Initially no complainants, can be added later

---

## 7️⃣ Evidence Management

### Common Fields (ALL evidence)
- Title
- Description
- Created date
- Recorded by (user)

### Evidence Types

#### 1. Witness Statements
- Text transcript
- Optional: image, video, audio

#### 2. Biological / Medical
- Blood, hair, fingerprints
- Images required
- Verified by:
  - Forensic Doctor
  - National ID database
- Verification fields initially empty

#### 3. Vehicle Evidence
- Model
- Color
- License plate **OR** serial number (never both)

#### 4. Identification Documents
- Full name
- Arbitrary key-value metadata (unbounded)
- Metadata may be empty

#### 5. Other Evidence
- Generic title-description record

---

## 8️⃣ Case Resolution (Detective Board)

- Detective uses **visual board**
  - Drag & drop evidence
  - Draw connections
- Can export board **as image**
- Proposes suspects
- Sergeant reviews:
  - Evidence
  - Criminal history

Outcomes:
- Approved → arrest begins
- Rejected → case remains open

⚠️ New evidence during resolution:
- Triggers **notification** to detective

---

## 9️⃣ Interrogation & Guilt Scoring

- Detective + Sergeant interrogate suspects
- Each assigns **guilt score (1–10)**

Captain:
- Reviews scores & evidence
- Issues decision

Critical crimes:
- Police Chief must approve captain’s decision

---

## 🔟 Trial Phase

Judge must see:
- Full case
- All evidence
- All involved officers
- Complete audit trail (approvals, rejections, comments)

Judge records:
- Final verdict (guilty / not guilty)
- Punishment with title & description

---

## 1️⃣1️⃣ Suspect Status & “Most Wanted”

### Under Surveillance
If a suspect is under investigation **> 1 month**:
- Status becomes **“Under Severe Surveillance”**
- Publicly visible page

### Ranking Formula
max(Lj) × max(Di)


Where:
- Lj = crime severity (1–4)
- Di = number of days under investigation

---

## 1️⃣2️⃣ Rewards System

If someone submits useful info:

Reward formula:
max(Lj) × max(Di) × 20,000,000


Flow:
1. Basic user submits information
2. Police Officer reviews
3. Detective approves
4. User receives **unique reward code**
5. User claims reward at police office

All officers can view:
- Reward code
- Amount
- User info

---

## 1️⃣3️⃣ Bail & Fine Payment (Optional)

- Applies to **Level 2 & 3 crimes**
- Sergeant sets amount
- Payment via **test payment gateways**
- System must include:
  - Payment callback page
  - Transaction verification

---

## 1️⃣4️⃣ Required Pages (Frontend)

1. Home Page
   - Total cases
   - Solved cases
   - Total police staff
2. Login & Register
3. Modular Dashboard (role-based)
4. Detective Board
5. Most Wanted / Under Severe Surveillance
6. Case & Complaint Status
7. Aggregated Reports
8. Evidence Create & Review

UI must be:
- Responsive
- Role-aware
- Clean UX
- State-managed correctly
- Skeleton loaders included

---

## 1️⃣5️⃣ Testing Requirements

### Backend
- Minimum **10 tests**(But )
- Cover:
  - Auth
  - Permissions
  - Core flows
  - Try to be complete and cover everything

### Frontend
- Minimum **5 tests**
- Use RTL / Jest / Playwright
- Try to be complete and cover everything
- Leave global style files for me to play with

---

## 1️⃣6️⃣ Reports needed:

There are a few report files needed. do each one of them in an md file:

- Development contracts (naming conventions, commit message formats, etc.)  
- Key system entities along with the reasons for their existence  
- Up to 6 NPM packages used in the project, along with a summary of their functionality and justification for their use  
- Strengths and weaknesses of artificial intelligence in frontend development  
- Strengths and weaknesses of artificial intelligence in backend development  
- Initial and final project requirement analyses, along with the strengths and weaknesses of the decisions made regarding them
- The general project structure and software decisions with reasons


## 1️⃣7️⃣ Checkpoints

### Checkpoint 1 (Planning and Reports)
- Report  Files

### Checkpoint 2 (Backend)
- Models
- RBAC
- REST APIs
- Swagger
- Test

### Checkpoint 3 (Frontend)
- Full UI and frontend
- Backend integration
- Test

### Checkpoint 4 (Devops)
- Docker Compose
- CI/CD pipeline
---

## 1️⃣8️⃣ Final Instructions to Cursor

> Implement the **entire system end-to-end**.  
> Prioritize **data modeling**, **permission correctness**, and **auditability**.  
> Assume this system must follow **best practices**, but is still a student project.
