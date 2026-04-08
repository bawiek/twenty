import { t } from '@lingui/core/macro';

import { type InteractionType } from '@/stratia/types/InteractionTypes';

export type InteractionTypeOption = {
  value: InteractionType;
  icon: string;
  label: string;
  color: string;
};

export const INTERACTION_TYPE_OPTIONS: InteractionTypeOption[] = [
  { value: 'NOTE', icon: 'IconNote', label: t`Note`, color: 'gray' },
  { value: 'CALL', icon: 'IconPhone', label: t`Appel`, color: 'blue' },
  { value: 'EMAIL', icon: 'IconMail', label: t`Email`, color: 'green' },
];
