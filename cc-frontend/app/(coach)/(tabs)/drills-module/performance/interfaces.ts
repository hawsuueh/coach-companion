export interface Athlete {
  athlete_no: number;
  first_name: string;
  second_name: string;
  last_name: string;
  position: string;
  player_no: string;
  gmail: string; // Jersey number
}

export interface GameRecord {
  id: number;
  game_id: number;
  player_id: number; // Corresponds to Athlete.id
  madeFG: number;
  attemptFG: number;
  made2PTS: number;
  attempt2PTS: number;
  made3PTS: number;
  attempt3PTS: number;
  madeFT: number;
  attemptFT: number;
  offRebound: number;
  defRebound: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  points: number;
}
