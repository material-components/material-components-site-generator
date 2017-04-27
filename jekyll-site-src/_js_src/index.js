import './mdc-code-render';
import { addHiddenMarks } from './hidden-marks';
import { initAnchorScrollCorrection } from './anchor-scroll';
import { initWelcome } from './welcome';
import { watchForExternalLinkClicks } from './external-links';


initWelcome();
initAnchorScrollCorrection('.mdc-toolbar');
addHiddenMarks();
watchForExternalLinkClicks();
