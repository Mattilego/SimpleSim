const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: './src/main/electron.js',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'electron.js'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/main/preload.js',
          to: 'preload.js'
        }
      ]
    })
  ],
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    electron: 'commonjs electron'
  },
  resolve: {
    extensions: ['.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.json$/,
        type: 'json'
      }
    ]
  }
};
