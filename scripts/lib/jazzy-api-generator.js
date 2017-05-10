const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');


class JazzyApiGenerator {
  constructor(projectRootPath) {
    this.projectRootPath = projectRootPath;
  }

  build(componentFile) {
    const apiDocsPath = path.join(componentFile.dirname, 'api-docs/');
    const jazzyEnv = Object.assign({}, process.env, {
      BUNDLE_GEMFILE: path.join(this.projectRootPath, 'GEMFILE'),
    });

    // Build the docs
    execSync(`bundle exec jazzy \
        --output "${ apiDocsPath }" \
        --theme "${ this.projectRootPath }/ios-api-docs-src/theme"`,
      {
        cwd: componentFile.originalDir,
        env: jazzyEnv,
        stdio: ['ignore', 'ignore', 'inherit'],
      });

    // Remove the index, since it contains the same as README.md.
    fs.removeSync(path.join(apiDocsPath, 'index.html'));
  }
}


module.exports = {
  JazzyApiGenerator,
};
