/**
 * Returns a regular expression for matching markdown links.
 *
 * Capture group 1: Text
 * Capture group 2: URL
 * Capture group 3: Title (optional)
 */
function newMarkdownLinkPattern() {
  return /\[([^\]]+)\]\(([^)\s]+)(\s[^)]*)?\)/g;
}

/**
 * Returns a regular expression for matching href HTML attributes.
 *
 * Capture group 1: URL
 */
function newHrefPattern() {
  return /href=["']([^'"]+)["']/g;
}

/**
 * Returns a regular expression for matching src HTML attributes.
 *
 * Capture group 1: URL
 */
function newSrcPattern() {
  return /src=["']([^'"]+)["']/g;
}


module.exports = {
  newMarkdownLinkPattern,
  newHrefPattern,
  newSrcPattern,
};
