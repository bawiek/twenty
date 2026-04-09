// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/stageChangeTaskWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-06 — When an Opportunity's stage field changes, create a follow-up
// task matching the new stage (template library per stage). DATABASE_EVENT
// trigger on opportunity.updated with fields: ['stage'].
import { stageChangeTaskWorkflow } from '../definitions/stageChangeTaskWorkflow';

describe('stageChangeTaskWorkflow', () => {
  it('should use a DATABASE_EVENT trigger on opportunity.updated with fields: ["stage"]', () => {
    expect(stageChangeTaskWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(stageChangeTaskWorkflow.trigger.settings.eventName).toBe(
      'opportunity.updated',
    );
    expect(stageChangeTaskWorkflow.trigger.settings.fields).toEqual(['stage']);
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(stageChangeTaskWorkflow.name.startsWith('Stratia — ')).toBe(true);
  });

  it('should have a CREATE_RECORD step targeting the task object', () => {
    const createStep = stageChangeTaskWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { settings: { input: { objectName: string } } };

    expect(createStep).toBeDefined();
    expect(createStep.settings.input.objectName).toBe('task');
  });
});
