module.exports.BuildDir = {
  DIST: 'dist',
  JEKYLL: 'jekyll-site-src',
  STAGE: '.stage',
};

module.exports.FilePattern = {
  JEKYLL_FILES: '**/*.md',
  DOCS_DIRS: '**/docs/',
};

module.exports.ASSET_EXTENSIONS = new Set([
  'js', 'css', 'scss'
]);
