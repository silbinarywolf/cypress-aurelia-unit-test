// https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/preprocessors__typescript-webpack/cypress/plugins/index.js
const wp = require('@cypress/webpack-preprocessor');
const path = require('path');
const webpackOptions = require(path.resolve(__dirname, '../../webpack.config'));
if (!webpackOptions) {
  throw new Error('Missing webpack options.');
}

module.exports = (on) => {
  const options = {
    webpackOptions: webpackOptions,
  }
  on('file:preprocessor', wp(options))
}
