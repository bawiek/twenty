export type HandoffStatus = 'NONE' | 'PRET_POUR_CLOSING' | 'A_RETRAVAILLER';

export type HandoffQualification = {
  budget: boolean;
  autorite: boolean;
  besoin: boolean;
  timing: boolean;
  problematique: boolean;
  solution: boolean;
  objection: boolean;
  dispoRdv: boolean;
};

export type HandoffTemperature = 1 | 2 | 3 | 4 | 5;

export type HandoffPackage = {
  handoffStatus: HandoffStatus;
  handoffQualification: HandoffQualification | null;
  handoffTemperature: HandoffTemperature | null;
  handoffObjections: string;
  handoffNextStep: string;
  handoffSubmittedAt: string | null;
  handoffSubmittedById: string | null;
  reworkNote: string | null;
  reworkAt: string | null;
  reworkBySetterId: string | null;
};

export const EMPTY_HANDOFF_QUALIFICATION: HandoffQualification = {
  budget: false,
  autorite: false,
  besoin: false,
  timing: false,
  problematique: false,
  solution: false,
  objection: false,
  dispoRdv: false,
};
