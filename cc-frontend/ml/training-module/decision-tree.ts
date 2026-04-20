import { DataPoint } from './types';

class Node {
  constructor(
    public featureIndex: number | null = null,
    public threshold: number | null = null,
    public left: Node | null = null,
    public right: Node | null = null,
    public value: number | null = null
  ) {}
}

export class DecisionTree {
  private root: Node | null = null;
  constructor(private maxDepth: number = 5) {}

  // Optimized Gini Impurity calculation
  private gini(labels: number[]): number {
    if (labels.length === 0) return 0;
    const counts: Record<number, number> = {};
    for (const label of labels) {
      counts[label] = (counts[label] || 0) + 1;
    }

    let impurity = 1;
    for (const count of Object.values(counts)) {
      const p = count / labels.length;
      impurity -= p * p;
    }
    return impurity;
  }

  // Helper to find the most common label in a list
  private getMostCommonLabel(labels: number[]): number {
    if (labels.length === 0) return 1; // Default fallback
    const counts: Record<number, number> = {};
    labels.forEach(l => (counts[l] = (counts[l] || 0) + 1));

    return Number(
      Object.keys(counts).reduce((a, b) =>
        counts[Number(a)] > counts[Number(b)] ? a : b
      )
    );
  }

  private buildTree(data: DataPoint[], depth: number): Node {
    const labels = data.map(d => d.label);

    // Stopping criteria: Pure node, max depth reached, or no data
    if (data.length === 0) return new Node(null, null, null, null, 1);

    if (new Set(labels).size === 1 || depth >= this.maxDepth) {
      return new Node(null, null, null, null, this.getMostCommonLabel(labels));
    }

    let bestGini = 1.1; // Start higher than possible Gini
    let bestSplit = { fIdx: 0, thresh: 0 };
    let groups: { left: DataPoint[]; right: DataPoint[] } | null = null;

    // Iterate through every feature
    for (let f = 0; f < data[0].features.length; f++) {
      // Use unique values to reduce unnecessary iterations
      const uniqueValues = Array.from(new Set(data.map(d => d.features[f])));

      for (const val of uniqueValues) {
        const left = data.filter(d => d.features[f] <= val);
        const right = data.filter(d => d.features[f] > val);

        if (left.length === 0 || right.length === 0) continue;

        const weightedGini =
          (left.length / data.length) * this.gini(left.map(l => l.label)) +
          (right.length / data.length) * this.gini(right.map(l => l.label));

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          bestSplit = { fIdx: f, thresh: val };
          groups = { left, right };
        }
      }
    }

    // If no beneficial split was found, create a leaf node
    if (!groups) {
      return new Node(null, null, null, null, this.getMostCommonLabel(labels));
    }

    return new Node(
      bestSplit.fIdx,
      bestSplit.thresh,
      this.buildTree(groups.left, depth + 1),
      this.buildTree(groups.right, depth + 1)
    );
  }

  train(data: DataPoint[]) {
    if (!data || data.length === 0) {
      console.error('DecisionTree Error: No training data provided.');
      return;
    }
    this.root = this.buildTree(data, 0);
  }

  predict(features: number[]): number {
    let node = this.root;

    // Traverse the tree until we reach a leaf node (node.value is not null)
    while (node && node.value === null) {
      if (node.featureIndex === null || node.threshold === null) break;

      node =
        features[node.featureIndex] <= node.threshold ? node.left : node.right;
    }

    return node?.value ?? 1;
  }
}
