/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const chokidar = require('chokidar');
const { BuildDir, FilePatterns } = require('./project-paths');


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
  const watcher = chokidar.watch(BuildDir.JEKYLL, {
    ignoreInitial: true,
  });
  watcher
      .on('add', (path) => callback(path))
      .on('change', (path) => callback(path));
}


module.exports = {
  addWatchToWebpackConfig,
  setupFileWatches,
};
