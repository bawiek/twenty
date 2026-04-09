// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/noShowRelanceWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-02 — When the custom field noShow is toggled true on an Opportunity,
// create a StratiaNotification of type NO_SHOW_RELANCE + follow-up task.
import { noShowRelanceWorkflow } from '../definitions/noShowRelanceWorkflow';

describe('noShowRelanceWorkflow', () => {
  it('should use a DATABASE_EVENT trigger on opportunity.updated with fields: ["noShow"]', () => {
    expect(noShowRelanceWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(noShowRelanceWorkflow.trigger.settings.eventName).toBe(
      'opportunity.updated',
    );
    expect(noShowRelanceWorkflow.trigger.settings.fields).toEqual(['noShow']);
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(noShowRelanceWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should create a StratiaNotification of type NO_SHOW_RELANCE', () => {
    const createStep = noShowRelanceWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('NO_SHOW_RELANCE');
  });
});
