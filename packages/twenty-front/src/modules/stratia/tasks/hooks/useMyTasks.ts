import { useMemo } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { type StratiaTask, type GroupedTasks } from '../../types/TaskTypes';
import { groupTasksByDueDate } from '../utils/groupTasksByDueDate';

type UseMyTasksResult = {
  tasks: StratiaTask[];
  groupedTasks: GroupedTasks;
  overdueCount: number;
  isLoading: boolean;
  error: Error | null;
};

// Maps raw Twenty Task record to StratiaTask
const mapRecordToTask = (record: Record<string, unknown>): StratiaTask => ({
  id: record.id as string,
  title: (record.title as string) ?? '',
  description: (record.body as string) ?? '',
  dueAt: (record.dueAt as string) ?? new Date().toISOString(),
  priority: (record.priority as StratiaTask['priority']) ?? 'NORMAL',
  status: (record.status as StratiaTask['status']) ?? 'TODO',
  leadId: (record.taskTargets as string) ?? null,
  assigneeId: (record.assigneeId as string) ?? '',
  createdAt: (record.createdAt as string) ?? new Date().toISOString(),
});

export const useMyTasks = (): UseMyTasksResult => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentUserId = currentWorkspaceMember?.id ?? '';

  const {
    records,
    loading: isLoading,
    error,
  } = useFindManyRecords({
    objectNameSingular: 'task',
    filter: {
      assigneeId: { eq: currentUserId },
      status: { neq: 'DONE' },
    },
    orderBy: [{ dueAt: 'AscNullsLast' }],
    skip: !currentUserId,
  });

  const tasks = useMemo(
    () => (records ?? []).map(mapRecordToTask),
    [records],
  );

  const groupedTasks = useMemo(() => groupTasksByDueDate(tasks), [tasks]);

  const overdueCount = groupedTasks.overdue.length;

  return {
    tasks,
    groupedTasks,
    overdueCount,
    isLoading,
    error: error ?? null,
  };
};
