const path = require('path');

const { AureliaPlugin } = require('aurelia-webpack-plugin');

module.exports = {
  plugins: [],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
        include: [
          path.resolve('src')
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: require.resolve('css-modules-typescript-loader'),
            options: {
              mode: process.env.CI ? 'verify' : 'emit'
            }
          },
          {
            loader: require.resolve('css-loader'),
            options: {
              modules: true,
              localIdentName: '[name]__[local]',
            },
          },
          { 
            loader: require.resolve('sass-loader'),
            options: {
              implementation: require('sass'),
              includePaths: [
                path.resolve(__dirname, 'src')
              ]
            }
          }
        ],
      },
      {
        test: /\.tsx?$/,
        //exclude: path.resolve(__dirname, 'node_modules'),
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: [
      '.tsx', 
      '.ts',
      '.js'
    ],
    alias: {
      // NOTE(Jake): 2019-01-08
      // This needs to be aligned to TypeScript tsconfig "paths".
      // Alternatively, awesome-typescript-loader can be installed so this doesn't
      // need to be managed in two places.
      'cypress-aurelia-unit-test': path.resolve(__dirname, 'lib', 'index.ts'),
      '~':  path.resolve(__dirname, 'src'),
    },
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'lib'),
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new AureliaPlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};
