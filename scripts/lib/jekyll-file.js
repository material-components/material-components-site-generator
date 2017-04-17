const VinylFile = require('vinyl');
const fs = require('fs-extra');
const yaml = require('js-yaml');


const JEKYLL_README_PREFIX = '<!--docs:'
const FRONT_MATTER_DELIMITER = '---';

/**
 * The set of extensions to the Vinyl file interface.
 */
const BUILT_IN_PROPS = new Set([
  'isValidJekyll',
  'jekyllMetadata_',
  'jekyllMetadata',
  'shouldBecomeIndex',
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
   * @return {boolean} Whether this file begins with Front Matter metadata,
   *     which indicates that it should be processed by Jekyll.
   */
  get isValidJekyll() {
    const { stringContents } = this;
    return stringContents.startsWith(JEKYLL_README_PREFIX) ||
           stringContents.startsWith(FRONT_MATTER_DELIMITER);
  }

  /**
   * @return {boolean} Whether the file is intended to be used as index.html for
   *     its directory.
   */
  get shouldBecomeIndex() {
    return /(site-index|README)\.md$/.test(this.basename);
  }

  /**
   * Uncomments all Liquid/HTML code that was commented out as to not appear
   * in Github.
   */
  uncommentHiddenCode() {
    let { stringContents } = this;
    if (stringContents.includes(JEKYLL_README_PREFIX)) {
      stringContents = stringContents
          .replace(JEKYLL_README_PREFIX, FRONT_MATTER_DELIMITER)
          .replace(/-->/, FRONT_MATTER_DELIMITER)
    }

    this.stringContents = stringContents
        // Note that [^] matches any character including newlines, whereas "."
        // does not. For anyone who's wondering, [^] the negation of the empty
        // set.
        .replace(/<!--([{<][^]*?[>}])-->/g, '$1')
        // Rewrite links that point to markdown files to point to html files
        // instead.
        .replace(/\[([^\]]+)\]\((.*)\.md\)/g, (match, p1, p2) => {
          return /^https?:\/\//.test(p2) ? match : `[${p1}](${p2}.html)`;
        });
  }

  /**
   * Writes the file to disk, ensuring that its target directory exists.
   */
  write() {
    const { path, encoding, contents, stat: { mode } } = this;
    fs.ensureDirSync(this.dirname);
    fs.writeFileSync(path, contents, {
      encoding,
      mode,
    });
  }

  /**
   * Parses Front Matter (YAML) metadata out of the file header.
   */
  parseMetadata_() {
    const metadataMatch = this.stringContents.match(/^(---|<!--docs:)([^]*?)^(---|-->)/m);
    return metadataMatch && yaml.safeLoad(metadataMatch[2]);
  }

  /**
   * Reads the file at path, and constructs a new JekyllFile instance with its
   * contents.
   */
  static readFromPath(filePath, base, encoding='utf8') {
    return new JekyllFile({
      path: filePath,
      base,
      encoding,
      stat: fs.lstatSync(filePath),
      contents: fs.readFileSync(filePath),
    });
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
};
