const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const reporter = require('./reporter');
const url = require('url');


const ASSET_PATTERN = /\.(mp4|m4v|png|svg|jpe?g|gif)$/i;
const GITHUB_BASE_PATH = '/material-components/material-components';


function rewriteLocalLinks(file, site, srcPathsToFiles) {
  const linkModifications = determineLinkModifications(file, site, srcPathsToFiles);
  for (const [varName, newUrl] of linkModifications) {
    file.localLinkTemplateVars.set(varName, newUrl);
  }
}


function determineLinkModifications(file, site, srcPathsToFiles) {
  const modifications = new Map();
  for (const [varName, href] of file.localLinkTemplateVars) {
    const newHref = processHref(href, file, site, srcPathsToFiles);
    if (newHref) {
      modifications.set(varName, newHref);
    }
  }
  return modifications;
}


function processHref(href, file, site, srcPathsToFiles) {
  const srcLocalUrl = url.parse(path.resolve(file.originalDir, href));

  // If the link appears to be an absolute GitHub URL, add the hostname.
  if (srcLocalUrl.pathname.startsWith(GITHUB_BASE_PATH)) {
    return `https://www.github.com${ srcLocalUrl.format() }`;
  }

  // If the resolved path falls outside the MDC repo directory, or the file
  // doesn't exist, assume it's an example link and return.
  if (!srcLocalUrl.pathname.startsWith(site.repoPath) ||
      !fs.pathExistsSync(srcLocalUrl.pathname)) {
    return null;
  }

  // If we're dealing with an asset, copy it over.
  // TODO(shyndman): This feels out of place here. These methods are about
  // rewriting links, not copying assets.
  if (ASSET_PATTERN.test(srcLocalUrl.pathname)) {
    const destLocalPath = path.resolve(file.dirname, href);
    fs.copySync(srcLocalUrl.pathname, destLocalPath);
    return null;
  }

  const pathWithReadme = path.join(srcLocalUrl.pathname, 'README.md');
  if (srcPathsToFiles.has(pathWithReadme)) {
    srcLocalUrl.pathname = pathWithReadme;
  }

  // If the specified path has an associated markdown file in the site, rewrite
  // the link to point to it, including the search and has.
  if (srcPathsToFiles.has(srcLocalUrl.pathname)) {
    const destFile = srcPathsToFiles.get(srcLocalUrl.pathname);
    const destLocalUrl = url.parse(path.join(site.basepath, destFile.jekyllMetadata.path));
    destLocalUrl.search = srcLocalUrl.search;
    destLocalUrl.hash = srcLocalUrl.hash;
    return destLocalUrl.format();
  }

  reporter.linkWarning(href, file.path, 'No local link found. Writing GitHub link.')

  const githubUrl = url.parse(site.repoUrl, srcLocalUrl.pathname);
  githubUrl.pathname = path.join(githubUrl.pathname, 'tree/master', srcLocalUrl.pathname.replace(site.repoPath, ''));
  githubUrl.search = srcLocalUrl.search;
  githubUrl.hash = srcLocalUrl.hash;
  return githubUrl.format();
}


module.exports = {
  rewriteLocalLinks,
};
