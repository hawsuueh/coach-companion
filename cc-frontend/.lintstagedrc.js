module.exports = {
  // Type check TypeScript files
  '**/*.(ts|tsx)': () => 'yarn ts-check',

  // Lint & Prettify TS and JS files
  '**/*.(ts|tsx|js)': () => ['yarn lint:fix', 'yarn prettier:fix'],

  // Prettify only Markdown and JSON files
  '**/*.(md|json)': () => 'yarn prettier:fix'
};
