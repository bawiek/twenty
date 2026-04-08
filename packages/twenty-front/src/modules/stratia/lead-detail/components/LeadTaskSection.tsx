import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useMyTasks } from '../../tasks/hooks/useMyTasks';
import { useTaskMutations } from '../../tasks/hooks/useTaskMutations';
import {
  isTaskCreationOpenAtom,
  taskCreationLeadIdAtom,
} from '../../tasks/states/taskFilterState';
import { TaskCard } from '../../tasks/components/TaskCard';
import { TaskCreationForm } from '../../tasks/components/TaskCreationForm';

type LeadTaskSectionProps = {
  leadId: string;
};

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledCount = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledTaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

export const LeadTaskSection = ({ leadId }: LeadTaskSectionProps) => {
  const { tasks } = useMyTasks();
  const { completeTask } = useTaskMutations();
  const setIsTaskCreationOpen = useSetAtomState(isTaskCreationOpenAtom);
  const setTaskCreationLeadId = useSetAtomState(taskCreationLeadIdAtom);

  // Filter tasks by leadId and sort by due date ascending (next due first)
  const leadTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.leadId === leadId)
        .sort(
          (taskA, taskB) =>
            new Date(taskA.dueAt).getTime() - new Date(taskB.dueAt).getTime(),
        ),
    [tasks, leadId],
  );

  const handleOpenCreation = useCallback(() => {
    setTaskCreationLeadId(leadId);
    setIsTaskCreationOpen(true);
  }, [setIsTaskCreationOpen, setTaskCreationLeadId, leadId]);

  const handleComplete = useCallback(
    (taskId: string) => {
      completeTask(taskId);
    },
    [completeTask],
  );

  return (
    <StyledSection>
      <StyledHeader>
        <StyledTitleRow>
          <StyledTitle>
            <Trans>Taches</Trans>
          </StyledTitle>
          {leadTasks.length > 0 && (
            <StyledCount>{leadTasks.length}</StyledCount>
          )}
        </StyledTitleRow>
        <Button
          Icon={IconPlus}
          title={t`+ Tache`}
          variant="tertiary"
          size="small"
          onClick={handleOpenCreation}
        />
      </StyledHeader>

      <TaskCreationForm />

      {leadTasks.length === 0 ? (
        <StyledEmptyState>
          <Trans>Aucune tache pour ce lead</Trans>
        </StyledEmptyState>
      ) : (
        <StyledTaskList>
          {leadTasks.map((task) => (
            <TaskCard key={task.id} task={task} onComplete={handleComplete} />
          ))}
        </StyledTaskList>
      )}
    </StyledSection>
  );
};
