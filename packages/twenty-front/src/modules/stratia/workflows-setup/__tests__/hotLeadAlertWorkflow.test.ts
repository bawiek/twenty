// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/hotLeadAlertWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-03 — Every 4 hours, alert on "hot" leads (handoffTemperature >= 4)
// that have had no contact activity recently. Cron schedule: 0 */4 * * *.
import { hotLeadAlertWorkflow } from '../definitions/hotLeadAlertWorkflow';

describe('hotLeadAlertWorkflow', () => {
  it('should use a CRON trigger with pattern "0 */4 * * *" (every 4 hours)', () => {
    expect(hotLeadAlertWorkflow.trigger.type).toBe('CRON');
    expect(hotLeadAlertWorkflow.trigger.settings.pattern).toBe('0 */4 * * *');
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(hotLeadAlertWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should filter on handoffTemperature >= 4 (the literal number 4)', () => {
    const filterStep = hotLeadAlertWorkflow.steps.find(
      (s: { type: string }) => s.type === 'FILTER',
    ) as { type: 'FILTER'; settings: { input: { condition: string } } } | undefined;

    expect(filterStep).toBeDefined();
    const condition = filterStep!.settings.input.condition;
    expect(condition).toContain('handoffTemperature');
    expect(condition).toMatch(/>=\s*4/);
  });

  it('should create a StratiaNotification of type HOT_LEAD_NOT_FOLLOWED_UP', () => {
    const createStep = hotLeadAlertWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe(
      'HOT_LEAD_NOT_FOLLOWED_UP',
    );
  });
});
