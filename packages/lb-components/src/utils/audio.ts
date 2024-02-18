/**
 * @file 音频中用到的工具方法
 */

import { message as SenseMessage } from 'antd';
import { cStyle, cTool } from '@labelbee/lb-annotation';
import _ from 'lodash';
import { IInputList } from '@/types/main';
import Decimal from 'decimal.js';
import moment from 'moment';
import { ITextConfigItem } from '@labelbee/lb-utils';

const { COLORS_ARRAY, ICON_ARRAY, INVALID_ICON, NULL_COLOR, NULL_ICON, WHITE_FONT_COLOR_ARRAY } =
  cStyle;

const { ETextType } = cTool;

export const ATTRIBUTE_COLORS = [NULL_COLOR].concat(COLORS_ARRAY);

export const REGEXP_NUMBER = '^[0-9]+$';
export const REGEXP_ENGLISH = '^[A-Za-z]+$';

/**
 *  默认的文本配置列表
 */
export const DEFAULT_TEXT_CONFIG_ITEM: ITextConfigItem = {
  label: '文本',
  key: 'text',
  required: false,
  default: '',
  maxLength: 1000,
};

/**
 * 获取属性icon
 * @param attribute
 * @param attributeList
 */
export const getAttributeIcon = (attribute: string, attributeList: IInputList[], valid = true) => {
  const attributeIndex = attributeList.findIndex((i: any) => i.value === attribute);
  let src = ICON_ARRAY[attributeIndex % ICON_ARRAY.length] ?? NULL_ICON;
  if (!valid) {
    src = INVALID_ICON;
  }
  src = '';
  const img = new Image();
  img.src = src;
  return img;
};

/**
 * 获取正则校验的string
 * @param textCheckType
 * @param customFormat
 */
export const checkString = (textCheckType: number, customFormat: string) => {
  let regExpString = '';
  switch (textCheckType) {
    case ETextType.Order:
    case ETextType.NumberOnly:
      regExpString = REGEXP_NUMBER;
      break;
    case ETextType.EnglishOnly:
      regExpString = REGEXP_ENGLISH;
      break;
    case ETextType.CustomFormat:
      regExpString = customFormat;
      break;
  }
  return regExpString;
};

/**
 *
 * @param value 检测的值
 * @param checkString RegExp string
 */
export const checkTextAttibute = (value: string | undefined, checkString: string) => {
  if (value === undefined || value === '') {
    return true;
  } else {
    try {
      return new RegExp(checkString).test(value);
    } catch (error) {
      SenseMessage.destroy();
      SenseMessage.error('正则表达式填写错误');
      return false;
    }
  }
};

/**
 * 获取属性标注显示的数据
 * @param attribute
 * @param attributeList
 * @returns {string} 标注属性
 */
export const getAttributeShowText = (
  attribute: string | undefined,
  attributeList: IInputList[],
) => {
  try {
    const attributeIndex = getAttributeIndex(attribute, attributeList);
    return attributeList[attributeIndex]?.key ?? attribute;
  } catch (error) {
    return attribute;
  }
};

/**
 * 获取属性标注的索引
 * @param attribute
 * @param attributeList
 * @returns {number} 属性索引
 */
export const getAttributeIndex = (attribute: string | undefined, attributeList: IInputList[]) => {
  try {
    const attributeIndex = attributeList.findIndex((i: any) => i.value === attribute);
    return attributeIndex;
  } catch (error) {
    return -1;
  }
};

/**
 * 获取属性标注的索引
 * @param attribute
 * @param attributeList
 * @returns {string} 颜色hex值
 */
export const getAttributeColor = (attribute: string | undefined, attributeList: IInputList[]) => {
  try {
    const attributeIndex = getAttributeIndex(attribute, attributeList);
    if (attributeIndex === -1) {
      return NULL_COLOR;
    }
    return COLORS_ARRAY[attributeIndex % COLORS_ARRAY.length];
  } catch (error) {
    return NULL_COLOR;
  }
};

/**
 * v2.36新增当属性为背景色（紫色、棕色、蓝色），字体颜色为白色
 * @param attribute
 * @param attributeList
 * @returns {string} 字体颜色
 */
export const getAttributeFontColor = (
  attribute: string | undefined,
  attributeList: IInputList[],
) => {
  try {
    const attributeColor = getAttributeColor(attribute, attributeList);
    if (WHITE_FONT_COLOR_ARRAY.includes(attributeColor)) {
      return '#fff';
    }
    return '#333';
  } catch (error) {
    return '#333';
  }
};

/**
 * 文本标注：自动获取下一个序号（取当前数据的最大值 + 1）
 * @param toolResultList 工具的结果集
 * @param textCheckType
 */
export const getTextAttribute = (
  toolResultList: Array<{ textAttribute: string; [a: string]: any }>,
  textCheckType: number,
) => {
  try {
    if (textCheckType === ETextType.Order) {
      const textAttributeList = toolResultList
        .map((i) => parseInt(i.textAttribute, 10))
        .filter((order) => {
          return _.isNumber(order) && order < Number.MAX_SAFE_INTEGER && order >= 0;
        });
      textAttributeList.sort((a, b) => a - b);
      const maxOrder = textAttributeList.pop();
      return `${(maxOrder ? maxOrder : 0) + 1}`;
    }
    return '';
  } catch (error) {
    return '';
  }
};

/**
 * 更改数据的textAttribute
 * @param value
 * @param selectedID  工具中选中数据的ID
 * @param toolList 工具的结果集
 */
export const textChange = (value: string | undefined, selectedID: string, toolList: any[]) =>
  toolList.map((item) => {
    if (item.id === selectedID) {
      return {
        ...item,
        textAttribute: value,
      };
    }
    return item;
  });

/**
 * 获取错误提示的文案
 * @param textCheckType
 */
export const getErrorNotice = (textCheckType: number) => {
  switch (textCheckType) {
    case ETextType.Order:
    case ETextType.NumberOnly:
      return '请按仅数字的格式输入';
    case ETextType.EnglishOnly:
      return '请按仅英文的格式输入';
    case ETextType.CustomFormat:
      return '请按要求的格式输入';
    default:
      return '';
  }
};

/**
 * 验证文本是否通过
 * @param textCheckType
 * @param customFormat
 * @param text
 * @returns 文本是否校验通过
 */
export const textAttributeValidate = (
  textCheckType: number,
  customFormat: string,
  text: string,
) => {
  try {
    const reg = new RegExp(checkString(textCheckType, customFormat));
    return reg.test(text);
  } catch (error) {
    SenseMessage.error('正则填写错误');
  }
};
/**
 * 改变文本标注后 修改全部的LOG
 * @param toolLog LOG数据
 * @param toolList 工具的数据集
 */
export const changeTextAttributeInLog = (toolLog: any[][], toolList: any[]) => {
  return toolLog?.map((item) => {
    return item?.map((info) => {
      if (toolList?.findIndex((i) => i?.id === info?.id) > -1) {
        const changeRect = toolList?.find((i) => i?.id === info?.id);
        return {
          ...info,
          textAttribute: changeRect?.textAttribute,
        };
      } else {
        return info;
      }
    });
  });
};

/**
 * 修改rgba的透明度
 * @param color
 * @param opacity
 */
export const updateColorOpacity = (color: string, opacity: number) => {
  try {
    const colorArray = color.match(/\((.*)\)/)?.[1].split(',') || [];
    colorArray.splice(3, 1, opacity.toString());
    const newColorStr = colorArray.join(',');
    return `rgba(${newColorStr})`;
  } catch (e) {
    return color;
  }
};

/**
 * 精确减法
 * @param a
 * @param b
 * @returns
 */
export const precisionMinus = (a: number, b: number) => {
  return new Decimal(Number(a) || 0).minus(Number(b) || 0).toNumber();
};

/**
 * 精确加法
 * @param a
 * @param b
 * @returns
 */
export const precisionAdd = (a: number, b: number) => {
  return new Decimal(a).add(b).toNumber();
};

const generateIsDoubleClick = (interval: number) => {
  let preEvent: MouseEvent | null = null;
  const fn = (e: MouseEvent) => {
    if (!preEvent) {
      preEvent = e;
      setTimeout(() => {
        preEvent = null;
      }, interval);
      return false;
    }
    return e.target === preEvent?.target;
  };
  return fn;
};
// 间隔500ms点击同一元素视为双击
export const isDoubleClick = generateIsDoubleClick(500);

export const formatTime = (time: number) => {
  const milliseconds = Math.floor(time * 1000);
  const duration = moment.duration(milliseconds);
  const minutes = Math.floor(duration.asMinutes());
  return `${minutes}:${moment.utc(milliseconds).format('ss')}`;
};

export const timeFormat = (time: number, format = 'ss.S') => {
  const milliseconds = Math.floor(time * 1000);
  const duration = moment.duration(milliseconds);
  const minutes = fillZero(Math.floor(duration.asMinutes()));
  return `${minutes}:${moment.utc(milliseconds).format(format)}`;
};

const fillZero = (num: number) => {
  return num < 10 ? `0${num}` : num;
};

/**
 * 根据按下鼠标位置的时间节点、获取相同属性可调整的时间范围
 * @example
 * getCanMoveRange([165, 245.714], 332.8571428571429) => {min: 245.714, max: null}
 * getCanMoveRange([165, 245.714, 275], 90) => {min: null, max: 165}
 * getCanMoveRange([90, 165, 245.714, 332.857, 497.5], 263.2142857142857) => {min: 245.714, max: 332.857}
 *
 * @param {number} times 相同属性的时间节点
 * @param {number} eventDownTime 按下鼠标位置的时间节点
 */
export const getCanMoveRange = (times: number[], eventDownTime: number) => {
  let min = null;
  let max = null;
  const len = times.length;

  if (len === 0) {
    return {
      min,
      max,
    };
  }

  let minIndex = 0;

  if (eventDownTime < times[minIndex]) {
    max = times[minIndex];
  } else {
    times.forEach((item, index) => {
      if (eventDownTime > item) {
        min = item;
        minIndex = index;
      }
    });
    if (min && minIndex < len - 1) {
      max = times[minIndex + 1];
    }
  }

  return {
    min,
    max,
  };
};

// 触发一次窗口的resize事件，解决 WaveSurfer 不自动调整宽度的问题
export const dispatchResizeEvent = () => {
  const e = document.createEvent('Event');
  e.initEvent('resize', true, true);
  window.dispatchEvent(e);
};

// 判断是否为有效图片
export function isImageValue(result: string) {
  try {
    const data = JSON.parse(result);
    return typeof data.valid === 'boolean' ? data.valid : true;
  } catch {
    return true;
  }
}
