export type Analysis = {
  analysis_id: string;
  athlete_no: string;
  date: string;
  time: string;
};

export type BodypartAnalysis = {
  bodypart_analysis_id: string;
  analysis_id: string;
  strengths: string;
  weaknesses: string;
  bodypart_focus_scores: number;
  performance_summary: string;
};

export type InjuryAnalysis = {
  injury_analysis_id: string;
  analysis_id: string;
  name: string;
  affected_bodypart: string;
  recommended_adjustments: string;
  injury_summary: string;
};
