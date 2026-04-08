import { type InteractionEntry } from '@/stratia/types/InteractionTypes';
import { sortTimelineEntries } from '@/stratia/lead-detail/utils/sortTimelineEntries';

const makeEntry = (
  overrides: Partial<InteractionEntry> = {},
): InteractionEntry => ({
  id: 'default-id',
  type: 'NOTE',
  outcomeTag: 'REPONDU',
  body: 'Test note',
  createdAt: '2026-04-08T10:00:00Z',
  createdById: 'user-1',
  leadId: 'lead-1',
  ...overrides,
});

describe('sortTimelineEntries', () => {
  it('should sort entries by createdAt descending (most recent first)', () => {
    const entries = [
      makeEntry({ id: 'old', createdAt: '2026-04-06T10:00:00Z' }),
      makeEntry({ id: 'newest', createdAt: '2026-04-08T10:00:00Z' }),
      makeEntry({ id: 'middle', createdAt: '2026-04-07T10:00:00Z' }),
    ];

    const sorted = sortTimelineEntries(entries);

    expect(sorted.map((entry) => entry.id)).toEqual([
      'newest',
      'middle',
      'old',
    ]);
  });

  it('should maintain stable order when timestamps are equal', () => {
    const sameTimestamp = '2026-04-08T10:00:00Z';
    const entries = [
      makeEntry({ id: 'bravo', createdAt: sameTimestamp }),
      makeEntry({ id: 'alpha', createdAt: sameTimestamp }),
      makeEntry({ id: 'charlie', createdAt: sameTimestamp }),
    ];

    const sorted = sortTimelineEntries(entries);

    // When timestamps are equal, sort by id (localeCompare) for stability
    expect(sorted.map((entry) => entry.id)).toEqual([
      'alpha',
      'bravo',
      'charlie',
    ]);
  });

  it('should return an empty array when given an empty array', () => {
    const sorted = sortTimelineEntries([]);

    expect(sorted).toEqual([]);
  });

  it('should return a single entry unchanged', () => {
    const entries = [makeEntry({ id: 'solo' })];

    const sorted = sortTimelineEntries(entries);

    expect(sorted).toHaveLength(1);
    expect(sorted[0].id).toBe('solo');
  });

  it('should not mutate the original array', () => {
    const entries = [
      makeEntry({ id: 'second', createdAt: '2026-04-07T10:00:00Z' }),
      makeEntry({ id: 'first', createdAt: '2026-04-08T10:00:00Z' }),
    ];

    const originalOrder = entries.map((entry) => entry.id);
    sortTimelineEntries(entries);

    expect(entries.map((entry) => entry.id)).toEqual(originalOrder);
  });
});
