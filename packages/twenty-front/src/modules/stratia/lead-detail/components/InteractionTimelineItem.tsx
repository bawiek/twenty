import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import { type InteractionEntry } from '@/stratia/types/InteractionTypes';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  IconMail,
  IconNotes,
  IconPhone,
  IconSwitchHorizontal,
} from 'twenty-ui/display';

type InteractionTimelineItemProps = {
  entry: InteractionEntry;
};

// Icon and color mapping per interaction type (D-10)
const INTERACTION_ICON_MAP: Record<
  string,
  {
    Icon: typeof IconNotes;
    backgroundColor: string;
    iconColor: string;
  }
> = {
  NOTE: {
    Icon: IconNotes,
    backgroundColor: themeCssVariables.tag.background.gray,
    iconColor: themeCssVariables.tag.text.gray,
  },
  CALL: {
    Icon: IconPhone,
    backgroundColor: themeCssVariables.tag.background.blue,
    iconColor: themeCssVariables.tag.text.blue,
  },
  EMAIL: {
    Icon: IconMail,
    backgroundColor: themeCssVariables.tag.background.green,
    iconColor: themeCssVariables.tag.text.green,
  },
  STATUS_CHANGE: {
    Icon: IconSwitchHorizontal,
    backgroundColor: themeCssVariables.tag.background.orange,
    iconColor: themeCssVariables.tag.text.orange,
  },
};

// Outcome tag color mapping for displaying the tag chip
const OUTCOME_COLOR_MAP: Record<string, string> = {
  REPONDU: 'green',
  PAS_DE_REPONSE: 'red',
  MESSAGERIE: 'yellow',
  RAPPELER: 'blue',
};

const StyledItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['3']} 0;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledIconCircle = styled.div<{
  circleBackgroundColor: string;
  circleIconColor: string;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: ${themeCssVariables.border.radius.rounded};
  background: ${({ circleBackgroundColor }) => circleBackgroundColor};
  color: ${({ circleIconColor }) => circleIconColor};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  flex: 1;
  min-width: 0;
`;

const StyledContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${themeCssVariables.spacing['2']};
`;

const StyledTimestamp = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  white-space: nowrap;
`;

const StyledOutcomeChip = styled.span<{ chipColor: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing['1.5']};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ chipColor }) =>
    `var(--t-tag-text-${chipColor}, ${themeCssVariables.font.color.secondary})`};
  background: ${({ chipColor }) =>
    `var(--t-tag-background-${chipColor}, ${themeCssVariables.background.tertiary})`};
`;

const StyledSubject = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBody = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  line-height: ${themeCssVariables.text.lineHeight.md};
  word-break: break-word;
`;

const StyledMetadata = styled.div`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

// Individual timeline event card with icon, color, timestamp, and body (D-09, D-10, D-12).
export const InteractionTimelineItem = ({
  entry,
}: InteractionTimelineItemProps) => {
  const iconConfig = INTERACTION_ICON_MAP[entry.type] ?? INTERACTION_ICON_MAP.NOTE;
  const { Icon, backgroundColor, iconColor } = iconConfig;
  const outcomeColor = OUTCOME_COLOR_MAP[entry.outcomeTag] ?? 'gray';

  const relativeDate = formatDistanceToNow(new Date(entry.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  const callEntry = entry as Record<string, unknown>;
  const callDurationMinutes = callEntry.callDurationMinutes as
    | number
    | undefined;
  const emailSubject = callEntry.emailSubject as string | undefined;

  return (
    <StyledItemContainer>
      <StyledIconCircle
        circleBackgroundColor={backgroundColor}
        circleIconColor={iconColor}
      >
        <Icon size={16} />
      </StyledIconCircle>

      <StyledContent>
        <StyledContentHeader>
          <StyledTimestamp>{relativeDate}</StyledTimestamp>
          <StyledOutcomeChip chipColor={outcomeColor}>
            {entry.outcomeTag.replace(/_/g, ' ')}
          </StyledOutcomeChip>
        </StyledContentHeader>

        {/* Email subject shown as bold text above body (D-09) */}
        {entry.type === 'EMAIL' && emailSubject && (
          <StyledSubject>{emailSubject}</StyledSubject>
        )}

        {entry.body && <StyledBody>{entry.body}</StyledBody>}

        {/* Call duration shown below body (D-09) */}
        {entry.type === 'CALL' &&
          callDurationMinutes !== undefined &&
          callDurationMinutes !== null && (
            <StyledMetadata>
              {t`Duree`}: {callDurationMinutes} min
            </StyledMetadata>
          )}
      </StyledContent>
    </StyledItemContainer>
  );
};
