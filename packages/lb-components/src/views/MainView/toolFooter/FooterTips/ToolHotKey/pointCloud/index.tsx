import _ from 'lodash';
import { backward, forward, fullScreen, scale } from '../common';
import dragIcon from '@/assets/annotation/toolHotKeyIcon/icon_move_kj.svg';
import leftClick from '@/assets/annotation/toolHotKeyIcon/icon_mouse_left_kj.svg';
import rightClick from '@/assets/annotation/toolHotKeyIcon/icon_mouse_right_kj.svg';
import changePointCloudValid from '@/assets/annotation/pointCloudTool/changePointCloudValid.svg';
import copy from '@/assets/annotation/pointCloudTool/copy.svg';
import nextBox from '@/assets/annotation/pointCloudTool/nextBox.svg';
import paste from '@/assets/annotation/pointCloudTool/patse.svg';
import prevBox from '@/assets/annotation/pointCloudTool/prevBox.svg';
import rotate90_black from '@/assets/annotation/pointCloudTool/rotate90_black.svg';
import selectAll from '@/assets/annotation/pointCloudTool/selectAll.svg';
import selectMultiple from '@/assets/annotation/pointCloudTool/selectMultiple.svg';
import TabChangeSelectedSvg from '@/assets/annotation/toolHotKeyIcon/icon_tab_kj.svg';
import DeleteSvg from '@/assets/annotation/toolHotKeyIcon/icon_del_kj.svg';
import LassoSelectorSvg from '@/assets/annotation/pointCloudTool/lassoSelector.svg';
import RectSvg from '@/assets/annotation/rectTool/icon_rect.svg';
import CirCleSelectorSvg from '@/assets/annotation/pointCloudTool/circleSelector.svg';
import AddSvg from '@/assets/annotation/pointCloudTool/addSvg.svg';
import ClearSvg from '@/assets/annotation/pointCloudTool/clearSvg.svg';
import Image2DBoxScaleSvg from '@/assets/annotation/pointCloudTool/Image2DBoxScale.svg';

import { IShortcut } from '@/types/tool';
import React from 'react';
import { ReloadOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons';
import {
  polygon,
  invalidPolygon,
  selectedPolygon,
  changePolygonAttribute,
  deletePolygon,
  insertPolygonPoint,
  deletePolygonPoint,
} from '../polygon';

const changePointSize: IShortcut = {
  name: 'PointThickness',
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
  name: 'RotateAroundCenterPoint',
  icon: <ReloadOutlined />,
  shortCut: [leftClick],
  noticeInfo: 'DragOperation',
};

const Drag3D = {
  name: 'PointCloudViewTranslate',
  icon: dragIcon,
  shortCut: [rightClick],
  noticeInfo: 'Drag',
};

const DragTopView = {
  name: 'TopViewTranslate',
  icon: dragIcon,
  shortCut: [rightClick],
};

const ChangeInvalid = {
  name: 'ChangePointCloudValid',
  icon: changePointCloudValid,
  shortCut: ['V'],
};

const CopyBox = {
  name: 'CopyBox',
  icon: copy,
  shortCut: ['Ctrl', 'C'],
};

const PasteBox = {
  name: 'PasteBox',
  icon: paste,
  shortCut: ['Ctrl', 'V'],
};

const LeftRotate = {
  name: 'RotateLeft',
  icon: <RotateLeftOutlined />,
  shortCut: ['Q'],
};

const RightRotate = {
  name: 'RotateRight',
  icon: <RotateRightOutlined />,
  shortCut: ['E'],
};

const PrevBox = {
  name: 'PreviousBox',
  icon: prevBox,
  shortCut: ['Shift', 'Tab'],
};

const NextBox = {
  name: 'NextBox',
  icon: nextBox,
  shortCut: ['Tab'],
};

const Rotate90 = {
  name: 'Rotate90',
  icon: rotate90_black,
  shortCut: ['G'],
  noticeInfo: 'SelectedStatus',
};

const CopyPrevPage = {
  name: 'CopyPrevPage',
  icon: copy,
  shortCut: ['Alt', 'C'],
};

const ChangeBoxInvalid = {
  name: 'ChangeBoxValid',
  icon: TabChangeSelectedSvg,
  shortCut: ['F'],
  noticeInfo: 'SelectedStatus',
};

const SelectMulti = {
  name: 'MultiSelect',
  icon: selectMultiple,
  shortCut: ['Ctrl', rightClick],
};

const SelectAll = {
  name: 'SelectAllBox',
  icon: selectAll,
  shortCut: ['Ctrl', 'A'],
};

const deleteBox = {
  name: 'Delete',
  icon: DeleteSvg,
  shortCut: ['Del'],
  noticeInfo: 'SelectedStatus',
};

/**
 * PointCloud Segment.
 */

const LassoSelector = {
  name: 'LassoSelector',
  icon: LassoSelectorSvg,
  shortCut: ['H'],
  noticeInfo: 'SelectorMsg',
};

const RectSelector = {
  name: 'RectSelector',
  icon: RectSvg,
  shortCut: ['J'],
  noticeInfo: 'SelectorMsg',
};

const CircleSelector = {
  name: 'CircleSelector',
  icon: CirCleSelectorSvg,
  shortCut: ['K'],
  noticeInfo: 'SelectorMsg',
};

const Drag3DBySpace = {
  name: 'PointCloudViewTranslate',
  icon: dragIcon,
  shortCut: ['space', rightClick],
};

const AddMove = {
  name: 'AddPoint',
  icon: AddSvg,
  shortCut: ['U'],
};

const DeletePoint = {
  name: 'DeletePoint',
  icon: ClearSvg,
  shortCut: ['I'],
};

const Image2DBoxScale = {
  name: 'Image2DBoxScale',
  icon: Image2DBoxScaleSvg,
  shortCut: ['R'],
  noticeInfo: 'SelectedRect',
};

const pointCloudShortCutTable: IShortcut[] = [
  { name: 'GeneralOperation' },
  backward,
  forward,
  changePointSize,
  scale,
  rotateRoundCenter,
  Drag3D,
  DragTopView,
  ChangeInvalid,
  { name: 'RectPattern' },
  CopyBox,
  PasteBox,
  LeftRotate,
  RightRotate,
  PrevBox,
  NextBox,
  Rotate90,
  CopyPrevPage,
  ChangeBoxInvalid,
  deleteBox,
  SelectMulti,
  SelectAll,
  fullScreen,
  Image2DBoxScale,
];

const pointCloudShortCutTable_POLYGON: IShortcut[] = [
  { name: 'GeneralOperation' },
  backward,
  forward,
  changePointSize,
  scale,
  rotateRoundCenter,
  Drag3D,
  DragTopView,
  ChangeInvalid,
  { name: 'PolygonPattern' },
  polygon,
  invalidPolygon,
  selectedPolygon,
  changePolygonAttribute,
  deletePolygon,
  insertPolygonPoint,
  deletePolygonPoint,
];

const pointCloudShortCutTable_SEGMENT: IShortcut[] = [
  backward,
  forward,
  rotateRoundCenter,
  Drag3DBySpace,
  LassoSelector,
  RectSelector,
  CircleSelector,
  AddMove,
  DeletePoint,
];

export default pointCloudShortCutTable;

export { pointCloudShortCutTable_POLYGON, pointCloudShortCutTable_SEGMENT };
