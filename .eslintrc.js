module.exports = {
    'env': {
      'browser': true,
      'es6': true
    },
    'extends': [
      'standard'
    ],
    'globals': {
      'Atomics': 'readonly',
      'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
      'ecmaVersion': 2018,
      'sourceType': 'module'
    },
    'rules': {
      "no-console": "off",
      "indent": [
        "error",
        2
      ],
      "linebreak-style": [
        "error",
        "unix"
      ],
      "quotes": [
        "error",
        "single"
      ],
      "semi": [
        "error",
        "always"
      ]
    }
  }