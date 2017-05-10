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

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');


class JazzyApiGenerator {
  constructor(siteRoot, projectRootPath) {
    this.siteRoot = siteRoot;
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
        --theme "${ this.projectRootPath }/ios-api-docs-src/theme" \
        --head '${ this.siteRoot }' \
        --use-safe-filenames`,

      {
        cwd: componentFile.originalDir,
        env: jazzyEnv,
        stdio: ['ignore', 'ignore', 'inherit'],
      });

    // Remove files that are not needed.
    fs.removeSync(path.join(apiDocsPath, 'index.html'));
    fs.removeSync(path.join(apiDocsPath, 'docsets'));
  }
}


module.exports = {
  JazzyApiGenerator,
};
