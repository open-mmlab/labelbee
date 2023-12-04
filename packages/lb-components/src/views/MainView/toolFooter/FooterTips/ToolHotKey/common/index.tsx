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
import IconSaveKj from '@/assets/annotation/toolHotKeyIcon/icon_save_kj.svg';
import IconLineSpecialKj from '@/assets/annotation/toolHotKeyIcon/icon_lineSpecial_kj.svg';
import IconNoDisplay from '@/assets/annotation/toolHotKeyIcon/icon_noDisplay.svg';
import IconEyeLockKj from '@/assets/annotation/toolHotKeyIcon/icon_eyeLock_kj.svg';
import IconPlayPause from '@/assets/annotation/toolHotKeyIcon/icon_playPause.svg';
import IconFastForward from '@/assets/annotation/toolHotKeyIcon/icon_forward_kj.svg';
import IconRewind from '@/assets/annotation/toolHotKeyIcon/icon_back_kj.svg';
import IconSpeed from '@/assets/annotation/toolHotKeyIcon/icon_speed_kj.svg';
import ToggleTagModeSvg from '@/assets/annotation/audio/tag.svg';
import IconTagKj from '@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'
import IconClip from '@/assets/annotation/video/icon_clip.svg'
import IconClipSelected from '@/assets/annotation/toolHotKeyIcon/icon_frameActive_kj.svg';
import IconDeleteRemark from '@/assets/annotation/toolHotKeyIcon/deleteRemark.svg';
import IconPreRemark from '@/assets/annotation/toolHotKeyIcon/preRemark.svg';
import IconNextRemark from '@/assets/annotation/toolHotKeyIcon/nextRemark.svg';

export const revoke = {
  name: 'Undo',
  icon: RevokeSvg,
  shortCut: ['Ctrl', 'Z'],
};

export const restore = {
  name: 'Redo',
  icon: RestoreSvg,
  shortCut: ['Ctrl', 'Shift', 'Z'],
};

export const scale = {
  name: 'Scale',
  icon: ScaleSvg,
  shortCut: [ScaleShortCutSvg],
};

export const fullScreen = {
  name: 'Fullscreen',
  icon: FullScreenSvg,
  shortCut: ['F11'],
};

export const rotate = {
  name: 'Rotate',
  icon: RotateSvg,
  shortCut: ['R'],
  noticeInfo: 'ToOriginalStep',
};

export const setValid = {
  name: 'ToggleEffectiveness',
  icon: SetValidSvg,
  shortCut: ['Y'],
};

export const backward = {
  name: 'PreviousImage',
  icon: BackwardSvg,
  shortCut: ['A'],
};

export const forward = {
  name: 'NextImage',
  icon: ForwardSvg,
  shortCut: ['D'],
};

export const backwardPage = {
  name: 'PreviousFolder',
  icon: BackwardSvg,
  shortCut: ['Shift', 'A'],
};

export const forwardPage = {
  name: 'NextFolder',
  icon: ForwardSvg,
  shortCut: ['Shift', 'D'],
};

export const dargWithRightClick = {
  name: 'Drag',
  icon: DragWithRightClickSvg,
  shortCut: [DragWithRightClickShortCutSvg],
  noticeInfo: 'Press',
};

export const dargWithLeftClick = {
  name: 'Drag',
  icon: DragWithRightClickSvg,
  shortCut: ['Space', DragWithLeftClickSvg],
};

export const forwardWithEnter = {
  name: 'Next',
  icon: ForwardSvg,
  shortCut: ['Ctrl', 'Enter'],
};

export const copyBackwardResult = {
  name: 'CopyThePrevious',
  icon: CopyBackwardResultSvg,
  shortCut: ['ALT', 'C'],
};

export const attributeLock = {
  name: 'SpecifiedAttributesOnly',
  icon: IconEyeLockKj,
  shortCut: ['Shift', 'Number'],
};

export const attributeClickLock = {
  name: 'SpecifiedAttributesOnly',
  icon: IconEyeLockKj,
  shortCut: ['Shift', DragWithLeftClickSvg],
};

export const tabChangeSelected = {
  name: 'ToggleSelected',
  icon: TabChangeSelectedSvg,
  shortCut: ['Tab'],
};

export const tabReverseChangeSelected = {
  name: 'ToggleSelectedReverse',
  icon: TabReverseChangeSelectedSVG,
  shortCut: ['Shift', 'Tab'],
};

export const hidden = {
  name: 'HideGraphics',
  icon: IconNoDisplay,
  noticeInfo: '',
  shortCut: ['Z'],
};

export const changeSpecialLine = {
  name: 'ToggleLineParticularity',
  icon: IconLineSpecialKj,
  noticeInfo: 'ToSide',
  shortCut: ['Shift', DragWithLeftClickSvg],
};

export const saveResult = {
  name: 'Save',
  icon: IconSaveKj,
  shortCut: ['Ctrl', 'S'],
};

export const speed = {
  name: 'Speed',
  icon: IconSpeed,
  shortCut: ['&#8593;', '&#8595;'],
  shortCutUseHtml: true,
};

export const playPause = {
  name: 'PlayPause',
  icon: IconPlayPause,
  shortCut: ['Space'],
};

export const forwardForward = {
  name: 'FastForward',
  icon: IconFastForward,
  shortCut: ['&#8594;'],
  shortCutUseHtml: true,
};

export const rewind = {
  name: 'Rewind',
  icon: IconRewind,
  shortCut: ['&#8592;'],
  shortCutUseHtml: true,
};

export const toggleTagMode = {
  name: 'SwitchTagMode',
  icon: ToggleTagModeSvg,
  shortCut: ['L'],
};

export const tag = {
  name: '打标签',
  icon: IconTagKj,
  shortCut: [DragWithLeftClickSvg],
  noticeInfo: 'LeftClick',
};

export const period = {
  name: '截取片段',
  icon: IconClip,
  noticeInfo: '两次',
  shortCut: ['X'],
};

export const clipSelected = {
  name: 'ClipSelect',
  icon: IconClipSelected,
  shortCut: [DragWithRightClickShortCutSvg],
  noticeInfo: 'RightClick',
};

export const deleteRemark = {
  name: 'DeleteComment',
  icon: IconDeleteRemark,
  shortCut: ['Delete'],
  noticeInfo: 'SelectedStatus',
};

export const nextRemark = {
  name: 'NextComment',
  icon: IconNextRemark,
  shortCut: ['Tab'],
};

export const preRemark = {
  name: 'PreviousComment',
  icon: IconPreRemark,
  shortCut: ['Shift', 'Tab'],
};
