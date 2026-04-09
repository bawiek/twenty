export type StratiaNotificationType =
  | 'HANDOFF_RECEIVED'
  | 'REWORK_RECEIVED'
  | 'HOT_LEAD_NOT_FOLLOWED_UP'
  | 'RDV_IMMINENT'
  | 'STUCK_IN_STAGE'
  | 'INACTIVE_LEAD'
  | 'NO_SHOW_RELANCE'
  | 'TASK_DUE_TODAY'
  | 'AUTO_ASSIGNED';

export type StratiaNotification = {
  id: string;
  recipientId: string;
  type: StratiaNotificationType;
  title: string;
  body: string | null;
  linkedOpportunityId: string | null;
  linkedTaskId: string | null;
  readAt: string | null;
  createdAt: string;
};
