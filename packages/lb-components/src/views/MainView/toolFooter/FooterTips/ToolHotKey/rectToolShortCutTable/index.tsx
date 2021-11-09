import DrawRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frame_kj.svg';
import DrawInvalidRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameNull_kj.svg';
import MouseLeftSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import SelectedRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameActive_kj.svg';
import MouseRightSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import ChangeValidSvg from '@/assets/annotation/toolHotKeyIcon/icon_frameChange_kj.svg';
import DeleteRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_del_kj.svg';
import {
  backward,
  dargWithRightClick,
  forward,
  // fullScreen,
  restore,
  revoke,
  rotate,
  scale,
  tabChangeSelected,
  tabReverseChangeSelected,
} from '../common';
import i18n from 'lb-utils';

export const drawRect = {
  name: i18n.t('AnnotateRect'),
  icon: DrawRectSvg,
  shortCut: [MouseLeftSvg, MouseLeftSvg],
};

export const drawInvalidRect = {
  name: i18n.t('AnnotateInvalidRect'),
  icon: DrawInvalidRectSvg,
  shortCut: [MouseLeftSvg, 'Ctrl', MouseLeftSvg],
};

export const selectRect = {
  name: i18n.t('SelectRect'),
  icon: SelectedRectSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: i18n.t('RightClick'),
};

export const changeValid = {
  name: i18n.t('ToggleRectEffectiveness'),
  icon: ChangeValidSvg,
  shortCut: ['F'],
};

export const changeValidByClick = {
  name: i18n.t('ToggleRectEffectiveness'),
  icon: ChangeValidSvg,
  shortCut: ['Ctrl', MouseLeftSvg],
};

export const deleteRect = {
  name: i18n.t('DeleteRect'),
  icon: DeleteRectSvg,
  shortCut: [MouseRightSvg],
  noticeInfo: i18n.t('SelectAndDoubleClick'),
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
  // fullScreen,
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
