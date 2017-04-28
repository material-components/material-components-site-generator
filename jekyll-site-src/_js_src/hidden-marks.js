const Selector = {
  WELCOME_TITLE: '.welcome__title',
  ARTICLE_HEADLINE: '.article h1:first-of-type',
};


/**
 * A mapping of labels to marked representations. These marked representations
 * are different than what the marking algorithm would produce, but look better
 * on the page.
 */
const SPECIAL_CASES = {
  'Material Components for iOS': 'Material•Components for•iOS¬',
  'Material Components for Web': 'Material•Components for•the•Web¬',
  'Material Components for Android': 'Material•Components for•Android¬',
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

  // We convert to text containing marks instead of HTML first, so that our
  // SPECIAL_CASES mapping is more readable.
  const markedText = addMarksToText(text);
  el.innerHTML = convertMarkedTextToHtml(markedText);
}


function addMarksToText(text) {
  return text in SPECIAL_CASES ?
      SPECIAL_CASES[text] :
      text.replace(/\s/g, '•')
          .replace(/$/, '¬');
}


function convertMarkedTextToHtml(markedText) {
  return markedText
      .replace(/•/g, htmlForMarkType('dot'))
      .replace(/(\w+)¬/, (match, precedingWord) =>
          htmlForMarkType('return', precedingWord));
}


function htmlForMarkType(type, content=' ') {
  return `<span class="hidden-mark hidden-mark--${ type }">${ content }</span>`;
}
