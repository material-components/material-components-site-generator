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

import { MDCSimpleMenu } from '@material/menu/';
import { Selector } from './selectors';
import { sendToolbarNavigationEvent } from './analytics';


const toolbarEl = document.querySelector(Selector.TOOLBAR);

export function initMenus() {
  const menuEls = Array.from(document.querySelectorAll(Selector.MENU));
  if (!menuEls.length) {
    return;
  }

  menuEls.forEach((menuEl) => {
    const menu = new MDCSimpleMenu(menuEl);
    menu.listen('MDCSimpleMenu:selected', menuItemSelected);

    const triggerEl = menuEl.parentElement.querySelector('button');
    triggerEl.addEventListener('click', () => {
      menu.show();
    });
  });
}


function menuItemSelected(e) {
  const { href } = e.detail.item.dataset;
  if (toolbarEl && toolbarEl.contains(e.detail.item)) {
    sendToolbarNavigationEvent(href);
  }
  window.location = href;
}
