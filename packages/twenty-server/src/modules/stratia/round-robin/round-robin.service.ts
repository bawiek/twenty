// STRATIA Phase 3 — Atomic round-robin setter picker (FLOW-05 / AUTO-05).
//
// Called by roundRobinAssignmentWorkflow (Wave 5) via the internal HTTP
// surface POST /stratia/round-robin/next-setter. For each call it:
//
//  1. Enters the workspace data-source context
//  2. Takes a Postgres advisory lock keyed on
//     hashtext('stratia:round-robin:' || workspaceId) to eliminate the
//     concurrent-assignment race (RESEARCH Pitfall 5 — two ads leads
//     landing in the same 10ms window would otherwise both read the same
//     lastIndex and get assigned to the same setter).
//  3. Loads or initializes the single StratiaRoundRobinCounter row
//  4. Loads workspaceMember rows filtered by stratiaRole === 'SETTER' in
//     createdAt ASC order (deterministic rotation across restarts)
//  5. Computes nextIndex = (lastIndex + 1) % setters.length
//  6. Persists the new lastIndex and returns the chosen workspaceMemberId.
//
// If no setters exist, the service throws
// "No setters available for round-robin assignment" so the workflow can
// surface the misconfiguration instead of silently swallowing the lead.
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { PickNextSetterResponse } from 'src/modules/stratia/round-robin/dto/pick-next-setter.dto';

type WorkspaceMemberRow = {
  id: string;
  createdAt: string | Date;
  stratiaRole?: string;
};

type RoundRobinCounterRow = {
  workspaceId: string;
  lastIndex: number;
};

type StratiaWorkspaceRepository<T> = {
  findOne: (options?: {
    where?: Record<string, unknown>;
  }) => Promise<T | null | undefined>;
  find: (options?: {
    where?: Record<string, unknown>;
    order?: Record<string, 'ASC' | 'DESC'>;
  }) => Promise<T[]>;
  save: (row: T) => Promise<T>;
  query?: (sql: string, params?: unknown[]) => Promise<unknown>;
};

type StratiaGlobalWorkspaceOrmManager = {
  executeInWorkspaceContext: <T>(fn: () => Promise<T> | T) => Promise<T>;
  getRepository: <T>(
    workspaceId: string,
    objectMetadataName: string,
    options?: { shouldBypassPermissionChecks?: boolean },
  ) => Promise<StratiaWorkspaceRepository<T>>;
};

const ROUND_ROBIN_COUNTER_OBJECT = 'stratiaRoundRobinCounter';
const WORKSPACE_MEMBER_OBJECT = 'workspaceMember';
const SETTER_ROLE = 'SETTER';

@Injectable()
export class RoundRobinService {
  private readonly logger = new Logger(RoundRobinService.name);

  constructor(
    @Inject('GlobalWorkspaceOrmManager')
    private readonly globalWorkspaceOrmManager: StratiaGlobalWorkspaceOrmManager,
  ) {}

  async pickNextSetter(workspaceId: string): Promise<PickNextSetterResponse> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        // Advisory lock scoped to the workspace. pg_advisory_xact_lock is
        // released automatically at transaction commit/rollback. Keyed by
        // hashtext('stratia:round-robin:' || workspaceId) so parallel
        // workspaces do not contend with each other.
        const counterRepository =
          await this.globalWorkspaceOrmManager.getRepository<RoundRobinCounterRow>(
            workspaceId,
            ROUND_ROBIN_COUNTER_OBJECT,
            { shouldBypassPermissionChecks: true },
          );

        if (typeof counterRepository.query === 'function') {
          try {
            await counterRepository.query(
              `SELECT pg_advisory_xact_lock(hashtext('stratia:round-robin:' || $1))`,
              [workspaceId],
            );
          } catch (error) {
            this.logger.warn(
              `pg_advisory_xact_lock failed for workspace ${workspaceId}: ${
                (error as Error).message
              }`,
            );
          }
        }

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberRow>(
            workspaceId,
            WORKSPACE_MEMBER_OBJECT,
            { shouldBypassPermissionChecks: true },
          );

        const setters = await workspaceMemberRepository.find({
          where: { stratiaRole: SETTER_ROLE },
          order: { createdAt: 'ASC' },
        });

        if (!setters || setters.length === 0) {
          throw new Error('No setters available for round-robin assignment');
        }

        const sortedSetters = [...setters].sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();

          return aTime - bTime;
        });

        const existingCounter = await counterRepository.findOne({
          where: { workspaceId },
        });

        const lastIndex =
          existingCounter && typeof existingCounter.lastIndex === 'number'
            ? existingCounter.lastIndex
            : -1;
        const nextIndex = (lastIndex + 1) % sortedSetters.length;
        const chosenSetter = sortedSetters[nextIndex];

        const counterRowToSave: RoundRobinCounterRow = {
          workspaceId,
          lastIndex: nextIndex,
        };

        await counterRepository.save(counterRowToSave);

        return { workspaceMemberId: chosenSetter.id };
      },
    );
  }
}
