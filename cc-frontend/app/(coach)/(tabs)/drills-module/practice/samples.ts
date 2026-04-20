// samples.ts
import { StatKey, TrainingSample, Drill } from './randomForestAlgo';

export class SyntheticDataGenerator {
  /**
   * Generates dynamic training data based on available drills and stat categories.
   * This allows the Random Forest to adapt whenever new drills are added to the DB.
   * * @param drills - The list of valid drills from the database
   * @param statKeys - The performance metrics used for features
   * @param count - Number of samples to generate (default 250)
   */
  public generateSamples(
    drills: Drill[],
    statKeys: StatKey[],
    count: number = 250
  ): TrainingSample[] {
    const samples: TrainingSample[] = [];

    for (let i = 0; i < count; i++) {
      // 1. Randomly select 1–3 stat keys for this sample
      const selectedStats = [...statKeys]
        .sort(() => 0.2 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      // 2. Generate normalized attention scores (0.2–1.0)
      // We sort them descending to simulate a "primary" and "secondary" focus
      const features: Record<string, number> = {};
      const rawScores = Array(selectedStats.length)
        .fill(0)
        .map(() => parseFloat((Math.random() * 0.8 + 0.2).toFixed(4)))
        .sort((a, b) => b - a);

      selectedStats.forEach((stat, index) => {
        features[stat] = rawScores[index];
      });

      // 3. Match drills by relevance (overlap between drill focus and sample stats)
      const labels = drills
        .map(drill => {
          const overlap = drill.good_for.filter(stat =>
            selectedStats.includes(stat)
          );
          return { id: drill.id, score: overlap.length };
        })
        .filter(d => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(d => d.id);

      // Only add samples that actually have relevant drill labels
      if (labels.length > 0) {
        samples.push({ features: features as any, labels });
      }
    }

    return samples;
  }
}
