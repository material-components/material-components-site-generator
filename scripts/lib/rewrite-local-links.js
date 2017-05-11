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

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const md5File = require('md5-file');
const reporter = require('./reporter');
const url = require('url');
const { BuildDir, CONTENT_ASSETS_PATH } = require('./project-paths');


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
  // TODO(shyndman): Figure out why the variable isn't interpolating in the
  // template.
  if (href.includes('{{ site.rootpath }}')) {
    href = href.replace('{{ site.rootpath }}', site.siteRoot);
  }

  const srcLocalUrl = url.parse(path.resolve(file.originalDir, href));

  // If the link appears to be an absolute GitHub URL, add the hostname.
  if (srcLocalUrl.pathname.startsWith(GITHUB_BASE_PATH)) {
    return `https://www.github.com${ srcLocalUrl.format() }`;
  }

  // If the resolved path falls outside the MDC repo directory, or the file
  // doesn't exist, assume it's an example link and return.
  if (!srcLocalUrl.pathname.startsWith(site.repoPath) ||
      !fs.existsSync(srcLocalUrl.pathname)) {
    return href;
  }

  // If we're dealing with an asset, give it a name that won't collide, and copy
  // it to a central directory.
  // TODO(shyndman): This feels out of place here. These methods are about
  // rewriting links, not copying assets.
  if (ASSET_PATTERN.test(srcLocalUrl.pathname)) {
    const destLocalPath = path.join(
        CONTENT_ASSETS_PATH,
        md5File.sync(srcLocalUrl.pathname) +
        path.extname(srcLocalUrl.pathname));
    const destAssetHref = path.join(site.siteRoot || '/', destLocalPath);
    fs.copySync(srcLocalUrl.pathname, path.join(BuildDir.STAGE, destLocalPath));
    return destAssetHref;
  }

  const pathWithReadme = path.join(srcLocalUrl.pathname, 'README.md');
  if (srcPathsToFiles.has(pathWithReadme)) {
    srcLocalUrl.pathname = pathWithReadme;
  }

  // If the specified path has an associated markdown file in the site, rewrite
  // the link to point to it, including the search and hash.
  if (srcPathsToFiles.has(srcLocalUrl.pathname)) {
    const destFile = srcPathsToFiles.get(srcLocalUrl.pathname);
    const destLocalUrl = url.parse(
        path.join(site.siteRoot, site.basepath, destFile.jekyllMetadata.path));
    destLocalUrl.search = srcLocalUrl.search;
    destLocalUrl.hash = srcLocalUrl.hash;
    return destLocalUrl.format();
  }

  reporter.linkWarning(href, file.path, 'No local link found. Writing GitHub link.')

  const githubUrl = url.parse(site.repoUrl, srcLocalUrl.pathname);
  githubUrl.pathname = path.join(
    githubUrl.pathname,
    `tree/${ site.repoStableBranch }`,
    srcLocalUrl.pathname.replace(site.repoPath, ''));
  githubUrl.search = srcLocalUrl.search;
  githubUrl.hash = srcLocalUrl.hash;
  return githubUrl.format();
}


module.exports = {
  rewriteLocalLinks,
};
