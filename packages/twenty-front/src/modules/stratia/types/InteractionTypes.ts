export type InteractionType = 'NOTE' | 'CALL' | 'EMAIL';

export type OutcomeTag =
  | 'REPONDU'
  | 'PAS_DE_REPONSE'
  | 'MESSAGERIE'
  | 'RAPPELER';

export type InteractionEntry = {
  id: string;
  type: InteractionType;
  outcomeTag: OutcomeTag;
  body: string;
  createdAt: string;
  createdById: string;
  leadId: string;
};

export type CallLogEntry = InteractionEntry & {
  type: 'CALL';
  callDurationMinutes: number | null;
};

export type EmailLogEntry = InteractionEntry & {
  type: 'EMAIL';
  emailSubject: string;
};
