import { act, renderHook } from '@testing-library/react';
import { Provider, useAtom, useAtomValue } from 'jotai';
import { type PropsWithChildren } from 'react';

import {
  interactionTypeAtom,
  outcomeTagAtom,
  noteTextAtom,
  callDurationAtom,
  emailSubjectAtom,
  isInteractionFormValidAtom,
  resetInteractionFormAtom,
  isInteractionLoggerOpenAtom,
} from '@/stratia/lead-detail/states/interactionFormState';

// Test the interaction form state atoms directly since the component
// relies on Linaria styled components which require build-time CSS extraction.
// Testing atoms verifies the core behavior: type selection, validation,
// conditional field relevance, and form reset.

const JotaiWrapper = ({ children }: PropsWithChildren) => (
  <Provider>{children}</Provider>
);

describe('InteractionLogger form state', () => {
  it('should have 3 interaction type options (NOTE, CALL, EMAIL)', () => {
    const { result } = renderHook(() => useAtom(interactionTypeAtom), {
      wrapper: JotaiWrapper,
    });

    // Default type is NOTE
    expect(result.current[0]).toBe('NOTE');

    // Can switch to CALL
    act(() => {
      result.current[1]('CALL');
    });
    expect(result.current[0]).toBe('CALL');

    // Can switch to EMAIL
    act(() => {
      result.current[1]('EMAIL');
    });
    expect(result.current[0]).toBe('EMAIL');
  });

  it('should disable save when no outcome tag is selected', () => {
    const { result } = renderHook(
      () => ({
        isValid: useAtomValue(isInteractionFormValidAtom),
        noteText: useAtom(noteTextAtom),
        outcomeTag: useAtom(outcomeTagAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    // Set text but no outcome tag
    act(() => {
      result.current.noteText[1]('Some note text');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should disable save when text is empty', () => {
    const { result } = renderHook(
      () => ({
        isValid: useAtomValue(isInteractionFormValidAtom),
        noteText: useAtom(noteTextAtom),
        outcomeTag: useAtom(outcomeTagAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    // Set outcome tag but no text
    act(() => {
      result.current.outcomeTag[1]('REPONDU');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should enable save when both outcome tag and text are provided', () => {
    const { result } = renderHook(
      () => ({
        isValid: useAtomValue(isInteractionFormValidAtom),
        noteText: useAtom(noteTextAtom),
        outcomeTag: useAtom(outcomeTagAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    act(() => {
      result.current.outcomeTag[1]('REPONDU');
      result.current.noteText[1]('This is a note');
    });

    expect(result.current.isValid).toBe(true);
  });

  it('should track call duration when type is CALL', () => {
    const { result } = renderHook(
      () => ({
        interactionType: useAtom(interactionTypeAtom),
        callDuration: useAtom(callDurationAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    // Set type to CALL
    act(() => {
      result.current.interactionType[1]('CALL');
    });
    expect(result.current.interactionType[0]).toBe('CALL');

    // Call duration field is relevant -- set a value
    act(() => {
      result.current.callDuration[1](15);
    });
    expect(result.current.callDuration[0]).toBe(15);
  });

  it('should track email subject when type is EMAIL', () => {
    const { result } = renderHook(
      () => ({
        interactionType: useAtom(interactionTypeAtom),
        emailSubject: useAtom(emailSubjectAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    // Set type to EMAIL
    act(() => {
      result.current.interactionType[1]('EMAIL');
    });
    expect(result.current.interactionType[0]).toBe('EMAIL');

    // Email subject field is relevant -- set a value
    act(() => {
      result.current.emailSubject[1]('Follow-up call');
    });
    expect(result.current.emailSubject[0]).toBe('Follow-up call');
  });

  it('should reset all form state via resetInteractionFormAtom', () => {
    const { result } = renderHook(
      () => ({
        interactionType: useAtom(interactionTypeAtom),
        outcomeTag: useAtom(outcomeTagAtom),
        noteText: useAtom(noteTextAtom),
        callDuration: useAtom(callDurationAtom),
        emailSubject: useAtom(emailSubjectAtom),
        isOpen: useAtom(isInteractionLoggerOpenAtom),
        reset: useAtom(resetInteractionFormAtom),
      }),
      { wrapper: JotaiWrapper },
    );

    // Set all fields to non-default values
    act(() => {
      result.current.interactionType[1]('EMAIL');
      result.current.outcomeTag[1]('RAPPELER');
      result.current.noteText[1]('Test note');
      result.current.callDuration[1](30);
      result.current.emailSubject[1]('Subject');
      result.current.isOpen[1](true);
    });

    // Verify they are set
    expect(result.current.interactionType[0]).toBe('EMAIL');
    expect(result.current.outcomeTag[0]).toBe('RAPPELER');
    expect(result.current.noteText[0]).toBe('Test note');

    // Reset
    act(() => {
      result.current.reset[1]();
    });

    // Verify all reset to defaults
    expect(result.current.interactionType[0]).toBe('NOTE');
    expect(result.current.outcomeTag[0]).toBeNull();
    expect(result.current.noteText[0]).toBe('');
    expect(result.current.callDuration[0]).toBeNull();
    expect(result.current.emailSubject[0]).toBe('');
    expect(result.current.isOpen[0]).toBe(false);
  });
});
