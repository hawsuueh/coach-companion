import { GameRecord } from "../game_records";

// Define a type alias for the keys of STAT_IMPACT
export type StatKey = keyof typeof STAT_IMPACT;

// Defines the directionality of each statistic:
// 1 = Higher is better (Positive Impact)
// -1 = Higher is worse (Negative Impact / Needs Attention when high)
const STAT_IMPACT: { [key: string]: number } = {
  FG_PCT: 1,
  _2PTS_PCT: 1,
  _3PTS_PCT: 1,
  FT_PCT: 1,
  REB: 1,
  assists: 1,
  steals: 1,
  blocks: 1,
  turnovers: -1,
  points: 1,
};

// Maps the internal stat keys to user-friendly display labels
const STAT_LABELS: { [key: string]: string } = {
  FG_PCT: "FG% Efficiency",
  _2PTS_PCT: "2PT% Efficiency",
  _3PTS_PCT: "3PT% Efficiency",
  FT_PCT: "FT% Efficiency",
  REB: "Rebounding (Total)",
  assists: "Assists",
  steals: "Steals (Defense)",
  blocks: "Blocks (Defense)",
  turnovers: "Turnovers",
  points: "Scoring (Points)",
};

// GameRecord to hold pre-calculated derived stats
interface AnalyzedGameRecord extends GameRecord {
  FG_PCT: number;
  _2PTS_PCT: number;
  _3PTS_PCT: number;
  FT_PCT: number;
  REB: number;
}

// Helper function to calculate mean
const calculateMean = (data: number[]): number =>
  data.length > 0 ? data.reduce((sum, val) => sum + val, 0) / data.length : 0;

// Helper function to calculate standard deviation
const calculateStdDev = (data: number[], mean: number): number => {
  if (data.length <= 1) return 0;
  const variance =
    data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (data.length - 1); // Sample standard deviation
  return Math.sqrt(variance);
};

// Define the common structure for score results
type ScoreResult = { stat: string; score: number };

/**
 * Calculates the top 3 areas needing attention and top 3 areas of excellence
 * for a given player based on the last N games, using z-scores.
 * * @param playerId The current player's ID.
 * @param allGameRecords All available game records for all players.
 * @param gamesLimit The number of recent games to analyze (CHART_GAMES_LIMIT).
 * @returns An object containing the top 3 attention areas (negative scores) and top 3 excellence areas (positive scores).
 */
export const analyzePlayerPerformance = (
  playerId: number,
  allGameRecords: GameRecord[],
  gamesLimit: number
): {
  attentionAreas: ScoreResult[];
  excellenceAreas: ScoreResult[];
} => {
  const allPlayerStats: { [key: string]: number[] } = {};

  // 1. Filter raw records for the last N games
  const maxGameId = Math.max(...allGameRecords.map((r) => r.game_id));
  const recentGameIds = Array.from(
    { length: gamesLimit },
    (_, i) => maxGameId - i
  ).filter((id) => id > 0);

  const recordsToAnalyze = allGameRecords.filter((r) =>
    recentGameIds.includes(r.game_id)
  );

  if (recordsToAnalyze.length === 0) {
    return { attentionAreas: [], excellenceAreas: [] };
  }

  // Pre calculate derived values (percentages and total rebounds)
  const analyzedRecords: AnalyzedGameRecord[] = recordsToAnalyze.map(
    (record) => ({
      ...record,
      FG_PCT: record.attemptFG > 0 ? record.madeFG / record.attemptFG : 0,
      _2PTS_PCT:
        record.attempt2PTS > 0 ? record.made2PTS / record.attempt2PTS : 0,
      _3PTS_PCT:
        record.attempt3PTS > 0 ? record.made3PTS / record.attempt3PTS : 0,
      FT_PCT: record.attemptFT > 0 ? record.madeFT / record.attemptFT : 0,
      REB: record.offRebound + record.defRebound,
    })
  );

  const playerAnalyzedRecords = analyzedRecords.filter(
    (r) => r.player_id === playerId
  );

  if (playerAnalyzedRecords.length === 0) {
    return { attentionAreas: [], excellenceAreas: [] };
  }

  // Initialize allPlayerStats with empty arrays
  Object.keys(STAT_IMPACT).forEach((stat) => {
    allPlayerStats[stat] = [];
  });

  // 2. Populate raw stat values for all players
  analyzedRecords.forEach((record) => {
    Object.keys(STAT_IMPACT).forEach((stat) => {
      const key = stat as StatKey;
      const value = record[key as keyof AnalyzedGameRecord] as number;
      allPlayerStats[stat].push(value);
    });
  });

  const leagueStats: {
    [key: string]: { mean: number; stdDev: number };
  } = {};

  // 3. Calculate Mean and Standard Deviation µ and σ
  Object.keys(STAT_IMPACT).forEach((stat) => {
    const data = allPlayerStats[stat];
    const mean = calculateMean(data);
    const stdDev = calculateStdDev(data, mean);
    leagueStats[stat] = { mean, stdDev };
  });

  // 4. Calculate Player's Average Performance x̄ in the last N games
  const playerAverages: { [key: string]: number } = {};
  Object.keys(STAT_IMPACT).forEach((stat) => {
    const key = stat as StatKey;
    const playerStatValues = playerAnalyzedRecords.map(
      (r) => r[key as keyof AnalyzedGameRecord] as number
    );
    playerAverages[stat] = calculateMean(playerStatValues);
  });

  // 5. Calculate Attention Score (A = Z * -I)
  const playerAttentionScores: ScoreResult[] = [];

  Object.keys(STAT_IMPACT).forEach((stat) => {
    const playerAvg = playerAverages[stat];
    const { mean, stdDev } = leagueStats[stat];
    const impact = STAT_IMPACT[stat];

    let Z_Score: number;

    if (stdDev === 0) {
      // Handle zero standard deviation: assign a subjective Z_Score if poor performance
      if (impact === 1 && playerAvg < mean)
        Z_Score = -2; // Below average for a good stat
      else if (impact === -1 && playerAvg > mean)
        Z_Score = 2; // Above average for a bad stat
      else Z_Score = 0;
    } else {
      Z_Score = (playerAvg - mean) / stdDev;
    }

    // Negative score means attention is needed.
    const Attention_Score = Z_Score * -impact;

    const statName = STAT_LABELS[stat];

    playerAttentionScores.push({ stat: statName, score: Attention_Score });
  });

  // 6. Sort and filter
  // Sort from worst score (most negative, attention needed) to best score (most positive, excelling)
  playerAttentionScores.sort((a, b) => a.score - b.score);

  // Extract negative scores (Attention Areas)
  const negativeScores = playerAttentionScores.filter((item) => item.score < 0);
  const attentionAreas = negativeScores.slice(0, 3);

  // Extract positive scores (Excellence Areas)
  const positiveScores = playerAttentionScores.filter((item) => item.score > 0);

  // Sort positive scores in descending order (highest score is best) and take top 3
  positiveScores.sort((a, b) => b.score - a.score);
  const excellenceAreas = positiveScores.slice(0, 3);

  return { attentionAreas, excellenceAreas };
};
