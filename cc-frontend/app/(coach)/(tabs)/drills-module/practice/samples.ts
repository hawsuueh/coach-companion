import { StatKey, TrainingSample, Drill } from './randomForestAlgo';

export class SyntheticDataGenerator {
  /**
   * Helper to generate a random number following a Standard Normal Distribution 
   * (Mean 0, StdDev 1)
   * * @param drills - The list of valid drills from the database
   * @param statKeys - The performance metrics used for features
   * @param count - Number of samples to generate (default 250)
   */
  private standardNormal(): number {
    const u = 1 - Math.random();
    const v = 1 - Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  public generateSamples(
    drills: Drill[],
    statKeys: StatKey[],
    count: number = 250
  ): TrainingSample[] {
    const samples: TrainingSample[] = [];
    const drillCounts: Record<number, number> = {};
    const MIN_PER_DRILL = Math.max(3, Math.floor(count / Math.max(1, drills.length)));

    for (let i = 0; i < count; i++) {
      // 1. Pick 1-3 stats to be the "Attention Areas" (the problems)
      const selectedStats = statKeys
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      const features: Record<string, number> = {};

      // 2. Initialize ALL stats with "Average/Good" Z-scores (-1.5 to 0.5)
      // ensures the model learns what a healthy player looks like
      statKeys.forEach(k => {
        features[k] = parseFloat((this.standardNormal() * 0.5 - 0.5).toFixed(4));
      });

      // 3. Overwrite the Selected Stats with "High Attention" Z-scores (1.5 to 3.5)
      selectedStats.forEach((stat) => {
        features[stat] = parseFloat((Math.abs(this.standardNormal() * 0.5) + 1.8).toFixed(4));
      });

      // 4. Match drills
      const scoredDrills = drills
        .map(drill => {
          const overlap = drill.good_for.filter(s => selectedStats.includes(s)).length;
          // Add random jitter so ties (drills with same skills focus) are broken differently every time
          return { id: drill.id, overlap: overlap + Math.random() };
        })
        .filter(d => d.overlap >= 1) // Must have at least one real overlap
        .sort((a, b) => b.overlap - a.overlap);

      if (scoredDrills.length === 0) {
        if (Math.random() < 0.12 && drills.length > 0) {
          const rand = drills[Math.floor(Math.random() * drills.length)];
          samples.push({ features: features as any, labels: [rand.id] });
          drillCounts[rand.id] = (drillCounts[rand.id] || 0) + 1;
        }
        continue;
      }

      const top = scoredDrills.slice(0, 3).map(d => d.id);
      
      if (Math.random() < 0.2) {
        const extra = drills
          .map(d => ({ 
            id: d.id, 
            overlap: d.good_for.filter(s => features[s] > 1.5).length + Math.random() 
          }))
          .filter(d => d.overlap >= 1 && !top.includes(d.id))
          .sort((a, b) => b.overlap - a.overlap)[0];
        if (extra) top.push(extra.id);
      }

      samples.push({ features: features as any, labels: top });
      top.forEach(id => (drillCounts[id] = (drillCounts[id] || 0) + 1));
    }

    // 5. Minimal coverage loop
    for (const d of drills) {
      while ((drillCounts[d.id] || 0) < MIN_PER_DRILL) {
        const focus = d.good_for.length > 0 ? d.good_for[0] : statKeys[0];
        const features: Record<string, number> = {};
        statKeys.forEach(k => {
          features[k] = k === focus 
            ? parseFloat((Math.random() * 1.0 + 2.0).toFixed(4)) // High problem score
            : parseFloat((this.standardNormal() * 0.5 - 0.5).toFixed(4)); // Good score
        });
        samples.push({ features: features as any, labels: [d.id] });
        drillCounts[d.id] = (drillCounts[d.id] || 0) + 1;
      }
    }

    console.log(`Generated ${samples.length} samples. Coverage:`, drillCounts);
    return samples;
  }
}