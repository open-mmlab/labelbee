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
