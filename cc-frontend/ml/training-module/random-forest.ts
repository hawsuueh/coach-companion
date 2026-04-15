import { DecisionTree } from './decision-tree';
import { DataPoint } from './types';

export class RandomForest {
  private trees: DecisionTree[] = [];
  constructor(private numTrees: number = 10) {}

  train(data: DataPoint[]) {
    for (let i = 0; i < this.numTrees; i++) {
      const bootstrapSample = Array.from(
        { length: data.length },
        () => data[Math.floor(Math.random() * data.length)]
      );
      const tree = new DecisionTree(4);
      tree.train(bootstrapSample);
      this.trees.push(tree);
    }
  }

  predict(features: number[]): number {
    const votes = this.trees.map(t => t.predict(features));
    return (
      votes
        .sort(
          (a, b) =>
            votes.filter(v => v === a).length -
            votes.filter(v => v === b).length
        )
        .pop() ?? 1
    );
  }
}
