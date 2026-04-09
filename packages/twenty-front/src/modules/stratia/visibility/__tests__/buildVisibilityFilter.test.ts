import { buildLeadVisibilityFilter } from '../utils/buildVisibilityFilter';

describe('buildLeadVisibilityFilter', () => {
  const userId = 'user-123';

  it('should return null for ADMIN role (no filter)', () => {
    const result = buildLeadVisibilityFilter('ADMIN', userId);
    expect(result).toBeNull();
  });

  it('should return assignedMemberId filter for SETTER role', () => {
    const result = buildLeadVisibilityFilter('SETTER', userId);
    expect(result).toEqual({
      assignedMemberId: { eq: 'user-123' },
    });
  });

  it('should return OR filter for CLOSER role (own leads + handoff pret pour closing)', () => {
    const result = buildLeadVisibilityFilter('CLOSER', userId);
    expect(result).toEqual({
      or: [
        { assignedMemberId: { eq: 'user-123' } },
        { handoffStatus: { eq: 'PRET_POUR_CLOSING' } },
      ],
    });
  });

  it('should NOT reference the non-existent stage=PRET_POUR_CLOSING (Phase 2 bug fix)', () => {
    const result = buildLeadVisibilityFilter('CLOSER', userId);
    const json = JSON.stringify(result);
    expect(json).not.toContain('"stage"');
    expect(json).toContain('"handoffStatus"');
  });

  it('should default to most restrictive (setter-like) filter for unknown role', () => {
    const result = buildLeadVisibilityFilter('UNKNOWN_ROLE', userId);
    expect(result).toEqual({
      assignedMemberId: { eq: 'user-123' },
    });
  });
});
