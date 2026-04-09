// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/stuckLeadAlertWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-07 — Daily at 8am UTC, surface leads that have been stuck in the
// same stage for longer than the per-stage threshold (admin default or user
// override from WorkspaceMember preferences). Depends on stageEnteredAt
// being maintained by stageEnteredAtUpdateWorkflow.
import { stuckLeadAlertWorkflow } from '../definitions/stuckLeadAlertWorkflow';

describe('stuckLeadAlertWorkflow', () => {
  it('should use a CRON trigger with pattern "0 8 * * *" (daily 8am)', () => {
    expect(stuckLeadAlertWorkflow.trigger.type).toBe('CRON');
    expect(stuckLeadAlertWorkflow.trigger.settings.pattern).toBe('0 8 * * *');
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(stuckLeadAlertWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should reference stageEnteredAt in its filter or query step', () => {
    // The stuck detection relies on comparing stageEnteredAt to a per-stage
    // threshold. Its FILTER or CODE step must reference the field by name.
    const stepsAsJson = JSON.stringify(stuckLeadAlertWorkflow.steps);
    expect(stepsAsJson).toContain('stageEnteredAt');
  });

  it('should create a StratiaNotification of type STUCK_IN_STAGE', () => {
    const createStep = stuckLeadAlertWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('STUCK_IN_STAGE');
  });
});
