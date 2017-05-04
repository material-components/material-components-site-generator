// TODO(shyndman): This file is leftover from the legacy site. A refactor to
// bring up to date is necessary.

/**
 * @fileoverview
 * Material code renderer provides a wrapper around CodeMirror and renders code
 * snippets into material design styling. This module is imported for
 * side-effects only.
 *
 */
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/xml/xml';

import { MDCRadio, MDCRadioFoundation } from '@material/radio';



// A Boolean value to control line numbers generation. Device width smaller
// than 600px will be considered as mobile device.
// var _mobileSized = false;

/** Default language setting when no value is provided by kramdown. */
const DEFAULT_LANG = 'swift';

/** ID of the <template> element for language radio buttons. */
const LANGUAGE_RADIO_TEMPLATE_ID = 'language-radio-template';

const JS_CODE_MIRROR_SETTINGS = {
  language: 'JavaScript',
  mode: 'text/javascript',
};

/**
 * A mapping between kramdown language name and codeMirror name.
 */
const kramdownToCodeMirrorMap = {
  bash: {
    language: 'Shell',
    mode: 'text/x-sh',
  },
  css: {
    language: 'CSS',
    mode: 'text/css',
  },
  html: {
    language: 'HTML',
    mode: 'text/html',
  },
  groovy: {
    language: 'Groovy',
    mode: 'text/x-groovy',
  },
  java: {
    language: 'Java',
    mode: 'text/x-java',
  },
  javascript: JS_CODE_MIRROR_SETTINGS,
  js: JS_CODE_MIRROR_SETTINGS,
  objc: {
    language: 'Objective-C',
    mode: 'text/x-objectivec',
  },
  ruby: {
    language: 'Ruby',
    mode: 'text/x-ruby',
  },
  scss: {
    language: 'SCSS',
    // This is strange but it works, and text/x-scss does not.
    mode: 'text/x-less',
  },
  shell: {
    language: 'Shell',
    mode: 'text/x-sh',
  },
  swift: {
    language: 'Swift',
    mode: 'text/x-swift',
  },
  text: {
    language: 'Text',
    mode: 'text/plain',
  },
  xml: {
    language: 'XML',
    mode: 'text/x-xml',
  },
};



/**
 * The number of language radios that have been constructed on this page. Used
 * for unique ID generation.
 */
let languageRadioCount = 0;


/**
 * Generate single code mirror obj from source
 * @param {!Element} source An DOM element that contains the code snippet.
 * @param {boolean | false} lineno An boolean value for line number.
 * @return {Object} An Object of codeMirror bject and language.
 */
function renderSimpleCodeRenderer(source, lineno) {
  function shellFilter() {
    var lines = cm.display.wrapper.querySelectorAll('.CodeMirror-line > span');
    for (let i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.querySelector('.cm-def') &&
        line.innerText.indexOf('$') !== -1) {
          var childrenOfLine = line.childNodes;
          for (let j = 0; j < childrenOfLine.length; j++) {
            if (childrenOfLine[j].classList &&
               childrenOfLine[j].classList.contains('cm-def') !== -1) {
              break;
            }
            var span = document.createElement('span');
            span.classList.add('cm-userpath');
            span.innerHTML = childrenOfLine[j].nodeValue;
            line.replaceChild(span, line.childNodes[j]);
          }
      }
    }
  }

  function renderLineHighlight() {
    var highlight = source.parentNode.dataset.highlight.split(',');
    for (let i = 0; i < highlight.length; i++) {
      highlight[i] = highlight[i].trim();
      var rangeRegexp = /(\d)-(\d)/;
      var found = highlight[i].match(rangeRegexp);
      if (found !== null) {
        var start = parseInt(found[1]) - 1;
        var end = parseInt(found[2])
        for (let j = start; j < end; j++) {
          cm.getDoc().addLineClass(j, 'wrap', 'hll');
        }
      } else {
        var highlightline = parseInt(highlight[i]) - 1;
        cm.getDoc().addLineClass(highlightline, 'wrap', 'hll');
      }
    }
  }

  let kramdownLanguage = source.classList.length == 0 ?
      DEFAULT_LANG : source.classList[0].replace('language-', '');
  if (!(kramdownLanguage in kramdownToCodeMirrorMap)) {
    console.warn(`${kramdownLanguage} not supported.`)
    kramdownLanguage = 'text';
  }

  const { mode, language } = kramdownToCodeMirrorMap[kramdownLanguage];

  const cm = CodeMirror(function(elt) {
    source.parentNode.parentNode.replaceChild(elt, source.parentNode);
  }, {
    value: source.innerText.trim(),
    mode: mode,
    lineNumbers: lineno || false,
    readOnly: true
  });

  // If the language is Shell, this piece of logic process user path properly
  if (language === 'Shell') {
    shellFilter();
  }
  // If line highlight is specified, add line highlight class to those lines
  if (source.parentNode.dataset.highlight) {
    renderLineHighlight();
  }

  return {
    language, cm,
  };
}


/**
 * Generate multiple code mirror objects and form the material code renderer.
 * @param {Element} renderer An DOM element that wraps multiple code snippets.
 * @param {string} id An string to identify the renderer.
 * @return {Object} An Object of codeMirror bject and language.
 */
function renderComplexCodeRenderer(renderer, id) {
  // Allowed Language for complex material code render.
  var complexRendererAllowedLang = ['Swift', 'Objective-C'];

  // A Utility class to set/get page selected language.
  var selectedLanguage = {
    set: function(value) {
      value = complexRendererAllowedLang.indexOf(value) !== -1 ?
              value : complexRendererAllowedLang[0];
      if (typeof(window.sessionStorage) !== 'undefined') {
        window.sessionStorage.setItem('selectedLanguage', value);
      }
      else {
        selectedLanguage._value = value;
      }
    },
    get: function() {
      var value;
      if (typeof(window.sessionStorage) !== 'undefined') {
        value = window.sessionStorage.getItem('selectedLanguage');
      }
      else {
        value = selectedLanguage._value;
      }
      return value || complexRendererAllowedLang[0];
    }
  };

  /**
   * Generate Single radio button element from frontend template
   * @param {string} groupName An string to identify the group of radio button
   * belongs to.
   * @param {string} label The displayed name of the radio button.
   * @return {Element} An unattached DOM Node for a radio button.
   */
  function initRadioButton(groupName, label) {
    const templateEl = document.getElementById(LANGUAGE_RADIO_TEMPLATE_ID);
    const radioId = `language-radio-${languageRadioCount++}`;

    const radioInputEl = templateEl.content.querySelector('.mdc-radio__native-control');
    radioInputEl.setAttribute('id', radioId);
    radioInputEl.setAttribute('name', groupName);
    radioInputEl.setAttribute('value', label);

    const radioLabelEl = templateEl.content.querySelector('.language-name');
    radioLabelEl.setAttribute('for', radioId);
    radioLabelEl.textContent = label;

    const radioEl = document.importNode(templateEl.content, true);

    const radio = new MDCRadio(radioEl.querySelector('.mdc-radio'));
    radio.listen('change', () => {
      const lang = radio.nativeControl_.value;
      if (selectedLanguage.get() == lang) {
        return false;
      }
      selectedLanguage.set(lang);

      const event = document.createEvent('HTMLEvents');
      event.initEvent('selectLangChange', false, true);
      document.dispatchEvent(event);
    });

    return {
      component: radio,
      element: radioEl,
    };
  }

  var sources = renderer.querySelectorAll('pre code');
  var availableLanguage = [];
  // Before generate:
  // 1. Take care of invalid code snippet case.
  Array.from(sources).forEach((source) => {
    var kramdownLanguage = source.classList.length == 0 ? '' :
      source.classList[0].replace('language-', '');
    var language = kramdownToCodeMirrorMap[kramdownLanguage].language;
    if (complexRendererAllowedLang.indexOf[language] === -1) {
      source.parentNode.removeChild(source);
    } else {
      availableLanguage.push(language);
    }
  });

  // 2. Take care of non code snippet case after invalid snippets are deleted.
  if (!sources || sources.length === 0) {
    renderer.parentNode.removeChild(renderer);
    return;
  }

  // Generate Complex Code Renderer:
  let maxHeight = 0;
  const radioForm = document.createElement('form');
  radioForm.classList.add('language');
  const languageComponentMapping = {};
  const radioName = `MaterialCodeRenderer${id}`;

  Array.from(sources).forEach((source) => {
    const simpleRender = renderSimpleCodeRenderer(source, false);
    const { component, element } = initRadioButton(radioName, simpleRender.language);
    radioForm.appendChild(element);

    const clientHeight = simpleRender.cm.getScrollInfo().clientHeight;
    maxHeight = Math.max(maxHeight, clientHeight);

    languageComponentMapping[simpleRender.language] = {
      codemirror: simpleRender.cm,
      radio: component,
    };
  });

  // 3. Add radioForm into DOM
  renderer.insertBefore(radioForm, renderer.firstChild);

  // 4. Listen to selectLangChange event and change code snippet in display.
  radioForm.addEventListener('selectLangChange', () => {
    let targetLanguage = selectedLanguage.get();
    targetLanguage = availableLanguage.indexOf(targetLanguage) == -1 ?
        availableLanguage[0] : targetLanguage;

    const components = languageComponentMapping[targetLanguage];
    components.radio.checked = true;

    renderer.querySelector('.CodeMirror.active').classList.remove('active');
    components.codemirror.getWrapperElement().classList.add('active');
  });

  // 5. Set the code renderer container height to the highest code mirror.
  renderer.style.height = maxHeight + radioForm.offsetHeight + 'px';

  // After Generation:
  // Initialize with targetLanguage
  var targetLanguage = selectedLanguage.get();
  targetLanguage = availableLanguage.indexOf(targetLanguage) == -1 ?
                   availableLanguage[0] : targetLanguage;
  const components = languageComponentMapping[targetLanguage];
  components.radio.checked = true;
  components.codemirror.getWrapperElement().classList.add('active');
}

var complexRenders = document.querySelectorAll('.material-code-render');
for (let i = 0; i < complexRenders.length; i++) {
  // RendererIndex assigns a unique id to each code renderer. The id will
  // be used by radioForm for each code renderer to form radio button group.
  renderComplexCodeRenderer(complexRenders[i], i);
}

// Second: renders all other code snippet
var simpleRenders = document.querySelectorAll('pre code');
for (let j = 0; j < simpleRenders.length; j++) {
  renderSimpleCodeRenderer(simpleRenders[j]);
}

// Listen to selectLangChange event at document level and forward that event
// to exsiting material code renders.
document.addEventListener('selectLangChange', function(e) {
  for (let i = 0; i < complexRenders.length; i++) {
    var evt = new e.constructor(e.type, e);
    complexRenders[i].querySelector('.language').dispatchEvent(evt);
  }
});

// Scroll to targeted anchor after code renderer completes.
if (window.location.hash) {
  window.location.href = window.location.hash;
}
