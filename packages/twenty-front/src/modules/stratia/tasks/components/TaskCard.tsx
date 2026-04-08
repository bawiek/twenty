import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isPast, parseISO, startOfDay, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IconCheck, IconCircle } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type StratiaTask } from '../../types/TaskTypes';

type TaskCardProps = {
  task: StratiaTask;
  onComplete: (taskId: string) => void;
};

const PRIORITY_COLORS: Record<StratiaTask['priority'], string> = {
  URGENT: themeCssVariables.color.red,
  IMPORTANT: themeCssVariables.color.orange,
  NORMAL: themeCssVariables.font.color.tertiary,
};

const PRIORITY_LABELS: Record<StratiaTask['priority'], string> = {
  URGENT: 'Urgent',
  IMPORTANT: 'Important',
  NORMAL: 'Normal',
};

const StyledCard = styled.div<{ isOverdue: boolean }>`
  align-items: center;
  background: ${({ isOverdue }) =>
    isOverdue
      ? themeCssVariables.background.danger
      : themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: ${({ isOverdue }) =>
    isOverdue
      ? `3px solid ${themeCssVariables.font.color.danger}`
      : `1px solid ${themeCssVariables.border.color.medium}`};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledCheckButton = styled.button`
  align-items: center;
  background: transparent;
  border: 1.5px solid ${themeCssVariables.border.color.medium};
  border-radius: 50%;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  padding: 0;
  width: 20px;

  &:hover {
    border-color: ${themeCssVariables.font.color.primary};
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDueDate = styled.span<{ isOverdue: boolean }>`
  color: ${({ isOverdue }) =>
    isOverdue
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledPriorityChip = styled.span<{ priorityColor: string }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${({ priorityColor }) => priorityColor};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 20px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledMetaRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLeadChip = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const TaskCard = ({ task, onComplete }: TaskCardProps) => {
  const dueDate = parseISO(task.dueAt);
  const isOverdue =
    isPast(startOfDay(dueDate)) &&
    startOfDay(dueDate) < startOfDay(new Date()) &&
    task.status !== 'DONE';

  const dueDateText = formatDistanceToNow(dueDate, {
    addSuffix: true,
    locale: fr,
  });

  const isDone = task.status === 'DONE';

  const handleComplete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onComplete(task.id);
  };

  return (
    <StyledCard isOverdue={isOverdue}>
      <StyledCheckButton
        onClick={handleComplete}
        aria-label={isDone ? t`Tache terminee` : t`Marquer comme terminee`}
      >
        {isDone ? <IconCheck size={14} /> : <IconCircle size={14} />}
      </StyledCheckButton>

      <StyledContent>
        <StyledTitle>{task.title}</StyledTitle>

        {task.description && (
          <StyledDescription>{task.description}</StyledDescription>
        )}

        <StyledMetaRow>
          <StyledDueDate isOverdue={isOverdue}>{dueDateText}</StyledDueDate>
          {task.leadId && (
            <StyledLeadChip>{task.leadId}</StyledLeadChip>
          )}
        </StyledMetaRow>
      </StyledContent>

      <StyledPriorityChip priorityColor={PRIORITY_COLORS[task.priority]}>
        {PRIORITY_LABELS[task.priority]}
      </StyledPriorityChip>
    </StyledCard>
  );
};
