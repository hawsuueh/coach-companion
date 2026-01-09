type BodypartScores = {
  upper_body: number;
  lower_body: number;
  core: number;
};

type Prediction = {
  focus: string;
  confidence: number;
};

type TreeResult = {
  vote: string;
};

// ---- Individual "decision trees" ----
function treeOne(scores: BodypartScores): TreeResult {
  if (scores.lower_body < 0.4) return { vote: 'LOWER_BODY' };
  if (scores.core < 0.4) return { vote: 'CORE' };
  return { vote: 'MAINTENANCE' };
}

function treeTwo(scores: BodypartScores): TreeResult {
  if (scores.upper_body < 0.4) return { vote: 'UPPER_BODY' };
  if (scores.lower_body < 0.5) return { vote: 'LOWER_BODY' };
  return { vote: 'MAINTENANCE' };
}

function treeThree(scores: BodypartScores): TreeResult {
  const min = Math.min(scores.upper_body, scores.lower_body, scores.core);

  if (min === scores.upper_body) return { vote: 'UPPER_BODY' };
  if (min === scores.lower_body) return { vote: 'LOWER_BODY' };
  return { vote: 'CORE' };
}

// ---- Random Forest wrapper ----
export function randomForestPredict(scores: BodypartScores): Prediction {
  console.log('🌲 Random Forest Input:', scores);

  const trees = [treeOne, treeTwo, treeThree];
  const votes: Record<string, number> = {};

  trees.forEach((tree, index) => {
    const result = tree(scores);
    console.log(`🌳 Tree ${index + 1} vote:`, result.vote);

    votes[result.vote] = (votes[result.vote] || 0) + 1;
  });

  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);

  const focus = sorted[0][0];
  const confidence = sorted[0][1] / trees.length;

  console.log('🗳 Vote count:', votes);
  console.log('🎯 Final focus:', focus);
  console.log('📊 Confidence:', confidence);

  return { focus, confidence };
}
