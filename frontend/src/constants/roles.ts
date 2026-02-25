/**
 * User roles constants
 */
export const ROLES = {
  SYSTEM_ADMINISTRATOR: 'System Administrator',
  POLICE_CHIEF: 'Police Chief',
  CAPTAIN: 'Captain',
  SERGEANT: 'Sergeant',
  DETECTIVE: 'Detective',
  POLICE_OFFICER: 'Police Officer',
  PATROL_OFFICER: 'Patrol Officer',
  INTERN: 'Intern (Cadet)',
  FORENSIC_DOCTOR: 'Forensic Doctor',
  JUDGE: 'Judge',
  COMPLAINANT: 'Complainant',
  WITNESS: 'Witness',
  SUSPECT: 'Suspect',
  CRIMINAL: 'Criminal',
  BASIC_USER: 'Basic User',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

