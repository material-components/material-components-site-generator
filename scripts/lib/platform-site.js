const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { JekyllFile } = require('./jekyll-file');
const { PLATFORM_CONFIG_PATH, BuildDir, FilePattern } = require('./project-paths');
const { sync: globSync } = require('glob');


const GLOB_OPTIONS = {
  ignore: ['**/node_modules/**'],
  dot: true,
};

class PlatformSite {
  constructor(repoPath) {
    this.repoPath = repoPath;
    this.config = readYaml(path.join(repoPath, PLATFORM_CONFIG_PATH));
    this.files_ = null;
  }

  get basepath() {
    return this.config.basepath;
  }

  get files() {
    if (!this.files_) {
      this.files_ = globSync(path.join(this.repoPath, FilePattern.JEKYLL_FILES), GLOB_OPTIONS)
          .map((filePath) => JekyllFile.readFromPath(filePath, this.repoPath))
          .filter((file) => file.isValidJekyll);
    }
    return this.files_;
  }

  get directoryPaths() {
    return globSync(path.join(this.repoPath, FilePattern.DOCS_DIRS), GLOB_OPTIONS);
  }

  prepareForBuild() {
    this.files.forEach((file) => this.processFile_(file));
    this.directoryPaths.forEach((path) => this.processDocsDirectory_(path));
  }

  processFile_(file) {
    if (!file.isValidJekyll) {
      return false;
    }

    file.uncommentHiddenCode();

    const fileMetadata = file.jekyllMetadata;
    if (fileMetadata.path) {
      this.applyPathRemapping_(file, fileMetadata.path);
    } else if (file.shouldBecomeIndex) {
      file.basename = 'index.md';
    }

    file.path = path.resolve(path.join(BuildDir.STAGE, this.basepath), file.relative);
    file.base = BuildDir.STAGE;
    file.write();
  }

  applyPathRemapping_(file, destPath) {
    if (destPath.endsWith('/')) {
      destPath += 'index.md';
    } else if (destPath.endsWith('.html')) {
      destPath = destPath.replace(/(.*)\.html$/, '$1.md');
    }

    file.base = '/';
    file.path = destPath;
  }

  processDocsDirectory_(docsDirPath) {
    const relativePath = path.relative(this.repoPath, docsDirPath);
    const newPath = path.resolve(path.join(BuildDir.STAGE, this.basepath), relativePath);
    fs.ensureDirSync(newPath);
    fs.copySync(docsDirPath, newPath);
  }
}


function readYaml(yamlPath) {
  return yaml.safeLoad(fs.readFileSync(yamlPath));
}


module.exports = {
  PlatformSite,
};
