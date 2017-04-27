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
   * Uncomments all Liquid/HTML code that was commented out as to not appear
   * in Github.
   */
  uncommentHiddenCode() {
    let { stringContents } = this;
    if (stringContents.includes(HIDDEN_FRONT_MATTER_PREFIX)) {
      stringContents = stringContents
          .replace(HIDDEN_FRONT_MATTER_PREFIX, FRONT_MATTER_DELIMITER)
          .replace(HIDDEN_FRONT_MATTER_POSTFIX, FRONT_MATTER_DELIMITER);
    }

    this.stringContents = stringContents
        // Uncomment liquid tags and HTML.
        //
        // Note that [^] matches any character including newlines, whereas "."
        // does not. For anyone who's wondering, [^] the negation of the empty
        // set.
        .replace(/<!--([{<][^]*?[>}])-->/g, '$1')
        // Move list item styling template tags into the correct position.
        //
        // Custom list item styling syntax had to be introduced so that the
        // template tags could be successfully commented out when displayed in
        // GitHub, which was not an option with the syntax supported by Jekyll.
        //
        // From:
        //     * This is a list item
        //       {: .list-item-css-class }
        // To:
        //     * {: .list-item-css-class } This is a list item
        //
        .replace(/^(\s*)([*-])(\s+)([^\n]+)\n\1\s\3({:[^}]+})/gm, '$1$2 $5 $4')
        // Rewrite links that point to markdown files to point to html files
        // instead.
        .replace(/\[([^\]]+)\]\((.*)\.md\)/g, (match, p1, p2) => {
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
