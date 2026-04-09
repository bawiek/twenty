// STRATIA Phase 3 — Top-level stratia server module.
//
// Aggregates every server-side stratia NestJS sub-module so the main
// ModulesModule only needs a single `StratiaModule` import. Keep this file
// intentionally small — it should only import/export sibling stratia
// modules. All extension logic lives under modules/stratia/<feature>/.
//
// Monthly-rebase note: This is the single integration point between the
// Twenty fork and all stratia backend code. Upstream Twenty never touches
// this file, so rebases should be trivial.
import { Module } from '@nestjs/common';

import { StratiaEmailModule } from 'src/modules/stratia/email/stratia-email.module';
import { StratiaRoundRobinModule } from 'src/modules/stratia/round-robin/round-robin.module';

@Module({
  imports: [StratiaRoundRobinModule, StratiaEmailModule],
  exports: [StratiaRoundRobinModule, StratiaEmailModule],
})
export class StratiaModule {}
