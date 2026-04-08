import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useMyTasks } from '../hooks/useMyTasks';
import { useTaskMutations } from '../hooks/useTaskMutations';
import {
  isTaskCreationOpenAtom,
  taskCreationLeadIdAtom,
} from '../states/taskFilterState';
import { TaskCreationForm } from './TaskCreationForm';
import { TaskGroupSection } from './TaskGroupSection';

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  height: 100%;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  justify-content: center;
  padding: ${themeCssVariables.spacing[10]};
  text-align: center;
`;

export const MyTasksPage = () => {
  const { groupedTasks, isLoading } = useMyTasks();
  const { completeTask } = useTaskMutations();
  const setIsTaskCreationOpen = useSetAtomState(isTaskCreationOpenAtom);
  const setTaskCreationLeadId = useSetAtomState(taskCreationLeadIdAtom);

  const handleOpenCreation = useCallback(() => {
    setTaskCreationLeadId(null);
    setIsTaskCreationOpen(true);
  }, [setIsTaskCreationOpen, setTaskCreationLeadId]);

  const handleComplete = useCallback(
    (taskId: string) => {
      completeTask(taskId);
    },
    [completeTask],
  );

  const hasNoTasks =
    groupedTasks.overdue.length === 0 &&
    groupedTasks.today.length === 0 &&
    groupedTasks.tomorrow.length === 0 &&
    groupedTasks.thisWeek.length === 0 &&
    groupedTasks.later.length === 0;

  if (isLoading) {
    return null;
  }

  return (
    <StyledPage>
      <StyledHeader>
        <StyledTitle>
          <Trans>Mes taches</Trans>
        </StyledTitle>
        <Button
          Icon={IconPlus}
          title={t`+ Tache`}
          variant="secondary"
          size="small"
          onClick={handleOpenCreation}
        />
      </StyledHeader>

      <TaskCreationForm />

      {hasNoTasks ? (
        <StyledEmptyState>
          <Trans>
            Aucune tache en cours. Creez une tache depuis une fiche lead ou avec
            le bouton ci-dessus.
          </Trans>
        </StyledEmptyState>
      ) : (
        <StyledSections>
          <TaskGroupSection
            title={t`En retard`}
            tasks={groupedTasks.overdue}
            onComplete={handleComplete}
            variant="danger"
          />
          <TaskGroupSection
            title={t`Aujourd'hui`}
            tasks={groupedTasks.today}
            onComplete={handleComplete}
          />
          <TaskGroupSection
            title={t`Demain`}
            tasks={groupedTasks.tomorrow}
            onComplete={handleComplete}
          />
          <TaskGroupSection
            title={t`Cette semaine`}
            tasks={groupedTasks.thisWeek}
            onComplete={handleComplete}
          />
          <TaskGroupSection
            title={t`Plus tard`}
            tasks={groupedTasks.later}
            onComplete={handleComplete}
          />
        </StyledSections>
      )}
    </StyledPage>
  );
};
