// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/roundRobinAssignmentWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// FLOW-05 / AUTO-05 — When a new Opportunity is created, auto-assign it to
// the next setter in round-robin order. The workflow is DATABASE_EVENT on
// opportunity.created; it filters to "Inbound" sources, calls the stratia
// backend round-robin endpoint (HTTP_REQUEST step), writes the result to
// assignedMemberId (UPDATE_RECORD — NOT ownerId, per OQ-5 decision in
// 03-SPIKES.md), then creates an AUTO_ASSIGNED StratiaNotification row.
import { roundRobinAssignmentWorkflow } from '../definitions/roundRobinAssignmentWorkflow';

describe('roundRobinAssignmentWorkflow', () => {
  it('should use a DATABASE_EVENT trigger on opportunity.created', () => {
    expect(roundRobinAssignmentWorkflow.trigger.type).toBe('DATABASE_EVENT');
    expect(roundRobinAssignmentWorkflow.trigger.settings.eventName).toBe(
      'opportunity.created',
    );
  });

  it('should have a name starting with "Stratia — "', () => {
    expect(roundRobinAssignmentWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should have steps in order: FILTER → HTTP_REQUEST → UPDATE_RECORD → CREATE_RECORD', () => {
    const stepTypes = roundRobinAssignmentWorkflow.steps.map(
      (s: { type: string }) => s.type,
    );
    expect(stepTypes[0]).toBe('FILTER');
    expect(stepTypes[1]).toBe('HTTP_REQUEST');
    expect(stepTypes[2]).toBe('UPDATE_RECORD');
    expect(stepTypes[3]).toBe('CREATE_RECORD');
  });

  it('should UPDATE_RECORD on the opportunity and write assignedMemberId (not ownerId per OQ-5)', () => {
    const updateStep = roundRobinAssignmentWorkflow.steps.find(
      (s: { type: string }) => s.type === 'UPDATE_RECORD',
    ) as { type: 'UPDATE_RECORD'; settings: { input: { objectName: string; fieldsToUpdate: string[] } } };

    expect(updateStep).toBeDefined();
    expect(updateStep.settings.input.objectName).toBe('opportunity');
    expect(updateStep.settings.input.fieldsToUpdate).toContain(
      'assignedMemberId',
    );
    expect(updateStep.settings.input.fieldsToUpdate).not.toContain('ownerId');
  });

  it('should create a StratiaNotification of type AUTO_ASSIGNED in the CREATE_RECORD step', () => {
    const createStep = roundRobinAssignmentWorkflow.steps.find(
      (s: { type: string }) => s.type === 'CREATE_RECORD',
    ) as { type: 'CREATE_RECORD'; settings: { input: { objectName: string; fields: Record<string, unknown> } } };

    expect(createStep.settings.input.objectName).toBe('stratiaNotification');
    expect(createStep.settings.input.fields.type).toBe('AUTO_ASSIGNED');
  });
});
