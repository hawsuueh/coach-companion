import { RandomForest } from './random-forest';
import { applyRules } from './rule-engine';
import { scoreExercises } from './content-matcher';
import { GameStats, AthleteProfile, Exercise, DataPoint } from './types';

export class RecommendationEngine {
  private forest: RandomForest;

  constructor(trainingData: DataPoint[]) {
    // We use more trees because we have more features now (11 vs 5)
    this.forest = new RandomForest(20);
    this.forest.train(trainingData);
  }

  generateTraining(
    last5Games: GameStats[],
    athlete: AthleteProfile,
    allExercises: Exercise[]
  ) {
    const count = last5Games.length || 1;

    // 1. Feature Engineering: Transforming raw stats into ML Features
    const avgStats = [
      last5Games.reduce((a, b) => a + b.points, 0) / count,
      last5Games.reduce((a, b) => a + b.assists, 0) / count,
      last5Games.reduce((a, b) => a + b.turnovers, 0) / count,
      last5Games.reduce(
        (a, b) => a + (b.offensive_rebounds + b.defensive_rebounds),
        0
      ) / count,
      last5Games.reduce((a, b) => a + b.steals, 0) / count,
      last5Games.reduce((a, b) => a + b.blocks, 0) / count,
      last5Games.reduce((a, b) => a + b.fouls, 0) / count,

      // Efficiency Feature: Are they missing shots they usually make? (Sign of fatigue)
      last5Games.reduce(
        (a, b) =>
          a +
          (b.field_goals_attempted > 0
            ? b.field_goals_made / b.field_goals_attempted
            : 0),
        0
      ) / count,

      // Volume Feature: Total physical engagement
      last5Games.reduce(
        (a, b) => a + (b.field_goals_attempted + b.free_throws_attempted),
        0
      ) / count,

      // Defensive Intensity: High steals/blocks/fouls usually mean high physical output
      last5Games.reduce((a, b) => a + (b.steals + b.blocks + b.fouls), 0) /
        count
    ];

    // 2. Random Forest Prediction
    const intensityLabel = this.forest.predict(avgStats);

    // 3. Rule Engine: Safety First (Remove injured body parts)
    const safeExercises = applyRules(allExercises, athlete);

    // 4. Content Matcher: Match to weaknesses (body_focus_scores)
    const ranked = scoreExercises(safeExercises, athlete, intensityLabel);

    // Return Top 8 most relevant exercises
    return ranked.slice(0, 8);
  }
}
