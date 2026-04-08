import { useQuery } from '@apollo/client/react';
import { useAtomValue as useJotaiAtomValue } from 'jotai';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type StratiaRole } from '@/stratia/types/RoleTypes';
import { GetRolesDocument } from '~/generated-metadata/graphql';

// Maps Twenty role labels to StratIA role identifiers.
// Role labels are set during Phase 1 setup: "Admin", "Setter", "Closer".
const ROLE_LABEL_MAP: Record<string, StratiaRole> = {
  admin: 'ADMIN',
  setter: 'SETTER',
  closer: 'CLOSER',
};

export type CurrentUserRoleResult = {
  role: StratiaRole;
  userId: string;
  isLoading: boolean;
};

export const useCurrentUserRole = (): CurrentUserRoleResult => {
  const currentWorkspaceMember = useJotaiAtomValue(
    currentWorkspaceMemberState.atom,
  );

  const { data, loading } = useQuery(GetRolesDocument, {
    fetchPolicy: 'cache-first',
  });

  const userId = currentWorkspaceMember?.id ?? '';

  // Find the role assigned to the current user by checking role members
  const roles = data?.getRoles ?? [];
  let detectedRole: StratiaRole = 'SETTER';

  for (const role of roles) {
    const isMember = role.workspaceMembers?.some(
      (member) => member.id === userId,
    );

    if (isMember) {
      const normalizedLabel = role.label.toLowerCase().trim();
      const mappedRole = ROLE_LABEL_MAP[normalizedLabel];

      if (mappedRole) {
        detectedRole = mappedRole;
        break;
      }
    }
  }

  return {
    role: detectedRole,
    userId,
    isLoading: loading,
  };
};
