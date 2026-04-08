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

  it('should return OR filter for CLOSER role (own leads + pret pour closing)', () => {
    const result = buildLeadVisibilityFilter('CLOSER', userId);
    expect(result).toEqual({
      or: [
        { assignedMemberId: { eq: 'user-123' } },
        { stage: { eq: 'PRET_POUR_CLOSING' } },
      ],
    });
  });

  it('should default to most restrictive (setter-like) filter for unknown role', () => {
    const result = buildLeadVisibilityFilter('UNKNOWN_ROLE', userId);
    expect(result).toEqual({
      assignedMemberId: { eq: 'user-123' },
    });
  });
});
