const merge = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge.smartStrategy(
  {
    'module.rules.use': 'prepend'
  }
)(common, {
  entry: {
    app: ['aurelia-bootstrapper'],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader')
        ]
      },
    ]
  }
});
