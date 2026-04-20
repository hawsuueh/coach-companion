import { DecisionTree } from './decision-tree';
import { DataPoint } from './types';

export class RandomForest {
  private trees: DecisionTree[] = [];
  constructor(private numTrees: number = 10) {}

  train(data: DataPoint[]) {
    this.trees = []; // Clear old trees
    for (let i = 0; i < this.numTrees; i++) {
      const bootstrapSample = Array.from(
        { length: data.length },
        () => data[Math.floor(Math.random() * data.length)]
      );
      const tree = new DecisionTree(5); // Increased depth for 10 features
      tree.train(bootstrapSample);
      this.trees.push(tree);
    }
  }

  predict(features: number[]): number {
    if (this.trees.length === 0) return 1; // Default to Moderate

    const votes = this.trees.map(t => t.predict(features));

    // Find the Mode (most common vote)
    const frequency: Record<number, number> = {};
    votes.forEach(v => (frequency[v] = (frequency[v] || 0) + 1));

    return Number(
      Object.keys(frequency).reduce((a, b) =>
        frequency[Number(a)] > frequency[Number(b)] ? a : b
      )
    );
  }
}
