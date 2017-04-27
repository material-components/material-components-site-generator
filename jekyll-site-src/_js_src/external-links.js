export function watchForExternalLinkClicks() {
  document.addEventListener('click', elementClicked);
}

function elementClicked(e) {
  const { target } = e;
  if (target.tagName != 'A') {
    return;
  }

  if (target.hostname == window.location.hostname) {
    return;
  }

  window.open(target.href);
  e.preventDefault();
}
