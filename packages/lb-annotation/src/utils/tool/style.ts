import { COLORS_ARRAY, NULL_COLOR } from '../../constant/style';

export const ATTRIBUTE_COLORS = [NULL_COLOR].concat(COLORS_ARRAY);

const FILL_OPACITY = 0.8;

export interface IStyleState {
  toolStyle?: any;
  toolStyleConfig: IToolStyleConfig;
}

export interface IToolStyleConfig {
  width?: number;
  color?: number;
  opacity?: number;
}

export type TToolStyleConfig = 'width' | 'color' | 'opacity';

export const toolColor = {
  valid: {
    stroke: 'rgba(102, 111, 255, 0.6)',
    fill: 'rgba(102, 111, 255, 0.3)',
  },
  invalid: {
    stroke: 'rgba(255, 153, 102,1)',
    fill: 'rgba(255, 153, 102, 0.5)',
  },
  validSelected: {
    stroke: 'rgba(0, 15, 255, 0.8)',
    fill: 'rgba(0, 15, 255, 0.4)',
  },
  invalidSelected: {
    stroke: 'rgba(255,153,102,0.8)',
    fill: 'rgba(255,153,102,0.3)',
  },
  validHover: {
    stroke: 'rgba(0, 15, 255, 1)',
    fill: 'rgba(0, 15, 255, 0.5)',
  },

  invalidHover: {
    stroke: 'rgba(255,153,102,1)',
    fill: 'rgba(255,153,102,0.5)',
  },
  validTextColor: '#000FFF',
  invalidTextColor: 'rgba(255, 102, 102, 1)',
};

const changeColor: { [a: number]: any } = {
  1: {
    valid: 'rgba(0, 0, 255, 0.5)',
    select: {
      stroke: 'rgba(0, 15, 255, 1)',
      fill: 'rgba(0,15,255, 1)',
    },
    hover: 'rgba(0, 15, 255, 0.8)',
    line: 'rgba(102, 111, 255, 1 )',
  },
  3: {
    valid: 'rgba(0, 255, 255, 0.5)',
    select: {
      stroke: 'rgba(0, 212, 255,  1)',
      fill: 'rgba(0,212,255, 1)',
    },
    hover: 'rgba(0, 212, 255, 0.8)',
    line: 'rgba(102, 230, 255, 1)',
  },
  5: {
    valid: 'rgba(0, 255, 0, 0.5)',
    select: {
      stroke: 'rgba(149, 255, 1)',
      fill: 'rgba(149,255,0, 1)',
    },
    hover: 'rgba(149, 255, 0, 0.8)',
    line: 'rgba(191, 255, 102, 1)',
  },
  7: {
    valid: 'rgba(255, 255, 0, 0.5)',
    select: {
      stroke: 'rgba(255, 230, 102, 1)',
      fill: 'rgba(255,213,0, 1)',
    },
    hover: 'rgba(255, 230, 102, 0.8)',
    line: 'rgba(255, 230, 102, 1)',
  },
  9: {
    valid: 'rgba(255, 0, 255, 0.5)',
    select: {
      stroke: 'rgba(230, 102, 255, 1)',
      fill: 'rgba(213,0,255, 1)',
    },
    hover: 'rgba(230, 102, 255, 0.8)',
    line: 'rgba(230, 102, 255, 1)',
  },
};

export const changeOpacity: { [a: number]: number } = {
  1: 0.2,
  3: 0.4,
  5: 0.6,
  7: 0.8,
  9: 1.0,
};

// 计算透明度
const getOpacity = (opacity: number, color: string) => {
  const newColor = color.split(' ').join('');

  if (!newColor) {
    return changeOpacity[opacity] * Number(1);
  }

  // @ts-ignore
  const firstOpacity = newColor.match(/,\d+(\.\d+){0,1}\)/)[0].match(/\d+(\.\d+){0,1}/)[0];
  return changeOpacity[opacity] * Number(firstOpacity);
};

export const colorSplit = (color: string, opacity: number) => {
  return color
    .split(' ')
    .join('')
    .replace(/,\d+(\.\d+){0,1}\)/, `,${opacity.toFixed(2)})`);
};

/**
 *
 * @param style {IToolStyleConfig}
 */
export const getShowColor = (style: IToolStyleConfig = { color: 1, opacity: 9, width: 2 }) => {
  const { color = 1, opacity = 9, width = 2 } = style;
  const showColor = JSON.parse(JSON.stringify(toolColor));

  showColor.valid.stroke = colorSplit(changeColor[color].valid, getOpacity(opacity, changeColor[color].valid));
  showColor.valid.fill = colorSplit(
    changeColor[color].valid,
    getOpacity(opacity, changeColor[color].valid) * FILL_OPACITY,
  );
  showColor.validSelected.stroke = colorSplit(
    changeColor[color].select.stroke,
    getOpacity(opacity, changeColor[color].select.stroke),
  );
  showColor.validSelected.fill = colorSplit(
    changeColor[color].select.fill,
    getOpacity(opacity, changeColor[color].select.fill) * FILL_OPACITY,
  );
  showColor.validHover.stroke = colorSplit(changeColor[color].hover, getOpacity(opacity, changeColor[color].hover));
  showColor.validHover.fill = colorSplit(
    changeColor[color].hover,
    getOpacity(opacity, changeColor[color].hover) * FILL_OPACITY,
  );

  // 无效的比例是一样的
  showColor.invalid.stroke = colorSplit(showColor.invalid.stroke, getOpacity(opacity, showColor.invalid.stroke));
  showColor.invalid.fill = colorSplit(
    showColor.invalid.stroke,
    getOpacity(opacity, showColor.invalid.stroke) * FILL_OPACITY,
  );
  showColor.invalidSelected.stroke = colorSplit(
    showColor.invalidSelected.stroke,
    getOpacity(opacity, showColor.invalidSelected.stroke),
  );
  showColor.invalidSelected.fill = colorSplit(
    showColor.invalidSelected.fill,
    getOpacity(opacity, showColor.invalidSelected.fill) * FILL_OPACITY,
  );
  showColor.invalidHover.stroke = colorSplit(
    showColor.invalidHover.stroke,
    getOpacity(opacity, showColor.invalidHover.fill),
  );
  showColor.invalidHover.fill = colorSplit(
    showColor.invalidHover.fill,
    getOpacity(opacity, showColor.invalidHover.fill) * FILL_OPACITY,
  );
  return {
    lineColor: changeColor[color].line,
    toolColor: showColor,
    width,
    opacity,
  };
};

/**
 *
 * @param attribute
 * @param attributeList
 * @param opacity
 */
export const getAttributeColor = (attribute: any, attributeList: any, opacity: any = 9, color?: string) => {
  const attributeIndex = attributeList?.findIndex((i: any) => i?.value === attribute);
  const attributeColor = COLORS_ARRAY[attributeIndex % COLORS_ARRAY.length] ?? color ?? NULL_COLOR;
  const showColor = JSON.parse(JSON.stringify(toolColor));
  showColor.valid.stroke = colorSplit(attributeColor, getOpacity(opacity, attributeColor));
  showColor.valid.fill = colorSplit(attributeColor, getOpacity(opacity, attributeColor) * FILL_OPACITY * 0.5);
  showColor.validSelected.stroke = colorSplit(attributeColor, getOpacity(opacity, attributeColor));
  showColor.validSelected.fill = colorSplit(attributeColor, getOpacity(opacity, attributeColor) * FILL_OPACITY);
  showColor.validHover.stroke = colorSplit(attributeColor, getOpacity(opacity, attributeColor));
  showColor.validHover.fill = colorSplit(attributeColor, getOpacity(opacity, attributeColor) * FILL_OPACITY);
  showColor.invalid.stroke = colorSplit(showColor.invalid.stroke, getOpacity(opacity, attributeColor));
  showColor.invalid.fill = colorSplit(showColor.invalid.fill, getOpacity(opacity, attributeColor) * FILL_OPACITY * 0.5);
  showColor.invalidSelected.stroke = colorSplit(showColor.invalidSelected.stroke, getOpacity(opacity, attributeColor));
  showColor.invalidSelected.fill = colorSplit(
    showColor.invalidSelected.fill,
    getOpacity(opacity, attributeColor) * FILL_OPACITY,
  );
  showColor.invalidHover.stroke = colorSplit(showColor.invalidHover.stroke, getOpacity(opacity, attributeColor));
  showColor.invalidHover.fill = colorSplit(
    showColor.invalidHover.fill,
    getOpacity(opacity, attributeColor) * FILL_OPACITY,
  );
  return showColor;
};

/**
 * 获取线条的颜色
 * @param attribute
 * @param attributeList
 * @param opacity
 */
export const getLineColor = (attribute: any, attributeList: any) => {
  const attributeIndex = attributeList.findIndex((i: any) => i.value === attribute);
  const attributeColor = COLORS_ARRAY[attributeIndex % COLORS_ARRAY.length] ?? NULL_COLOR;
  return attributeColor;
};
