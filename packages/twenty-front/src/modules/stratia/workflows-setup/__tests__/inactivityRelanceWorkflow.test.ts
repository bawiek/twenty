// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/inactivityRelanceWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-01 — Daily at 8am UTC, look for leads with no activity in the last N
// days (N per-user override from WorkspaceMember preferences, default 3) and
// notify the assigned setter to relance.
import { inactivityRelanceWorkflow } from '../definitions/inactivityRelanceWorkflow';

describe('inactivityRelanceWorkflow', () => {
  it('should use a CRON trigger with pattern "0 8 * * *" (daily 8am UTC)', () => {
    expect(inactivityRelanceWorkflow.trigger.type).toBe('CRON');
    expect(inactivityRelanceWorkflow.trigger.settings.pattern).toBe(
      '0 8 * * *',
    );
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(inactivityRelanceWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should create a StratiaNotification of type INACTIVE_LEAD', () => {
    const createStep = inactivityRelanceWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('INACTIVE_LEAD');
  });
});
