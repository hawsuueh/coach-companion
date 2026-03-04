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

  private gini(labels: number[]): number {
    const unique = Array.from(new Set(labels));
    let impurity = 1;
    for (const l of unique) {
      const p = labels.filter(x => x === l).length / labels.length;
      impurity -= p * p;
    }
    return impurity;
  }

  private buildTree(data: DataPoint[], depth: number): Node {
    const labels = data.map(d => d.label);
    if (new Set(labels).size === 1 || depth >= this.maxDepth) {
      const mostCommon = labels
        .sort(
          (a, b) =>
            labels.filter(v => v === a).length -
            labels.filter(v => v === b).length
        )
        .pop()!;
      return new Node(null, null, null, null, mostCommon);
    }

    let bestGini = 1;
    let bestSplit = { fIdx: 0, thresh: 0 };
    let groups: { left: DataPoint[]; right: DataPoint[] } | null = null;

    for (let f = 0; f < data[0].features.length; f++) {
      const values = data.map(d => d.features[f]);
      for (const val of values) {
        const left = data.filter(d => d.features[f] <= val);
        const right = data.filter(d => d.features[f] > val);
        if (left.length === 0 || right.length === 0) continue;

        const g =
          (left.length / data.length) * this.gini(left.map(l => l.label)) +
          (right.length / data.length) * this.gini(right.map(l => l.label));

        if (g < bestGini) {
          bestGini = g;
          bestSplit = { fIdx: f, thresh: val };
          groups = { left, right };
        }
      }
    }

    if (!groups) return new Node(null, null, null, null, labels[0]);

    return new Node(
      bestSplit.fIdx,
      bestSplit.thresh,
      this.buildTree(groups.left, depth + 1),
      this.buildTree(groups.right, depth + 1)
    );
  }

  train(data: DataPoint[]) {
    this.root = this.buildTree(data, 0);
  }

  predict(features: number[]): number {
    let node = this.root;
    while (node && node.value === null) {
      node =
        features[node.featureIndex!] <= node.threshold!
          ? node.left
          : node.right;
    }
    return node?.value ?? 1;
  }
}
