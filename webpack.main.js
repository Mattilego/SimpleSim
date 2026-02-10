const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: './src/main/electron.js',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'electron.js'
  },
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
        type: 'asset/resource',
        generator: {
          filename: 'data/[name][ext]'
        }
      }
    ]
  }
};
