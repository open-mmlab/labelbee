import { isNumber } from 'lodash';
import { COLORS_ARRAY, ICON_ARRAY, INVALID_ICON, NULL_COLOR, NULL_ICON } from '../../constant/style';
import { ETextType } from '../../constant/tool';
// import { message } from 'antd';

export const ATTRIBUTE_COLORS = [NULL_COLOR].concat(COLORS_ARRAY);

export const REGEXP_NUMBER = '^[0-9]+$';
export const REGEXP_ENGLISH = '^[A-Za-z]+$';

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
    default: {
      break;
    }
  }
  return regExpString;
};

/**
 *
 * @param value 检测的值
 * @param checkString RegExp string
 */
export const checkTextAttibute = (value: string | undefined, checkStrings: string) => {
  if (value === undefined || value === '') {
    return true;
  }
  try {
    return new RegExp(checkStrings).test(value);
  } catch (error) {
    // message.destroy();
    // message.error('正则表达式填写错误');
    return false;
  }
};

/**
 * 获取属性标注显示的数据
 * @param attribute
 * @param attributeList
 * @returns {string} 标注属性
 */
export const getAttributeShowText = (attribute: string | undefined, attributeList: IInputList[]) => {
  try {
    const attributeIndex = attributeList.findIndex((i: any) => i.value === attribute);
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
    if (attributeIndex >= 8) {
      // 大于指定颜色范围后需要循环

      return attributeIndex % 8;
    }

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
export const getAttributeColor: any = (attribute: string | undefined, attributeList: IInputList[]) => {
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
 * 文本标注：自动获取下一个序号（取当前数据的最大值 + 1）
 * @param toolResultList 工具的结果集
 * @param textCheckType
 */
export const getTextAttribute = (toolResultList: IRect[] | ILine[], textCheckType: number) => {
  try {
    if (textCheckType === ETextType.Order) {
      const textAttributeList = toolResultList
        .map((i: any) => parseInt(i.textAttribute, 10))
        .filter((order: any) => {
          return isNumber(order) && order < Number.MAX_SAFE_INTEGER && order >= 0;
        });
      textAttributeList.sort((a: any, b: any) => a - b);
      const maxOrder = textAttributeList.pop();
      return `${(maxOrder || 0) + 1}`;
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
export const textAttributeValidate = (textCheckType: number, customFormat: string, text: string) => {
  try {
    const reg = new RegExp(checkString(textCheckType, customFormat));
    return reg.test(text);
  } catch (error) {
    // message.error('正则填写错误');
  }
};

/**
 * 检查结果的文本标注数据是否可以通过
 * @param textCheckType
 * @param customFormat
 * @param resultList 需要检查的结果集
 */
export const checkTextAttribute = (
  textCheckType: ETextType,
  customFormat: string,
  resultList: any[],
  selectedID?: string,
): boolean => {
  let error = false;
  resultList.forEach((item) => {
    if (item?.textAttribute === undefined || item?.textAttribute === '') {
      return;
    }
    if (
      (selectedID ? item.id === selectedID : true) &&
      !textAttributeValidate(textCheckType, customFormat, item.textAttribute)
    ) {
      error = true;
    }
  });
  if (error) {
    // message.error(getErrorNotice(textCheckType));
    return true;
  }
  return false;
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
      }
      return info;
    });
  });
};
