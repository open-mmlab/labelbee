import canvasEdit0 from '../assets/attributeIcon/icon_canvasEdit0.svg';
import canvasEdit1 from '../assets/attributeIcon/icon_canvasEdit1.svg';
import canvasEdit2 from '../assets/attributeIcon/icon_canvasEdit2.svg';
import canvasEdit3 from '../assets/attributeIcon/icon_canvasEdit3.svg';
import canvasEdit4 from '../assets/attributeIcon/icon_canvasEdit4.svg';
import canvasEdit5 from '../assets/attributeIcon/icon_canvasEdit5.svg';
import canvasEdit6 from '../assets/attributeIcon/icon_canvasEdit6.svg';
import canvasEdit7 from '../assets/attributeIcon/icon_canvasEdit7.svg';
import canvasEdit8 from '../assets/attributeIcon/icon_canvasEdit8.svg';

// 基础颜色
import baseEditLan from '../assets/attributeIcon/icon_editLAN.svg';
import baseEditQing from '../assets/attributeIcon/icon_editQING.svg';
import baseEditLv from '../assets/attributeIcon/icon_editLV.svg';
import baseEditHuang from '../assets/attributeIcon/icon_editHUANG.svg';
import baseEditFen from '../assets/attributeIcon/icon_editFEN.svg';

import { EFilterToolOperation } from './tool';

import INVALID_ICON from '../assets/attributeIcon/icon_canvasEdit_miss.svg';

const NULL_ICON = canvasEdit0;
/** 全局的样式常量 */

export const HEADER_HEIGHT = 61;
/** 全局设置padding: 20px 16px 内置margin: 16px 总共78px */
export const TAB_HEIGHT = 80;
/** 搜索栏高度 使用Form表单 */
export const SEARCH_HEIGHT = 62;
/** 常规padding值 */
export const PADDING = 20;
/** table的size为default的每行高度 */
export const TABLE_ROW_HEIGHT = 55;
/** pagination的size为small的高度 + padding: 0 20px */
export const PAGINATION_HEIGHT = 55;

export const TIPS_HEIGHT = 40;
export const FOOTER_HEIGHT = 80;
export const SIDERBAR_WIDTH = 240;
export const EDIT_STEP_WIDTH = 320;

/**  bee主色 - 蓝紫：rgba(102, 111, 255, 1) */
export const THEME_COLOR = 'rgba(102, 111, 255, 1)';

export const COLORS_ARRAY = [
  'rgba(128, 12, 249, 1)', // 6
  'rgba(0, 255, 48, 1)', // 3
  'rgba(255, 136, 247, 1)', // 7
  'rgba(255, 226, 50, 1)', // 2
  'rgba(153, 66, 23, 1)', // 8
  'rgba(2, 130, 250, 1)', // 5
  'rgba(255, 35, 35, 1)', // 1
  'rgba(0, 255, 234, 1)', // 4
];

/** svg icon */
export const ICON_ARRAY = [
  canvasEdit0,
  canvasEdit6,
  canvasEdit3,
  canvasEdit7,
  canvasEdit2,
  canvasEdit8,
  canvasEdit5,
  canvasEdit1,
  canvasEdit4,
];

/** svg base icon */
export const BASE_ICON: { [a: number]: any } = {
  1: baseEditLan,
  3: baseEditQing,
  5: baseEditLv,
  7: baseEditHuang,
  9: baseEditFen,
};

/** 无效色 - 红：rgba(255, 51, 51, 1) */
export const INVALID_COLOR = 'rgba(255, 51, 51, 1)';
export const INVALID_COLOR_RGBA = {
  r: 255,
  g: 51,
  b: 51,
  a: 1,
};

export const NULL_COLOR = 'rgba(204, 204, 204, 1)';

export { NULL_ICON, INVALID_ICON };

/**
 *   @index0 粉：rgba(255, 51, 255, 1)
 *   @index1 蓝：rgba(51, 153, 255, 1)
 *   @index2 绿：rgba(51, 254, 51, 1)
 *   @index3 红：rgba(255, 51, 51, 1)
 */
export const FILTER_TOOL_COLOR = {
  [EFilterToolOperation.lc]: 'rgba(153, 51, 255, 1)',
  [EFilterToolOperation.rc]: 'rgba(51, 153, 255, 1)',
  [EFilterToolOperation.clc]: 'rgba(46, 230, 46, 1)',
  [EFilterToolOperation.crc]: 'rgba(255, 51, 51, 1)',
};

export const styleString = `{"color":1,"width":2,"borderOpacity":9,"fillOpacity":9,"toolColor":{"1":{"valid":{"stroke":"rgba(0,0,255,0.50)","fill":"rgba(0,0,255,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validSelected":{"stroke":"rgba(0,15,255,1.00)","fill":"rgba(0,15,255,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,0.80)","fill":"rgba(255,153,102,0.19)"},"validHover":{"stroke":"rgba(0,15,255,0.80)","fill":"rgba(0,15,255,0.51)"},"invalidHover":{"stroke":"rgba(255,153,102,0.50)","fill":"rgba(255,153,102,0.32)"}},"3":{"valid":{"stroke":"rgba(0,255,255,0.50)","fill":"rgba(0,255,255,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validSelected":{"stroke":"rgba(0,212,255,1.00)","fill":"rgba(0,212,255,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,0.80)","fill":"rgba(255,153,102,0.19)"},"validHover":{"stroke":"rgba(0,212,255,0.80)","fill":"rgba(0,212,255,0.51)"},"invalidHover":{"stroke":"rgba(255,153,102,0.50)","fill":"rgba(255,153,102,0.32)"}},"5":{"valid":{"stroke":"rgba(0,255,0,0.50)","fill":"rgba(0,255,0,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validSelected":{"stroke":"rgba(149,255,1.00)","fill":"rgba(149,255,0,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,0.80)","fill":"rgba(255,153,102,0.19)"},"validHover":{"stroke":"rgba(149,255,0,0.80)","fill":"rgba(149,255,0,0.51)"},"invalidHover":{"stroke":"rgba(255,153,102,0.50)","fill":"rgba(255,153,102,0.32)"}},"7":{"valid":{"stroke":"rgba(255,255,0,0.50)","fill":"rgba(255,255,0,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validSelected":{"stroke":"rgba(255,230,102,1.00)","fill":"rgba(255,213,0,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,0.80)","fill":"rgba(255,153,102,0.19)"},"validHover":{"stroke":"rgba(255,230,102,0.80)","fill":"rgba(255,230,102,0.51)"},"invalidHover":{"stroke":"rgba(255,153,102,0.50)","fill":"rgba(255,153,102,0.32)"}},"9":{"valid":{"stroke":"rgba(255,0,255,0.50)","fill":"rgba(255,0,255,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validSelected":{"stroke":"rgba(230,102,255,1.00)","fill":"rgba(213,0,255,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,0.80)","fill":"rgba(255,153,102,0.19)"},"validHover":{"stroke":"rgba(230,102,255,0.80)","fill":"rgba(230,102,255,0.51)"},"invalidHover":{"stroke":"rgba(255,153,102,0.50)","fill":"rgba(255,153,102,0.32)"}}},"attributeColor":[{"valid":{"stroke":"rgba(204,204,204,1.00)","fill":"rgba(204,204,204,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(204,204,204,1.00)","fill":"rgba(204,204,204,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(204,204,204,1.00)","fill":"rgba(204,204,204,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(128,12,249,1.00)","fill":"rgba(128,12,249,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(128,12,249,1.00)","fill":"rgba(128,12,249,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(128,12,249,1.00)","fill":"rgba(128,12,249,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(0,255,48,1.00)","fill":"rgba(0,255,48,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(0,255,48,1.00)","fill":"rgba(0,255,48,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(0,255,48,1.00)","fill":"rgba(0,255,48,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(255,136,247,1.00)","fill":"rgba(255,136,247,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(255,136,247,1.00)","fill":"rgba(255,136,247,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(255,136,247,1.00)","fill":"rgba(255,136,247,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(255,226,50,1.00)","fill":"rgba(255,226,50,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(255,226,50,1.00)","fill":"rgba(255,226,50,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(255,226,50,1.00)","fill":"rgba(255,226,50,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(153,66,23,1.00)","fill":"rgba(153,66,23,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(153,66,23,1.00)","fill":"rgba(153,66,23,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(153,66,23,1.00)","fill":"rgba(153,66,23,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(2,130,250,1.00)","fill":"rgba(2,130,250,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(2,130,250,1.00)","fill":"rgba(2,130,250,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(2,130,250,1.00)","fill":"rgba(2,130,250,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(255,35,35,1.00)","fill":"rgba(255,35,35,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(255,35,35,1.00)","fill":"rgba(255,35,35,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(255,35,35,1.00)","fill":"rgba(255,35,35,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}},{"valid":{"stroke":"rgba(0,255,234,1.00)","fill":"rgba(0,255,234,0.32)"},"invalid":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.32)"},"validSelected":{"stroke":"rgba(0,255,234,1.00)","fill":"rgba(0,255,234,0.64)"},"invalidSelected":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"},"validHover":{"stroke":"rgba(0,255,234,1.00)","fill":"rgba(0,255,234,0.64)"},"invalidHover":{"stroke":"rgba(255,153,102,1.00)","fill":"rgba(255,153,102,0.64)"}}],"lineColor":{"1":"rgba(102, 111, 255, 1 )","3":"rgba(102, 230, 255, 1)","5":"rgba(191, 255, 102, 1)","7":"rgba(255, 230, 102, 1)","9":"rgba(230, 102, 255, 1)"},"attributeLineColor":["rgba(204, 204, 204, 1)","rgba(128, 12, 249, 1)","rgba(0, 255, 48, 1)","rgba(255, 136, 247, 1)","rgba(255, 226, 50, 1)","rgba(153, 66, 23, 1)","rgba(2, 130, 250, 1)","rgba(255, 35, 35, 1)","rgba(0, 255, 234, 1)"]}`;
