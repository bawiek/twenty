import {
  isToday,
  isTomorrow,
  isPast,
  isThisWeek,
  startOfDay,
  parseISO,
} from 'date-fns';

import { type StratiaTask, type GroupedTasks } from '../../types/TaskTypes';

export const groupTasksByDueDate = (tasks: StratiaTask[]): GroupedTasks => {
  const activeTasks = tasks.filter((task) => task.status !== 'DONE');
  const todayStart = startOfDay(new Date());

  return activeTasks.reduce<GroupedTasks>(
    (groups, task) => {
      const dueDate = startOfDay(parseISO(task.dueAt));

      if (isPast(dueDate) && dueDate < todayStart) {
        groups.overdue.push(task);
      } else if (isToday(dueDate)) {
        groups.today.push(task);
      } else if (isTomorrow(dueDate)) {
        groups.tomorrow.push(task);
      } else if (isThisWeek(dueDate, { weekStartsOn: 1 })) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }

      return groups;
    },
    { overdue: [], today: [], tomorrow: [], thisWeek: [], later: [] },
  );
};
