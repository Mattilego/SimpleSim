const { merge } = require('webpack-merge');
const mainConfig = require('./webpack.main.js');
const rendererConfig = require('./webpack.renderer.js');
const serverConfig = require('./webpack.server.js');
const rendererAdvancedConfig = require('./webpack.renderer.advanced.js');

// Export all configs for different build scenarios
module.exports = [
  mainConfig,
  rendererConfig,
  serverConfig,
  rendererAdvancedConfig
];

// Individual exports for specific builds
module.exports.main = mainConfig;
module.exports.renderer = rendererConfig;
module.exports.server = serverConfig;
module.exports.rendererAdvanced = rendererAdvancedConfig;
