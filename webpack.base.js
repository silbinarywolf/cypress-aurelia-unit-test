const path = require('path');
const { AureliaPlugin } = require('aurelia-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src', 'main.ts'),
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
              sourceMap: true,
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
        use: 'ts-loader',
        exclude: /node_modules/
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
      // NOTE: Jake: 2018-11-11
      // This should align with tsconfig.json "paths" where possible so that
      // IDE's can utilize tsconfig.json
      lib: path.resolve(__dirname, 'lib'),
      example: path.resolve(__dirname, 'src'),
    },
    modules: [
      path.resolve(__dirname, 'src'),
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
      //chunks: 'all'
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
