import CodeX from 'eslint-config-codex';

export default [
  ...CodeX,
  {
    ignorePatterns: ['dist', 'node_modules', '.github'],
    rules: {
      'jsdoc/no-undefined-types': 'off'
    }
  }
];
