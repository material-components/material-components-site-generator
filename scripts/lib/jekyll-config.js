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

const _ = require('lodash');
const fs = require('fs-extra');
const yaml = require('js-yaml');


class JekyllConfiguration {
  constructor(siteConfigPath) {
    this.siteConfig = readYaml(siteConfigPath);
    this.platformConfigs = new Map();
  }

  addPlatformConfig(platformConfig) {
    this.validatePlatformConfig_(platformConfig);
    this.platformConfigs.set(platformConfig.basepath, platformConfig);

    return this;
  }

  validatePlatformConfig_(platformConfig) {
    if (!platformConfig.basepath) {
      throw new Error('Platform configs (.mdc-docs.yaml) require basepath fields.');
    }
  }

  write(outputPath) {
    const contents = this.getFileContents_();
    fs.writeFileSync(outputPath, contents, {
      encoding: 'utf8',
    });
  }

  getFileContents_() {
    return yaml.safeDump(this.mergeConfigs_())
  }

  mergeConfigs_() {
    const mergedConfig = _.cloneDeep(this.siteConfig);

    if (!mergedConfig['defaults']) {
      mergedConfig['defaults'] = [];
    }

    for (const [basepath, platformConfig] of this.platformConfigs) {
      mergedConfig['defaults'].push({
        scope: {
          path: this.sanitizeScopePath_(basepath),
        },
        values: platformConfig,
      });
    }

    return mergedConfig;
  }

  sanitizeScopePath_(path) {
    return path.trim().replace(/^\/?([^/]*)\//g, '$1');
  }
}


function readYaml(yamlPath) {
  return yaml.safeLoad(fs.readFileSync(yamlPath));
}


module.exports = {
  JekyllConfiguration,
};
