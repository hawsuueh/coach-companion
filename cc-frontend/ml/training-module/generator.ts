import * as fs from 'fs';

interface TrainingRow {
  // Inputs (Z-Scores)
  field_goal_pct: number;
  two_point_pct: number;
  three_point_pct: number;
  freethrow_pct: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  // Outputs (Focus Scores for each Body Part)
  focus_chest: number;
  focus_back: number;
  focus_shoulders: number;
  focus_arms: number;
  focus_legs: number;
  focus_core: number;
}

export class SyntheticGenerator {
  private randomZ(): number {
    return parseFloat((Math.random() * 6 - 3).toFixed(2));
  }

  generateDataset(rowCount: number = 5000) {
    const dataset: TrainingRow[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: any = {
        field_goal_pct: this.randomZ(),
        two_point_pct: this.randomZ(),
        three_point_pct: this.randomZ(),
        freethrow_pct: this.randomZ(),
        rebounds: this.randomZ(),
        assists: this.randomZ(),
        steals: this.randomZ(),
        blocks: this.randomZ(),
        turnovers: this.randomZ(),
        // Initialize focus scores at 0
        focus_chest: 0,
        focus_back: 0,
        focus_shoulders: 0,
        focus_arms: 0,
        focus_legs: 0,
        focus_core: 0
      };

      // APPLY YOUR FORMULA:
      // We only care about negative performance (where Z < 0)
      // If a stat is bad, we add its weight to the body part focus.

      const stats = [
        {
          val: row.field_goal_pct,
          weights: { focus_legs: 0.4, focus_arms: 0.4, focus_shoulders: 0.2 }
        },
        { val: row.rebounds, weights: { focus_legs: 0.7, focus_core: 0.3 } },
        { val: row.steals, weights: { focus_shoulders: 0.5, focus_core: 0.5 } },
        {
          val: row.two_point_pct,
          weights: { focus_legs: 0.5, focus_arms: 0.5 }
        },
        {
          val: row.three_point_pct,
          weights: { focus_legs: 0.6, focus_shoulders: 0.2, focus_arms: 0.2 }
        },
        {
          val: row.freethrow_pct,
          weights: { focus_arms: 0.6, focus_core: 0.2, focus_shoulders: 0.2 }
        },
        {
          val: row.assists,
          weights: { focus_arms: 0.6, focus_core: 0.2, focus_back: 0.2 }
        },
        { val: row.blocks, weights: { focus_legs: 0.6, focus_shoulders: 0.4 } },
        { val: row.turnovers, weights: { focus_core: 0.5, focus_arms: 0.5 } }
      ];

      stats.forEach(stat => {
        if (stat.val < 0) {
          // Only calculate focus for underperformance
          const magnitude = Math.abs(stat.val); // How bad was the stat?
          Object.entries(stat.weights).forEach(([part, weight]) => {
            row[part] += magnitude * weight;
          });
        }
      });

      // Rounding for clean data
      [
        'focus_chest',
        'focus_back',
        'focus_shoulders',
        'focus_arms',
        'focus_legs',
        'focus_core'
      ].forEach(p => {
        row[p] = parseFloat(row[p].toFixed(2));
      });

      dataset.push(row);
    }

    fs.writeFileSync(
      './ml/training-module/training_data.json',
      JSON.stringify(dataset, null, 2)
    );
    console.log(
      `✅ Success: Generated ${rowCount} rows with Multi-Output Focus Scores.`
    );
  }
}
