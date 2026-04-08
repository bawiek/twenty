import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { useLeadTimeline } from '@/stratia/lead-detail/hooks/useLeadTimeline';
import { InteractionTimelineItem } from '@/stratia/lead-detail/components/InteractionTimelineItem';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type InteractionTimelineProps = {
  leadId: string;
};

const StyledTimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing['2']} 0;
`;

const StyledEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${themeCssVariables.spacing['8']} ${themeCssVariables.spacing['4']};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledLoadingSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['3']};
  padding: ${themeCssVariables.spacing['4']};
`;

const StyledSkeletonItem = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['3']};
  align-items: flex-start;
`;

const StyledSkeletonCircle = styled.div`
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: ${themeCssVariables.border.radius.rounded};
  background: ${themeCssVariables.background.tertiary};
`;

const StyledSkeletonLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['1']};
  flex: 1;
`;

const StyledSkeletonLine = styled.div<{ widthPercent: number }>`
  height: 12px;
  width: ${({ widthPercent }) => widthPercent}%;
  border-radius: ${themeCssVariables.border.radius.xs};
  background: ${themeCssVariables.background.tertiary};
`;

// Loading skeleton to display while timeline data is being fetched
const TimelineSkeleton = () => (
  <StyledLoadingSkeleton>
    {[1, 2, 3].map((index) => (
      <StyledSkeletonItem key={index}>
        <StyledSkeletonCircle />
        <StyledSkeletonLines>
          <StyledSkeletonLine widthPercent={60} />
          <StyledSkeletonLine widthPercent={90} />
          <StyledSkeletonLine widthPercent={40} />
        </StyledSkeletonLines>
      </StyledSkeletonItem>
    ))}
  </StyledLoadingSkeleton>
);

// Timeline container that fetches and renders interaction entries (D-12).
// Displays entries in reverse chronological order (most recent on top).
// Shows loading skeleton while fetching and empty state when no entries exist.
export const InteractionTimeline = ({ leadId }: InteractionTimelineProps) => {
  const { timelineEntries, isLoading } = useLeadTimeline({ leadId });

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (timelineEntries.length === 0) {
    return <StyledEmptyState>{t`Aucune interaction`}</StyledEmptyState>;
  }

  return (
    <StyledTimelineContainer>
      {timelineEntries.map((entry) => (
        <InteractionTimelineItem key={entry.id} entry={entry} />
      ))}
    </StyledTimelineContainer>
  );
};
