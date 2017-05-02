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
