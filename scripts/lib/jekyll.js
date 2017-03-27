const chalk = require('chalk');


const JEKYLL_README_PREFIX = '<!--docs:'
const FRONT_MATTER_DELIMITER = '---';

function isJekyllMarkdown(file) {
  const { contents, path } = file;

  const hasFrontMatter =
      contents.startsWith(JEKYLL_README_PREFIX) ||
      contents.startsWith(FRONT_MATTER_DELIMITER);

  console.error(`├─ ${path} ${hasFrontMatter ? chalk.green('✓') : chalk.red('×')}`);

  return hasFrontMatter;
}

function liquifyMarkdown(file) {
  const { contents } = file;
  if (!contents.startsWith(JEKYLL_README_PREFIX)) {
    return;
  }

  file.contents = contents
      .replace(JEKYLL_README_PREFIX, FRONT_MATTER_DELIMITER)
      .replace(/-->/, FRONT_MATTER_DELIMITER)
      // Note that [^] matches any character including newlines, whereas "."
      // does not. For anyone who's wondering, [^] the negation of the empty
      // set.
      .replace(/<!--([{<][^]*?[>}])-->/g, '$1');
}

function isJekyllIndex(file) {
  return /\/(site-index|README)\.md$/.test(file.path);
}

function renameJekyllToIndex(file) {
  // TODO(shyndman): We shouldn't have to replace twice. Vinyl files will fix
  // this.
  file.path = file.path.replace(/\/(site-index|README)\.md$/, '/index.md');
  file.relativePath = file.relativePath.replace(/(\/|^)(site-index|README)\.md$/, '$1index.md');
}

module.exports = {
  isJekyllIndex,
  isJekyllMarkdown,
  liquifyMarkdown,
  renameJekyllToIndex
};
