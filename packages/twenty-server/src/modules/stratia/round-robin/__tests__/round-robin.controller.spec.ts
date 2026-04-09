// Wave 0 RED test — imports a controller that does not exist yet.
// Wave 2 (plan 03-02) creates ../round-robin.controller.ts.
// Test framework: Jest.
//
// POST /stratia/round-robin/next-setter — Internal HTTP endpoint called by
// the roundRobinAssignmentWorkflow HTTP_REQUEST step. Protected by an
// internal shared-secret auth guard so external callers cannot trigger
// assignment bypass.
import { Test, type TestingModule } from '@nestjs/testing';

import { RoundRobinController } from '../round-robin.controller';
import { RoundRobinService } from '../round-robin.service';

describe('RoundRobinController', () => {
  let controller: RoundRobinController;
  const mockService = {
    pickNextSetter: jest.fn(),
  };

  beforeEach(async () => {
    mockService.pickNextSetter.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoundRobinController],
      providers: [
        {
          provide: RoundRobinService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RoundRobinController>(RoundRobinController);
  });

  it('should return { workspaceMemberId } from the service on POST /stratia/round-robin/next-setter', async () => {
    mockService.pickNextSetter.mockResolvedValue({
      workspaceMemberId: 'setter-123',
    });

    // The controller method is exposed at POST /stratia/round-robin/next-setter.
    // We invoke the method directly — NestJS routing is covered by the
    // framework's own tests; here we assert the handler contract.
    const result = await controller.nextSetter({
      workspaceId: 'ws-1',
    } as { workspaceId: string });

    expect(result).toEqual({ workspaceMemberId: 'setter-123' });
  });

  it('should delegate to RoundRobinService.pickNextSetter with the workspace id from the request context', async () => {
    mockService.pickNextSetter.mockResolvedValue({
      workspaceMemberId: 'setter-x',
    });
    await controller.nextSetter({ workspaceId: 'ws-42' } as { workspaceId: string });
    expect(mockService.pickNextSetter).toHaveBeenCalledWith('ws-42');
  });

  it('should propagate a 500-class error when the service throws', async () => {
    mockService.pickNextSetter.mockRejectedValue(
      new Error('No setters available for round-robin assignment'),
    );
    await expect(
      controller.nextSetter({ workspaceId: 'ws-1' } as { workspaceId: string }),
    ).rejects.toThrow(/No setters available/);
  });

  it('should require an internal-auth guard to block external callers', () => {
    // The controller class OR the nextSetter method must carry an @UseGuards
    // decorator referencing the stratia internal auth guard. We inspect the
    // Reflect metadata to confirm a guard is attached.
    const metadata = Reflect.getMetadata('__guards__', controller.nextSetter);
    const classMetadata = Reflect.getMetadata(
      '__guards__',
      RoundRobinController,
    );
    const hasGuard =
      (Array.isArray(metadata) && metadata.length > 0) ||
      (Array.isArray(classMetadata) && classMetadata.length > 0);
    expect(hasGuard).toBe(true);
  });
});
