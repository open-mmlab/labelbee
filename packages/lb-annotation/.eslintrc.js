/*
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-15 11:45:52
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-27 23:06:16
 */
module.exports = {
  extends: ['airbnb', 'plugin:import/typescript', 'plugin:markdown/recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
    jasmine: true,
    jest: true,
    es6: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['babel', 'jest', '@typescript-eslint', 'unicorn', 'markdown', 'prettier'],
  // https://github.com/typescript-eslint/typescript-eslint/issues/46#issuecomment-470486034
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 2,
      },
    },
  ],
  rules: {
    'prettier/prettier': 2,
    'spaced-comment': 0,
    'import/extensions': 0,
    'import/no-cycle': 0,
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true, optionalDependencies: false, peerDependencies: false },
    ],
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/anchor-has-content': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    // label-has-for has been deprecated
    // https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/label-has-for.md
    'jsx-a11y/label-has-for': 0,

    'comma-dangle': ['error', 'always-multiline'],
    'consistent-return': 0, // TODO: remove later
    'no-param-reassign': 0, // TODO: remove later
    'no-underscore-dangle': 0,
    // for (let i = 0; i < len; i++)
    'no-plusplus': 0,
    // https://eslint.org/docs/rules/no-continue
    // labeledLoop is conflicted with `eslint . --fix`
    'no-continue': 0,
    // ban this for Number.isNaN needs polyfill
    'no-restricted-globals': 0,
    'max-classes-per-file': 0,

    'unicorn/better-regex': 2,
    'unicorn/prefer-string-trim-start-end': 2,
    'unicorn/expiring-todo-comments': 2,
    'unicorn/no-abusive-eslint-disable': 'off',

    // https://github.com/typescript-eslint/typescript-eslint/issues/2540#issuecomment-692866111
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': 2,
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': [2, { ignoreTypeValueShadow: true }],
    // https://github.com/typescript-eslint/typescript-eslint/issues/2528#issuecomment-689369395
    'no-undef': 0,
    'no-bitwise': 0,
    'class-methods-use-this': 0,
    'no-restricted-properties': 0,
    'no-multi-assign': 0,
    'import/prefer-default-export': 0,
    'no-restricted-syntax': 0, // TODO 后续严格限制
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'import/no-unresolved': [
      2,
      {
        ignore: ['^@/'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  globals: {
    gtag: true,
  },
};
