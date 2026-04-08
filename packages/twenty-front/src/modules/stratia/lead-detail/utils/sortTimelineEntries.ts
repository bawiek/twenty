import { type InteractionEntry } from '@/stratia/types/InteractionTypes';

// Pure function for sorting timeline entries in reverse chronological order.
// Exported separately from the hook so it can be unit tested without pulling
// in the full GraphQL dependency chain.
export const sortTimelineEntries = (
  entries: InteractionEntry[],
): InteractionEntry[] => {
  return [...entries].sort((entryA, entryB) => {
    // Descending: most recent first (D-12)
    const dateComparison =
      new Date(entryB.createdAt).getTime() -
      new Date(entryA.createdAt).getTime();

    // Stable sort: when timestamps are equal, preserve order via id comparison
    if (dateComparison !== 0) {
      return dateComparison;
    }

    return entryA.id.localeCompare(entryB.id);
  });
};
