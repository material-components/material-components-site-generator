import './mdc-code-render';
import { addHiddenMarks } from './hidden-marks';
import { initAnchorScrollCorrection } from './anchor-scroll';
import { initFeedback } from './feedback';
import { initMenus } from './menus';
import { initWelcome } from './welcome';
import { watchForExternalLinkClicks } from './external-links';


addHiddenMarks();
initAnchorScrollCorrection('.mdc-toolbar');
initFeedback();
initMenus();
initWelcome();
watchForExternalLinkClicks();
