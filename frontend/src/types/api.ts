/**
 * API response types matching Django REST Framework responses
 */

export interface User {
  id: number;
  username: string;
  email: string;
  phone_number: string;
  national_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: number;
  title: string;
  description: string;
  severity: CrimeSeverity;
  status: CaseStatus;
  incident_date: string | null;
  incident_time: string | null;
  incident_location: string | null;
  created_by: User;
  assigned_detective: User | null;
  assigned_sergeant: User | null;
  resolution_date: string | null;
  resolution_notes: string;
  created_date: string;
  updated_date: string;
  complainants?: CaseComplainant[];
  witnesses?: CaseWitness[];
  evidence_count?: number;
  suspects_count?: number;
}

export interface CaseComplainant {
  id: number;
  case: number;
  complainant: User;
  added_date: string;
  notes: string;
}

export interface CaseWitness {
  id: number;
  case: number;
  witness: User | null;
  witness_national_id: string | null;
  witness_phone: string | null;
  added_date: string;
  notes: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  submitted_by: User;
  submission_count: number;
  status: ComplaintStatus;
  reviewed_by_intern: User | null;
  reviewed_by_officer: User | null;
  review_comments: string;
  case: Case | null;
  reviews: ComplaintReview[];
  created_date: string;
  updated_date: string;
}

export interface ComplaintReview {
  id: number;
  complaint: number;
  reviewer: User;
  action: ComplaintReviewAction;
  comments: string;
  reviewed_at: string;
}

export interface Evidence {
  id: number;
  title: string;
  description: string;
  evidence_type: EvidenceType;
  case: { id: number; title: string; severity: string; status: string; created_by: string; assigned_detective: string | null; created_date: string } | number;
  recorded_by: User;
  created_date: string;
  // Witness Statement fields
  transcript?: string;
  witness_name?: string;
  witness_national_id?: string;
  witness_phone?: string;
  image?: string;
  video?: string;
  audio?: string;
  // Biological Evidence fields
  evidence_category?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  verified_by_forensic_doctor?: User | null;
  verified_by_national_id?: string;
  verification_date?: string | null;
  verification_notes?: string;
  // Vehicle Evidence fields
  model?: string;
  color?: string;
  license_plate?: string;
  serial_number?: string;
  // Identification Document fields
  full_name?: string;
  metadata?: Record<string, any>;
}

export interface Suspect {
  id: number;
  case: number;
  user: User | null;
  name: string;
  national_id: string;
  phone_number: string;
  status: SuspectStatus;
  surveillance_start_date: string | null;
  arrest_date: string | null;
  cleared_date: string | null;
  notes: string;
  created_date: string;
  updated_date: string;
  days_under_investigation?: number;
  most_wanted_ranking?: number;
}

export interface Interrogation {
  id: number;
  suspect: number;
  case: number;
  interrogator: User;
  interrogation_date: string;
  duration: string | null;
  transcript: string;
  notes: string;
}

export interface GuiltScore {
  id: number;
  suspect: number;
  case: number;
  assigned_by: User;
  score: number;
  justification: string;
  assigned_date: string;
}

export interface CaptainDecision {
  id: number;
  case: number;
  suspect: number;
  decision: CaptainDecisionType;
  comments: string;
  requires_chief_approval: boolean;
  chief_approval: boolean | null;
  chief_approved_by: User | null;
  chief_approval_date: string | null;
  decided_at: string;
  decided_by: User;
}

export interface DetectiveBoard {
  id: number;
  case: number;
  detective: User;
  board_data: Record<string, any>;
  last_modified: string;
  last_modified_by: User | null;
  connections: BoardEvidenceConnection[];
  evidence_items?: Evidence[];
}

export interface BoardEvidenceConnection {
  id: number;
  board: number;
  source_evidence: Evidence;
  target_evidence: Evidence;
  connection_type: string;
  notes: string;
  created_at: string;
}

export interface Trial {
  id: number;
  case: Case;
  judge: User;
  trial_date: string | null;
  verdict_date: string | null;
  verdict: VerdictType | null;
  punishment_title: string;
  punishment_description: string;
  notes: string;
  created_date: string;
  updated_date: string;
  is_complete: boolean;
}

export interface RewardSubmission {
  id: number;
  submitted_by: User;
  case: number | null;
  information: string;
  status: RewardStatus;
  reviewed_by_officer: User | null;
  reviewed_by_detective: User | null;
  review_comments: string;
  submitted_date: string;
  updated_date: string;
}

export interface Reward {
  id: number;
  submission: RewardSubmission;
  case: number | null;
  amount: number;
  reward_code: string;
  status: RewardClaimStatus;
  claimed_date: string | null;
  claimed_at_location: string;
  created_date: string;
  created_by: User;
}

export interface BailFine {
  id: number;
  case: number;
  suspect: number;
  amount: string;
  type: 'Bail' | 'Fine';
  status: PaymentStatus;
  due_date: string | null;
  paid_date: string | null;
  payment_transaction_id: string;
  set_by: User;
  created_date: string;
  updated_date: string;
  transactions?: PaymentTransaction[];
}

export interface PaymentTransaction {
  id: number;
  bail_fine: number;
  transaction_id: string;
  amount: string;
  currency: string;
  status: TransactionStatus;
  gateway_response: Record<string, any>;
  created_date: string;
  completed_date: string | null;
}

export interface Notification {
  id: number;
  user: number;
  type: NotificationType;
  title: string;
  message: string;
  related_case: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// Enums and Types
export type CrimeSeverity = 'Level 3' | 'Level 2' | 'Level 1' | 'Critical';
export type CaseStatus = 'Pending' | 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';
export type ComplaintStatus = 'Pending' | 'Returned' | 'Under Review' | 'Approved' | 'Rejected' | 'Permanently Rejected';
export type ComplaintReviewAction = 'Returned' | 'Forwarded' | 'Approved' | 'Rejected';
export type EvidenceType = 'witness_statement' | 'biological' | 'vehicle' | 'identification' | 'other';
export type SuspectStatus = 'Under Investigation' | 'Under Severe Surveillance' | 'Arrested' | 'Cleared';
export type CaptainDecisionType = 'Approve Arrest' | 'Reject' | 'Request More Evidence';
export type VerdictType = 'Guilty' | 'Not Guilty';
export type RewardStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
export type RewardClaimStatus = 'Pending' | 'Claimed';
export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';
export type TransactionStatus = 'Pending' | 'Success' | 'Failed' | 'Refunded';
export type NotificationType = 'new_evidence' | 'case_update' | 'approval_required' | 'complaint_review' | 'suspect_proposed' | 'decision_made' | 'reward_approved' | 'other';

// API Response wrappers
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: any;
}

export interface LoginResponse {
  user: User;
  token: string;
}

