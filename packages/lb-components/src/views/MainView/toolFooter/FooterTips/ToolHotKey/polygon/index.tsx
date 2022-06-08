import DrawPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_line_kj.svg';
import DrawInvalidPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonNull_kj.svg';
import SelectedPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonActive_kj.svg';
import ChangePolygonAttribute from '@/assets/annotation/toolHotKeyIcon/icon_polygonChange_kj.svg';
import DeletePolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonDel_kj.svg';
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';

import IconLineContKj from '@/assets/annotation/toolHotKeyIcon/icon_lineCont_kj.svg';
import IconPolygonInsertKj from '@/assets/annotation/toolHotKeyIcon/icon_polygonInsert_kj.svg';
import IconUnGripKj from '@/assets/annotation/toolHotKeyIcon/icon_unGrip_kj.svg';
import IconPointSpecialKj from '@/assets/annotation/toolHotKeyIcon/icon_pointSpecial_kj.svg';
import IconSegment from '@/assets/annotation/toolHotKeyIcon/icon_segment.svg';
import IconPolygonMerge from '@/assets/annotation/toolHotKeyIcon/icon_polygonMerge_kj.svg';
import IconAI from '@/assets/annotation/toolHotKeyIcon/icon_AI.svg';
import IconSwapOutlined from '@/assets/annotation/toolHotKeyIcon/icon_swap_outlined.svg';

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
  tabChangeSelected,
  tabReverseChangeSelected,
  // attributeClickLock,
  // attributeLock,
  // copyBackwardResult,
  // hidden,
  // changeSpecialLine,
  // saveResult,
  dargWithLeftClick,
} from '../common';

export const polygon = {
  name: 'AnnotatePolygon',
  icon: DrawPolygonSvg,
  shortCut: [MouseLeftSvg],
};

export const invalidPolygon = {
  name: 'AnnotateInvalidPolygon',
  icon: DrawInvalidPolygonSvg,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const selectedPolygon = {
  name: 'SelectPolygon',
  icon: SelectedPolygonSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: 'RightClick',
};

export const changePolygonAttribute = {
  name: 'TogglePolygonEffectiveness',
  icon: ChangePolygonAttribute,
  shortCut: ['F'],
};

export const deletePolygon = {
  name: 'DeletePolygon',
  icon: DeletePolygonSvg,
  shortCut: ['Del'],
};

export const keepLine = {
  name: 'ContinueToLabel',
  icon: IconLineContKj,
  shortCut: ['Space'],
};

export const insertPolygonPoint = {
  name: 'InsertPoint',
  icon: IconPolygonInsertKj,
  noticeInfo: 'SelectAndDoubleClick',
  shortCut: [MouseLeftSvg],
};

export const deletePolygonPoint = {
  name: 'DeletePoint',
  icon: DeletePolygonSvg,
  noticeInfo: 'SelectAndDoubleClick',
  shortCut: [MouseRightSvg],
};

export const changeSpecialPoint = {
  name: 'TogglePointParticularity',
  icon: IconPointSpecialKj,
  noticeInfo: '',
  shortCut: ['Shift', MouseLeftSvg],
};

export const suspendAbsorption = {
  name: 'StopAdsorption',
  icon: IconUnGripKj,
  noticeInfo: 'Press',
  shortCut: ['Alt'],
};

export const splitPolygon = {
  name: 'CropOverlapArea',
  icon: IconSegment,
  noticeInfo: '',
  shortCut: ['ALT', 'X'],
};

export const combinePolygon = {
  name: 'CombineOverlapArea',
  icon: IconPolygonMerge,
  noticeInfo: '',
  shortCut: ['Alt', 'Z'],
};

export const segmentByAlgorithm = {
  name: 'SegmentationRecognition',
  icon: IconAI,
  noticeInfo: '',
  shortCut: ['Q'],
};

export const changeRenderPattern = {
  name: 'SwitchPattern',
  icon: IconSwapOutlined,
  noticeInfo: '',
  shortCut: ['U'],
};

const pointToolShortCutTable = [
  // saveResult,
  polygon,
  invalidPolygon,
  selectedPolygon,
  changePolygonAttribute,
  deletePolygon,
  keepLine,
  insertPolygonPoint,
  deletePolygonPoint,
  // changeSpecialPoint,
  // changeSpecialLine,
  suspendAbsorption,
  // hidden,
  // segmentByAlgorithm,
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
  tabChangeSelected,
  tabReverseChangeSelected,
  // changeRenderPattern,
  combinePolygon,
  splitPolygon,
];
export default pointToolShortCutTable;
