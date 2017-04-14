const path = require('path');
const fs = require('fs-extra');
const { BuildDir } = require('./project-paths');


function processJekyllFile(file) {
  if (!file.isValidJekyll) {
    return false;
  }

  file.uncommentHiddenCode();
  if (file.shouldBecomeIndex) {
    file.basename = 'index.md';
  }

  file.path = path.resolve(BuildDir.STAGE, file.relative);
  file.basedir = BuildDir.STAGE;
  file.write();
}

function processSupplementaryDirectory(docsRepoPath, docsDirPath) {
  const relativePath = path.relative(docsRepoPath, docsDirPath);
  const newPath = path.resolve(BuildDir.STAGE, relativePath);
  fs.ensureDirSync(newPath);
  fs.copySync(docsDirPath, newPath);
}


module.exports = {
  processJekyllFile,
  processSupplementaryDirectory,
};
