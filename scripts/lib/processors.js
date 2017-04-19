const path = require('path');
const fs = require('fs-extra');
const { BuildDir } = require('./project-paths');


function processJekyllFile(platformSite, file) {
  if (!file.isValidJekyll) {
    return false;
  }

  file.uncommentHiddenCode();

  const fileMetadata = file.jekyllMetadata;
  if (fileMetadata.path) {
    applyPathRemapping(file, fileMetadata.path);
  } else if (file.shouldBecomeIndex) {
    file.basename = 'index.md';
  }

  file.path = path.resolve(path.join(BuildDir.STAGE, platformSite.basepath), file.relative);
  file.base = BuildDir.STAGE;
  file.write();
}

function processDocsDirectory(platformSite, docsDirPath) {
  const relativePath = path.relative(platformSite.repoPath, docsDirPath);
  const newPath = path.resolve(path.join(BuildDir.STAGE, platformSite.basepath), relativePath);
  fs.ensureDirSync(newPath);
  fs.copySync(docsDirPath, newPath);
}

function applyPathRemapping(file, destPath) {
  if (destPath.endsWith('/')) {
    destPath += 'index.md';
  } else if (destPath.endsWith('.html')) {
    destPath = destPath.replace(/(.*)\.html$/, '$1.md');
  }

  file.base = '/';
  file.path = destPath;
}


module.exports = {
  processJekyllFile,
  processDocsDirectory,
};
