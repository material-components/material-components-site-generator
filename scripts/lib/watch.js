const chokidar = require('chokidar');
const { BuildDir, FilePatterns } = require('./conf');


function addWatchToWebpackConfig(webpackConfig) {
  if (!Array.isArray(webpackConfig)) {
    webpackConfig = [webpackConfig];
  }

  webpackConfig.forEach((config) => {
    Object.assign(config, {
      watch: true,
      watchOptions: /node_modules/,
    });
  });
}

function setupFileWatches(callback) {
  const watcher = chokidar.watch(BuildDir.JEKYLL);
  watcher
      .on('add', (path) => callback(path))
      .on('change', (path) => callback(path));
}


module.exports = {
  addWatchToWebpackConfig,
  setupFileWatches,
};
