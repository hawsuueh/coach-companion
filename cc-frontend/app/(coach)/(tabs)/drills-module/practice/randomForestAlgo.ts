type StatKey = string;

type TrainingSample = {
  features: { [key in StatKey]: number }; // normalized attention scores
  labels: number[]; // drill IDs that worked well
};

type TreeNode = {
  feature?: StatKey;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number[]; // predicted drill IDs
};

function splitData(
  data: TrainingSample[],
  feature: StatKey,
  threshold: number
): { left: TrainingSample[]; right: TrainingSample[] } {
  const left = data.filter((d) => d.features[feature] <= threshold);
  const right = data.filter((d) => d.features[feature] > threshold);
  return { left, right };
}

function generateWeights(n: number): number[] {
  const base = [1.0, 0.7, 0.3, 0.2, 0.1];
  const slice = base.slice(0, n);
  const total = slice.reduce((sum, w) => sum + w, 0);
  return slice.map((w) => w / total); // normalize to sum = 1
}

function getDrillWeights(drill: { good_for: StatKey[] }): {
  [key in StatKey]?: number;
} {
  const tiers = {
    1: [1.0],
    2: [0.7, 0.3],
    3: [0.5, 0.3, 0.2],
  };
  const weights =
    tiers[drill.good_for.length as 1 | 2 | 3] ??
    generateWeights(drill.good_for.length);

  const result: { [key in StatKey]?: number } = {};
  drill.good_for.forEach((stat, i) => {
    result[stat] = weights[i] ?? 0;
  });
  return result;
}

function scoreDrillAgainstAttention(
  drill: { id: number; good_for: StatKey[] },
  attentionScores: { [key in StatKey]?: number }
): number {
  const weights = getDrillWeights(drill);
  let score = 0;
  for (const stat of drill.good_for) {
    const attention = attentionScores[stat] ?? 0;
    score += (weights[stat] ?? 0) * Math.abs(attention);
  }
  return score;
}

export function predictForestWeighted(
  forest: TreeNode[],
  input: { [key in StatKey]: number },
  drills: { id: number; good_for: StatKey[] }[]
): number[] {
  const rawVotes: { [id: number]: number } = {};
  forest.forEach((tree) => {
    predictTree(tree, input).forEach((id) => {
      rawVotes[id] = (rawVotes[id] || 0) + 1;
    });
  });

  const attentionScores = input;
  const drillMap = new Map(drills.map((d) => [d.id, d]));

  const scored = Object.entries(rawVotes)
    .map(([idStr, count]) => {
      const id = parseInt(idStr);
      const drill = drillMap.get(id);
      const relevance = drill
        ? scoreDrillAgainstAttention(drill, attentionScores)
        : 0;

      const coverageScore = drill
        ? drill.good_for.reduce(
            (sum, stat) => sum + (attentionScores[stat] ?? 0),
            0
          )
        : 0;

      return {
        id,
        score: count * relevance,
        coverageScore,
        good_for: drill?.good_for ?? [],
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // This represents the player's biggest weakness
  const maxAttention = Math.max(...Object.values(input), 0);

  // defines threshhold for stat urgency against biggest weakness (by 40%)
  const urgencyThreshold = maxAttention * 0.4;

  // Diversity-aware selection with attention weighting
  const selected: number[] = [];
  const coveredStats = new Set<StatKey>();

  for (const entry of scored) {
    // Check which stats this drill helps that aren't covered yet
    const newStats = entry.good_for.filter((stat) => !coveredStats.has(stat));

    // Calculate how urgent these "new" stats are
    const currentDrillUrgency = newStats.reduce(
      (sum, stat) => sum + (input[stat] || 0),
      0
    );

    /**
     * DIVERSITY LOGIC:
     * We select the drill if:
     * 1. It covers a brand new stat category.
     * 2. OR: It covers stats that are significantly high (Urgent) relative to the athlete's worst stat.
     * 3. OR: We haven't reached a minimum of 3 drills yet.
     */
    if (
      newStats.length > 0 ||
      currentDrillUrgency > urgencyThreshold ||
      selected.length < 3
    ) {
      selected.push(entry.id);
      newStats.forEach((stat) => coveredStats.add(stat));
    }

    if (selected.length >= 6) break;
  }

  return selected;
}

function giniImpurity(samples: TrainingSample[]): number {
  const labelCounts: { [id: number]: number } = {};
  samples.forEach((s) => {
    s.labels.forEach((id) => {
      labelCounts[id] = (labelCounts[id] || 0) + 1;
    });
  });

  const total = samples.length;
  let impurity = 1;
  for (const count of Object.values(labelCounts)) {
    const prob = count / total;
    impurity -= prob * prob;
  }
  return impurity;
}

function findBestSplit(
  samples: TrainingSample[],
  features: StatKey[]
): {
  feature: StatKey;
  threshold: number;
  score: number;
} | null {
  let bestScore = Infinity;
  let bestFeature: StatKey | null = null;
  let bestThreshold = 0;

  for (const feature of features) {
    const thresholds = Array.from(
      new Set(samples.map((s) => s.features[feature]))
    );
    for (const t of thresholds) {
      const { left, right } = splitData(samples, feature, t);
      const score =
        (left.length / samples.length) * giniImpurity(left) +
        (right.length / samples.length) * giniImpurity(right);
      if (score < bestScore) {
        bestScore = score;
        bestFeature = feature;
        bestThreshold = t;
      }
    }
  }

  return bestFeature
    ? { feature: bestFeature, threshold: bestThreshold, score: bestScore }
    : null;
}

function buildTree(
  samples: TrainingSample[],
  features: StatKey[],
  depth: number = 0,
  maxDepth: number = 5
): TreeNode {
  if (depth >= maxDepth || samples.length <= 1) {
    const labelCounts: { [id: number]: number } = {};
    samples.forEach((s) => {
      s.labels.forEach((id) => {
        labelCounts[id] = (labelCounts[id] || 0) + 1;
      });
    });
    const sorted = Object.entries(labelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => parseInt(id));
    return { prediction: sorted };
  }

  const split = findBestSplit(samples, features);
  if (!split) return buildTree(samples, features, maxDepth, maxDepth);

  const { left, right } = splitData(samples, split.feature, split.threshold);
  return {
    feature: split.feature,
    threshold: split.threshold,
    left: buildTree(left, features, depth + 1, maxDepth),
    right: buildTree(right, features, depth + 1, maxDepth),
  };
}
function predictTree(
  tree: TreeNode,
  input: { [key in StatKey]: number }
): number[] {
  if (tree.prediction) return tree.prediction;
  if (!tree.feature || tree.threshold === undefined) return [];

  const value = input[tree.feature] || 0;
  return value <= tree.threshold
    ? predictTree(tree.left!, input)
    : predictTree(tree.right!, input);
}

export function buildForest(
  samples: TrainingSample[],
  features: StatKey[],
  numTrees = 10
): TreeNode[] {
  const forest: TreeNode[] = [];
  for (let i = 0; i < numTrees; i++) {
    const subset = samples
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(samples.length * 0.8));
    forest.push(buildTree(subset, features));
  }
  return forest;
}

export function predictForest(
  forest: TreeNode[],
  input: { [key in StatKey]: number }
): number[] {
  const votes: { [id: number]: number } = {};
  forest.forEach((tree) => {
    predictTree(tree, input).forEach((id) => {
      votes[id] = (votes[id] || 0) + 1;
    });
  });

  return Object.entries(votes)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => parseInt(id));
}
