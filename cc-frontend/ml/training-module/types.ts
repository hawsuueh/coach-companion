export interface GameStats {
  points: number;
  assists: number;
  turnovers: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  steals: number;
  blocks: number;
  fouls: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_point_made: number;
  three_point_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  // We will calculate these for the features array
  fg_percentage: number;
  activity_rate: number; // Sum of attempts + defensive actions
}

export interface AthleteProfile {
  athlete_no: string;
  position: 'Guard' | 'Forward' | 'Center';
  injured_bodypart_ids: string[];
  body_focus_scores: Record<string, number>;
}

export interface Exercise {
  exercise_id: string;
  name: string;
  bodypart_ids: string[];
  intensity: number;
}

export interface DataPoint {
  features: number[]; // Array of 11-12 numerical values
  label: number; // 0: Recovery, 1: Moderate, 2: Intense
}
