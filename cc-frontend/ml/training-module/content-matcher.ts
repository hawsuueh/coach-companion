import { Exercise, AthleteProfile } from './types';

export const scoreExercises = (
  exercises: Exercise[],
  athlete: AthleteProfile,
  predictedIntensity: number
): Exercise[] => {
  return exercises
    .map(ex => {
      let score = 0;

      // A: Intensity Match (from Random Forest)
      // If RF predicted label 0 (Recovery), low intensity (1-4) gets points.
      if (predictedIntensity === 0 && ex.intensity <= 4) score += 5;
      if (predictedIntensity === 2 && ex.intensity >= 7) score += 5;

      // B: Focus Match (from body_focus_scores)
      // We prioritize body parts with LOWER scores (weaknesses).
      ex.bodypart_ids.forEach(id => {
        const strength = athlete.body_focus_scores[id] ?? 1.0;
        score += (1.0 - strength) * 10; // High reward for training weaknesses
      });

      return { ...ex, matchScore: score };
    })
    .sort((a, b) => (b as any).matchScore - (a as any).matchScore);
};
