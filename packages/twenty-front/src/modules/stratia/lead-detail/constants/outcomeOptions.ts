import { t } from '@lingui/core/macro';

import { type OutcomeTag } from '@/stratia/types/InteractionTypes';

export type OutcomeOption = {
  value: OutcomeTag;
  label: string;
  color: string;
};

export const OUTCOME_OPTIONS: OutcomeOption[] = [
  { value: 'REPONDU', label: t`Repondu`, color: 'green' },
  { value: 'PAS_DE_REPONSE', label: t`Pas de reponse`, color: 'red' },
  { value: 'MESSAGERIE', label: t`Messagerie`, color: 'yellow' },
  { value: 'RAPPELER', label: t`Rappeler`, color: 'blue' },
];
