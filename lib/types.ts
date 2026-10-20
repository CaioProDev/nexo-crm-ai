export const leadStages = ["Novo", "Qualificado", "Proposta", "Negociação", "Ganho"] as const;
export type LeadStage = (typeof leadStages)[number];

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: LeadStage;
  score: number;
  source: string;
  lastContact: string;
  nextAction: string;
  createdAt: string;
};

export type LeadInput = Omit<Lead, "id" | "score" | "lastContact" | "createdAt"> & {
  score?: number;
};

export type AIAnalysis = {
  summary: string;
  risks: string[];
  recommended_action: string;
  reasoning: string;
  suggested_message: string;
  missing_information: string[];
};
