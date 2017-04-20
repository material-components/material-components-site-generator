const _ = require('lodash');
const path = require('path');


/**
 * Used to generate hierarchical navigation from a set of JekyllFile instances.
 */
class SectionNavigation {
  /**
   * @param {string} name The name of the section to which this navigation
   *     applies. This corresponds to the section field in the Front Matter
   *     metadata.
   */
  constructor(name, basepath='') {
    this.name = name;
    this.basepath_ = basepath;
    this.root_ = {
      name,
      children: [],
    };
  }

  /**
   * Returns the top-level navigation items.
   */
  get items() {
    return this.root_.children;
  }

  /**
   * Adds a navigation entry for the provided file.
   */
  add(file) {
    // Clone the file so we can mutate it without worry.
    file = file.clone();

    // Modify the file's base so that platform directories are not included in
    // the output.
    file.base += this.basepath_;

    const metadata = file.jekyllMetadata;
    const dir = this.ensureDir_(file.relative);

    if (file.basename == 'index.md' || file.basename == 'index.html') {
      dir.title = metadata.navTitle || metadata.title;
    } else {
      file.extname = '.html';
      dir.children.push({
        title: metadata.title,
        url: file.relative,
      });
    }
  }

  /**
   * Creates the directory in the navigation datastructure if it doesn't already
   * exist.
   */
  ensureDir_(docPath) {
    const dir = path.dirname(docPath);
    if (dir == '.') {
      return this.root_;
    }

    let pathAcc = '';
    let node = this.root_;
    for (const part of dir.split('/')) {
      pathAcc += `/${part}`;

      const childUrl = `${pathAcc}/`;
      let childNode = node.children.find((child) => child.url == childUrl);
      if (!childNode) {
        childNode = {
          title: part,
          url: childUrl,
          children: [],
        };
        node.children.push(childNode);
      }
      node = childNode;
    }

    return node;
  }
}


module.exports = {
  SectionNavigation,
};
