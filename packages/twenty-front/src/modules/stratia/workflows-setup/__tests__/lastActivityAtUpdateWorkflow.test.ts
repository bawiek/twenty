// Wave 0 RED test — imports a workflow definition that does not exist yet.
// Wave 5 (plan 03-06) creates ../definitions/lastActivityAtUpdateWorkflow.ts.
// Test framework: Jest (Phase 2 precedent).
//
// AUTO-01 / AUTO-03 support — Maintains the custom lastActivityAt field on
// Opportunity so inactivity and hot-lead alerts have a reliable timestamp
// to compare against. Trigger fires on note.created or
// timelineActivity.created (confirmed in Wave 5 plan 03-06).
import { lastActivityAtUpdateWorkflow } from '../definitions/lastActivityAtUpdateWorkflow';

describe('lastActivityAtUpdateWorkflow', () => {
  it('should have a name starting with "Stratia — "', () => {
    expect(lastActivityAtUpdateWorkflow.name.startsWith('Stratia — ')).toBe(
      true,
    );
  });

  it('should use a DATABASE_EVENT trigger', () => {
    expect(lastActivityAtUpdateWorkflow.trigger.type).toBe('DATABASE_EVENT');
    // Event name is note.created or timelineActivity.created — confirmed at
    // Wave 5. Both start with a lowercase letter and end with `.created`.
    expect(lastActivityAtUpdateWorkflow.trigger.settings.eventName).toMatch(
      /\.created$/,
    );
  });

  it('should include an UPDATE_RECORD step targeting the opportunity object', () => {
    const updateStep = lastActivityAtUpdateWorkflow.steps.find(
      (s: { type: string }) => s.type === 'UPDATE_RECORD',
    ) as { type: 'UPDATE_RECORD'; settings: { input: { objectName: string } } } | undefined;

    expect(updateStep).toBeDefined();
    expect(updateStep!.settings.input.objectName).toBe('opportunity');
  });

  it('should list lastActivityAt in the UPDATE_RECORD fieldsToUpdate array', () => {
    const updateStep = lastActivityAtUpdateWorkflow.steps.find(
      (s: { type: string }) => s.type === 'UPDATE_RECORD',
    ) as { settings: { input: { fieldsToUpdate: string[] } } };

    expect(updateStep.settings.input.fieldsToUpdate).toContain(
      'lastActivityAt',
    );
  });
});
