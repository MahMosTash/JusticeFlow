/**
 * Application routes
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CASES: '/cases',
  CASE_DETAIL: (id: number) => `/cases/${id}`,
  CASE_CREATE: '/cases/create',
  COMPLAINTS: '/complaints',
  COMPLAINT_SUBMIT: '/complaints/submit',
  COMPLAINT_DETAIL: (id: number) => `/complaints/${id}`,
  EVIDENCE: '/evidence',
  EVIDENCE_CREATE: '/evidence/create',
  EVIDENCE_DETAIL: (id: number) => `/evidence/${id}`,
  DETECTIVE_BOARD: '/detective-board',
  DETECTIVE_BOARD_CASE: (caseId: number) => `/detective-board/${caseId}`,
  MOST_WANTED: '/most-wanted',
  REPORTS: '/reports',
  REWARDS: '/rewards',
  REWARD_SUBMIT: '/rewards/submit',
} as const;

