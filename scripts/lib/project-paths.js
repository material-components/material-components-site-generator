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

const path = require('path');


const BuildDir = {
  DIST: 'dist',
  JEKYLL: 'jekyll-site-src',
  STAGE: '.stage',
};

const FilePattern = {
  JEKYLL_FILES: '**/*.md',
  DOCS_DIRS: '**/docs/',
};

const ASSET_EXTENSIONS = new Set([
  '.js', '.css', '.scss'
]);

const CONTENT_ASSETS_PATH = 'images/content';
const JEKYLL_CONFIG_PATH = '_config.yml';
const PLATFORM_CONFIG_PATH = '.mdc-docsite.yml';
const PROD_SITE_ROOT = '/components';

module.exports = {
  BuildDir,
  FilePattern,
  ASSET_EXTENSIONS,
  CONTENT_ASSETS_PATH,
  JEKYLL_CONFIG_PATH,
  PLATFORM_CONFIG_PATH,
  PROD_SITE_ROOT,
};
