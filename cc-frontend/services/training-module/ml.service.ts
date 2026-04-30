import supabase from '@/config/supabaseClient';
import { AthleteZScores } from '@/view-models/training-module/athlete-stats-zscore.vm';
import modelData from '@/ml/training-module/model.json';

export interface ExerciseDistribution {
  bodyPartId: number;
  count: number;
}

export class MLService {
  // --- HELPERS ---
  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance) || 0.0001;
  }

  private getPct(made: number, attempted: number): number {
    return attempted === 0 ? 0 : (made / attempted) * 100;
  }

  // --- PHASE 1: DATA PREPARATION ---
  async getAthleteZScores(athleteNo: number): Promise<AthleteZScores | null> {
    const { data: games } = await supabase
      .from('athlete_game')
      .select('*')
      .eq('athlete_no', athleteNo)
      .order('game_no', { ascending: false })
      .limit(6);

    if (!games || games.length < 6) return null;

    const currentGame = games[0];
    const historicalGames = games.slice(1);

    const statsToProcess = historicalGames.map(g => ({
      fg: this.getPct(g.field_goals_made, g.field_goals_attempted),
      p2: this.getPct(g.two_point_made, g.two_point_attempted),
      p3: this.getPct(g.three_point_made, g.three_point_attempted),
      ft: this.getPct(g.free_throws_made, g.free_throws_attempted),
      reb: g.offensive_rebounds + g.defensive_rebounds,
      ast: g.assists,
      stl: g.steals,
      blk: g.blocks,
      tov: g.turnovers
    }));

    const result: any = {};
    const keys = ['fg', 'p2', 'p3', 'ft', 'reb', 'ast', 'stl', 'blk', 'tov'];
    const statNames = [
      'field_goal_pct',
      'two_point_pct',
      'three_point_pct',
      'freethrow_pct',
      'rebounds',
      'assists',
      'steals',
      'blocks',
      'turnovers'
    ];

    keys.forEach((key, index) => {
      const history = statsToProcess.map(s => (s as any)[key]);
      const mean = this.calculateMean(history);
      const stdDev = this.calculateStdDev(history, mean);

      let currentVal: number;
      if (key === 'reb')
        currentVal =
          currentGame.offensive_rebounds + currentGame.defensive_rebounds;
      else if (key === 'fg')
        currentVal = this.getPct(
          currentGame.field_goals_made,
          currentGame.field_goals_attempted
        );
      else if (key === 'p2')
        currentVal = this.getPct(
          currentGame.two_point_made,
          currentGame.two_point_attempted
        );
      else if (key === 'p3')
        currentVal = this.getPct(
          currentGame.three_point_made,
          currentGame.three_point_attempted
        );
      else if (key === 'ft')
        currentVal = this.getPct(
          currentGame.free_throws_made,
          currentGame.free_throws_attempted
        );
      else
        currentVal = (currentGame as any)[
          key === 'ast'
            ? 'assists'
            : key === 'stl'
              ? 'steals'
              : key === 'blk'
                ? 'blocks'
                : 'turnovers'
        ];

      result[statNames[index]] = (currentVal - mean) / stdDev;
    });

    return result as AthleteZScores;
  }

  // --- PHASE 2: MACHINE LEARNING INFERENCE ---
  predictFatigue(zScores: AthleteZScores | null): number[] {
    // Fallback if not enough games
    if (!zScores) return [1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

    const inputVector = [
      zScores.field_goal_pct,
      zScores.two_point_pct,
      zScores.three_point_pct,
      zScores.freethrow_pct,
      zScores.rebounds,
      zScores.assists,
      zScores.steals,
      zScores.blocks,
      zScores.turnovers
    ];

    // Predict with all trees and average
    const allPredictions = (modelData as any[]).map(tree =>
      this.walkTree(tree.root, inputVector)
    );
    const finalFocus = [0, 0, 0, 0, 0, 0];

    allPredictions.forEach(pred => {
      pred.forEach((val: number, i: number) => (finalFocus[i] += val));
    });

    return finalFocus.map(sum => sum / allPredictions.length);
  }

  private walkTree(node: any, sample: number[]): number[] {
    if (node.value) return node.value;
    return sample[node.featureIndex] < node.threshold
      ? this.walkTree(node.left, sample)
      : this.walkTree(node.right, sample);
  }

  // --- PHASE 3: VOLUME DISTRIBUTION ---
  calculateDistribution(
    focusScores: number[],
    totalExercises: number
  ): ExerciseDistribution[] {
    const bodyPartIds = [1, 2, 3, 4, 5, 6]; // Chest, Back, Shoulders, Arms, Legs, Core
    const totalFocus = focusScores.reduce((a, b) => a + b, 0);

    // Initial allocation based on ratios
    let distributed = bodyPartIds.map((id, index) => ({
      bodyPartId: id,
      count: Math.round((focusScores[index] / totalFocus) * totalExercises)
    }));

    // Adjust for rounding issues to ensure it matches totalExercises exactly
    let currentSum = distributed.reduce((s, i) => s + i.count, 0);
    while (currentSum !== totalExercises) {
      if (currentSum < totalExercises) {
        const maxIdx = focusScores.indexOf(Math.max(...focusScores));
        distributed[maxIdx].count++;
        currentSum++;
      } else {
        const minIdx = distributed.findIndex(d => d.count > 0);
        distributed[minIdx].count--;
        currentSum--;
      }
    }
    return distributed;
  }
}
