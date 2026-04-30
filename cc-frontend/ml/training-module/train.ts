import * as fs from 'fs';
import { RandomForest } from './rf-scratch';

// 1. Load the synthetic data
const rawData = JSON.parse(
  fs.readFileSync('./ml/training-module/training_data.json', 'utf8')
);

// 2. Separate Features (X) and Targets (Y)
const X = rawData.map((d: any) => [
  d.field_goal_pct,
  d.two_point_pct,
  d.three_point_pct,
  d.freethrow_pct,
  d.rebounds,
  d.assists,
  d.steals,
  d.blocks,
  d.turnovers
]);

const y = rawData.map((d: any) => [
  d.focus_chest,
  d.focus_back,
  d.focus_shoulders,
  d.focus_arms,
  d.focus_legs,
  d.focus_core
]);

// 3. Initialize and Train
const rf = new RandomForest(15, 8); // 15 trees
console.log('🛠️ Training Random Forest from scratch...');
rf.train(X, y);

// 4. Save the "Brain" to a JSON file
// We save the 'trees' array so the mobile app can load it later
fs.writeFileSync('./ml/training-module/model.json', JSON.stringify(rf.trees));
console.log('💾 Model saved to model.json');
