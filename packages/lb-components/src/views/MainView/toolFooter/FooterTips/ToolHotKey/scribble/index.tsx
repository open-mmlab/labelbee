import DragWithLeftClickSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import IconLineStatic from '@/assets/annotation/toolHotKeyIcon/icon_line_static.svg';
import eraserSvg from '@/assets/annotation/toolHotKeyIcon/icon_eraser.svg';
import scribbleSvg from '@/assets/annotation/toolHotKeyIcon/icon_scribble.svg';
import strokeEnlargeSvg from '@/assets/annotation/toolHotKeyIcon/icon_strokeEnlarge.svg';
import strokeReductionSvg from '@/assets/annotation/toolHotKeyIcon/icon_strokeReduction.svg';

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
  hidden,
} from '../common';

export const scribbleImg = {
  name: 'Scribble',
  icon: scribbleSvg,
  shortCut: ['Q'],
};
export const eraseImg = {
  name: 'Erase',
  icon: eraserSvg,
  shortCut: ['W'],
};

export const scribbleLine = {
  name: 'ScribbleLine',
  icon: IconLineStatic,
  shortCut: ['Ctrl', DragWithLeftClickSvg],
};

export const strokeEnlarge = {
  name: 'StrokeEnlarge',
  icon: strokeEnlargeSvg,
  shortCut: ['F'],
};
export const strokeReduction = {
  name: 'StrokeReduction',
  icon: strokeReductionSvg,
  shortCut: ['G'],
};

const scribbleShortCutTable = [
  scribbleImg,
  eraseImg,
  scribbleLine,
  strokeEnlarge,
  strokeReduction,
  scale,
  saveResult,
  restore,
  revoke,
  rotate,
  backward,
  forward,
  dargWithRightClick,
  setValid,
  hidden,
  // copyBackwardResult,
];

export default scribbleShortCutTable;
