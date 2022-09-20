import _ from 'lodash';
import { backward, forward, fullScreen, scale } from '../common';
import dragIcon from '@/assets/annotation/toolHotKeyIcon/icon_move_kj.svg';
import leftClick from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import rightClick from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import changePointCloudValid from '@/assets/annotation/pointCloudTool/changePointCloudValid.svg';
import copy from '@/assets/annotation/pointCloudTool/copy.svg';
import nextBox from '@/assets/annotation/pointCloudTool/nextBox.svg';
import patse from '@/assets/annotation/pointCloudTool/patse.svg';
import prevBox from '@/assets/annotation/pointCloudTool/prevBox.svg';
import rotate180_black from '@/assets/annotation/pointCloudTool/rotate180_black.svg';
import selectAll from '@/assets/annotation/pointCloudTool/selectAll.svg';
import selectMultiple from '@/assets/annotation/pointCloudTool/selectMultiple.svg';
import TabChangeSelectedSvg from '@/assets/annotation/toolHotKeyIcon/icon_tab_kj.svg';

import { IShortcut } from '@/types/tool';
import React from 'react';
import { ReloadOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons';

const changePointSize: IShortcut = {
  name: '点的显示粗细',
  icon: (
    <span
      style={{
        display: ' inline-block',
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: '1px solid',
      }}
    />
  ),
  shortCut: ['+', '-'],
  linkSymbol: '',
};

const rotateRoundCenter: IShortcut = {
  name: '绕中心点旋转画面',
  icon: <ReloadOutlined />,
  shortCut: [leftClick],
  noticeInfo: '拖动',
};

const Drag3D = {
  name: '点云平移',
  icon: dragIcon,
  shortCut: [rightClick],
  noticeInfo: '拖动',
};

const DragTopView = {
  name: '俯视图平移',
  icon: dragIcon,
  shortCut: [rightClick],
  noticeInfo: '拖动',
};

const ChangeInvalid = {
  name: '切换点云有效性',
  icon: changePointCloudValid,
  shortCut: ['V'],
};

const CopyBox = {
  name: '复制框',
  icon: copy,
  shortCut: ['Ctrl', 'C'],
};

const PasteBox = {
  name: '粘贴框',
  icon: patse,
  shortCut: ['Ctrl', 'V'],
};

const LeftRotate = {
  name: '向左旋转微调',
  icon: <RotateLeftOutlined />,
  shortCut: ['Q'],
};

const RightRotate = {
  name: '向右旋转微调',
  icon: <RotateRightOutlined />,
  shortCut: ['E'],
};

const PrevBox = {
  name: '上一框',
  icon: prevBox,
  shortCut: ['Z'],
};

const NextBox = {
  name: '下一框',
  icon: nextBox,
  shortCut: ['C'],
};

const Rotate180 = {
  name: '旋转180°',
  icon: rotate180_black,
  shortCut: ['G'],
  noticeInfo: '选中时',
};

const CopyPrevPage = {
  name: '复制上一页',
  icon: copy,
  shortCut: ['Alt', 'C'],
};

const ChangeBoxInvalid = {
  name: '切换标注框有效性',
  icon: TabChangeSelectedSvg,
  shortCut: ['F'],
  noticeInfo: '选中时',
};

const SelectMulti = {
  name: '多选',
  icon: selectMultiple,
  shortCut: ['Ctrl', rightClick],
};

const SelectAll = {
  name: '全选',
  icon: selectAll,
  shortCut: ['Ctrl', 'A'],
};

const pointCloudShortCutTable: IShortcut[] = [
  { name: '通用' },
  backward,
  forward,
  changePointSize,
  scale,
  rotateRoundCenter,
  Drag3D,
  DragTopView,
  ChangeInvalid,
  { name: '拉框模式' },
  CopyBox,
  PasteBox,
  LeftRotate,
  RightRotate,
  PrevBox,
  NextBox,
  Rotate180,
  CopyPrevPage,
  ChangeBoxInvalid,
  SelectMulti,
  SelectAll,
  fullScreen,
];

export default pointCloudShortCutTable;
