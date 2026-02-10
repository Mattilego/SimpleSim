const { merge } = require('webpack-merge');
const mainConfig = require('./webpack.main.js');
const rendererConfig = require('./webpack.renderer.js');
const serverConfig = require('./webpack.server.js');

// Export all configs for different build scenarios
module.exports = [
  mainConfig,
  rendererConfig,
  serverConfig
];

// Individual exports for specific builds
module.exports.main = mainConfig;
module.exports.renderer = rendererConfig;
module.exports.server = serverConfig;
