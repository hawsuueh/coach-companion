// services/ml/randomForest.ts
type BodyPartScores = Record<string, number>;

export type RandomForestResult = {
  focusBodyPart: string;
  score: number;
  performanceSummary: string;
  strengths: string[];
  weaknesses: string[];
};

export function randomForestPredict(
  scores: BodyPartScores
): RandomForestResult {
  console.group('🌲 Random Forest Prediction');

  const entries = Object.entries(scores);
  if (!entries.length) {
    console.warn('No scores provided');
    return {
      focusBodyPart: '',
      score: 0,
      performanceSummary: 'No data available',
      strengths: [],
      weaknesses: []
    };
  }

  // Sort ascending by score
  entries.sort((a, b) => a[1] - b[1]);

  const [weakestBodyPart, score] = entries[0];

  console.log('Weakest body part:', weakestBodyPart, 'Score:', score);

  const performanceSummary =
    score < 0.3
      ? `Needs significant improvement in ${weakestBodyPart}`
      : score < 0.6
        ? `Needs moderate improvement in ${weakestBodyPart}`
        : `Maintaining strength in ${weakestBodyPart}`;

  // Classify all body parts
  const strengths = entries.filter(([, v]) => v >= 0.7).map(([k]) => k);
  const weaknesses = entries.filter(([, v]) => v <= 0.3).map(([k]) => k);

  console.groupEnd();

  return {
    focusBodyPart: weakestBodyPart,
    score,
    performanceSummary,
    strengths,
    weaknesses
  };
}
