// STRATIA Phase 3 — DTO for POST /stratia/email/send.
//
// Shared by the Wave 5 reworkNotificationWorkflow and any future stratia
// automation that needs to forward an email through Resend without depending
// on the native Twenty SEND_EMAIL action (which requires a connected Gmail /
// Microsoft account — see RESEARCH Pitfall 2).

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};
