export type TaskPriority = 'URGENT' | 'IMPORTANT' | 'NORMAL';

export type StratiaTask = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  priority: TaskPriority;
  status: 'TODO' | 'DONE';
  leadId: string | null;
  assigneeId: string;
  createdAt: string;
};

export type GroupedTasks = {
  overdue: StratiaTask[];
  today: StratiaTask[];
  tomorrow: StratiaTask[];
  thisWeek: StratiaTask[];
  later: StratiaTask[];
};
