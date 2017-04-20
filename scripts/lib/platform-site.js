const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { JekyllFile } = require('./jekyll-file');
const { PLATFORM_CONFIG_PATH, BuildDir, FilePattern } = require('./project-paths');
const { SectionNavigation } = require('./section-navigation');
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

  get filesBySection() {
    if (!this.filesBySection_) {
      this.filesBySection_ = this.files.reduce((map, file) => {
        const section = file.jekyllMetadata.section;
        if (!section) {
          return map;
        }

        if (!map.has(section)) {
          map.set(section, []);
        }

        map.get(section).push(file);
        return map;
      }, new Map);
    }

    return this.filesBySection_;
  }

  prepareForBuild() {
    this.files.forEach((file) => this.processFile_(file));
    this.directoryPaths.forEach((path) => this.processDocsDirectory_(path));
    this.buildNavigation_();
    this.files.forEach((file) => file.write());
  }

  processFile_(file) {
    if (!file.isValidJekyll) {
      return;
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

  buildNavigation_() {
    for (const [section, sectionFiles] of this.filesBySection) {
      const sectionNav = new SectionNavigation(section, this.basepath);
      for (const file of sectionFiles) {
        sectionNav.add(file);
      }

      // Apply application-specific tweaks to the navigation.
      const navItems = this.tweakNavigation_(sectionNav);

      // Now that we've constructed the navigation for this section, we write
      // it out to every file in the section that hasn't defined their own.
      for (const file of sectionFiles) {
        const metadata = file.jekyllMetadata;
        if (file.navigation) {
          continue;
        }

        metadata.navigation = navItems;
        // TODO(shyndman): You have to set this to write it back. That's weird.
        file.jekyllMetadata = metadata;
      }
    }
  }

  tweakNavigation_(sectionNav) {
    // TODO(shyndman): This is gross. Much better defined as part of the site's
    // configuration.
    switch (sectionNav.name) {
      case 'components':
      case 'docs':
        return sectionNav.items[0].children;

      default:
        return sectionNav.items;
    }
  }
}


function readYaml(yamlPath) {
  return yaml.safeLoad(fs.readFileSync(yamlPath));
}


module.exports = {
  PlatformSite,
};
