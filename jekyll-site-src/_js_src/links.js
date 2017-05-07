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

import * as analytics from './analytics';
import { Selector } from './selectors';
import { findClosestLink } from './dom';


const welcomeEl = document.querySelector(Selector.WELCOME);
const toolbarEl = document.querySelector(Selector.TOOLBAR);


export function watchForLinkClicks() {
  document.addEventListener('click', elementClicked);
}


function elementClicked(e) {
  const { target } = e;
  const closestLinkEl = findClosestLink(target);

  if (!closestLinkEl) {
    return;
  }

  if (closestLinkEl.hostname == window.location.hostname) {
    handleInternalLink(closestLinkEl);
  } else {
    handleExternalLink(closestLinkEl, e);
  }
}


/**
 * Send analytics events on welcome or toolbar link clicks.
 */
function handleInternalLink(linkEl) {
  if (toolbarEl && toolbarEl.contains(linkEl)) {
    analytics.sendToolbarNavigationEvent(linkEl.href);
  } else if (welcomeEl && welcomeEl.contains(linkEl)) {
    analytics.sendWelcomeNavigationEvent(linkEl.href);
  }
}


/**
 * Opens the link in a new tab.
 */
function handleExternalLink(linkEl, event) {
  window.open(linkEl.href);
  event.preventDefault();
  analytics.sendExternalNavigationEvent(linkEl.href);
}
