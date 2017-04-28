const VinylFile = require('vinyl');
const fs = require('fs-extra');
const yaml = require('js-yaml');


const FRONT_MATTER_DELIMITER = '---';
const FRONT_MATTER_PATTERN = /^(---|<!--docs:)([^]*?)^(---|-->)/m;


/**
 * The set of extensions to the Vinyl file interface.
 */
const BUILT_IN_PROPS = new Set([
  'isValidJekyll',
  'jekyllMetadata_',
  'jekyllMetadata',
  'stringContents',
]);


/**
 * A grab bag of convenience extensions to vinyl files for working with Jekyll.
 */
class JekyllFile extends VinylFile {
  constructor(fileInfo) {
    super(fileInfo);
  }

  /**
   * @return {string} The contents of this file as a string.
   */
  get stringContents() {
    return this.contents.toString();
  }

  /**
   * Sets the contents of the file from a string.
   */
  set stringContents(value) {
    this.contents = Buffer.from(value);
  }

  /**
   * @return {Object}
   */
  get jekyllMetadata() {
    if (!this.isValidJekyll) {
      return null;
    } else if (!this.jekyllMetadata_) {
      this.jekyllMetadata_ = this.parseMetadata_();
    }

    return this.jekyllMetadata_;
  }

  /**
   * Sets the Jekyll Front Matter metadata.
   */
  set jekyllMetadata(metadata) {
    this.jekyllMetadata_ = metadata;
  }

  /**
   * @return {boolean} Whether this file begins with Front Matter metadata,
   *     which indicates that it should be processed by Jekyll.
   */
  get isValidJekyll() {
    const { stringContents } = this;
    return stringContents.startsWith(FRONT_MATTER_DELIMITER);
  }

  /**
   * Writes the file to disk, ensuring that its target directory exists.
   */
  write() {
    // Always rewrite the page's metadata in case it's changed.
    this.applyMetadataChanges_();

    const { path, encoding, contents, stat: { mode } } = this;
    fs.ensureDirSync(this.dirname);
    fs.writeFileSync(path, contents, {
      encoding,
      mode,
    });
  }

  applyMetadataChanges_() {
    const { stringContents } = this;
    const metadataYaml = yaml.safeDump(this.jekyllMetadata_);
    if (!this.isValidJekyll) {
      this.stringContents = `---\n${metadataYaml}\n---\n${stringContents}`;
    } else {
      this.stringContents = stringContents.replace(FRONT_MATTER_PATTERN, `$1\n${metadataYaml}$3`);
    }
  }

  /**
   * Parses Front Matter (YAML) metadata out of the file header.
   */
  parseMetadata_() {
    const metadataMatch = this.stringContents.match(FRONT_MATTER_PATTERN);
    return metadataMatch && yaml.safeLoad(metadataMatch[2]);
  }

  /**
   * Required by Vinyl subclasses.
   */
  static isCustomProp(name) {
    return super.isCustomProp(name) && !BUILT_IN_PROPS.has(name);
  }
}


module.exports = {
  JekyllFile,
  FRONT_MATTER_DELIMITER,
};
