const deepcopy = require('deepcopy');
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
    const mergedConfig = deepcopy(this.siteConfig);

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
