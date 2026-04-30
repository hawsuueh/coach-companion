// 1. Data Structure for a Split Node
interface Node {
  featureIndex?: number;
  threshold?: number;
  left?: Node;
  right?: Node;
  value?: number[];
}

// 2. The Decision Tree (The "Worker")
class DecisionTree {
  root!: Node;
  constructor(
    private maxDepth: number = 7,
    private minSamples: number = 10
  ) {}

  train(features: number[][], targets: number[][]): Node {
    this.root = this.buildTree(features, targets, 0);
    return this.root;
  }

  private buildTree(X: number[][], y: number[][], depth: number): Node {
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;

    // Base Case: Stop if max depth reached or samples are too few
    if (depth >= this.maxDepth || numSamples <= this.minSamples) {
      return { value: this.calculateLeafValue(y) };
    }

    let bestSplit = { mse: Infinity, feature: -1, threshold: -1 };

    // Optimization: Only check a random subset of features per split (Standard RF logic)
    const featureIndices = Array.from({ length: numFeatures }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.sqrt(numFeatures)) + 1);

    for (const f of featureIndices) {
      const thresholds = X.map(row => row[f]);
      for (const t of thresholds) {
        const { leftY, rightY } = this.split(X, y, f, t);
        if (leftY.length === 0 || rightY.length === 0) continue;

        const currentMSE = this.calculateCombinedMSE(leftY, rightY);
        if (currentMSE < bestSplit.mse) {
          bestSplit = { mse: currentMSE, feature: f, threshold: t };
        }
      }
    }

    // If no good split was found, make it a leaf
    if (bestSplit.feature === -1) return { value: this.calculateLeafValue(y) };

    const { leftX, leftY, rightX, rightY } = this.split(
      X,
      y,
      bestSplit.feature,
      bestSplit.threshold
    );

    return {
      featureIndex: bestSplit.feature,
      threshold: bestSplit.threshold,
      left: this.buildTree(leftX, leftY, depth + 1),
      right: this.buildTree(rightX, rightY, depth + 1)
    };
  }

  private split(X: number[][], y: number[][], f: number, t: number) {
    const leftX: number[][] = [],
      leftY: number[][] = [],
      rightX: number[][] = [],
      rightY: number[][] = [];
    for (let i = 0; i < X.length; i++) {
      if (X[i][f] < t) {
        leftX.push(X[i]);
        leftY.push(y[i]);
      } else {
        rightX.push(X[i]);
        rightY.push(y[i]);
      }
    }
    return { leftX, leftY, rightX, rightY };
  }

  private calculateLeafValue(y: number[][]): number[] {
    const means = new Array(y[0].length).fill(0);
    for (const row of y) row.forEach((val, i) => (means[i] += val));
    return means.map(m => m / y.length);
  }

  private calculateCombinedMSE(left: number[][], right: number[][]): number {
    const mse = (data: number[][]) => {
      const mean = this.calculateLeafValue(data);
      return data.reduce(
        (acc, row) =>
          acc + row.reduce((s, v, i) => s + Math.pow(v - mean[i], 2), 0),
        0
      );
    };
    return mse(left) + mse(right);
  }

  predict(sample: number[], node: Node = this.root): number[] {
    if (node.value) return node.value;
    return sample[node.featureIndex!] < node.threshold!
      ? this.predict(sample, node.left!)
      : this.predict(sample, node.right!);
  }
}

// 3. The Random Forest (The "Boss")
export class RandomForest {
  trees: DecisionTree[] = [];
  constructor(
    private numTrees: number = 10,
    private maxDepth: number = 7
  ) {}

  train(X: number[][], y: number[][]) {
    for (let i = 0; i < this.numTrees; i++) {
      const tree = new DecisionTree(this.maxDepth);
      // Bootstrapping: Train on random 80% of data
      const subsetIndices = Array.from({ length: X.length }, () =>
        Math.floor(Math.random() * X.length)
      );
      const subX = subsetIndices.map(idx => X[idx]);
      const subY = subsetIndices.map(idx => y[idx]);
      tree.train(subX, subY);
      this.trees.push(tree);
      console.log(`🌲 Tree ${i + 1}/${this.numTrees} trained.`);
    }
  }

  predict(sample: number[]): number[] {
    const preds = this.trees.map(t => t.predict(sample));
    const finalMean = new Array(preds[0].length).fill(0);
    preds.forEach(p => p.forEach((val, i) => (finalMean[i] += val)));
    return finalMean.map(m => m / this.numTrees);
  }
}
