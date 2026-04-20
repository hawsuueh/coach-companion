import { RandomForest } from './random-forest';
import { applyRules } from './rule-engine';
import { scoreExercises, generateSyntheticSamples } from './content-matcher';
import { GameStats, AthleteProfile, Exercise } from './types';

export class RecommendationEngine {
  private forest: RandomForest;

  constructor() {
    this.forest = new RandomForest(20);
    // Auto-train on initialization using synthetic data
    const trainingData = generateSyntheticSamples(300);
    this.forest.train(trainingData);
  }

  generateTraining(
    last5Games: GameStats[],
    athlete: AthleteProfile,
    allExercises: Exercise[]
  ): Exercise[] {
    const count = last5Games.length || 1;

    // 1. Feature Engineering (Must match the length/order of training data)
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
      // Efficiency
      last5Games.reduce(
        (a, b) =>
          a +
          (b.field_goals_attempted > 0
            ? b.field_goals_made / b.field_goals_attempted
            : 0),
        0
      ) / count,
      // Volume
      last5Games.reduce(
        (a, b) => a + (b.field_goals_attempted + b.free_throws_attempted),
        0
      ) / count,
      // Defensive Intensity
      last5Games.reduce((a, b) => a + (b.steals + b.blocks + b.fouls), 0) /
        count
    ];

    // 2. Random Forest Prediction (Returns 0, 1, or 2)
    const intensityLabel = this.forest.predict(avgStats);

    // 3. Rule Engine: Apply hard constraints (Injuries/Position)
    const safeExercises = applyRules(allExercises, athlete);

    // 4. Content Matcher: Scoring based on intensityLabel + body_focus_scores
    const ranked = scoreExercises(safeExercises, athlete, intensityLabel);

    return ranked.slice(0, 8);
  }
}
