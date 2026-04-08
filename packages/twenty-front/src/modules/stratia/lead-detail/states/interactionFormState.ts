import { atom } from 'jotai';

import { type InteractionType, type OutcomeTag } from '@/stratia/types/InteractionTypes';

export const interactionTypeAtom = atom<InteractionType>('NOTE');
export const outcomeTagAtom = atom<OutcomeTag | null>(null);
export const noteTextAtom = atom<string>('');
export const callDurationAtom = atom<number | null>(null);
export const emailSubjectAtom = atom<string>('');
export const isInteractionLoggerOpenAtom = atom<boolean>(false);

// Derived: form is valid when outcome tag is selected (D-07) and text is non-empty
export const isInteractionFormValidAtom = atom((get) => {
  const outcome = get(outcomeTagAtom);
  const text = get(noteTextAtom);

  return outcome !== null && text.trim().length > 0;
});

// Reset all form atoms to initial state
export const resetInteractionFormAtom = atom(null, (_get, set) => {
  set(interactionTypeAtom, 'NOTE');
  set(outcomeTagAtom, null);
  set(noteTextAtom, '');
  set(callDurationAtom, null);
  set(emailSubjectAtom, '');
  set(isInteractionLoggerOpenAtom, false);
});
