const path = require('path');
const fs = require('fs-extra');
const { BuildDir } = require('./project-paths');


function processJekyllFile(platformSite, file) {
  if (!file.isValidJekyll) {
    return false;
  }

  file.uncommentHiddenCode();
  if (file.shouldBecomeIndex) {
    file.basename = 'index.md';
  }

  file.path = path.resolve(path.join(BuildDir.STAGE, platformSite.basepath), file.relative);
  file.basedir = BuildDir.STAGE;
  file.write();
}

function processDocsDirectory(platformSite, docsDirPath) {
  const relativePath = path.relative(platformSite.repoPath, docsDirPath);
  const newPath = path.resolve(path.join(BuildDir.STAGE, platformSite.basepath), relativePath);
  fs.ensureDirSync(newPath);
  fs.copySync(docsDirPath, newPath);
}


module.exports = {
  processJekyllFile,
  processDocsDirectory,
};
