import { useMemo } from 'react';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type InteractionEntry } from '@/stratia/types/InteractionTypes';
import { sortTimelineEntries } from '@/stratia/lead-detail/utils/sortTimelineEntries';

type UseLeadTimelineParams = {
  leadId: string;
};

type UseLeadTimelineResult = {
  timelineEntries: InteractionEntry[];
  isLoading: boolean;
  error: Error | undefined;
};

// Fetches Notes linked to a specific lead via noteTargets, sorted by createdAt DESC.
// Custom fields (interactionType, outcomeTag, callDuration) are included in the query
// via the Metadata API fields added by scripts/stratia-metadata-setup.ts.
export const useLeadTimeline = ({
  leadId,
}: UseLeadTimelineParams): UseLeadTimelineResult => {
  // Query notes that target this specific lead (person)
  const {
    records: noteTargets,
    loading,
    error,
  } = useFindManyRecords({
    objectNameSingular: 'noteTarget',
    filter: {
      personId: { eq: leadId },
    },
    orderBy: [{ createdAt: 'DescNullsLast' }],
    recordGqlFields: {
      id: true,
      createdAt: true,
      note: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        createdBy: {
          source: true,
          workspaceMemberId: true,
        },
        interactionType: true,
        outcomeTag: true,
        callDuration: true,
      },
    },
  });

  // Transform noteTarget records into InteractionEntry objects
  const timelineEntries = useMemo(() => {
    const entries: InteractionEntry[] = noteTargets
      .filter(
        (target: Record<string, unknown>) =>
          target.note !== null && target.note !== undefined,
      )
      .map((target: Record<string, unknown>) => {
        const note = target.note as Record<string, unknown>;
        const createdBy = note.createdBy as Record<string, unknown> | null;

        return {
          id: note.id as string,
          type: (note.interactionType as string) || 'NOTE',
          outcomeTag: (note.outcomeTag as string) || 'REPONDU',
          body: (note.body as string) || '',
          createdAt: note.createdAt as string,
          createdById:
            (createdBy?.workspaceMemberId as string) || '',
          leadId,
          // Include optional fields for call/email entries
          ...(note.callDuration !== null &&
            note.callDuration !== undefined && {
              callDurationMinutes: note.callDuration as number,
            }),
          ...(note.title &&
            (note.interactionType as string) === 'EMAIL' && {
              emailSubject: note.title as string,
            }),
        } as InteractionEntry;
      });

    return sortTimelineEntries(entries);
  }, [noteTargets, leadId]);

  return {
    timelineEntries,
    isLoading: loading,
    error,
  };
};
