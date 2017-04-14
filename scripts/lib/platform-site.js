const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { JekyllFile } = require('./jekyll-file');
const { PLATFORM_CONFIG_PATH, FilePattern } = require('./project-paths');
const { sync: globSync } = require('glob');


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
      this.files_ = globSync(path.join(this.repoPath, FilePattern.JEKYLL_FILES))
          .map((filePath) => JekyllFile.readFromPath(filePath, this.repoPath));
    }
    return this.files_;
  }

  get directoryPaths() {
    return globSync(path.join(this.repoPath, FilePattern.DOCS_DIRS));
  }
}


function readYaml(yamlPath) {
  return yaml.safeLoad(fs.readFileSync(yamlPath));
}


module.exports = {
  PlatformSite,
};
