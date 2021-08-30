import DrawRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frame_kj.svg';
import DrawInvalidRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameNull_kj.svg';
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import SelectedRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameActive_kj.svg';
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import ChangeValidSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameChange_kj.svg';
import DeleteRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_del_kj.svg';
import {
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
  tabChangeSelected,
  tabReverseChangeSelected,
} from '../common';

export const drawRect = {
  name: '拉框',
  icon: DrawRectSvg,
  shortCut: [MouseLeftSvg, MouseLeftSvg],
};

export const drawInvalidRect = {
  name: '拉无效框',
  icon: DrawInvalidRectSvg,
  shortCut: [MouseLeftSvg, 'Ctrl', MouseLeftSvg],
};

export const selectRect = {
  name: '选中框',
  icon: SelectedRectSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: '右击',
};

export const changeValid = {
  name: '切换框性质',
  icon: ChangeValidSvg,
  shortCut: ['F'],
};

export const changeValidByClick = {
  name: '切换框性质',
  icon: ChangeValidSvg,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const deleteRect = {
  name: '删除框',
  icon: DeleteRectSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: '选中双击',
};

const rectToolShortcutTable = [
  drawRect,
  drawInvalidRect,
  selectRect,
  changeValid,
  changeValidByClick,
  deleteRect,
  revoke,
  restore,
  rotate,
  scale,
  fullScreen,
  backward,
  forward,
  // setValid,
  // copyBackwardResult,
  dargWithRightClick,
  // dargWithLeftClick,
  tabChangeSelected,
  tabReverseChangeSelected,
];
export default rectToolShortcutTable;
