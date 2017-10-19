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

const { assert } = require('chai');
const { newMarkdownCodePattern } = require('../scripts/lib/patterns');


suite('patterns');

test('Matches inline code embedded in a sentence', () => {
  assert.match(
      'This is a paragraph containing `inline code`, and more!',
      newMarkdownCodePattern());
});

test('Matches lonely line code', () => {
  assert.match('`some code`', newMarkdownCodePattern());
});

test('Matches inline code split across lines', () => {
  assert.match(`
      \`
      some
      code
      across
      lines
      \`
    `, newMarkdownCodePattern());
});

test('Does not match inline code split across lines with empty lines', () => {
  assert.notMatch(`
      \`
      some
      code

      across
      lines
      \`
  `, newMarkdownCodePattern());
});

test('Matches code blocks with a language specifier', () => {
  assert.match(`
      \`\`\`html
      some
      code

      across
      lines
      \`\`\`
  `, newMarkdownCodePattern());
});

test('Matches code blocks without a language specifier', () => {
  assert.match(`
      \`\`\`
      some
      code

      across
      lines
      \`\`\`
  `, newMarkdownCodePattern());
});

test('Matches code blocks with inconsistent leading whitespace', () => {
  assert.match(`
      \`\`\`
      some
      code

      across
      lines
           \`\`\`
  `, newMarkdownCodePattern());
});

