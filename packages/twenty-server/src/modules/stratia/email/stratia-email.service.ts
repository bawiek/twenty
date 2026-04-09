// STRATIA Phase 3 — Resend HTTP forwarder (AUTO-03 / FLOW-04).
//
// Thin NestJS service that POSTs outbound emails to the Resend REST API.
// Why not the native Twenty SEND_EMAIL workflow action? Because the native
// action requires an OAuth-connected Gmail or Microsoft account on the
// workspace (RESEARCH Pitfall 2) — the StratIA ops team has neither, and
// Resend is the project's already-chosen transactional email provider.
//
// The service is intentionally dumb: it forwards whatever the caller sends
// and propagates any non-2xx Resend response as a thrown Error. Template
// rendering happens in the workflow HTTP_REQUEST step upstream.
//
// Behaviour summary:
//   - POST https://api.resend.com/emails
//   - Authorization: Bearer <RESEND_API_KEY>      (Wave 0 test asserts exact casing)
//   - content-type: application/json              (Wave 0 test asserts exact casing)
//   - body JSON: { from, to: [to], subject, html }
//   - No-op + console.warn if RESEND_API_KEY is unset (safe for local dev)
//   - Throws with the response body text on non-2xx responses
//   - "from" header defaults to STRATIA_EMAIL_FROM, falling back to
//     'StratIA <noreply@stratia.fr>' if that env var is also unset. The
//     value is resolved at construction time so the service can be rebuilt
//     per-request in tests.
import { Injectable } from '@nestjs/common';

import type { SendEmailInput } from 'src/modules/stratia/email/dto/send-email.dto';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM_ADDRESS = 'StratIA <noreply@stratia.fr>';

@Injectable()
export class StratiaEmailService {
  private readonly fromAddress: string;

  constructor() {
    this.fromAddress = process.env.STRATIA_EMAIL_FROM ?? DEFAULT_FROM_ADDRESS;
  }

  async send({ to, subject, html }: SendEmailInput): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Dev-friendly no-op so local runs do not crash. Railway production
      // MUST set RESEND_API_KEY — tracked in 03-RAILWAY-ENV.md.
      console.warn(
        '[StratiaEmailService] RESEND_API_KEY not set — skipping send',
      );

      return;
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Resend send failed: ${response.status} ${errorText}`);
    }
  }
}
