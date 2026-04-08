import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

import { type InteractionType } from '@/stratia/types/InteractionTypes';
import {
  INTERACTION_TYPE_OPTIONS,
  type InteractionTypeOption,
} from '@/stratia/lead-detail/constants/interactionTypeOptions';
import { OutcomeTagSelector } from '@/stratia/lead-detail/components/OutcomeTagSelector';
import { useCreateInteraction } from '@/stratia/lead-detail/hooks/useCreateInteraction';
import {
  interactionTypeAtom,
  outcomeTagAtom,
  noteTextAtom,
  callDurationAtom,
  emailSubjectAtom,
  isInteractionLoggerOpenAtom,
  isInteractionFormValidAtom,
} from '@/stratia/lead-detail/states/interactionFormState';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type InteractionLoggerProps = {
  leadId: string;
};

const StyledOpenButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing['1']};
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing['3']};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid ${themeCssVariables.border.color.medium};
  background: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  cursor: pointer;
  transition: ${themeCssVariables.clickableElementBackgroundTransition};

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledLoggerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['4']};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  background: ${themeCssVariables.background.primary};
`;

const StyledTypeSelector = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['0']};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  overflow: hidden;
`;

const StyledTypeButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing['2']};
  border: none;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  cursor: pointer;
  transition: ${themeCssVariables.clickableElementBackgroundTransition};
  color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.tertiary};
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.primary};

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${themeCssVariables.spacing['2']};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.primary};
  resize: vertical;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${themeCssVariables.spacing['2']};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.primary};

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }

  &:focus {
    outline: none;
    border-color: ${themeCssVariables.accent.primary};
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledSaveButton = styled.button<{ isDisabled: boolean }>`
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing['4']};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: none;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? '0.5' : '1')};
  color: ${themeCssVariables.font.color.inverted};
  background: ${themeCssVariables.accent.primary};
  transition: ${themeCssVariables.clickableElementBackgroundTransition};

  &:hover {
    opacity: ${({ isDisabled }) => (isDisabled ? '0.5' : '0.9')};
  }
`;

const StyledCancelButton = styled.button`
  padding: ${themeCssVariables.spacing['1.5']} ${themeCssVariables.spacing['4']};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid ${themeCssVariables.border.color.medium};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  cursor: pointer;
  color: ${themeCssVariables.font.color.secondary};
  background: ${themeCssVariables.background.primary};
  transition: ${themeCssVariables.clickableElementBackgroundTransition};

  &:hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

// Unified inline interaction entry component (D-05, D-06, D-07, D-08, D-11).
// The "+ Note" button is always visible. Clicking it opens the inline logger (not a modal).
// Flow: click + Note -> select type -> select outcome tag -> type text -> save.
// Quick note takes 4 actions: click + Note, select tag, type, save (D-05).
export const InteractionLogger = ({ leadId }: InteractionLoggerProps) => {
  const [interactionType, setInteractionType] = useAtom(interactionTypeAtom);
  const [outcomeTag, setOutcomeTag] = useAtom(outcomeTagAtom);
  const [noteText, setNoteText] = useAtom(noteTextAtom);
  const [callDuration, setCallDuration] = useAtom(callDurationAtom);
  const [emailSubject, setEmailSubject] = useAtom(emailSubjectAtom);
  const [isOpen, setIsOpen] = useAtom(isInteractionLoggerOpenAtom);
  const isFormValid = useAtomValue(isInteractionFormValidAtom);
  const { createInteraction, isLoading } = useCreateInteraction();

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleSave = async () => {
    if (!isFormValid || !outcomeTag) {
      return;
    }

    await createInteraction({
      leadId,
      type: interactionType,
      outcomeTag,
      body: noteText,
      callDurationMinutes: callDuration,
      emailSubject: emailSubject || undefined,
    });
    // Form reset happens inside useCreateInteraction via resetInteractionFormAtom
  };

  if (!isOpen) {
    return (
      <StyledOpenButton onClick={handleOpen}>+ {t`Note`}</StyledOpenButton>
    );
  }

  return (
    <StyledLoggerContainer>
      {/* Type selector: Note | Appel | Email (D-11) */}
      <StyledTypeSelector role="group" aria-label={t`Type d'interaction`}>
        {INTERACTION_TYPE_OPTIONS.map((option: InteractionTypeOption) => (
          <StyledTypeButton
            key={option.value}
            isActive={interactionType === option.value}
            onClick={() =>
              setInteractionType(option.value as InteractionType)
            }
            type="button"
          >
            {option.label}
          </StyledTypeButton>
        ))}
      </StyledTypeSelector>

      {/* Outcome tag selector (D-06, D-07) */}
      <OutcomeTagSelector selectedTag={outcomeTag} onSelect={setOutcomeTag} />

      {/* Conditional: email subject field (only when type=EMAIL, D-09) */}
      {interactionType === 'EMAIL' && (
        <StyledInput
          type="text"
          placeholder={t`Objet de l'email`}
          value={emailSubject}
          onChange={(event) => setEmailSubject(event.target.value)}
          data-testid="email-subject-input"
        />
      )}

      {/* Main note body text area */}
      <StyledTextArea
        placeholder={t`Ajouter une note...`}
        value={noteText}
        onChange={(event) => setNoteText(event.target.value)}
        data-testid="note-text-area"
      />

      {/* Conditional: call duration field (only when type=CALL, D-09) */}
      {interactionType === 'CALL' && (
        <StyledInput
          type="number"
          placeholder={t`Duree de l'appel (minutes)`}
          value={callDuration ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            setCallDuration(value === '' ? null : Number(value));
          }}
          min={0}
          data-testid="call-duration-input"
        />
      )}

      {/* Footer with cancel and save buttons */}
      <StyledFooter>
        <StyledCancelButton onClick={handleCancel} type="button">
          {t`Annuler`}
        </StyledCancelButton>
        <StyledSaveButton
          isDisabled={!isFormValid || isLoading}
          onClick={handleSave}
          disabled={!isFormValid || isLoading}
          type="button"
          data-testid="save-interaction-button"
        >
          {isLoading ? t`Enregistrement...` : t`Enregistrer`}
        </StyledSaveButton>
      </StyledFooter>
    </StyledLoggerContainer>
  );
};
