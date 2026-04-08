import { useCurrentUserRole } from '@/stratia/visibility/hooks/useCurrentUserRole';
import {
  buildLeadVisibilityFilter,
  type VisibilityFilter,
} from '@/stratia/visibility/utils/buildVisibilityFilter';

export type RoleVisibilityResult = {
  role: string;
  filter: VisibilityFilter | null;
  isAdmin: boolean;
  isLoading: boolean;
};

export const useRoleVisibility = (): RoleVisibilityResult => {
  const { role, userId, isLoading } = useCurrentUserRole();
  const filter = buildLeadVisibilityFilter(role, userId);

  return {
    role,
    filter,
    isAdmin: role === 'ADMIN',
    isLoading,
  };
};
