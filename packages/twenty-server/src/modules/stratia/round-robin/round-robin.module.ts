// STRATIA Phase 3 — Round-robin NestJS module.
//
// Exposes POST /stratia/round-robin/next-setter and wires the service to the
// global workspace ORM manager via a string-token alias so both production
// DI and the Wave 0 unit specs resolve the same provider.
import { Module } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { RoundRobinController } from 'src/modules/stratia/round-robin/round-robin.controller';
import { RoundRobinService } from 'src/modules/stratia/round-robin/round-robin.service';

@Module({
  controllers: [RoundRobinController],
  providers: [
    RoundRobinService,
    {
      provide: 'GlobalWorkspaceOrmManager',
      useExisting: GlobalWorkspaceOrmManager,
    },
  ],
  exports: [RoundRobinService],
})
export class StratiaRoundRobinModule {}
