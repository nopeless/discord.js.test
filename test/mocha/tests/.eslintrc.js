'use strict';

// This is just to not generate errors
// you should use the mocha plugin for eslint
module.exports = {
  rules: {
    'prefer-arrow-callback': 0,
    'func-names': 0,
    'mocha/no-hooks-for-single-case': 0,
  },
  globals: {
    it: 'readonly',
    describe: 'readonly',
    before: 'readonly',
    after: 'readonly',
  },
};
