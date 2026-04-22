const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  entry: './src/renderer/js/indexAdvanced.js',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundleAdvanced.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/advanced.html',
      filename: 'advanced.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styleAdvanced.css'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist/renderer')
    },
    port: 8080,
    hot: true
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
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      },
      {
        test: /\.json$/,
        type: 'json'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css']
  }
};
