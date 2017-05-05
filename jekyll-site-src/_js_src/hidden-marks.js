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

const Selector = {
  WELCOME_TITLE: '.welcome__title',
  ARTICLE_HEADLINE: '.article h1:first-of-type',
};


export function addHiddenMarks() {
  addMarksToAllMatching(Selector.ARTICLE_HEADLINE);
  addMarksToAllMatching(Selector.WELCOME_TITLE);
}


function addMarksToAllMatching(selector) {
  const matchingElements = Array.from(document.querySelectorAll(selector));
  matchingElements.forEach((el) => addMarksToElement(el));
}


function addMarksToElement(el) {
  const text = el.textContent.trim();
  el.innerHTML = convertToMarkedHtml(text);
}


function convertToMarkedHtml(text) {
  return text
      .replace(/(\w+)\s/g, (match, precedingWord) =>
          htmlForMarkType('dot', precedingWord))
      .replace(/(\w+)$/, (match, precedingWord) =>
          htmlForMarkType('return', precedingWord));
}


function htmlForMarkType(type, content=' ') {
  return `<span class="hidden-mark hidden-mark--${ type }">${ content }&nbsp;</span>`;
}
