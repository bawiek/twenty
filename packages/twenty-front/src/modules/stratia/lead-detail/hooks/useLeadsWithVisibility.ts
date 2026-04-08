import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRoleVisibility } from '@/stratia/visibility/hooks/useRoleVisibility';

type VisibilityFilterObject = Record<string, unknown>;

// Merges the role-based visibility filter with any additional filters.
// When visibilityFilter is null (admin), only uses additionalFilter.
// When both are present, ANDs them together.
//
// Role filter behavior (from buildLeadVisibilityFilter):
//   ADMIN  -> null                -> no filter, sees all leads
//   SETTER -> { assignedMemberId: { eq: currentUserId } } -> sees only own leads
//   CLOSER -> { or: [own leads, { stage: { eq: 'PRET_POUR_CLOSING' } }] } -> sees own + ready-to-close
export const buildMergedFilter = (
  visibilityFilter: VisibilityFilterObject | null,
  additionalFilter?: VisibilityFilterObject,
): VisibilityFilterObject | undefined => {
  if (!visibilityFilter && !additionalFilter) {
    return undefined;
  }

  if (!visibilityFilter) {
    return additionalFilter;
  }

  if (!additionalFilter) {
    return visibilityFilter;
  }

  return { and: [visibilityFilter, additionalFilter] };
};

type UseLeadsWithVisibilityParams = {
  additionalFilter?: VisibilityFilterObject;
  limit?: number;
};

// Wraps Twenty's record query with role-based visibility filtering.
// A setter calling this hook will receive only leads where assignedMemberId matches their user ID.
// A closer will see their leads plus leads with stage "PRET_POUR_CLOSING".
// An admin will see all leads without any filter.
export const useLeadsWithVisibility = ({
  additionalFilter,
  limit,
}: UseLeadsWithVisibilityParams = {}) => {
  const { role, filter: visibilityFilter, isAdmin, isLoading: isRoleLoading } =
    useRoleVisibility();

  const mergedFilter = buildMergedFilter(visibilityFilter, additionalFilter);

  const {
    records: leads,
    loading: isQueryLoading,
    error,
    totalCount,
    fetchMoreRecords,
    hasNextPage,
  } = useFindManyRecords({
    objectNameSingular: 'person',
    filter: mergedFilter,
    skip: isRoleLoading,
    ...(limit !== undefined && { limit }),
  });

  return {
    leads,
    isLoading: isRoleLoading || isQueryLoading,
    error,
    role,
    isAdmin,
    totalCount,
    fetchMoreRecords,
    hasNextPage,
  };
};
