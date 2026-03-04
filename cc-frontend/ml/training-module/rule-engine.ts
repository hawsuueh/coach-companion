import { Exercise, AthleteProfile } from './types';

export const applyRules = (
  exercises: Exercise[],
  athlete: AthleteProfile
): Exercise[] => {
  const blockedIds = new Set(athlete.injured_bodypart_ids);

  return exercises.filter(ex => {
    // 1. Injury Filter: If exercise hits an injured bodypart, REMOVE IT.
    const isInjured = ex.bodypart_ids.some(id => blockedIds.has(id));
    if (isInjured) return false;

    // 2. Position Rule: Centers might avoid high-impact plyometrics
    if (
      athlete.position === 'Center' &&
      ex.name.toLowerCase().includes('jump')
    ) {
      return false;
    }

    return true;
  });
};
