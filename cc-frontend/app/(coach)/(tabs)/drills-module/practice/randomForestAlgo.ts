export type StatKey = string;

export interface TrainingSample {
  features: { [key in StatKey]: number };
  labels: number[];
}

export interface TreeNode {
  feature?: StatKey;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number[];
}

export interface Drill {
  id: number;
  good_for: StatKey[];
}

export class DrillRandomForest {
  private forest: TreeNode[] = [];

  constructor(forest?: TreeNode[]) {
    if (forest) this.forest = forest;
  }

  /**
   * Trains the forest using synthetic or real training samples.
   */
  public buildForest(
  samples: TrainingSample[],
  features: StatKey[],
  numTrees: number = 20,
  maxDepth: number = 5,
  maxFeatures: number | 'sqrt' | 'log2' = 'sqrt'
): void {
  this.forest = [];
  for (let i = 0; i < numTrees; i++) {
    // Bootstrap with replacement
    const subset: TrainingSample[] = [];
    for (let j = 0; j < samples.length; j++) {
      subset.push(samples[Math.floor(Math.random() * samples.length)]);
    }
    this.forest.push(this.buildTree(subset, features, 0, maxDepth, maxFeatures));
  }
}

  /**
   * Basic prediction: Returns drill IDs sorted by majority vote.
   */
  public predict(input: { [key in StatKey]: number }): number[] {
    const votes: Record<number, number> = {};

    this.forest.forEach(tree => {
      this.predictTree(tree, input).forEach(id => {
        votes[id] = (votes[id] || 0) + 1;
      });
    });

    return Object.entries(votes)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => parseInt(id));
  }

  /**
   * Advanced prediction: Combines forest votes with attention-score weighting
   * and diversity-aware selection.
   */
  public predictWeighted(
    input: { [key in StatKey]: number },
    drills: Drill[]
  ): number[] {
    const rawVotes: Record<number, number> = {};
    const drillMap = new Map(drills.map(d => [d.id, d]));

    // 1. Collect votes from all trees
    this.forest.forEach(tree => {
      this.predictTree(tree, input).forEach(id => {
        rawVotes[id] = (rawVotes[id] || 0) + 1;
      });
    });

    // 2. Score drills based on relevance to player's attention areas
    const scored = Object.entries(rawVotes)
      .map(([idStr, count]) => {
        const id = parseInt(idStr);
        const drill = drillMap.get(id);
        const relevance = drill
          ? this.scoreDrillAgainstAttention(drill, input)
          : 0;

        return {
          id,
          score: count * relevance,
          good_for: drill?.good_for ?? []
        };
      })
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    // 3. Apply Diversity Logic
    const maxAttention = Math.max(...Object.values(input), 0);
    const urgencyThreshold = maxAttention * 0.4;
    const selected: number[] = [];
    const coveredStats = new Set<StatKey>();

    for (const entry of scored) {
      const newStats = entry.good_for.filter(stat => !coveredStats.has(stat));
      const currentDrillUrgency = newStats.reduce(
        (sum, stat) => sum + (input[stat] || 0),
        0
      );

      if (
        newStats.length > 0 ||
        currentDrillUrgency > urgencyThreshold ||
        selected.length < 3
      ) {
        selected.push(entry.id);
        newStats.forEach(stat => coveredStats.add(stat));
      }

      if (selected.length >= 6) break;
    }

    return selected;
  }

  // --- Private Helper Methods (Tree Logic) ---

  private buildTree(
  samples: TrainingSample[],
  features: StatKey[],
  depth: number,
  maxDepth: number,
  maxFeatures: number | 'sqrt' | 'log2'
): TreeNode {
  if (depth >= maxDepth || samples.length <= 1) {
    const labelCounts: Record<number, number> = {};
    samples.forEach(s => {
      s.labels.forEach(id => {
        labelCounts[id] = (labelCounts[id] || 0) + 1;
      });
    });
    const sorted = Object.entries(labelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => parseInt(id));
    return { prediction: sorted };
  }

  const split = this.findBestSplit(samples, features, maxFeatures);
  if (!split) return { prediction: [] };

  const { left, right } = this.splitData(
    samples,
    split.feature,
    split.threshold
  );
  return {
    feature: split.feature,
    threshold: split.threshold,
    left: this.buildTree(left, features, depth + 1, maxDepth, maxFeatures),
    right: this.buildTree(right, features, depth + 1, maxDepth, maxFeatures)
  };
}

  private predictTree(
    tree: TreeNode,
    input: { [key in StatKey]: number }
  ): number[] {
    if (tree.prediction) return tree.prediction;
    if (!tree.feature || tree.threshold === undefined) return [];

    const value = input[tree.feature] || 0;
    return value <= tree.threshold
      ? this.predictTree(tree.left!, input)
      : this.predictTree(tree.right!, input);
  }

  private findBestSplit(
  samples: TrainingSample[],
  features: StatKey[],
  maxFeatures: number | 'sqrt' | 'log2'
) {
  const M = features.length;
  const k =
    typeof maxFeatures === 'number'
      ? Math.max(1, Math.min(maxFeatures, M))
      : maxFeatures === 'sqrt'
      ? Math.max(1, Math.floor(Math.sqrt(M)))
      : Math.max(1, Math.floor(Math.log2(M)));

  // sample k features without replacement
  const featShuffled = features.slice().sort(() => 0.5 - Math.random());
  const candidateFeatures = featShuffled.slice(0, k);

  let bestScore = Infinity;
  let bestFeature: StatKey | null = null;
  let bestThreshold = 0;

  for (const feature of candidateFeatures) {
    // gather unique candidate thresholds (unique feature values)
    const vals = Array.from(new Set(samples.map(s => s.features[feature]))).sort((a, b) => a - b);
    for (const t of vals) {
      const { left, right } = this.splitData(samples, feature, t);
      if (left.length === 0 || right.length === 0) continue;

      const score =
        (left.length / samples.length) * this.giniImpurity(left) +
        (right.length / samples.length) * this.giniImpurity(right);

      if (score < bestScore) {
        bestScore = score;
        bestFeature = feature;
        bestThreshold = t;
      }
    }
  }
  return bestFeature
    ? { feature: bestFeature, threshold: bestThreshold }
    : null;
}

  private giniImpurity(samples: TrainingSample[]): number {
    const labelCounts: Record<number, number> = {};
    let totalLabels = 0;

    samples.forEach(s => {
      s.labels.forEach(id => {
        labelCounts[id] = (labelCounts[id] || 0) + 1;
        totalLabels++;
      });
    });

    if (totalLabels === 0) return 0;
    let impurity = 1;
    for (const count of Object.values(labelCounts)) {
      const prob = count / totalLabels;
      impurity -= prob * prob;
    }
    return impurity;
  }

  private splitData(
    data: TrainingSample[],
    feature: StatKey,
    threshold: number
  ) {
    const left = data.filter(d => d.features[feature] <= threshold);
    const right = data.filter(d => d.features[feature] > threshold);
    return { left, right };
  }

  // --- Private Helper Methods (Weighting Logic) ---

  private scoreDrillAgainstAttention(
    drill: Drill,
    attentionScores: Record<StatKey, number>
  ): number {
    const weights = this.getDrillWeights(drill);
    let score = 0;
    for (const stat of drill.good_for) {
      const attention = attentionScores[stat] ?? 0;
      score += (weights[stat] ?? 0) * Math.max(0, attention);
    }
    return score;
  }

  private getDrillWeights(drill: Drill): Record<StatKey, number> {
    const tiers: Record<number, number[]> = {
      1: [1.0],
      2: [0.7, 0.3],
      3: [0.5, 0.3, 0.2]
    };

    const weights =
      tiers[drill.good_for.length] ||
      this.generateWeights(drill.good_for.length);
    const result: Record<StatKey, number> = {};
    drill.good_for.forEach((stat, i) => {
      result[stat] = weights[i] ?? 0;
    });
    return result;
  }

  private generateWeights(n: number): number[] {
    const base = [1.0, 0.7, 0.3, 0.2, 0.1];
    const slice = base.slice(0, n);
    const total = slice.reduce((sum, w) => sum + w, 0);
    return slice.map(w => w / total);
  }

  public getForestState(): TreeNode[] {
    return this.forest;
  }
}

export const drillForest = new DrillRandomForest();
