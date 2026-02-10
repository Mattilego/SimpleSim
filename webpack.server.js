const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/server/server.js',
  output: {
    path: path.resolve(__dirname, 'dist/server'),
    filename: 'server.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    express: 'commonjs express'
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
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
};
