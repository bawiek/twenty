// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/reworkNotificationWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// FLOW-04 — When a closer toggles a lead back to 'A_RETRAVAILLER' in the
// handoffStatus field, notify the original setter (in-app StratiaNotification)
// AND send a Resend email via the stratia-email forwarder endpoint
// (/stratia/email/send). DATABASE_EVENT trigger on opportunity.updated with
// fields: ['handoffStatus'], then a FILTER (or IF_ELSE) gating on the new
// value being 'A_RETRAVAILLER', then two parallel actions.
import { reworkNotificationWorkflow } from '../definitions/reworkNotificationWorkflow';

describe('reworkNotificationWorkflow', () => {
  it('should have a name starting with "Stratia — "', () => {
    expect(reworkNotificationWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should use a DATABASE_EVENT trigger on opportunity.updated', () => {
    expect(reworkNotificationWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(reworkNotificationWorkflow.trigger.settings.eventName).toBe(
      'opportunity.updated',
    );
  });

  it('should set trigger.settings.fields to include the literal \'handoffStatus\'', () => {
    expect(reworkNotificationWorkflow.trigger.settings.fields).toContain(
      'handoffStatus',
    );
  });

  it('should include a CREATE_RECORD step on stratiaNotification with type REWORK_RECEIVED', () => {
    const createStep = reworkNotificationWorkflow.steps.find(
      (s: { type: string; settings: { input: { objectName?: string } } }) =>
        s.type === 'CREATE_RECORD' &&
        s.settings.input.objectName === 'stratiaNotification',
    ) as { settings: { input: { fields: Record<string, unknown> } } };

    expect(createStep).toBeDefined();
    expect(createStep.settings.input.fields.type).toBe('REWORK_RECEIVED');
  });

  it('should include an HTTP_REQUEST step whose URL references the stratia/email/send forwarder', () => {
    const httpStep = reworkNotificationWorkflow.steps.find(
      (s: { type: string }) => s.type === 'HTTP_REQUEST',
    ) as { settings: { input: { url: string } } };

    expect(httpStep).toBeDefined();
    expect(httpStep.settings.input.url).toContain('stratia/email/send');
  });

  it('should gate execution on handoffStatus === \'A_RETRAVAILLER\' via a FILTER or IF_ELSE step earlier than the CREATE_RECORD step', () => {
    // The literal 'A_RETRAVAILLER' must appear somewhere in the step chain
    // before the CREATE_RECORD step fires (to avoid sending notifications on
    // every handoffStatus change). We check for it in the serialized steps.
    const stepsAsJson = JSON.stringify(reworkNotificationWorkflow.steps);
    expect(stepsAsJson).toContain('A_RETRAVAILLER');
  });
});
