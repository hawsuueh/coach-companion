// PerformanceAnalyzer.ts
import { GameRecord } from '../game_records';

// Define a type alias for the keys of STAT_IMPACT
export type StatKey = keyof typeof PerformanceAnalyzer.STAT_IMPACT;

// Define the common structure for score resultsw
export interface ScoreResult {
  stat: string;
  score: number;
}

// GameRecord to hold pre-calculated derived stats
interface AnalyzedGameRecord extends GameRecord {
  FG_PCT: number;
  _2PTS_PCT: number;
  _3PTS_PCT: number;
  FT_PCT: number;
  REB: number;
}

export class PerformanceAnalyzer {
  // Defines the directionality of each statistic:
  // 1 = Higher is better (Positive Impact)
  // -1 = Higher is worse (Negative Impact / Needs Attention when high)
  public static readonly STAT_IMPACT = {
    FG_PCT: 1,
    _2PTS_PCT: 1,
    _3PTS_PCT: 1,
    FT_PCT: 1,
    REB: 1,
    assists: 1,
    steals: 1,
    blocks: 1,
    turnovers: -1,
    points: 1
  };

  // Maps the internal stat keys to user-friendly display labels
  private static readonly STAT_LABELS: Record<string, string> = {
    FG_PCT: 'FG% Efficiency',
    _2PTS_PCT: '2PT% Efficiency',
    _3PTS_PCT: '3PT% Efficiency',
    FT_PCT: 'FT% Efficiency',
    REB: 'Rebounding (Total)',
    assists: 'Assists',
    steals: 'Steals (Defense)',
    blocks: 'Blocks (Defense)',
    turnovers: 'Turnovers',
    points: 'Scoring (Points)'
  };

  /**
   * Calculates the top 3 areas needing attention and top 3 areas of excellence
   * for a given player based on the last N games, using z-scores.
   * @param playerId The current player's ID.
   * @param allGameRecords All available game records for all players.
   * @param gamesLimit The number of recent games to analyze (CHART_GAMES_LIMIT).
   * @returns An object containing the top 3 attention areas (negative scores) and top 3 excellence areas (positive scores).
   */
  public analyzePlayerPerformance(
    playerId: number,
    allGameRecords: GameRecord[],
    gamesLimit: number
  ): { attentionAreas: ScoreResult[]; excellenceAreas: ScoreResult[] } {
    // 1. Filter raw records for the last N games
    const maxGameId = Math.max(...allGameRecords.map(r => r.game_id));
    const recentGameIds = Array.from(
      { length: gamesLimit },
      (_, i) => maxGameId - i
    ).filter(id => id > 0);
    const recordsToAnalyze = allGameRecords.filter(r =>
      recentGameIds.includes(r.game_id)
    );

    if (recordsToAnalyze.length === 0)
      return { attentionAreas: [], excellenceAreas: [] };

    // 2. Pre-calculate derived values (percentages and total rebounds)
    const analyzedRecords: AnalyzedGameRecord[] = recordsToAnalyze.map(
      record => ({
        ...record,
        FG_PCT: record.attemptFG > 0 ? record.madeFG / record.attemptFG : 0,
        _2PTS_PCT:
          record.attempt2PTS > 0 ? record.made2PTS / record.attempt2PTS : 0,
        _3PTS_PCT:
          record.attempt3PTS > 0 ? record.made3PTS / record.attempt3PTS : 0,
        FT_PCT: record.attemptFT > 0 ? record.madeFT / record.attemptFT : 0,
        REB: record.offRebound + record.defRebound
      })
    );

    const playerRecords = analyzedRecords.filter(r => r.player_id === playerId);
    if (playerRecords.length === 0)
      return { attentionAreas: [], excellenceAreas: [] };

    // 3. Calculate League & Player Averages
    const playerAttentionScores: ScoreResult[] = [];
    const statKeys = Object.keys(
      PerformanceAnalyzer.STAT_IMPACT
    ) as (keyof typeof PerformanceAnalyzer.STAT_IMPACT)[];

    const MIN_GAMES = 2; // require at least 2 games to include a player in population, useful to avoid 1 game players skewing results

    // Build per-player aggregates mean and count
    const perPlayerAgg = new Map<number, { count: number; means: Record<string, number> }>();
    analyzedRecords.forEach(r => {
      const entry = perPlayerAgg.get(r.player_id) || { count: 0, means: {} as Record<string, number> };
      entry.count++;
      // accumulate sums for stats
      Object.keys(PerformanceAnalyzer.STAT_IMPACT).forEach((stat) => {
        const s = stat as keyof typeof PerformanceAnalyzer.STAT_IMPACT;
        entry.means[s] = (entry.means[s] || 0) + (r as any)[s];
      });
      perPlayerAgg.set(r.player_id, entry);
    });
    // finalize means
    perPlayerAgg.forEach(entry => {
      Object.keys(entry.means).forEach(k => (entry.means[k] = entry.means[k] / entry.count));
    });

    statKeys.forEach(stat => {
      // allValues = per-player means for players with enough games
      const allValues = Array.from(perPlayerAgg.values())
        .filter(e => e.count >= MIN_GAMES)
        .map(e => e.means[stat as string]);

      // player per-game values for this stat
      const playerValues = playerRecords.map(r => (r as any)[stat]);

      if (allValues.length === 0 || playerValues.length === 0) {
        playerAttentionScores.push({
          stat: PerformanceAnalyzer.STAT_LABELS[stat],
          score: 0
        });
        return;
      }

      const mean = this.calculateMean(allValues);
      const stdDev = this.calculateStdDev(allValues, mean);
      const playerAvg = this.calculateMean(playerValues);
      const impact = PerformanceAnalyzer.STAT_IMPACT[stat];

      let zScore =
        stdDev === 0
          ? 0
          : (playerAvg - mean) / stdDev;

      playerAttentionScores.push({
        stat: PerformanceAnalyzer.STAT_LABELS[stat],
        score: zScore * -impact
      });
    });

    // 5. Sort and filter results
    return {
      attentionAreas: [...playerAttentionScores]
        .filter(i => i.score > 0) // Positive = Needs Work
        .sort((a, b) => b.score - a.score), // Sort highest score to top
      excellenceAreas: [...playerAttentionScores]
        .filter(i => i.score < 0) // Negative = Excelling
        .sort((a, b) => a.score - b.score) 
    };
  }

  // Helper function to calculate mean
  private calculateMean(data: number[]): number {
    return data.length > 0
      ? data.reduce((sum, val) => sum + val, 0) / data.length
      : 0;
  }

  // Helper function to calculate standard deviation (Sample StdDev)
  private calculateStdDev(data: number[], mean: number): number {
    if (data.length <= 1) return 0;
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      (data.length - 1);
    return Math.sqrt(variance);
  }
}
