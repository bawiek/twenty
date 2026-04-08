import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type StratiaTask } from '../../types/TaskTypes';
import { TaskCard } from './TaskCard';

type TaskGroupSectionProps = {
  title: string;
  tasks: StratiaTask[];
  onComplete: (taskId: string) => void;
  variant?: 'danger' | 'default';
};

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div<{ isDanger: boolean }>`
  align-items: center;
  border-left: ${({ isDanger }) =>
    isDanger
      ? `3px solid ${themeCssVariables.font.color.danger}`
      : '3px solid transparent'};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.span<{ isDanger: boolean }>`
  color: ${({ isDanger }) =>
    isDanger
      ? themeCssVariables.font.color.danger
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
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

export const TaskGroupSection = ({
  title,
  tasks,
  onComplete,
  variant = 'default',
}: TaskGroupSectionProps) => {
  if (tasks.length === 0) {
    return null;
  }

  const isDanger = variant === 'danger';

  return (
    <StyledSection>
      <StyledHeader isDanger={isDanger}>
        <StyledTitle isDanger={isDanger}>{title}</StyledTitle>
        <StyledCount>{tasks.length}</StyledCount>
      </StyledHeader>

      <StyledTaskList>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onComplete={onComplete} />
        ))}
      </StyledTaskList>
    </StyledSection>
  );
};
