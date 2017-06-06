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
const patterns = require('./patterns');
const url = require('url');
const { JekyllFile, FRONT_MATTER_DELIMITER } = require('./jekyll-file');


/**
 * The set of extensions to the Vinyl file interface.
 */
const BUILT_IN_PROPS = new Set([
  'localLinkTemplateVars',
  'originalPath',
  'originalDir',
  'prepared_',
]);


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

    this.prepared_ = false;

    /**
     * A mapping of template variables to repo local links that have been found
     * in the documentation. The links can then be modified at any time prior to
     * the file being written to have the changes be reflected in the output.
     * @type {!Map<string, string>}
     */
    this.localLinkTemplateVars = new Map();

    /**
     * The original path to the documentation markdown.
     */
    this.originalPath = this.path;

    /**
     * The original directory of the documentation markdown. This is used later
     * for rewriting local links, and should not be modified.
     * @const {string}
     */
    this.originalDir = this.dirname;
  }

  /**
   * @inheritDoc
   */
  get isValidJekyll() {
    return super.isValidJekyll ||
           this.stringContents.startsWith(HIDDEN_FRONT_MATTER_PREFIX);
  }

  /**
   * @return {boolean} true if file marks the root folder where API
   *     documentation should be generated.
   */
  get isApiDocRoot() {
    return !!this.jekyllMetadata.api_doc_root;
  }

  /**
   * @return {string} The name of this file's section. Currently the only
   *     options are
   */
  get section() {
    return this.jekyllMetadata.section || 'none';
  }

  /**
   * Returns the virtual source path – that is, a path in the source repository
   * that this file pretends to live at, so that it may satisfy local links in
   * the Markdown.
   */
  get virtualSourcePath() {
    return this.jekyllMetadata.virtual_source_path || null;
  }

  /**
   * Performs the transforms necessary to take a GitHub-formatted doc file
   * and format it for material.io/components.
   */
  prepareForDocSite() {
    if (this.prepared_) {
      return;
    }

    let { stringContents: contents } = this;

    contents = this.uncommentMetadata_(contents);
    contents = this.uncommentJekyllSpecifics_(contents);
    contents = this.transformListItemStyles_(contents);
    contents = this.templatizeLocalLinks_(contents);
    this.stringContents = contents;

    this.prepareMetadata_();
    this.prepared_ = true;
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
   * or
   *     * This is
   *       a list item
   *       {: .list-item-css-class }
   * To:
   *     * {: .list-item-css-class } This is a list item
   */
  transformListItemStyles_(contents) {
    return contents.replace(
        /^(\s*)([*-])(\s+)([^\n]*\n(?:\1\s\3[^\n]*\n)*)^\1\s\3({:[^}]+}\n?)/gm,
        '$1$2 $5  $4');
  }

  /**
   * Searches through the provided contents for relative hrefs and srcs, and
   * replaces them with liquid template variable references. A mapping of
   */
  templatizeLocalLinks_(contents) {
    contents = contents.replace(patterns.newMarkdownLinkPattern(), (_, text, url, title='') => {
      return `[${ text }](${ this.templatizeLinkIfLocal_(url) }${ title })`;
    });
    contents = contents.replace(patterns.newHrefPattern(), (_, url) => {
      return `href="${ this.templatizeLinkIfLocal_(url) }"`;
    });
    contents = contents.replace(patterns.newSrcPattern(), (_, url) => {
      return `src="${ this.templatizeLinkIfLocal_(url) }"`;
    });

    return contents;
  }

  templatizeLinkIfLocal_(capturedUrl) {
    const parsedUrl = url.parse(capturedUrl);
    // We don't rewrite qualified URLs or hash links.
    // TODO(shyndman): What if this is a qualified link?
    if (parsedUrl.host || parsedUrl.href[0] == '#') {
      return capturedUrl;
    }

    const varName = `link_${ this.localLinkTemplateVars.size }`;
    this.localLinkTemplateVars.set(varName, capturedUrl);

    return `{{ page.local_links.${varName} }}`;
  }

  /**
   * Makes any necessary metadata tweaks during file preparation.
   */
  prepareMetadata_() {
    if (this.jekyllMetadata.iconId) {
      this.jekyllMetadata.icon_id = this.jekyllMetadata.iconId;
    }
  }

  /**
   * @inheritDoc
   */
  write() {
    this.jekyllMetadata.local_links = stringMapToObject(this.localLinkTemplateVars);
    super.write();
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

// TODO(shyndman): Extract to util class.
function stringMapToObject(map) {
  const obj = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  return obj;
}


module.exports = {
  DocumentationFile,
};
