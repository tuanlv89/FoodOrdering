module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-use-before-define': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-underscore-dangle': 'off',
    'no-extra-boolean-cast': 'off',
    'react/destructuring-assignment': 'off',
    semi: 'off',
    'no-unused-expressions': 'off',
    'react/require-default-props': 'off',
    'no-plusplus': 'off',
    'react/no-access-state-in-setstate': 'off',
    'no-empty': 'off',
    'arrow-parens': 'off',
    'import/prefer-default-export': 'off',
    'object-curly-newline': 'off',
    'react/jsx-wrap-multilines': 'off',
    'react/sort-comp': 'off',
    'linebreak-style': 'off',
    'prefer-const': 'off',
    'react/no-unused-state': 'off',
    'react/jsx-boolean-value': 'off',
    'no-else-return': 'off',
    'no-lonely-if': 'off',
    'max-len': 'off',
  },
  globals: {
    fetch: false,
  },
  settings: {
    'import/resolver': {
      alias: [
        ['src', './src'],
        ['helpers', './src/helpers'],
        ['features', './src/features'],
        ['libraries', './src/libraries'],
        ['apis', './src/apis'],
        ['routers', './src/routers'],
        ['configs', './src/configs'],
        ['assets', './src/assets'],
        ['actions', './src/actions'],
        ['db', './db']
      ],
    }
  }
};
