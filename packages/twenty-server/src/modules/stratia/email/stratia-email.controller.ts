// STRATIA Phase 3 — Internal HTTP surface for the Resend email forwarder.
//
// POST /stratia/email/send
//
// Consumed by Wave 5 workflow HTTP_REQUEST steps (reworkNotificationWorkflow,
// hotLeadAlertWorkflow, …) when an automation needs to deliver an email via
// Resend instead of the native Gmail/Microsoft SEND_EMAIL action.
//
// Protected by StratiaInternalGuard — the x-stratia-internal-secret header
// must match STRATIA_INTERNAL_SECRET on the server. Request body is validated
// minimally so misformed workflow payloads fail fast with a 400 instead of
// silently calling Resend with undefined fields.
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { SendEmailInput } from 'src/modules/stratia/email/dto/send-email.dto';
import { StratiaEmailService } from 'src/modules/stratia/email/stratia-email.service';
import { StratiaInternalGuard } from 'src/modules/stratia/shared/guards/stratia-internal.guard';

type SendEmailRequestBody = Partial<SendEmailInput>;

@Controller('stratia/email')
@UseGuards(StratiaInternalGuard)
export class StratiaEmailController {
  constructor(private readonly stratiaEmailService: StratiaEmailService) {}

  @Post('send')
  @HttpCode(200)
  async send(@Body() body: SendEmailRequestBody): Promise<{ success: true }> {
    if (!body?.to) {
      throw new BadRequestException('to is required');
    }
    if (!body.subject) {
      throw new BadRequestException('subject is required');
    }
    if (!body.html) {
      throw new BadRequestException('html is required');
    }

    await this.stratiaEmailService.send({
      to: body.to,
      subject: body.subject,
      html: body.html,
    });

    return { success: true };
  }
}
