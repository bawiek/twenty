// STRATIA Phase 3 — Stratia email NestJS module.
//
// Registers the Resend HTTP forwarder service and its internal REST surface
// at POST /stratia/email/send.
import { Module } from '@nestjs/common';

import { StratiaEmailController } from 'src/modules/stratia/email/stratia-email.controller';
import { StratiaEmailService } from 'src/modules/stratia/email/stratia-email.service';

@Module({
  controllers: [StratiaEmailController],
  providers: [StratiaEmailService],
  exports: [StratiaEmailService],
})
export class StratiaEmailModule {}
