import { SyntheticGenerator } from './generator';

const gen = new SyntheticGenerator();

console.log('🚀 Initializing Synthetic Data Generation...');
console.log('📊 Logic: Multi-Output Focus Scores (Ratio-based)');

// Run it!
gen.generateDataset(1000);

console.log('📂 File saved: ./ml/training-module/training_data.json');
