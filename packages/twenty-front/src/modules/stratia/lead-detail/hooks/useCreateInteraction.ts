import { useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { type InteractionType, type OutcomeTag } from '@/stratia/types/InteractionTypes';
import { resetInteractionFormAtom } from '@/stratia/lead-detail/states/interactionFormState';

type CreateInteractionInput = {
  leadId: string;
  type: InteractionType;
  outcomeTag: OutcomeTag;
  body: string;
  callDurationMinutes?: number | null;
  emailSubject?: string;
};

type UseCreateInteractionResult = {
  createInteraction: (input: CreateInteractionInput) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

// Creates a Note record with StratIA custom fields (interactionType, outcomeTag, callDuration)
// and links it to the lead via Twenty's note-target relation.
export const useCreateInteraction = (): UseCreateInteractionResult => {
  const [error, setError] = useState<Error | null>(null);
  const resetForm = useSetAtom(resetInteractionFormAtom);

  const { createOneRecord: createNote, loading: isCreatingNote } =
    useCreateOneRecord({
      objectNameSingular: 'note',
    });

  const { createOneRecord: createNoteTarget, loading: isCreatingTarget } =
    useCreateOneRecord({
      objectNameSingular: 'noteTarget',
    });

  const isLoading = isCreatingNote || isCreatingTarget;

  const createInteraction = useCallback(
    async (input: CreateInteractionInput) => {
      setError(null);

      try {
        // Create the Note record with custom fields set by the Metadata API script
        const noteRecord = await createNote({
          title: input.emailSubject ?? '',
          body: input.body,
          interactionType: input.type,
          outcomeTag: input.outcomeTag,
          callDuration: input.callDurationMinutes ?? null,
        });

        // Link the note to the lead via noteTarget relation
        // Twenty uses "person" as the standard contact object
        await createNoteTarget({
          noteId: noteRecord.id,
          personId: input.leadId,
        });

        // Reset the form after successful creation
        resetForm();
      } catch (caughtError) {
        const errorInstance =
          caughtError instanceof Error
            ? caughtError
            : new Error('Failed to create interaction');
        setError(errorInstance);
        throw errorInstance;
      }
    },
    [createNote, createNoteTarget, resetForm],
  );

  return {
    createInteraction,
    isLoading,
    error,
  };
};
