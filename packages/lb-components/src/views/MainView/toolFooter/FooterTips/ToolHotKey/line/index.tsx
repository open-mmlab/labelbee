import DrawPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_line_kj.svg';
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import LineNullKj from '@/assets/annotation/toolHotKeyIcon/icon_lineNull_kj.svg';
import StraightLineKj from '@/assets/annotation/toolHotKeyIcon/icon_straightLine_kj.svg';
import LineActiveKj from '@/assets/annotation/toolHotKeyIcon/icon_lineActive_kj.svg';
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import LineChangeKj from '@/assets/annotation/toolHotKeyIcon/icon_lineChange_kj.svg';
import DeletePointSvg from '@/assets/annotation/toolHotKeyIcon/icon_del_kj.svg';
import IconLineContKj from '@/assets/annotation/toolHotKeyIcon/icon_lineCont_kj.svg';
import LineInsertKj from '@/assets/annotation/toolHotKeyIcon/icon_lineInsert_kj.svg';
import LineDelKj from '@/assets/annotation/toolHotKeyIcon/icon_lineDel_kj.svg';
import IconUnGripKj from '@/assets/annotation/toolHotKeyIcon/icon_unGrip_kj.svg';
import Up from '@/assets/annotation/toolHotKeyIcon/icon_up.svg';
import Down from '@/assets/annotation/toolHotKeyIcon/icon_down.svg';

import {
  // attributeClickLock,
  // attributeLock,
  backward,
  // copyBackwardResult,
  dargWithLeftClick,
  dargWithRightClick,
  forward,
  // fullScreen,
  restore,
  revoke,
  rotate,
  scale,
  setValid,
  hidden,
  tabChangeSelected,
  tabReverseChangeSelected,
  changeSpecialLine,
  // saveResult,
} from '../common';

export const line = {
  name: 'AnnotateLine',
  icon: DrawPolygonSvg,
  shortCut: [MouseLeftSvg],
};

export const invalidLine = {
  name: 'AnnotateInvalidLine',
  icon: LineNullKj,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const horizontalLine = {
  name: 'HorizontalOrVertical',
  icon: StraightLineKj,
  shortCut: ['Shift', MouseLeftSvg],
};

export const selectLine = {
  name: 'SelectLine',
  icon: LineActiveKj,
  shortCut: [MouseRightSvg],
};

export const changeLineAttribute = {
  name: 'ToggleLineEffectiveness',
  icon: LineChangeKj,
  shortCut: ['F'],
};

export const deleteLine = {
  name: 'DeleteLine',
  icon: DeletePointSvg,
  noticeInfo: 'SelectAndDoubleClick',
  shortCut: [MouseRightSvg],
};

export const keepLine = {
  name: 'ContinueToLabel',
  icon: IconLineContKj,
  noticeInfo: 'Select',
  shortCut: ['Space'],
};

export const insertPoint = {
  name: 'InsertPoint',
  icon: LineInsertKj,
  noticeInfo: 'ClickOnLine',
  shortCut: [MouseLeftSvg],
};

export const deletePoint = {
  name: 'DeletePoint',
  icon: LineDelKj,
  noticeInfo: 'DblClickOnPoint',
  shortCut: [MouseRightSvg],
};

export const suspendAbsorption = {
  name: 'StopAdsorption',
  icon: IconUnGripKj,
  noticeInfo: 'Press',
  shortCut: ['Alt'],
};

export const preLine = {
  name: 'PreviousLine',
  icon: Up,
  shortCut: ['W'],
};

export const nextLine = {
  name: 'NextLine',
  icon: Down,
  shortCut: ['S'],
};

const lineToolShortCutTable = [
  // saveResult,
  line,
  invalidLine,
  horizontalLine,
  selectLine,
  changeLineAttribute,
  deleteLine,
  keepLine,
  changeSpecialLine,
  insertPoint,
  deletePoint,
  suspendAbsorption,
  // attributeLock,
  // attributeClickLock,
  revoke,
  restore,
  rotate,
  scale,
  // fullScreen,
  backward,
  forward,
  setValid,
  // copyBackwardResult,
  dargWithRightClick,
  dargWithLeftClick,
  hidden,
  tabChangeSelected,
  tabReverseChangeSelected,
];
export default lineToolShortCutTable;
  