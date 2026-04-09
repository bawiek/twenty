// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/handoffNotificationWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// FLOW-01 / FLOW-03 support — When an Opportunity's handoffStatus field
// changes (setter marks it "Prêt pour closing"), notify the closer(s).
// DATABASE_EVENT trigger with fields: ['handoffStatus'] per OQ-4
// decision in 03-SPIKES.md (the fields array is an allowlist, verified in
// workflow-database-event-trigger.listener.ts shouldTriggerJob).
import { handoffNotificationWorkflow } from '../definitions/handoffNotificationWorkflow';

describe('handoffNotificationWorkflow', () => {
  it('should have a name starting with "Stratia — "', () => {
    expect(handoffNotificationWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should use a DATABASE_EVENT trigger on opportunity.updated', () => {
    expect(handoffNotificationWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(handoffNotificationWorkflow.trigger.settings.eventName).toBe(
      'opportunity.updated',
    );
  });

  it('should set trigger.settings.fields to include the literal \'handoffStatus\'', () => {
    expect(handoffNotificationWorkflow.trigger.settings.fields).toContain(
      'handoffStatus',
    );
  });

  it('should contain at least one CREATE_RECORD step targeting stratiaNotification', () => {
    const createStep = handoffNotificationWorkflow.steps.find(
      (s: { type: string; settings: { input: { objectName?: string } } }) =>
        s.type === 'CREATE_RECORD' &&
        s.settings.input.objectName === 'stratiaNotification',
    ) as
      | { settings: { input: { objectName: string; fields: Record<string, unknown> } } }
      | undefined;

    expect(createStep).toBeDefined();
    expect(createStep!.settings.input.objectName).toBe('stratiaNotification');
  });

  it('should set the notification type field to the literal \'HANDOFF_RECEIVED\'', () => {
    const createStep = handoffNotificationWorkflow.steps.find(
      (s: { type: string; settings: { input: { objectName?: string } } }) =>
        s.type === 'CREATE_RECORD' &&
        s.settings.input.objectName === 'stratiaNotification',
    ) as { settings: { input: { fields: Record<string, unknown> } } };

    expect(createStep.settings.input.fields.type).toBe('HANDOFF_RECEIVED');
  });
});
