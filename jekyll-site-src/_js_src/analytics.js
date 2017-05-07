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

function sendEvent(category, action, label) {
  ga('send', {
    hitType: 'event',
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    transport: 'beacon',
  });
}


export const sendExternalNavigationEvent = (href) => {
  sendEvent('navigation', 'external click', href);
};


export const sendToolbarNavigationEvent = (href) => {
  sendEvent('navigation', 'toolbar click', href);
};


export const sendWelcomeNavigationEvent = (href) => {
  sendEvent('navigation', 'welcome click', href);
};


/**
 * @param {string=} id An optional string for identifying the code region that
 *     was copied.
 */
export const sendCodeCopyEvent = (id='') => {
  sendEvent('code', 'copy', id);
};
