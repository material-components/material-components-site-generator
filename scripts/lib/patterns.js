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

/**
 * Returns a regular expression for matching Markdown code (blocks and inline).
 */
function newMarkdownCodePattern() {
  return new RegExp([
    // CODE BLOCK
    '^(',
      // Leading space, followed by 3 or 4 backticks
      '([ \\t]*`{3,4})',
      // Match to the end of the first line
      '([^\\n]*)',
      // Lazily match everything ([^] is negation of empty set)...
      '([^]+?)',
      // ...until we hit the the same number of backticks as captured up front.
      '(^[ \\t]*\\2)',
    ')|',

    // INLINE CODE
    '(',
      // Starting backtick
      '`',
      // Zero or more non-empty lines (inline code can be split across lines,
      // as long as they aren't blank)
      '(',
        '\\n(^[^`\\n]+$)',
      ')*',
      // Followed by one character of anything but a backtick (`` isn't valid)
      '[^`]',
      // Then lazily match any character on the current line until the ending
      // backtick.
      '.*?`',
    ')',
  ].join(''), 'gm')
}

/**
 * Returns a regular expression that matches asset file paths.
 */
function newAssetPathPattern() {
  return /\.(mp4|m4v|png|svg|jpe?g|gif)$/ig;
}


module.exports = {
  newAssetPathPattern,
  newHrefPattern,
  newMarkdownCodePattern,
  newMarkdownLinkPattern,
  newSrcPattern,
};
