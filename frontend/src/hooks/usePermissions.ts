/**
 * Permissions hook
 */
import { useAuth } from './useAuth';
import { ROLES } from '@/constants/roles';

export const usePermissions = () => {
  const { hasRole, hasAnyRole } = useAuth();

  return {
    isSystemAdministrator: () => hasRole(ROLES.SYSTEM_ADMINISTRATOR),
    isPoliceChief: () => hasRole(ROLES.POLICE_CHIEF),
    isCaptain: () => hasRole(ROLES.CAPTAIN),
    isSergeant: () => hasRole(ROLES.SERGEANT),
    isDetective: () => hasRole(ROLES.DETECTIVE),
    isPoliceOfficer: () => hasRole(ROLES.POLICE_OFFICER),
    isPatrolOfficer: () => hasRole(ROLES.PATROL_OFFICER),
    isIntern: () => hasRole(ROLES.INTERN),
    isForensicDoctor: () => hasRole(ROLES.FORENSIC_DOCTOR),
    isJudge: () => hasRole(ROLES.JUDGE),
    isBasicUser: () => hasRole(ROLES.BASIC_USER),
    isOfficer: () => hasAnyRole([ROLES.POLICE_OFFICER, ROLES.PATROL_OFFICER, ROLES.POLICE_CHIEF]),
    isInvestigator: () => hasAnyRole([ROLES.DETECTIVE, ROLES.SERGEANT]),
    canCreateCase: () => hasAnyRole([ROLES.POLICE_OFFICER, ROLES.PATROL_OFFICER, ROLES.POLICE_CHIEF]),
    canReviewComplaint: () => hasAnyRole([ROLES.INTERN, ROLES.POLICE_OFFICER]),
    canManageEvidence: () => hasAnyRole([ROLES.DETECTIVE, ROLES.SERGEANT, ROLES.POLICE_OFFICER]),
    canUseDetectiveBoard: () => hasRole(ROLES.DETECTIVE),
    canViewMostWanted: () => true, // Public page
  };
};

