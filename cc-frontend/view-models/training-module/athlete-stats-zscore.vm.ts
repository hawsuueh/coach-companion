export interface AthleteZScores {
  field_goal_pct: number;
  two_point_pct: number;
  three_point_pct: number;
  freethrow_pct: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number; // Remember: high turnovers = bad, but we process raw Z first
}