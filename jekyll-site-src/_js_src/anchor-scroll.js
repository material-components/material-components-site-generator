/**
 * Initializes anchor scroll correction. This ensures that the linked element
 * is visible instead of being hidden by the fixed toolbar.
 */
export function initAnchorScrollCorrection(toolbarSelector) {
  window.addEventListener('DOMContentLoaded', () => {
    scrollToAnchor(window.location.hash, toolbarSelector);
  });

  window.addEventListener('hashchange', (e) => {
    if (scrollToAnchor(window.location.hash, toolbarSelector)) {
      e.preventDefault();
    }
  });
}


function scrollToAnchor(anchor, toolbarSelector) {
  if (anchor[0] != '#') {
    return false;
  }

  const element = document.querySelector(anchor);
  if (!element) {
    return false;
  }

  const toolbarElement = document.querySelector(toolbarSelector);
  if (!toolbarElement) {
    return false;
  }

  const elementRelativeTop = element.getBoundingClientRect().top;
  const toolbarHeight = toolbarElement.offsetHeight;
  window.scroll(
      window.pageXOffset,
      window.pageYOffset + elementRelativeTop - toolbarHeight);

  return true;
}
