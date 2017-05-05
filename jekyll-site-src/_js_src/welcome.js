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
  window.addEventListener('scroll', invalidateScroll);
  window.addEventListener('resize', invalidateScroll);
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
