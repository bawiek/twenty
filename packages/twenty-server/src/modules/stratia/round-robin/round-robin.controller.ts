// STRATIA Phase 3 — Internal HTTP surface for the round-robin setter picker.
//
// POST /stratia/round-robin/next-setter
//
// Consumed by roundRobinAssignmentWorkflow (Wave 5) via its HTTP_REQUEST step.
// Protected by StratiaInternalGuard — callers must present the shared-secret
// header x-stratia-internal-secret that matches STRATIA_INTERNAL_SECRET on
// the server environment. External callers without the secret are rejected
// so inbound leads cannot be reassigned from outside the workflow engine.
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import type {
  PickNextSetterRequest,
  PickNextSetterResponse,
} from 'src/modules/stratia/round-robin/dto/pick-next-setter.dto';
import { RoundRobinService } from 'src/modules/stratia/round-robin/round-robin.service';
import { StratiaInternalGuard } from 'src/modules/stratia/shared/guards/stratia-internal.guard';

@Controller('stratia/round-robin')
@UseGuards(StratiaInternalGuard)
export class RoundRobinController {
  constructor(private readonly roundRobinService: RoundRobinService) {}

  @Post('next-setter')
  async nextSetter(
    @Body() body: PickNextSetterRequest,
  ): Promise<PickNextSetterResponse> {
    if (!body?.workspaceId) {
      throw new BadRequestException('workspaceId is required');
    }

    return this.roundRobinService.pickNextSetter(body.workspaceId);
  }
}
