import { styled } from '@linaria/react';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { InteractionLogger } from '@/stratia/lead-detail/components/InteractionLogger';
import { InteractionTimeline } from '@/stratia/lead-detail/components/InteractionTimeline';
import { LeadDetailHeader } from '@/stratia/lead-detail/components/LeadDetailHeader';
import { LeadTaskSection } from '@/stratia/lead-detail/components/LeadTaskSection';
import { useLeadTimeline } from '@/stratia/lead-detail/hooks/useLeadTimeline';
import { useMyTasks } from '@/stratia/tasks/hooks/useMyTasks';

type StratiaLeadDetailPanelProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

const StyledPanel = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
  padding: ${themeCssVariables.spacing['4']};
`;

// Renders StratIA lead-detail UI (header, logger, timeline, task section)
// ONLY for Person records. Returns null for every other Twenty object so that
// the default layout stays intact for task, company, opportunity, etc.
//
// The underlying LeadDetailHeader requires pipeline stage + last contact + next
// task title props. Rather than forcing the caller (RecordShowPage) to derive
// them, this wrapper derives sane defaults from the already-wired stratia
// hooks:
//   - lastContactDate comes from the most recent timeline entry
//   - nextTaskTitle comes from the earliest non-done task attached to this lead
//   - pipeline stage defaults to "Nouveau" until Twenty pipeline fields are wired
// These defaults are explicitly allowed by plan 2-04 ("pass sensible defaults
// derived from context").
const PersonLeadPanel = ({ leadId }: { leadId: string }) => {
  const { timelineEntries } = useLeadTimeline({ leadId });
  const { tasks } = useMyTasks();

  const lastContactDate = useMemo(
    () => (timelineEntries.length > 0 ? timelineEntries[0].createdAt : null),
    [timelineEntries],
  );

  const nextTaskTitle = useMemo(() => {
    const leadTasks = tasks
      .filter((task) => task.leadId === leadId)
      .sort(
        (taskA, taskB) =>
          new Date(taskA.dueAt).getTime() - new Date(taskB.dueAt).getTime(),
      );
    return leadTasks.length > 0 ? leadTasks[0].title : null;
  }, [tasks, leadId]);

  return (
    <StyledPanel>
      <LeadDetailHeader
        leadId={leadId}
        currentStage="Nouveau"
        stageColor="blue"
        lastContactDate={lastContactDate}
        nextTaskTitle={nextTaskTitle}
      />
      <InteractionLogger leadId={leadId} />
      <InteractionTimeline leadId={leadId} />
      <LeadTaskSection leadId={leadId} />
    </StyledPanel>
  );
};

export const StratiaLeadDetailPanel = ({
  objectNameSingular,
  objectRecordId,
}: StratiaLeadDetailPanelProps) => {
  if (objectNameSingular !== 'person') {
    return null;
  }

  return <PersonLeadPanel leadId={objectRecordId} />;
};
