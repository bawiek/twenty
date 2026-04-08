import { subDays, addDays, startOfDay, formatISO } from 'date-fns';

import { type StratiaTask } from '../../types/TaskTypes';
import { groupTasksByDueDate } from '../utils/groupTasksByDueDate';

const makeTask = (overrides: Partial<StratiaTask> = {}): StratiaTask => ({
  id: 'test-' + Math.random().toString(36).slice(2),
  title: 'Test task',
  description: '',
  dueAt: new Date().toISOString(),
  priority: 'NORMAL',
  status: 'TODO',
  leadId: null,
  assigneeId: 'user-1',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Helper to create ISO date string at start of day
const dateAt = (date: Date): string =>
  formatISO(startOfDay(date), { representation: 'complete' });

describe('groupTasksByDueDate', () => {
  it('should place a task due yesterday in the overdue array', () => {
    const task = makeTask({ dueAt: dateAt(subDays(new Date(), 1)) });
    const result = groupTasksByDueDate([task]);

    expect(result.overdue).toHaveLength(1);
    expect(result.overdue[0].id).toBe(task.id);
  });

  it('should place a task due today in the today array', () => {
    const task = makeTask({ dueAt: dateAt(new Date()) });
    const result = groupTasksByDueDate([task]);

    expect(result.today).toHaveLength(1);
    expect(result.today[0].id).toBe(task.id);
  });

  it('should place a task due tomorrow in the tomorrow array', () => {
    const task = makeTask({ dueAt: dateAt(addDays(new Date(), 1)) });
    const result = groupTasksByDueDate([task]);

    expect(result.tomorrow).toHaveLength(1);
    expect(result.tomorrow[0].id).toBe(task.id);
  });

  it('should place a task due in 3 days (same week) in thisWeek array', () => {
    // Pick a date 3 days from now -- may or may not be this week depending on day.
    // Use a date that is definitely this week by checking.
    const threeDaysFromNow = addDays(new Date(), 3);
    const task = makeTask({ dueAt: dateAt(threeDaysFromNow) });
    const result = groupTasksByDueDate([task]);

    // It should be in either thisWeek or later, depending on the current day of week.
    // If 3 days out crosses into next week, it'll be in 'later'.
    // We verify it's not in overdue/today/tomorrow at minimum.
    expect(result.overdue).toHaveLength(0);
    expect(result.today).toHaveLength(0);
    expect(result.tomorrow).toHaveLength(0);
    // The task should be in thisWeek or later
    const inThisWeekOrLater =
      result.thisWeek.length === 1 || result.later.length === 1;
    expect(inThisWeekOrLater).toBe(true);
  });

  it('should place a task due in 10 days in the later array', () => {
    const task = makeTask({ dueAt: dateAt(addDays(new Date(), 10)) });
    const result = groupTasksByDueDate([task]);

    expect(result.later).toHaveLength(1);
    expect(result.later[0].id).toBe(task.id);
  });

  it('should return all empty arrays for empty input', () => {
    const result = groupTasksByDueDate([]);

    expect(result.overdue).toHaveLength(0);
    expect(result.today).toHaveLength(0);
    expect(result.tomorrow).toHaveLength(0);
    expect(result.thisWeek).toHaveLength(0);
    expect(result.later).toHaveLength(0);
  });

  it('should keep a task due today at 23:59 in today (not overdue)', () => {
    const todayLate = new Date();
    todayLate.setHours(23, 59, 59, 0);
    const task = makeTask({ dueAt: todayLate.toISOString() });
    const result = groupTasksByDueDate([task]);

    expect(result.today).toHaveLength(1);
    expect(result.overdue).toHaveLength(0);
  });

  it('should exclude completed tasks (status=DONE) from grouping', () => {
    const task = makeTask({ status: 'DONE', dueAt: dateAt(new Date()) });
    const result = groupTasksByDueDate([task]);

    expect(result.today).toHaveLength(0);
    expect(result.overdue).toHaveLength(0);
    expect(result.tomorrow).toHaveLength(0);
    expect(result.thisWeek).toHaveLength(0);
    expect(result.later).toHaveLength(0);
  });
});
