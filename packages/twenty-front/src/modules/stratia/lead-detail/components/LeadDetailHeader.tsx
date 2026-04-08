import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type LeadDetailHeaderProps = {
  leadId: string;
  currentStage: string;
  stageColor: string;
  lastContactDate: string | null;
  nextTaskTitle: string | null;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: ${themeCssVariables.spacing['4']};
  padding: ${themeCssVariables.spacing['3']} ${themeCssVariables.spacing['4']};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  background: ${themeCssVariables.background.primary};
`;

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  flex: 1;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledStageChip = styled.span<{ chipColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing['2']};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ chipColor }) =>
    `var(--t-tag-text-${chipColor}, ${themeCssVariables.font.color.primary})`};
  background: ${({ chipColor }) =>
    `var(--t-tag-background-${chipColor}, ${themeCssVariables.background.tertiary})`};
  width: fit-content;
`;

// Header showing pipeline stage, last contact date, and next action at a glance (D-01).
// Placed at the top of the lead detail main area, above the timeline.
export const LeadDetailHeader = ({
  currentStage,
  stageColor,
  lastContactDate,
  nextTaskTitle,
}: LeadDetailHeaderProps) => {
  const formattedLastContact = lastContactDate
    ? formatDistanceToNow(new Date(lastContactDate), {
        addSuffix: true,
        locale: fr,
      })
    : t`Aucun contact`;

  const displayNextAction = nextTaskTitle ?? t`Aucune action prevue`;

  return (
    <StyledContainer>
      <StyledSection>
        <StyledLabel>{t`Etape pipeline`}</StyledLabel>
        <StyledStageChip chipColor={stageColor}>{currentStage}</StyledStageChip>
      </StyledSection>

      <StyledSection>
        <StyledLabel>{t`Dernier contact`}</StyledLabel>
        <StyledValue>{formattedLastContact}</StyledValue>
      </StyledSection>

      <StyledSection>
        <StyledLabel>{t`Prochaine action`}</StyledLabel>
        <StyledValue>{displayNextAction}</StyledValue>
      </StyledSection>
    </StyledContainer>
  );
};
