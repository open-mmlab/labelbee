import DrawPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_line_kj.svg'
import DrawInvalidPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonNull_kj.svg'
import SelectedPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonActive_kj.svg'
import ChangePolygonAttribute from '@/assets/annotation/toolHotKeyIcon/icon_polygonChange_kj.svg'
import DeletePolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonDel_kj.svg'
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg'
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';

import IconLineContKj from '@/assets/annotation/toolHotKeyIcon/icon_lineCont_kj.svg';
import IconPolygonInsertKj from '@/assets/annotation/toolHotKeyIcon/icon_polygonInsert_kj.svg';
import IconUnGripKj from '@/assets/annotation/toolHotKeyIcon/icon_unGrip_kj.svg';
import IconPointSpecialKj from '@/assets/annotation/toolHotKeyIcon/icon_pointSpecial_kj.svg';
import IconSegment from '@/assets/annotation/toolHotKeyIcon/icon_segment.svg';
import IconAI from '@/assets/annotation/toolHotKeyIcon/icon_AI.svg';
import IconSwapOutlined from '@/assets/annotation/toolHotKeyIcon/icon_swap_outlined.svg';

import {
  backward,
  dargWithRightClick,
  forward,
  fullScreen,
  restore,
  revoke,
  rotate,
  setValid,
  scale,
  tabChangeSelected,
  tabReverseChangeSelected,
  attributeClickLock,
  attributeLock,
  copyBackwardResult,
  hidden,
  changeSpecialLine,
  saveResult,
  dargWithLeftClick
} from '../common';

export const polygon = {
  name: '标多边形',
  icon: DrawPolygonSvg,
  shortCut: [MouseLeftSvg],
};

export const invalidPolygon = {
  name: '标无效多边形',
  icon: DrawInvalidPolygonSvg,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const selectedPolygon = {
  name: '选中多边形',
  icon: SelectedPolygonSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: '右击',
};

export const changePolygonAttribute = {
  name: '切换多边形性质',
  icon: ChangePolygonAttribute,
  shortCut: ['F'],
};

export const deletePolygon = {
  name: '删除多边形',
  icon: DeletePolygonSvg,
  shortCut: ['Del'],
};

export const keepLine = {
  name: '续标',
  icon: IconLineContKj,
  shortCut: ['Space'],
};

export const insertPolygonPoint = {
  name: '插入点',
  icon: IconPolygonInsertKj,
  noticeInfo: '移中双击',
  shortCut: [MouseLeftSvg],
};

export const deletePolygonPoint = {
  name: '删除点',
  icon: DeletePolygonSvg,
  noticeInfo: '移中双击',
  shortCut: [MouseRightSvg],
};

export const changeSpecialPoint = {
  name: '换特殊点',
  icon: IconPointSpecialKj,
  noticeInfo: '对点',
  shortCut: ['Shift', MouseLeftSvg],
};

export const suspendAbsorption = {
  name: '暂停吸附',
  icon: IconUnGripKj,
  noticeInfo: '按住',
  shortCut: ['Alt'],
};

export const segment = {
  name: '裁剪重叠区域',
  icon: IconSegment,
  noticeInfo: '',
  shortCut: ['ALT', 'X'],
};

export const segmentByAlgorithm = {
  name: '分割辅助',
  icon: IconAI,
  noticeInfo: '',
  shortCut: ['Q'],
};

export const changeRenderPattern = {
  name: '切换绘制形式',
  icon: IconSwapOutlined,
  noticeInfo: '',
  shortCut: ['U'],
};

const pointToolShortCutTable = [
  saveResult,
  polygon,
  invalidPolygon,
  selectedPolygon,
  changePolygonAttribute,
  deletePolygon,
  keepLine,
  insertPolygonPoint,
  deletePolygonPoint,
  changeSpecialPoint,
  changeSpecialLine,
  suspendAbsorption,
  hidden,
  segment,
  segmentByAlgorithm,
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
  tabChangeSelected,
  tabReverseChangeSelected,
  changeRenderPattern,
];
export default pointToolShortCutTable;
