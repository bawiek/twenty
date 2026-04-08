import { type StratiaRole } from '@/stratia/types/RoleTypes';

export type VisibilityFilter = {
  and?: object[];
  or?: object[];
  [key: string]: unknown;
};

export const buildLeadVisibilityFilter = (
  role: StratiaRole | string,
  currentUserId: string,
): VisibilityFilter | null => {
  switch (role) {
    case 'ADMIN':
      return null;
    case 'SETTER':
      return { assignedMemberId: { eq: currentUserId } };
    case 'CLOSER':
      return {
        or: [
          { assignedMemberId: { eq: currentUserId } },
          { stage: { eq: 'PRET_POUR_CLOSING' } },
        ],
      };
    default:
      // Unknown role defaults to most restrictive (setter-like)
      return { assignedMemberId: { eq: currentUserId } };
  }
};
