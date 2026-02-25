/**
 * Crime severity levels
 */
export const CRIME_SEVERITY = {
  LEVEL_3: 'Level 3',
  LEVEL_2: 'Level 2',
  LEVEL_1: 'Level 1',
  CRITICAL: 'Critical',
} as const;

export const CRIME_SEVERITY_OPTIONS = [
  { value: CRIME_SEVERITY.LEVEL_3, label: 'Level 3 - Minor crimes (petty theft, small fraud)' },
  { value: CRIME_SEVERITY.LEVEL_2, label: 'Level 2 - Major crimes (vehicle theft)' },
  { value: CRIME_SEVERITY.LEVEL_1, label: 'Level 1 - Severe crimes (murder)' },
  { value: CRIME_SEVERITY.CRITICAL, label: 'Critical - Terrorism, serial murder, assassination' },
] as const;

