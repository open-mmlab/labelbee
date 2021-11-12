import iconTagKj from '@/assets/annotation/toolHotKeyIcon/icon_tag_kj.svg'

import {
  backward,
  dargWithLeftClick,
  dargWithRightClick,
  forward,
  // fullScreen,
  rotate,
  // saveResult,
  scale,
  // setValid,
} from '../common';

export const tagInSingleImg: any = {
  name: 'Tagging',
  icon: iconTagKj,
  shortCut: [1, 9],
};

// 单图
const tagToolSingleShortCutTable = [
  // saveResult,
  tagInSingleImg,
  rotate,
  // fullScreen,
  scale,
  // setValid,
  backward,
  forward,
  dargWithRightClick,
  dargWithLeftClick,
];
export default tagToolSingleShortCutTable;

