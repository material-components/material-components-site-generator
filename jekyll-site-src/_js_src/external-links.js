export function watchForExternalLinkClicks() {
  document.addEventListener('click', elementClicked);
}


function elementClicked(e) {
  const { target } = e;
  const closestLinkEl = findClosestLink(target);

  if (!closestLinkEl) {
    return;
  }

  if (closestLinkEl.hostname == window.location.hostname) {
    return;
  }

  window.open(closestLinkEl.href);
  e.preventDefault();
}


function findClosestLink(element) {
  do {
    if (element.tagName == 'A') {
      return element;
    }
  } while (element = element.parentElement);

  return null;
}
