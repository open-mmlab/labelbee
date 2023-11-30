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
  name: 'CombineAudio',
  icon: IconPolygonMerge,
  noticeInfo: '',
  shortCut: ['Alt', 'Z'],
};

export const splitAudio = {
  name: 'ClipAudio',
  icon: IconPolygonCut,
  noticeInfo: '',
  shortCut: ['Alt', 'X'],
};

audioForward.name = 'NextFile';
audioBackward.name = 'PreviousFile';
audioBackTrack.name = 'Forward0.1';
audioForwardTrack.name = 'Back0.1';
audioToggleClipMode.name = 'SwitchClipMode';
audioClipped.name = 'Clip';
audioTag.name = 'TaggingOrAttr';
audioPrev.name = 'PreviousInterval';
audioNext.name = 'NextInterval';

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
