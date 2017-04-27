const fs = require('fs-extra');
const { JekyllFile, FRONT_MATTER_DELIMITER } = require('./jekyll-file');


/**
 * The set of extensions to the Vinyl file interface.
 */
const BUILT_IN_PROPS = new Set([]);


/**
 * An alternative to the Front Matter delimiter, used to prevent the metadata
 * from rendering as a table on GitHub.
 */
const HIDDEN_FRONT_MATTER_PREFIX = '<!--docs:'
const HIDDEN_FRONT_MATTER_POSTFIX = '-->'


/**
 * Represents a documentation article source file.
 */
class DocumentationFile extends JekyllFile {
  constructor(fileInfo) {
    super(fileInfo);
  }

  /**
   * @inheritDoc
   */
  get isValidJekyll() {
    return super.isValidJekyll ||
           this.stringContents.startsWith(HIDDEN_FRONT_MATTER_PREFIX);
  }

  /**
   * Performs the transforms necessary to take a GitHub-formatted doc file
   * and format it for material.io/components.
   */
  prepareForDocSite() {
    let { stringContents: contents } = this;

    contents = this.uncommentMetadata_(contents);
    contents = this.uncommentJekyllSpecifics_(contents);
    contents = this.transformListItemStyles_(contents);
    contents = this.rewriteMarkdownLinks_(contents);

    this.stringContents = contents;
  }

  /**
   * Uncomments Front Matter metadata.
   */
  uncommentMetadata_(contents) {
    if (contents.includes(HIDDEN_FRONT_MATTER_PREFIX)) {
      contents = contents
          .replace(HIDDEN_FRONT_MATTER_PREFIX, FRONT_MATTER_DELIMITER)
          .replace(HIDDEN_FRONT_MATTER_POSTFIX, FRONT_MATTER_DELIMITER);
    }
    return contents;
  }

  /**
   * Uncomment liquid tags and HTML that are specific to Jekyll (and hidden
   * from GitHub).
   */
  uncommentJekyllSpecifics_(contents) {
    // Note that [^] matches any character including newlines, whereas "."
    // does not. For anyone who's wondering, [^] the negation of the empty
    // set.
    return contents.replace(/<!--([{<][^]*?[>}])-->/g, '$1');
  }

  /**
   * Move list item styling template tags into the correct position.
   *
   * Custom list item styling syntax had to be introduced so that the
   * template tags could be successfully commented out when displayed in
   * GitHub, which was not an option with the syntax supported by Jekyll.
   *
   * From:
   *     * This is a list item
   *       {: .list-item-css-class }
   * To:
   *     * {: .list-item-css-class } This is a list item
   */
  transformListItemStyles_(contents) {
    return contents.replace(
        /^(\s*)([*-])(\s+)([^\n]+)\n\1\s\3({:[^}]+})/gm, '$1$2 $5 $4');
  }

  /**
   * Rewrite links that point to markdown files to point to html files instead.
   */
  rewriteMarkdownLinks_(contents) {
    return contents.replace(/\[([^\]]+)\]\((.*)\.md\)/g, (match, p1, p2) => {
      return /^https?:\/\//.test(p2) ? match : `[${p1}](${p2}.html)`;
    });
  }

  /**
   * Reads the file at path, and constructs a new DocumentationFile instance
   * with its contents.
   */
  static readFromPath(filePath, base, encoding='utf8') {
    return new DocumentationFile({
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
  DocumentationFile,
};
