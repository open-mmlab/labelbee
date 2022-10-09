import {
  backward,
  dargWithRightClick,
  forward,
  // fullScreen,
  restore,
  revoke,
  rotate,
  setValid,
  scale,
  // attributeClickLock,
  // attributeLock,
  // copyBackwardResult,
  // hidden,
  // changeSpecialLine,
  saveResult,
  // dargWithLeftClick,
} from '../common';

const scribbleShortCutTable = [
  scale,
  saveResult,
  restore,
  revoke,
  rotate,
  backward,
  forward,
  dargWithRightClick,
  setValid,
  // copyBackwardResult,
];

export default scribbleShortCutTable;
