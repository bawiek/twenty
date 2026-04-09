// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/rdvImminentNotifWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-04 — Every 5 minutes, look for upcoming RDV (next meeting) and notify
// the closer X minutes before. Cron schedule: */5 * * * *.
import { rdvImminentNotifWorkflow } from '../definitions/rdvImminentNotifWorkflow';

describe('rdvImminentNotifWorkflow', () => {
  it('should use a CRON trigger with pattern "*/5 * * * *" (every 5 minutes)', () => {
    expect(rdvImminentNotifWorkflow.trigger.type).toBe('CRON');
    expect(rdvImminentNotifWorkflow.trigger.settings.pattern).toBe(
      '*/5 * * * *',
    );
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(rdvImminentNotifWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should create a StratiaNotification of type RDV_IMMINENT', () => {
    const createStep = rdvImminentNotifWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('RDV_IMMINENT');
  });
});
