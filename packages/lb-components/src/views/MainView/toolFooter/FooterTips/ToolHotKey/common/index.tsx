import RevokeSvg from '@/assets/annotation/toolHotKeyIcon/icon_cencel_kj.svg';
import RestoreSvg from '@/assets/annotation/toolHotKeyIcon/icon_reform_kj.svg';
import ScaleSvg from '@/assets/annotation/toolHotKeyIcon/icon_loupe_kj.svg';
import ScaleShortCutSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_middle_kj.svg';
import FullScreenSvg from '@/assets/annotation/toolHotKeyIcon/icon_fullView_kj.svg';
import RotateSvg from '@/assets/annotation/toolHotKeyIcon/icon_reload_kj.svg';
import SetValidSvg from '@/assets/annotation/toolHotKeyIcon/setValid.svg';
import BackwardSvg from '@/assets/annotation/toolHotKeyIcon/icon_last_kj.svg';
import ForwardSvg from '@/assets/annotation/toolHotKeyIcon/icon_next_kj.svg';
import DragWithRightClickSvg from '@/assets/annotation/toolHotKeyIcon/icon_move_kj.svg';
import DragWithRightClickShortCutSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import DragWithLeftClickSvg from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import CopyBackwardResultSvg from '@/assets/annotation/toolHotKeyIcon/icon_copyBackwardResult.svg';
import TabChangeSelectedSvg from '@/assets/annotation/toolHotKeyIcon/icon_tab_kj.svg';
import TabReverseChangeSelectedSVG from '@/assets/annotation/toolHotKeyIcon/icon_alttab_kj.svg';

export const revoke = {
  name: '撤销',
  icon: RevokeSvg,
  shortCut: ['Ctrl', 'Z'],
};

export const restore = {
  name: '重做',
  icon: RestoreSvg,
  shortCut: ['Ctrl', 'Shift', 'Z'],
};

export const scale = {
  name: '放大/缩小',
  icon: ScaleSvg,
  shortCut: [ScaleShortCutSvg],
};

export const fullScreen = {
  name: '全屏',
  icon: FullScreenSvg,
  shortCut: ['F11'],
};

export const rotate = {
  name: '旋转',
  icon: RotateSvg,
  shortCut: ['R'],
  noticeInfo: '仅原图',
};

export const setValid = {
  name: '是否标为无效',
  icon: SetValidSvg,
  shortCut: ['Y'],
};

export const backward = {
  name: '上一张',
  icon: BackwardSvg,
  shortCut: ['A'],
};

export const forward = {
  name: '下一张',
  icon: ForwardSvg,
  shortCut: ['D'],
};

export const backwardPage = {
  name: '上一文件夹',
  icon: BackwardSvg,
  shortCut: ['Shift', 'A'],
};

export const forwardPage = {
  name: '下一文件夹',
  icon: ForwardSvg,
  shortCut: ['Shift', 'D'],
};

export const dargWithRightClick = {
  name: '拖动图片',
  icon: DragWithRightClickSvg,
  shortCut: [DragWithRightClickShortCutSvg],
  noticeInfo: '长按',
};

export const dargWithLeftClick = {
  name: '拖动图片',
  icon: DragWithRightClickSvg,
  shortCut: ['Space', DragWithLeftClickSvg],
};

export const forwardWithEnter = {
  name: '下一张',
  icon: ForwardSvg,
  shortCut: ['Ctrl', 'Enter'],
};

// export const chooseImg = {
//   name: '选图片',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_imgChose_kj.svg'),
//   shortCut: [import('@/assets/annotation/toolHotKeyIcon/icon_mouse_kj.svg')],
//   noticeInfo: '移动',
// };

// export const tag = {
//   name: '打标签',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'),
//   shortCut: [import('@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg')],
//   noticeInfo: '左击',
// };

// export const attributed = {
//   name: '选属性',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'),
//   shortCut: ['0', '9'],
//   linkSymbol: '~',
// };

// export const tagCtrl = {
//   name: '打标签',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'),
//   shortCut: ['Ctrl', import('@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg')],
// };

// export const tagPage = {
//   name: '打标签（整页）',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'),
//   shortCut: ['Ctrl', 'A'],
// };

// export const forwardByMouse = {
//   name: '下一张',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_next_kj.svg'),
//   shortCut: ['Ctrl', 'Enter'],
// };

// export const preLine = {
//   name: '上条线',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_up.svg'),
//   shortCut: ['W'],
// };

// export const nextLine = {
//   name: '下条线',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_down.svg'),
//   shortCut: ['S'],
// };

export const copyBackwardResult = {
  name: '复制上张',
  icon: CopyBackwardResultSvg,
  shortCut: ['ALT', 'C'],
};

// export const forwardTrack = {
//   name: '步进',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_forward_kj.svg'),
//   shortCut: ['&#8594;'],
//   shortCutUseHtml: true,
// };

// export const backTrack = {
//   name: '步退',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_back_kj.svg'),
//   shortCut: ['&#8592;'],
//   shortCutUseHtml: true,
// };

// export const playbackRate = {
//   name: '倍率',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_speed_kj.svg'),
//   shortCut: ['&#8593;', '&#8595;'],
//   shortCutUseHtml: true,
// };

// export const play = {
//   name: '播放/暂停',
//   icon: import('@/assets/annotation/toolHotKeyIcon/icon_playPause.svg'),
//   shortCut: ['Space'],
// };

// export const period = {
//   name: '截取片段',
//   icon: import('@/assets/annotation/video/icon_clip.svg'),
//   noticeInfo: '两次',
//   shortCut: ['X'],
// };

// export const time = {
//   name: '标时间点',
//   icon: import('@/assets/annotation/video/icon_env.svg'),
//   shortCut: ['E'],
// };

export const tabChangeSelected = {
  name: '切换选中',
  icon: TabChangeSelectedSvg,
  shortCut: ['Tab'],
};

export const tabReverseChangeSelected = {
  name: '逆序切换选中',
  icon: TabReverseChangeSelectedSVG,
  shortCut: ['Shift', 'Tab'],
};
