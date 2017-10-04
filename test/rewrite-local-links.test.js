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
const mockFs = require('mock-fs');
const { DocumentationFile } = require('../scripts/lib/documentation-file');
const { PlatformSite } = require('../scripts/lib/platform-site');
const { assert } = require('chai');
const { rewriteLocalLinks } = require('../scripts/lib/rewrite-local-links');


suite('localLinks');

const LINKED_FILE_PATH = '/repo/some_dir/second_file';
const LINKED_INDEX_PATH = '/repo/source/subdir/README.md';
const DOCSITE_CONFIG = `
basepath: platform/
repo_url: https://github.com/material-components/material-components-web
repo_stable_branch: stable`;

let site;
beforeEach(() => {
  mockFs({
    '/repo/.mdc-docsite.yml': DOCSITE_CONFIG,
    '/repo/source/docs/screenshot.png': mockFs.file(),
    '/repo/source/in/github/but/not/docsite': '...',
    [LINKED_FILE_PATH]: '...',
    [LINKED_INDEX_PATH]: '...',
  });
  site = new PlatformSite('/repo');
});

afterEach(() => mockFs.restore());

test('Links that don\'t point to anything fail the build', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', '/non/existent/file');
  const expectedLocalLinks = new Map(file.localLinkTemplateVars);
  assert.throws(() => rewriteLocalLinks(file, site, new Map()));
});

test('Links to assets that can\'t be found are ignored', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', '/non/existent/image.png');
  const expectedLocalLinks = new Map(file.localLinkTemplateVars);
  rewriteLocalLinks(file, site, new Map());
  assert.deepEqual(
      Array.from(file.localLinkTemplateVars),
      [['link_1', '/non/existent/image.png']]);
});

test('Links to assets are rewritten to point to a global assets directory', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', './docs/screenshot.png');
  rewriteLocalLinks(file, site, new Map());
  assert.deepEqual(
      Array.from(file.localLinkTemplateVars),
      // File name is md5 hash of "docs/screenshot.png"
      [['link_1', '/images/content/d41d8cd98f00b204e9800998ecf8427e.png']]);
});

test('Assets are copied to the global assets directory', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', 'docs/screenshot.png');
  rewriteLocalLinks(file, site, new Map());
  console.log(mockFs.getMockRoot().list());
  assert(fs.pathExistsSync('.stage/images/content/d41d8cd98f00b204e9800998ecf8427e.png'));
});

test('Local source links will be rewritten to point to the equivalent docsite file', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', '../some_dir/second_file');
  const linkedFile = newDocFile('/destination/second_file', LINKED_FILE_PATH);
  rewriteLocalLinks(file, site, new Map().set(LINKED_FILE_PATH, linkedFile));
  assert.deepEqual(
    Array.from(file.localLinkTemplateVars),
    [['link_1', 'platform/destination/second_file']]);
});

test('Local source directory links will be rewritten to point to the equivalent docsite index', () => {
  // Note that we don't include /README.md on the end of the localLink.
  const file = newDocFile('/destination/file', '/repo/source/file', './subdir');
  const linkedFile = newDocFile('/destination/second_file', LINKED_INDEX_PATH);
  rewriteLocalLinks(file, site, new Map().set(LINKED_INDEX_PATH, linkedFile));
  assert.deepEqual(
    Array.from(file.localLinkTemplateVars),
    [['link_1', 'platform/destination/second_file']]);
});

test('Local source links without docsite equivalents will be linked to GitHub', () => {
  const file = newDocFile('/destination/file', '/repo/source/file', 'in/github/but/not/docsite#hash');
  rewriteLocalLinks(file, site, new Map());
  assert.deepEqual(
    Array.from(file.localLinkTemplateVars),
    [[
      'link_1',
      'https://github.com/material-components/material-components-web/' +
      'tree/stable/' + // Note the branch correspond's to the site's stable
      'source/in/github/but/not/docsite#hash'
    ]]);
});

test('Absolute paths with our org\'s prefix are rewritten to GH links.', () => {
  const file = newDocFile(
      '/destination/file', '/repo/source/file', '/material-components/material-components/');
  rewriteLocalLinks(file, site, new Map());
  assert.deepEqual(
      Array.from(file.localLinkTemplateVars),
      [['link_1', 'https://www.github.com/material-components/material-components']]);
});


function newDocFile(docsitePath, originalPath, localLink) {
  const file = new DocumentationFile({
    path: originalPath,
  });
  file.path = docsitePath;
  file.stringContents = `---\npath: ${docsitePath}\n---`
  if (localLink) {
    file.localLinkTemplateVars.set('link_1', localLink);
  }

  return file;
}
