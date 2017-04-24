import './mdc-code-render';
import { initAnchorScrollCorrection } from './anchor-scroll';
import { addHiddenMarks } from './hidden-marks';
import { initWelcome } from './welcome';


initWelcome();
initAnchorScrollCorrection('.mdc-toolbar');
addHiddenMarks();
