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
  attributeClickLock,
  attributeLock,
  backward,
  copyBackwardResult,
  dargWithLeftClick,
  dargWithRightClick,
  forward,
  fullScreen,
  restore,
  revoke,
  rotate,
  scale,
  setValid,
  hidden,
  tabChangeSelected,
  tabReverseChangeSelected,
  changeSpecialLine,
  saveResult,
} from '../common';

export const line = {
  name: '标线',
  icon: DrawPolygonSvg,
  shortCut: [MouseLeftSvg],
};

export const invalidLine = {
  name: '标无效线',
  icon: LineNullKj,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const horizontalLine = {
  name: '标水平/垂直线',
  icon: StraightLineKj,
  shortCut: ['Shift', MouseLeftSvg],
};

export const selectLine = {
  name: '选中线',
  icon: LineActiveKj,
  shortCut: [MouseRightSvg],
};

export const changeLineAttribute = {
  name: '切换线性质',
  icon: LineChangeKj,
  shortCut: ['F'],
};

export const deleteLine = {
  name: '删除线',
  icon: DeletePointSvg,
  noticeInfo: '选中双击',
  shortCut: [MouseRightSvg],
};

export const keepLine = {
  name: '续标',
  icon: IconLineContKj,
  noticeInfo: '选中',
  shortCut: ['Space'],
};

export const insertPoint = {
  name: '插入点',
  icon: LineInsertKj,
  noticeInfo: '对线单击',
  shortCut: [MouseLeftSvg],
};

export const deletePoint = {
  name: '删除点',
  icon: LineDelKj,
  noticeInfo: '对点双击',
  shortCut: [MouseRightSvg],
};

export const suspendAbsorption = {
  name: '暂停吸附',
  icon: IconUnGripKj,
  noticeInfo: '按住',
  shortCut: ['Alt'],
};

export const preLine = {
  name: '上条线',
  icon: Up,
  shortCut: ['W'],
};

export const nextLine = {
  name: '下条线',
  icon: Down,
  shortCut: ['S'],
};

const lineToolShortCutTable = [
  saveResult,
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
  attributeLock,
  attributeClickLock,
  revoke,
  restore,
  rotate,
  scale,
  fullScreen,
  backward,
  forward,
  setValid,
  copyBackwardResult,
  dargWithRightClick,
  dargWithLeftClick,
  hidden,
  tabChangeSelected,
  tabReverseChangeSelected,
];
export default lineToolShortCutTable;
