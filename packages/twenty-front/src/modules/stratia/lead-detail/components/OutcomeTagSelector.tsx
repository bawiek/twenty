import { styled } from '@linaria/react';

import { type OutcomeTag } from '@/stratia/types/InteractionTypes';
import {
  OUTCOME_OPTIONS,
  type OutcomeOption,
} from '@/stratia/lead-detail/constants/outcomeOptions';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type OutcomeTagSelectorProps = {
  selectedTag: OutcomeTag | null;
  onSelect: (tag: OutcomeTag) => void;
};

const StyledChipRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['1']};
  flex-wrap: nowrap;
`;

const StyledChip = styled.button<{ chipColor: string; isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing['2']};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  cursor: pointer;
  transition: ${themeCssVariables.clickableElementBackgroundTransition};
  border: 1px solid
    ${({ chipColor }) =>
      `var(--t-tag-text-${chipColor}, ${themeCssVariables.border.color.medium})`};
  color: ${({ chipColor }) =>
    `var(--t-tag-text-${chipColor}, ${themeCssVariables.font.color.primary})`};
  background: ${({ chipColor, isSelected }) =>
    isSelected
      ? `var(--t-tag-background-${chipColor}, ${themeCssVariables.background.tertiary})`
      : 'transparent'};

  &:hover {
    background: ${({ chipColor }) =>
      `var(--t-tag-background-${chipColor}, ${themeCssVariables.background.tertiary})`};
  }
`;

// Horizontal chip/button row for selecting an outcome tag (D-06, D-07).
// Outcome tag is mandatory -- save button is disabled until one is selected.
export const OutcomeTagSelector = ({
  selectedTag,
  onSelect,
}: OutcomeTagSelectorProps) => {
  return (
    <StyledChipRow>
      {OUTCOME_OPTIONS.map((option: OutcomeOption) => (
        <StyledChip
          key={option.value}
          chipColor={option.color}
          isSelected={selectedTag === option.value}
          onClick={() => onSelect(option.value)}
          type="button"
        >
          {option.label}
        </StyledChip>
      ))}
    </StyledChipRow>
  );
};
