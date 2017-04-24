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
  constructor(name, files, basepath='') {
    this.name = name;
    this.basepath_ = basepath;
    this.root_ = {
      name,
      children: [],
    };

    this.addAll_(files);
    this.sort_();
  }

  /**
   * Returns the top-level navigation items.
   */
  get items() {
    return this.root_.children;
  }

  /**
   * @private
   */
  addAll_(files) {
    for (const file of files) {
      this.add_(file);
    }
  }

  /**
   * Adds a navigation entry for the provided file.
   * @private
   */
  add_(file) {
    // Clone the file so we can mutate it without worry.
    file = file.clone();

    // Modify the file's base so that platform directories are not included in
    // the output.
    file.base += this.basepath_;

    const metadata = file.jekyllMetadata;
    const dir = this.ensureDir_(file.relative);

    const child = {
      title: metadata.navTitle || metadata.title,
      navPriority: metadata.navPriority || 0,
    };
    if (metadata.iconId) {
      child.iconId = metadata.iconId;
    }
    if (metadata.excerpt) {
      child.excerpt = metadata.excerpt;
    }

    if (file.basename == 'index.md' || file.basename == 'index.html') {
      Object.assign(dir, child);
    } else {
      file.extname = '.html';
      child.url = file.relative;
      dir.children.push(child);
    }
  }

  /**
   * Creates the directory in the navigation datastructure if it doesn't already
   * exist.
   * @private
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

  /**
   * Sorts each branch of the tree. This is called after construction because
   * not enough information is available while the nodes are being added.
   * @private
   */
  sort_(node=this.root_) {
    node.children.sort((a, b) => {
      return  a.navPriority != b.navPriority ?
          b.navPriority - a.navPriority : // desc
          a.title.localeCompare(b.title); // asc
    });

    for (const child of node.children) {
      this.sort_(child);
    }
  }
}


module.exports = {
  SectionNavigation,
};
