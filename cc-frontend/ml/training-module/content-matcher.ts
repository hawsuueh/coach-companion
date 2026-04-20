import { Exercise, AthleteProfile, DataPoint } from './types';

// Feature mapping used for both training and inference
export const STAT_KEYS = [
  'points',
  'assists',
  'turnovers',
  'rebounds',
  'steals',
  'blocks',
  'fouls',
  'fg_pct',
  'volume',
  'def_intensity'
];

export const scoreExercises = (
  exercises: Exercise[],
  athlete: AthleteProfile,
  predictedIntensity: number
): Exercise[] => {
  return exercises
    .map(ex => {
      let score = 0;

      // A: Intensity Match (from Random Forest)
      // 0: Recovery (Low Intensity), 1: Moderate, 2: Intense
      if (predictedIntensity === 0 && ex.intensity <= 4) score += 10;
      if (predictedIntensity === 1 && ex.intensity > 4 && ex.intensity < 7)
        score += 10;
      if (predictedIntensity === 2 && ex.intensity >= 7) score += 10;

      // B: Focus Match (Prioritize weaknesses)
      ex.bodypart_ids.forEach(id => {
        const strength = athlete.body_focus_scores[id] ?? 1.0;
        score += (1.0 - strength) * 15;
      });

      return { ...ex, matchScore: score };
    })
    .sort((a, b) => (b as any).matchScore - (a as any).matchScore);
};

// SYNTHETIC GENERATOR
export function generateSyntheticSamples(count = 250): DataPoint[] {
  const samples: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const features = Array(STAT_KEYS.length)
      .fill(0)
      .map(() => Math.random());

    // Heuristic: If stats are high (features[8] is volume), suggest label 2 (Intense)
    // If stats are low/fatigued (features[7] is low fg%), suggest label 0 (Recovery)
    let label = 1;
    if (features[8] > 0.8) label = 2;
    if (features[7] < 0.3) label = 0;

    samples.push({ features, label });
  }
  return samples;
}
