import { useCallback, useState } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { type TaskPriority } from '../../types/TaskTypes';

type CreateTaskInput = {
  title: string;
  description: string;
  dueAt: string;
  priority: TaskPriority;
  leadId?: string;
};

type UseTaskMutationsResult = {
  createTask: (input: CreateTaskInput) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  isCreating: boolean;
  isCompleting: boolean;
};

export const useTaskMutations = (): UseTaskMutationsResult => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'task',
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      setIsCreating(true);

      try {
        await createOneRecord({
          title: input.title,
          body: input.description,
          dueAt: input.dueAt,
          priority: input.priority,
          status: 'TODO',
          assigneeId: currentWorkspaceMember?.id,
        });
      } finally {
        setIsCreating(false);
      }
    },
    [createOneRecord, currentWorkspaceMember?.id],
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      setIsCompleting(true);

      try {
        await updateOneRecord({
          objectNameSingular: 'task',
          idToUpdate: taskId,
          updateOneRecordInput: {
            status: 'DONE',
          },
        });
      } finally {
        setIsCompleting(false);
      }
    },
    [updateOneRecord],
  );

  return {
    createTask,
    completeTask,
    isCreating,
    isCompleting,
  };
};
