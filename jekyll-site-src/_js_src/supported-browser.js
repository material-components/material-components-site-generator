import * as bowser from 'bowser';


export function displayUnsupportedMessage() {
  document.body.className = '';
  document.body.classList.add('page');
  document.body.classList.add('page--unsupported-browser');
  document.body.innerHTML = `
    <h1>Material Components</h1>
    <p>
      Oops! Your browser is not yet supported. Visit
      <a href="https://github.com/material-components/">GitHub</a> for more information,
      or upgrade your browser.
    </p>
  `;
}


export function isBrowserSupported() {
  return !bowser.msie; // Internet Explorer is not supported. Edge 12+.
}
