const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.base.js');

module.exports = merge.smartStrategy(
  {
    'module.rules.use': 'prepend'
  }
)(common, {
  mode: 'production',
  entry: {
    app: ['aurelia-bootstrapper'],
  },
  stats: 'errors-only',
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          require.resolve('style-loader')
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      // NOTE(Jake): 2019-01-09
      // Without this, running "cypress open" doesn't work.
      maxChunks: 1,
    })
  ]
});
