import _ from 'lodash';
import {
  rewind,
  backward,
  forward,
  forwardForward,
  fullScreen,
  playPause,
  saveResult,
  setValid,
  speed,
  tag,
  period,
  toggleTagMode,
  clipSelected,
  attributeLock,
  attributeClickLock,
  deleteRemark,
  preRemark,
  nextRemark,
} from '../common';
import {
  preLine,
  nextLine
} from '../line'
import IconPolygonMerge from '@/assets/annotation/toolHotKeyIcon/icon_polygonMerge_kj.svg';
import IconPolygonCut from '@/assets/annotation/toolHotKeyIcon/icon_polygonCut_kj.svg';
import DrawRectSvg from '@/assets/annotation/toolHotKeyIcon/icon_frame_kj.svg';

const audioForward = _.cloneDeep(forward);
const audioBackward = _.cloneDeep(backward);
const audioBackTrack = _.cloneDeep(rewind);
const audioForwardTrack = _.cloneDeep(forwardForward);
const audioPlaybackRate = _.cloneDeep(speed);
const audioTag = _.cloneDeep(tag);
const audioToggleTagMode = _.cloneDeep(toggleTagMode);
const audioToggleClipMode = _.cloneDeep(period);
const audioClipped = _.cloneDeep(tag);
const audioClipSelected = _.cloneDeep(clipSelected);
const audioPrev = _.cloneDeep(preLine);
const audioNext = _.cloneDeep(nextLine);

export const combineAudio = {
  name: '合并区间',
  icon: IconPolygonMerge,
  noticeInfo: '',
  shortCut: ['Alt', 'Z'],
};

export const splitAudio = {
  name: '分割区间',
  icon: IconPolygonCut,
  noticeInfo: '',
  shortCut: ['Alt', 'X'],
};

audioForward.name = '下一个';
audioBackward.name = '上一个';
audioBackTrack.name = '后退0.1s';
audioForwardTrack.name = '前进0.1s';
audioToggleClipMode.name = '切换截取模式';
audioClipped.name = '截取';
audioTag.name = '打标签/属性';
audioPrev.name = '上一区间';
audioNext.name = '下一区间';

audioClipped.icon = DrawRectSvg;

audioToggleClipMode.noticeInfo = '';

const audioTextToolShortCurTable = [
  saveResult,
  audioToggleTagMode,
  audioToggleClipMode,
  audioClipped,
  audioClipSelected,
  audioTag,
  attributeLock,
  attributeClickLock,
  playPause,
  audioPlaybackRate,
  audioForwardTrack,
  audioBackTrack,
  setValid,
  fullScreen,
  audioBackward,
  audioForward,
  deleteRemark,
  preRemark,
  nextRemark,
  audioPrev,
  audioNext,
  combineAudio,
  splitAudio,
];

export default audioTextToolShortCurTable
