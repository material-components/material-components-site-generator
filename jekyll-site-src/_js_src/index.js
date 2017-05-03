import './mdc-code-render';
import { addHiddenMarks } from './hidden-marks';
import { initAnchorScrollCorrection } from './anchor-scroll';
import { initFeedback } from './feedback';
import { initPlatformMenu } from './platform-menu';
import { initWelcome } from './welcome';
import { watchForExternalLinkClicks } from './external-links';


addHiddenMarks();
initAnchorScrollCorrection('.mdc-toolbar');
initFeedback();
initPlatformMenu();
initWelcome();
watchForExternalLinkClicks();
