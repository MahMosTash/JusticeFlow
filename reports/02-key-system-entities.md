# Key System Entities

## Overview
This document outlines the core entities (models) in the Police Case Management System, their purpose, relationships, and the rationale behind their design. These entities form the foundation of the entire system and drive all business logic, permissions, and workflows.

---

## 1. User & Authentication Entities

### 1.1 User
**Purpose:** Represents all system users (officers, civilians, suspects, etc.)

**Key Attributes:**
- `username`, `email`, `phone_number`, `national_id` (all unique)
- `first_name`, `last_name`
- `password` (hashed)
- `is_active`, `is_staff`, `is_superuser`
- `date_joined`, `last_login`

**Relationships:**
- One-to-Many: Cases (created_by), Evidence (recorded_by)
- Many-to-Many: Roles (through RoleAssignment)

**Rationale:**
- Central authentication entity for all user types
- Single user model simplifies permission management
- National ID enables identity verification across the system
- Multiple unique identifiers (username, email, phone, national_id) support flexible login

---

### 1.2 Role
**Purpose:** Defines user roles dynamically (System Administrator, Police Chief, Detective, etc.)

**Key Attributes:**
- `name` (unique)
- `description`
- `permissions` (many-to-many with Permission)
- `is_active`
- `created_at`, `updated_at`

**Relationships:**
- Many-to-Many: Users (through RoleAssignment)
- Many-to-Many: Permissions

**Rationale:**
- **Dynamic RBAC:** Roles can be created/modified at runtime without code changes
- Enables flexible permission management for different organizational structures
- Supports hierarchical role relationships (e.g., Police Chief > Captain > Sergeant)
- Critical for auditability - all actions are role-based

---

### 1.3 RoleAssignment
**Purpose:** Links users to roles with temporal tracking

**Key Attributes:**
- `user` (ForeignKey)
- `role` (ForeignKey)
- `assigned_at`, `assigned_by`
- `is_active`

**Rationale:**
- Tracks when and by whom roles were assigned
- Supports role history for audit trails
- Enables temporary role assignments
- Critical for security compliance

---

## 2. Case Management Entities

### 2.1 Case
**Purpose:** Central entity representing a criminal case

**Key Attributes:**
- `title`, `description`
- `severity` (Level 3, 2, 1, Critical)
- `status` (Open, Under Investigation, Resolved, Closed)
- `incident_date`, `incident_time`, `incident_location`
- `created_date`, `created_by`
- `assigned_detective`, `assigned_sergeant`
- `resolution_date`, `resolution_notes`

**Relationships:**
- One-to-Many: Complaints, Evidence, Suspects, Interrogations
- Many-to-Many: Complainants (through CaseComplainant)
- Many-to-Many: Witnesses (through CaseWitness)

**Rationale:**
- **Core business entity:** All workflows revolve around cases
- Severity drives approval chains and notification rules
- Status tracks case lifecycle from creation to resolution
- Incident details are critical for crime scene-based cases
- Assignment fields enable workload management

---

### 2.2 Complaint
**Purpose:** Represents a complaint submitted by a complainant that may become a case

**Key Attributes:**
- `title`, `description`
- `submitted_by` (complainant user)
- `submission_count` (tracks resubmissions)
- `status` (Pending, Under Review, Approved, Rejected, Permanently Rejected)
- `reviewed_by_intern`, `reviewed_by_officer`
- `review_comments`
- `created_date`, `updated_date`

**Relationships:**
- Many-to-One: Case (nullable - created after approval)
- One-to-Many: ComplaintReviews (audit trail)

**Rationale:**
- **Workflow entity:** Implements complaint-based case creation
- Submission count enforces 3-strike rule (permanent rejection)
- Status tracks approval workflow (Intern → Police Officer)
- Review comments provide feedback to complainants
- Separate from Case to maintain clear workflow separation

---

### 2.3 ComplaintReview
**Purpose:** Audit trail for complaint review actions

**Key Attributes:**
- `complaint` (ForeignKey)
- `reviewer` (user)
- `action` (Returned, Forwarded, Approved, Rejected)
- `comments`
- `reviewed_at`

**Rationale:**
- **Auditability:** Complete history of complaint reviews
- Enables tracking of who reviewed what and when
- Comments explain decisions for future reference
- Critical for compliance and dispute resolution

---

## 3. Evidence Entities

### 3.1 Evidence (Abstract Base)
**Purpose:** Base model for all evidence types with common fields

**Key Attributes:**
- `title`, `description`
- `created_date`, `recorded_by` (user)
- `case` (ForeignKey)
- `evidence_type` (polymorphic discriminator)

**Rationale:**
- **Polymorphism:** Single evidence interface with multiple types
- Common fields reduce duplication
- Recorded_by tracks evidence chain of custody
- Created_date enables chronological evidence ordering
- Base model simplifies evidence queries across types

---

### 3.2 WitnessStatement
**Purpose:** Evidence type for witness testimonies

**Key Attributes:**
- Inherits from Evidence
- `transcript` (text)
- `witness_name`, `witness_national_id`, `witness_phone`
- `image` (optional), `video` (optional), `audio` (optional)

**Rationale:**
- **Flexible evidence:** Supports text, image, video, audio
- Witness contact info enables follow-up interviews
- Optional media files capture visual/audio evidence
- Separate model allows type-specific validation and queries

---

### 3.3 BiologicalEvidence
**Purpose:** Evidence type for biological/medical evidence (blood, hair, fingerprints)

**Key Attributes:**
- Inherits from Evidence
- `evidence_category` (Blood, Hair, Fingerprint, DNA, etc.)
- `images` (required - multiple)
- `verified_by_forensic_doctor` (nullable)
- `verified_by_national_id` (nullable)
- `verification_date` (nullable)

**Relationships:**
- Many-to-One: ForensicDoctor (user)

**Rationale:**
- **Verification requirement:** Must be verified by forensic doctor
- Images required for documentation and analysis
- National ID verification links evidence to individuals
- Nullable verification fields track pending verification
- Critical for legal admissibility

---

### 3.4 VehicleEvidence
**Purpose:** Evidence type for vehicle-related evidence

**Key Attributes:**
- Inherits from Evidence
- `model`, `color`
- `license_plate` OR `serial_number` (mutually exclusive)

**Rationale:**
- **Mutual exclusivity:** License plate OR serial number, never both
- Model and color aid identification
- Separate model enables vehicle-specific queries and validation
- Supports vehicle theft cases (Level 2 crimes)

---

### 3.5 IdentificationDocument
**Purpose:** Evidence type for ID documents with flexible metadata

**Key Attributes:**
- Inherits from Evidence
- `full_name`
- `metadata` (JSONField - arbitrary key-value pairs)

**Rationale:**
- **Flexibility:** Unbounded metadata supports various document types
- JSONField allows different document structures without schema changes
- Full name enables quick identification
- Metadata may be empty for minimal documents

---

### 3.6 OtherEvidence
**Purpose:** Generic evidence type for miscellaneous evidence

**Key Attributes:**
- Inherits from Evidence
- (Only base fields - title, description, etc.)

**Rationale:**
- **Catch-all:** Handles evidence that doesn't fit other categories
- Maintains evidence consistency (all evidence has same base structure)
- Prevents forcing evidence into inappropriate categories

---

## 4. Investigation Entities

### 4.1 Suspect
**Purpose:** Represents individuals suspected of involvement in a case

**Key Attributes:**
- `case` (ForeignKey)
- `user` (ForeignKey - nullable, may be system user or external)
- `name`, `national_id`, `phone_number`
- `status` (Under Investigation, Under Severe Surveillance, Arrested, Cleared)
- `surveillance_start_date`
- `arrest_date`, `cleared_date`

**Relationships:**
- One-to-Many: Interrogations, GuiltScores

**Rationale:**
- **Investigation tracking:** Central entity for suspect management
- Status drives "Most Wanted" ranking and public visibility
- Surveillance start date enables 1-month threshold calculation
- User FK nullable (suspects may not be system users)
- Critical for detective board and case resolution

---

### 4.2 Interrogation
**Purpose:** Records interrogation sessions with suspects

**Key Attributes:**
- `suspect` (ForeignKey)
- `case` (ForeignKey)
- `interrogator` (user - Detective or Sergeant)
- `interrogation_date`, `duration`
- `transcript`, `notes`

**Rationale:**
- **Audit trail:** Complete record of interrogations
- Tracks who interrogated whom and when
- Transcript and notes support guilt scoring decisions
- Required for legal compliance

---

### 4.3 GuiltScore
**Purpose:** Records guilt scores assigned by interrogators

**Key Attributes:**
- `suspect` (ForeignKey)
- `case` (ForeignKey)
- `assigned_by` (user - Detective or Sergeant)
- `score` (1-10)
- `justification`
- `assigned_date`

**Rationale:**
- **Decision support:** Quantitative assessment of suspect guilt
- Multiple scores per suspect (Detective + Sergeant)
- Justification documents reasoning
- Used by Captain for decision-making

---

### 4.4 CaptainDecision
**Purpose:** Records Captain's decision based on guilt scores and evidence

**Key Attributes:**
- `case` (ForeignKey)
- `suspect` (ForeignKey)
- `decision` (Approve Arrest, Reject, Request More Evidence)
- `comments`
- `requires_chief_approval` (boolean - for Critical crimes)
- `chief_approval` (nullable)
- `decided_at`, `approved_at`

**Rationale:**
- **Approval chain:** Captain reviews and decides
- Critical crimes require Police Chief approval
- Comments explain decision rationale
- Tracks approval workflow for auditability

---

## 5. Detective Board Entity

### 5.1 DetectiveBoard
**Purpose:** Stores visual board state for detective case analysis

**Key Attributes:**
- `case` (ForeignKey - unique)
- `detective` (user)
- `board_data` (JSONField - stores positions, connections, layout)
- `last_modified`, `last_modified_by`

**Rationale:**
- **Visual analysis:** Enables drag-drop evidence organization
- JSONField stores flexible board state (positions, connections)
- Tracks modifications for collaboration
- Export functionality generates images from board_data

---

### 5.2 BoardEvidenceConnection
**Purpose:** Represents connections between evidence on detective board

**Key Attributes:**
- `board` (ForeignKey)
- `source_evidence`, `target_evidence` (ForeignKeys)
- `connection_type`, `notes`
- `created_at`

**Rationale:**
- **Relationship tracking:** Documents evidence relationships
- Connection types (e.g., "Related to", "Contradicts", "Supports")
- Notes explain connection reasoning
- Supports visual board export with connections

---

## 6. Trial & Resolution Entities

### 6.1 Trial
**Purpose:** Represents the trial phase of a case

**Key Attributes:**
- `case` (ForeignKey - unique)
- `judge` (user)
- `trial_date`, `verdict_date`
- `verdict` (Guilty, Not Guilty)
- `punishment_title`, `punishment_description`
- `notes`

**Rationale:**
- **Legal closure:** Final phase of case lifecycle
- Judge records official verdict and punishment
- Verdict and punishment are required for case closure
- Complete audit trail from complaint to verdict

---

## 7. Rewards System Entities

### 7.1 RewardSubmission
**Purpose:** Information submitted by basic users for rewards

**Key Attributes:**
- `submitted_by` (user)
- `case` (ForeignKey - nullable, may be general tip)
- `information` (text)
- `status` (Pending, Under Review, Approved, Rejected)
- `reviewed_by_officer`, `reviewed_by_detective`
- `review_comments`
- `submitted_date`

**Rationale:**
- **Reward workflow:** Tracks information submission
- Two-stage approval (Police Officer → Detective)
- Status tracks approval progress
- Comments provide feedback

---

### 7.2 Reward
**Purpose:** Represents an approved reward with unique code

**Key Attributes:**
- `submission` (ForeignKey - unique)
- `case` (ForeignKey - nullable)
- `amount` (calculated: max(severity) × max(days) × 20,000,000)
- `reward_code` (unique, generated)
- `status` (Pending, Claimed)
- `claimed_date`, `claimed_at_location`
- `created_date`

**Rationale:**
- **Reward management:** Tracks reward lifecycle
- Unique code enables office claim verification
- Amount calculated from formula
- Status tracks if reward has been claimed
- All officers can view for transparency

---

## 8. Payment Entities (Optional)

### 8.1 BailFine
**Purpose:** Represents bail or fine for Level 2 & 3 crimes

**Key Attributes:**
- `case` (ForeignKey)
- `suspect` (ForeignKey)
- `amount` (set by Sergeant)
- `type` (Bail, Fine)
- `status` (Pending, Paid, Overdue)
- `due_date`, `paid_date`
- `payment_transaction_id`

**Rationale:**
- **Payment tracking:** Manages bail/fine payments
- Only for Level 2 & 3 crimes (not Level 1 or Critical)
- Transaction ID links to payment gateway
- Status tracks payment completion

---

### 8.2 PaymentTransaction
**Purpose:** Records payment gateway transactions

**Key Attributes:**
- `bail_fine` (ForeignKey)
- `transaction_id` (from gateway)
- `amount`, `currency`
- `status` (Pending, Success, Failed, Refunded)
- `gateway_response` (JSONField)
- `created_date`, `completed_date`

**Rationale:**
- **Payment audit:** Complete transaction history
- Gateway response stored for verification
- Status tracks payment lifecycle
- Required for financial reconciliation

---

## 9. Notification Entity

### 9.1 Notification
**Purpose:** System notifications for users

**Key Attributes:**
- `user` (ForeignKey)
- `type` (New Evidence, Case Update, Approval Required, etc.)
- `title`, `message`
- `related_case` (ForeignKey - nullable)
- `is_read`, `read_at`
- `created_at`

**Rationale:**
- **User engagement:** Keeps users informed of system events
- Type enables notification filtering
- Read status tracks user engagement
- Related case links notification to relevant context
- Critical for detective notifications on new evidence

---

## 10. Audit Trail Entity

### 10.1 AuditLog
**Purpose:** Comprehensive audit trail for all system actions

**Key Attributes:**
- `user` (ForeignKey)
- `action` (Create, Update, Delete, Approve, Reject, etc.)
- `model_name` (Case, Evidence, Complaint, etc.)
- `object_id`
- `changes` (JSONField - before/after values)
- `ip_address`, `user_agent`
- `timestamp`

**Rationale:**
- **Compliance:** Required for police system auditability
- Tracks all user actions with full context
- Changes field enables rollback capability
- IP and user agent support security investigations
- Critical for legal and regulatory compliance

---

## Entity Relationship Summary

### Core Relationships
1. **User** → **Role** (Many-to-Many via RoleAssignment)
2. **Case** → **Complaint** (One-to-Many)
3. **Case** → **Evidence** (One-to-Many, polymorphic)
4. **Case** → **Suspect** (One-to-Many)
5. **Suspect** → **Interrogation** (One-to-Many)
6. **Suspect** → **GuiltScore** (One-to-Many)
7. **Case** → **DetectiveBoard** (One-to-One)
8. **Case** → **Trial** (One-to-One)
9. **RewardSubmission** → **Reward** (One-to-One)

### Design Principles
1. **Separation of Concerns:** Each entity has a single, well-defined purpose
2. **Auditability:** All critical actions are logged and traceable
3. **Flexibility:** Polymorphic evidence, dynamic roles, flexible metadata
4. **Workflow Support:** Entities support multi-stage approval processes
5. **Data Integrity:** Foreign keys and constraints ensure referential integrity

---

**Last Updated:** 2024
**Version:** 1.0

