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

ANIMATION_DURATION = 300;

current_state = {
  count: 0
};

window.jazzy = {'docset': false}
if (typeof window.dash != 'undefined') {
  document.documentElement.className += ' dash'
  window.jazzy.docset = true
}
if (navigator.userAgent.match(/xcode/i)) {
  document.documentElement.className += ' xcode'
  window.jazzy.docset = true
}

// On doc load, toggle the URL hash discussion if present
$(document).ready(function() {
  if (!window.jazzy.docset) {
    var target = findTargetFromPath(window.location.hash);
    if(target) {
      current_state.targetpath = target.path;
      current_state.action = 'open';
      open(target);
    }
  }
});

$(window).on('popstate', function(e) {
  var state = e.originalEvent.state;
  if (!state || state.count < current_state.count) {
    //back button pressed, revert whatever the current step is
    if(current_state.action == 'open') {
      close(findTargetFromPath(current_state.targetpath));
    }
    else {
      open(findTargetFromPath(current_state.targetpath));
    }
    current_state = state? state : {};
  }
  else {
    // forward button pressed, do whatever that step tell you todo
    if(state.action == 'open') {
      open(findTargetFromPath(state.targetpath));
    }
    else {
      close(findTargetFromPath(state.targetpath));
    }
    current_state = state;
  }
});

// On token click, toggle its discussion and animate token.marginLeft
$('.token').click(function(event) {
  if (window.jazzy.docset) {
    return;
  }
  var target = findTargetFromToken($(this));
  current_state.targetpath = target.path;
  current_state.count++;
  if(isOpened(target)) {
    current_state.action = 'close';
    close(target);
    history.pushState(current_state, '', window.location.pathname);
  }
  else {
    current_state.action = 'open';
    open(target);
    history.pushState(current_state, '', target.path);
  }
  event.preventDefault();
});

function findTargetFromPath(path) {
  if (path === "") {
    return null;
  }
  target = {};
  target.path = path;
  target.$token = $('a[href="' + target.path +'"]');
  target.$content = target.$token.parent().parent().next();
  return target;
}

function findTargetFromToken($token) {
  if (!$token) {
    return null;
  }
  target = {};
  target.$token = $token;
  target.path = target.$token.attr('href');
  target.$content = target.$token.parent().parent().next();
  return target;
}

function isOpened(target) {
  return target? target.$content.css('display') !== 'none' : false;
}

function open(target) {
  if (target) {
    target.$content.slideDown(ANIMATION_DURATION);
  }
}

function close(target) {
  if (target) {
    target.$content.slideUp(ANIMATION_DURATION);
  }
}