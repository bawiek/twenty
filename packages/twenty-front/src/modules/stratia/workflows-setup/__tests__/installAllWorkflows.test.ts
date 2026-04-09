// Wave 0 RED test — imports an installer that does not exist yet.
// Wave 5 (plan 03-06) creates ../installAllWorkflows.ts.
// Test framework: Jest (Phase 2 precedent).
//
// The installer is the single-shot entrypoint that creates all 12 Phase 3
// workflow definitions on the Twenty server via GraphQL. It MUST be
// idempotent (running twice does not create duplicates) and MUST call the
// GraphQL endpoint exactly 12 times (once per workflow) on a fresh install.
//
// Count reconciliation: 8 original workflows (5 CRON + 3 DATABASE_EVENT) +
// 4 added via checker review (handoffNotif, reworkNotif, stageEnteredAtUpdate,
// lastActivityAtUpdate) = 12 workflows total. See 03-01-PLAN.md <behavior>
// for the full list.
import { installAllWorkflows, ALL_DEFINITIONS } from '../installAllWorkflows';

// Mock fetch — the installer posts raw GraphQL mutations, not React hooks.
const fetchMock = jest.fn();
const originalFetch = global.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  process.env.TWENTY_SERVER_URL = 'https://fake-twenty.test';
  process.env.TWENTY_API_KEY = 'fake-token';
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('installAllWorkflows', () => {
  it('should export exactly 12 workflow definitions in ALL_DEFINITIONS', () => {
    expect(ALL_DEFINITIONS).toHaveLength(12);
  });

  it('should call the GraphQL endpoint at least once per workflow definition (12 workflows)', async () => {
    // Default: every fetch returns a successful create response.
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          __schema: { mutationType: { fields: [{ name: 'createWorkflow' }] } },
          createWorkflow: { id: 'wf-new' },
          createWorkflowVersion: { id: 'wfv-new' },
          activateWorkflowVersion: true,
          workflows: { edges: [] },
        },
      }),
    });

    await installAllWorkflows();

    // Each workflow triggers at least one create call. 12 workflows = at
    // least 12 create calls. (Actual calls may be higher because the
    // installer also creates workflow versions + activations — we assert
    // "at least 12" to avoid over-specifying the exact call count.)
    const createCalls = fetchMock.mock.calls.filter(([, init]) => {
      const body = (init as { body?: string })?.body ?? '';
      return (
        body.includes('createWorkflow') ||
        body.includes('createOneWorkflow')
      );
    });
    expect(createCalls.length).toBeGreaterThanOrEqual(12);
  });

  it('should be idempotent — a second run does NOT create duplicate workflows when workflow names already exist', async () => {
    // First call of the skip-check lookup returns existing workflows for
    // every definition, so the installer should skip all creates.
    fetchMock.mockImplementation(async (_url, init) => {
      const body = (init as { body?: string })?.body ?? '';
      if (body.includes('workflows')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              workflows: {
                edges: ALL_DEFINITIONS.map((def: { name: string }) => ({
                  node: { id: `existing-${def.name}`, name: def.name },
                })),
              },
            },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ data: {} }),
      };
    });

    await installAllWorkflows();

    const createCalls = fetchMock.mock.calls.filter(([, init]) => {
      const body = (init as { body?: string })?.body ?? '';
      // Match creation mutations but not the idempotency lookup query.
      return (
        (body.includes('createWorkflow') ||
          body.includes('createOneWorkflow')) &&
        !body.includes('__schema') &&
        !body.includes('workflows(filter')
      );
    });
    expect(createCalls.length).toBe(0);
  });

  it('should throw a helpful error when createWorkflow mutation returns null', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          __schema: { mutationType: { fields: [{ name: 'createWorkflow' }] } },
          createWorkflow: null,
          workflows: { edges: [] },
        },
        errors: [{ message: 'createWorkflow returned null' }],
      }),
    });

    await expect(installAllWorkflows()).rejects.toThrow(/createWorkflow/);
  });
});
