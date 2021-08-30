import DrawPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_line_kj.svg'
import DrawInvalidPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonNull_kj.svg'
import SelectedPolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonActive_kj.svg'
import ChangePolygonAttribute from '@/assets/annotation/toolHotKeyIcon/icon_polygonChange_kj.svg'
import DeletePolygonSvg from '@/assets/annotation/toolHotKeyIcon/icon_polygonDel_kj.svg'
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg'
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';

import {
  backward,
  dargWithRightClick,
  forward,
  fullScreen,
  restore,
  revoke,
  rotate,
  scale,
  tabChangeSelected,
  tabReverseChangeSelected,
} from '../common';

export const drawPolygon = {
  name: '标点',
  icon: DrawPolygonSvg,
  shortCut: [MouseLeftSvg],
};

export const drawInvalidPolygon = {
  name: '标无效点',
  icon: DrawInvalidPolygonSvg,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const selectPolygon = {
  name: '选中点',
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
  name: '删除点',
  icon: DeletePolygonSvg,
  shortCut: ['Del'],
};

const pointToolShortCutTable = [
  drawPolygon,
  drawInvalidPolygon,
  selectPolygon,
  changePolygonAttribute,
  deletePolygon,

  revoke,
  restore,
  rotate,
  scale,
  fullScreen,
  backward,
  forward,
  dargWithRightClick,
  tabChangeSelected,
  tabReverseChangeSelected,
];
export default pointToolShortCutTable;
