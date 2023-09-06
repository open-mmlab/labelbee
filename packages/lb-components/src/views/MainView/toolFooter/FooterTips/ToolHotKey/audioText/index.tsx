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
