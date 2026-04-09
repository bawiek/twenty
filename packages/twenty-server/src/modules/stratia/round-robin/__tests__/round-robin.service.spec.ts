// Wave 0 RED test — imports a service that does not exist yet.
// Wave 2 (plan 03-02) creates ../round-robin.service.ts.
// Test framework: Jest (twenty-server uses Jest, per CLAUDE.md and
// 03-VALIDATION.md).
//
// FLOW-05 / AUTO-05 — Round-robin setter assignment. pickNextSetter returns
// { workspaceMemberId } and increments an atomic counter so consecutive calls
// rotate through the available setters in createdAt ASC order, wrapping at
// the end. Only workspaceMembers with stratiaRole === 'SETTER' are eligible.
import { Test, type TestingModule } from '@nestjs/testing';

import { RoundRobinService } from '../round-robin.service';

type FakeSetter = { id: string; createdAt: string; stratiaRole: string };
type FakeCounterRow = { workspaceId: string; lastIndex: number };

const WORKSPACE_ID = 'ws-test-1';

const buildSetters = (count: number): FakeSetter[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `setter-${index}`,
    createdAt: new Date(2026, 0, 1 + index).toISOString(),
    stratiaRole: 'SETTER',
  }));

describe('RoundRobinService', () => {
  let service: RoundRobinService;
  let counterRow: FakeCounterRow | null;
  let members: Array<FakeSetter & { stratiaRole: string }>;

  const counterRepository = {
    findOne: jest.fn(async () => counterRow),
    save: jest.fn(async (row: FakeCounterRow) => {
      counterRow = { ...row };
      return row;
    }),
  };

  const workspaceMemberRepository = {
    find: jest.fn(async (options?: { where?: { stratiaRole?: string }; order?: Record<string, 'ASC' | 'DESC'> }) => {
      const filtered = members.filter(
        (m) => !options?.where?.stratiaRole || m.stratiaRole === options.where.stratiaRole,
      );
      if (options?.order?.createdAt === 'ASC') {
        return [...filtered].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
      }
      return filtered;
    }),
  };

  const globalWorkspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(async (fn: () => unknown) => fn()),
    getRepository: jest.fn(async (_workspaceId: string, table: string) => {
      if (table === 'stratiaRoundRobinCounter') {
        return counterRepository;
      }
      if (table === 'workspaceMember') {
        return workspaceMemberRepository;
      }
      throw new Error(`Unexpected repository request for ${table}`);
    }),
  };

  beforeEach(async () => {
    counterRow = null;
    members = [];
    counterRepository.findOne.mockClear();
    counterRepository.save.mockClear();
    workspaceMemberRepository.find.mockClear();
    globalWorkspaceOrmManager.getRepository.mockClear();
    globalWorkspaceOrmManager.executeInWorkspaceContext.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoundRobinService,
        {
          provide: 'GlobalWorkspaceOrmManager',
          useValue: globalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<RoundRobinService>(RoundRobinService);
  });

  it('should return the first setter when counter.lastIndex = -1 (first call)', async () => {
    members = buildSetters(3);
    counterRow = { workspaceId: WORKSPACE_ID, lastIndex: -1 };

    const result = await service.pickNextSetter(WORKSPACE_ID);
    expect(result.workspaceMemberId).toBe('setter-0');
    expect(counterRow.lastIndex).toBe(0);
  });

  it('should rotate setter[0], setter[1], setter[2], setter[0] on consecutive calls (wrap-around modulo count)', async () => {
    members = buildSetters(3);
    counterRow = { workspaceId: WORKSPACE_ID, lastIndex: -1 };

    const first = await service.pickNextSetter(WORKSPACE_ID);
    const second = await service.pickNextSetter(WORKSPACE_ID);
    const third = await service.pickNextSetter(WORKSPACE_ID);
    const fourth = await service.pickNextSetter(WORKSPACE_ID);

    expect(first.workspaceMemberId).toBe('setter-0');
    expect(second.workspaceMemberId).toBe('setter-1');
    expect(third.workspaceMemberId).toBe('setter-2');
    expect(fourth.workspaceMemberId).toBe('setter-0');
  });

  it('should throw "No setters available for round-robin assignment" when no setters exist', async () => {
    members = [];
    counterRow = { workspaceId: WORKSPACE_ID, lastIndex: -1 };

    await expect(service.pickNextSetter(WORKSPACE_ID)).rejects.toThrow(
      'No setters available for round-robin assignment',
    );
  });

  it('should initialize the counter row on first call when none exists', async () => {
    members = buildSetters(2);
    counterRow = null;

    await service.pickNextSetter(WORKSPACE_ID);
    expect(counterRepository.save).toHaveBeenCalled();
    expect(counterRow).not.toBeNull();
    expect(counterRow!.workspaceId).toBe(WORKSPACE_ID);
  });

  it('should only consider workspaceMembers with stratiaRole === \'SETTER\' (ADMIN and CLOSER excluded)', async () => {
    members = [
      { id: 'admin-1', createdAt: '2026-01-01T00:00:00Z', stratiaRole: 'ADMIN' },
      { id: 'closer-1', createdAt: '2026-01-02T00:00:00Z', stratiaRole: 'CLOSER' },
      { id: 'setter-a', createdAt: '2026-01-03T00:00:00Z', stratiaRole: 'SETTER' },
      { id: 'setter-b', createdAt: '2026-01-04T00:00:00Z', stratiaRole: 'SETTER' },
    ];
    counterRow = { workspaceId: WORKSPACE_ID, lastIndex: -1 };

    const result = await service.pickNextSetter(WORKSPACE_ID);
    expect(['setter-a', 'setter-b']).toContain(result.workspaceMemberId);
    expect(result.workspaceMemberId).not.toBe('admin-1');
    expect(result.workspaceMemberId).not.toBe('closer-1');
  });

  it('should order setters deterministically by createdAt ASC for reproducible rotation', async () => {
    // Create setters out-of-order in the source list; the service must sort.
    members = [
      { id: 'setter-c', createdAt: '2026-03-01T00:00:00Z', stratiaRole: 'SETTER' },
      { id: 'setter-a', createdAt: '2026-01-01T00:00:00Z', stratiaRole: 'SETTER' },
      { id: 'setter-b', createdAt: '2026-02-01T00:00:00Z', stratiaRole: 'SETTER' },
    ];
    counterRow = { workspaceId: WORKSPACE_ID, lastIndex: -1 };

    const first = await service.pickNextSetter(WORKSPACE_ID);
    const second = await service.pickNextSetter(WORKSPACE_ID);
    const third = await service.pickNextSetter(WORKSPACE_ID);

    expect(first.workspaceMemberId).toBe('setter-a');
    expect(second.workspaceMemberId).toBe('setter-b');
    expect(third.workspaceMemberId).toBe('setter-c');
  });
});
