// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/tasksDueTodayNotifWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// TASK-05 (bell unread count) — Daily at 8am UTC, notify each assignee about
// tasks due today. Creates StratiaNotification rows of type TASK_DUE_TODAY
// which the bell query surfaces to the user.
import { tasksDueTodayNotifWorkflow } from '../definitions/tasksDueTodayNotifWorkflow';

describe('tasksDueTodayNotifWorkflow', () => {
  it('should use a CRON trigger with pattern "0 8 * * *" (daily 8am)', () => {
    expect(tasksDueTodayNotifWorkflow.trigger.type).toBe('CRON');
    expect(tasksDueTodayNotifWorkflow.trigger.settings.pattern).toBe(
      '0 8 * * *',
    );
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(tasksDueTodayNotifWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should create a StratiaNotification of type TASK_DUE_TODAY', () => {
    const createStep = tasksDueTodayNotifWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('TASK_DUE_TODAY');
  });
});
