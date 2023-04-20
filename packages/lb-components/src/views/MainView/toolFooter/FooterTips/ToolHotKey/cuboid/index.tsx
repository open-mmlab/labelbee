import {
  backward,
  dargWithRightClick,
  forward,
  restore,
  revoke,
  rotate,
  setValid,
  hidden,
  scale,
  saveResult,
} from '../common';
import {
  changeValid,
  changeValidByClick,
  selectRect,
  deleteRect,
  drawInvalidRect,
  drawRect,
} from '../rectToolShortCutTable';

const cuboidShortCutTable = [
  backward,
  forward,

  // Temporary reuse of react tool icons
  drawRect,
  drawInvalidRect,
  dargWithRightClick,
  selectRect,
  deleteRect,
  changeValid,
  changeValidByClick,

  scale,
  saveResult,
  restore,
  revoke,
  rotate,
  setValid,
  hidden,
];

export default cuboidShortCutTable;
