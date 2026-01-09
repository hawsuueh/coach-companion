type StatKey = string;

type TrainingSample = {
  features: { [key in StatKey]: number };
  labels: number[];
};

function generateSyntheticSamples(
  drills: { id: number; good_for: StatKey[] }[],
  statKeys: StatKey[],
  count = 250
): TrainingSample[] {
  const samples: TrainingSample[] = [];
  const statUsage: Record<StatKey, number> = Object.fromEntries(
    statKeys.map((key) => [key, 0])
  );

  for (let i = 0; i < count; i++) {
    // Randomly select 1–3 stat keys
    const selectedStats = statKeys
      .sort(() => 0.2 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1); // 1, 2, or 3

    // Update stat usage tracker
    selectedStats.forEach((stat) => {
      statUsage[stat]++;
    });

    // Assign normalized attention scores (0.2–1.0)
    const features: { [key in StatKey]?: number } = {};
    // Generate 2–3 random scores between 0.2 and 1.0
    const rawScores = Array(selectedStats.length)
      .fill(0)
      .map(() => parseFloat((Math.random() * 0.8 + 0.2).toFixed(4)))
      .sort((a, b) => b - a); // Sort descending

    // Assign scores to selected stats in order
    selectedStats.forEach((stat, index) => {
      features[stat] = rawScores[index];
    });

    // Match drills by relevance (number of overlapping stat keys)
    const labels = drills
      .map((drill) => {
        const overlap = drill.good_for.filter((stat) =>
          selectedStats.includes(stat)
        );
        return { id: drill.id, score: overlap.length };
      })
      .filter((d) => d.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((d) => d.id);

    if (labels.length > 0) {
      samples.push({ features: features as any, labels });
    }
  }

  return samples;
}

export { generateSyntheticSamples };
