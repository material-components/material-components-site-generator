const Selector = {
  WELCOME: '.welcome',
  TOOLBAR: '.mdc-toolbar',
};

const CssClass = {
  NO_SHADOW: 'mdc-toolbar--no-shadow'
};


let scrollInvalidated = false;
const welcomeEl = document.querySelector(Selector.WELCOME);
const toolbarEl = document.querySelector(Selector.TOOLBAR);


export function initWelcome() {
  if (!welcomeEl) {
    return;
  }

  invalidateScroll();
  window.addEventListener('scroll', () => {
    invalidateScroll();
  });
}


function invalidateScroll() {
  if (!scrollInvalidated) {
    scrollInvalidated = true;
    window.requestAnimationFrame(() => {
      hideShadowIfRequired();
      scrollInvalidated = false;
    });
  }
}


function hideShadowIfRequired() {
  // NOTE: I'm deliberately not using ClassList.toggle(cls, force) here for
  // better browser support.
  if (isShadowHidden()) {
    toolbarEl.classList.add(CssClass.NO_SHADOW);
  } else {
    toolbarEl.classList.remove(CssClass.NO_SHADOW);
  }
}


function isShadowHidden() {
  return welcomeEl.getBoundingClientRect().bottom >
         toolbarEl.getBoundingClientRect().bottom;
}
