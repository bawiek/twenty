// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/stageEnteredAtUpdateWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-07 support — Maintains the custom stageEnteredAt field on Opportunity
// so stuckLeadAlertWorkflow can compare it against the per-stage threshold.
// DATABASE_EVENT trigger on opportunity.updated with fields: ['stage'] per
// OQ-4 decision. The trigger fires ONLY when the stage column actually
// changes — no extra FILTER step needed.
import { stageEnteredAtUpdateWorkflow } from '../definitions/stageEnteredAtUpdateWorkflow';

describe('stageEnteredAtUpdateWorkflow', () => {
  it('should have a name starting with "Stratia — "', () => {
    expect(stageEnteredAtUpdateWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should use a DATABASE_EVENT trigger on opportunity.updated', () => {
    expect(stageEnteredAtUpdateWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(stageEnteredAtUpdateWorkflow.trigger.settings.eventName).toBe(
      'opportunity.updated',
    );
  });

  it('should set trigger.settings.fields to include the literal \'stage\'', () => {
    expect(stageEnteredAtUpdateWorkflow.trigger.settings.fields).toContain(
      'stage',
    );
  });

  it('should include an UPDATE_RECORD step targeting the opportunity object', () => {
    const updateStep = stageEnteredAtUpdateWorkflow.steps.find(
      (s: { type: string }) => s.type === 'UPDATE_RECORD',
    ) as
      | { type: 'UPDATE_RECORD'; settings: { input: { objectName: string; fieldsToUpdate: string[] } } }
      | undefined;

    expect(updateStep).toBeDefined();
    expect(updateStep!.settings.input.objectName).toBe('opportunity');
  });

  it('should list stageEnteredAt in the UPDATE_RECORD fieldsToUpdate array', () => {
    const updateStep = stageEnteredAtUpdateWorkflow.steps.find(
      (s: { type: string }) => s.type === 'UPDATE_RECORD',
    ) as { settings: { input: { fieldsToUpdate: string[] } } };

    expect(updateStep.settings.input.fieldsToUpdate).toContain(
      'stageEnteredAt',
    );
  });
});
