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

const JEKYLL_CONFIG_PATH = '_config.yml';
const PLATFORM_CONFIG_PATH = '.mdc-docsite.yml';


module.exports = {
  BuildDir,
  FilePattern,
  ASSET_EXTENSIONS,
  JEKYLL_CONFIG_PATH,
  PLATFORM_CONFIG_PATH,
};
