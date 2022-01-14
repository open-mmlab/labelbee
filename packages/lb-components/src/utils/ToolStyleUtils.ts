import {
  CHANGE_COLOR,
  DEFAULT_COLOR,
  COLORS_ARRAY,
  NULL_COLOR,
  BORDER_OPACITY_LEVEL,
  FILL_OPACITY_LEVEL,
} from '@/data/Style';
import _ from 'lodash';

const FILL_OPACITY = 0.8;

export class ToolStyleUtils {
  public static changeOpacity: { [a: number]: number } = {
    1: 0.2,
    3: 0.4,
    5: 0.6,
    7: 0.8,
    9: 1.0,
  };

  public static colorSplit(color: string, opacity: number) {
    return color
      .split(' ')
      .join('')
      .replace(/,[0-9]+([.]{1}[0-9]+){0,1}\)/, `,${opacity.toFixed(2)})`);
  }

  public static computeOpacity(opacity: number, color: string) {
    const s =
      color
        .split(' ')
        .join('')
        .match(/,[0-9]+([.]{1}[0-9]+){0,1}\)/)?.[0] || '';
    let firstOpacity = s.match(/[0-9]+([.]{1}[0-9]+){0,1}/)?.[0];
    return opacity * Number(firstOpacity);
  }

  public static getToolColors(borderOpacityParam = 9, fillOpacityParam = 9) {
    const colorSplit = ToolStyleUtils.colorSplit;
    const computeOpacity = ToolStyleUtils.computeOpacity;

    const toolColor = _.cloneDeep(CHANGE_COLOR);
    const borderOpacity = BORDER_OPACITY_LEVEL[borderOpacityParam];
    const fillOpacity = FILL_OPACITY_LEVEL[fillOpacityParam];

    Object.keys(CHANGE_COLOR).forEach((color: any) => {
      const showColor = _.cloneDeep(DEFAULT_COLOR);
      showColor.valid.stroke = colorSplit(
        CHANGE_COLOR[color].valid,
        computeOpacity(borderOpacity, CHANGE_COLOR[color].valid),
      );
      showColor.valid.fill = colorSplit(
        CHANGE_COLOR[color].valid,
        computeOpacity(fillOpacity, CHANGE_COLOR[color].valid) * FILL_OPACITY,
      );
      showColor.validSelected.stroke = colorSplit(
        CHANGE_COLOR[color].select.stroke,
        computeOpacity(borderOpacity, CHANGE_COLOR[color].select.stroke),
      );
      showColor.validSelected.fill = colorSplit(
        CHANGE_COLOR[color].select.fill,
        computeOpacity(fillOpacity, CHANGE_COLOR[color].select.fill) * FILL_OPACITY,
      );
      showColor.validHover.stroke = colorSplit(
        CHANGE_COLOR[color].hover,
        computeOpacity(borderOpacity, CHANGE_COLOR[color].hover),
      );
      showColor.validHover.fill = colorSplit(
        CHANGE_COLOR[color].hover,
        computeOpacity(fillOpacity, CHANGE_COLOR[color].hover) * FILL_OPACITY,
      );

      // 无效的比例是一样的
      showColor.invalid.stroke = colorSplit(
        showColor.invalid.stroke,
        computeOpacity(borderOpacity, showColor.invalid.stroke),
      );
      showColor.invalid.fill = colorSplit(
        showColor.invalid.stroke,
        computeOpacity(fillOpacity, showColor.invalid.stroke) * FILL_OPACITY,
      );
      showColor.invalidSelected.stroke = colorSplit(
        showColor.invalidSelected.stroke,
        computeOpacity(borderOpacity, showColor.invalidSelected.stroke),
      );
      showColor.invalidSelected.fill = colorSplit(
        showColor.invalidSelected.fill,
        computeOpacity(fillOpacity, showColor.invalidSelected.fill) * FILL_OPACITY,
      );
      showColor.invalidHover.stroke = colorSplit(
        showColor.invalidHover.stroke,
        computeOpacity(borderOpacity, showColor.invalidHover.fill),
      );
      showColor.invalidHover.fill = colorSplit(
        showColor.invalidHover.fill,
        computeOpacity(fillOpacity, showColor.invalidHover.fill) * FILL_OPACITY,
      );
      toolColor[color] = showColor;
    });
    return toolColor;
  }

  public static getAttributeColors(borderOpacityParam = 9, fillOpacityParam = 9) {
    const colorSplit = ToolStyleUtils.colorSplit;
    const computeOpacity = ToolStyleUtils.computeOpacity;
    const borderOpacity = BORDER_OPACITY_LEVEL[borderOpacityParam];
    const fillOpacity = FILL_OPACITY_LEVEL[fillOpacityParam];

    let AttributeColorList: string[] = _.cloneDeep(COLORS_ARRAY);
    AttributeColorList.unshift(NULL_COLOR);
    AttributeColorList = AttributeColorList.map((item) => {
      const showColor = JSON.parse(JSON.stringify(DEFAULT_COLOR));
      showColor.valid.stroke = colorSplit(item, computeOpacity(borderOpacity, item));
      showColor.valid.fill = colorSplit(
        item,
        computeOpacity(fillOpacity, item) * FILL_OPACITY * 0.5,
      );
      showColor.validSelected.stroke = colorSplit(item, computeOpacity(borderOpacity, item));
      showColor.validSelected.fill = colorSplit(
        item,
        computeOpacity(fillOpacity, item) * FILL_OPACITY,
      );
      showColor.validHover.stroke = colorSplit(item, computeOpacity(borderOpacity, item));
      showColor.validHover.fill = colorSplit(
        item,
        computeOpacity(fillOpacity, item) * FILL_OPACITY,
      );
      showColor.invalid.stroke = colorSplit(
        showColor.invalid.stroke,
        computeOpacity(borderOpacity, item),
      );
      showColor.invalid.fill = colorSplit(
        showColor.invalid.fill,
        computeOpacity(fillOpacity, item) * FILL_OPACITY * 0.5,
      );
      showColor.invalidSelected.stroke = colorSplit(
        showColor.invalidSelected.stroke,
        computeOpacity(borderOpacity, item),
      );
      showColor.invalidSelected.fill = colorSplit(
        showColor.invalidSelected.fill,
        computeOpacity(fillOpacity, item) * FILL_OPACITY,
      );
      showColor.invalidHover.stroke = colorSplit(
        showColor.invalidHover.stroke,
        computeOpacity(borderOpacity, item),
      );
      showColor.invalidHover.fill = colorSplit(
        showColor.invalidHover.fill,
        computeOpacity(fillOpacity, item) * FILL_OPACITY,
      );
      return showColor;
    });
    return AttributeColorList;
  }

  public static getDefaultToolLineColors() {
    const toolColor: any = {};
    Object.keys(CHANGE_COLOR).forEach((color: any) => {
      toolColor[color] = CHANGE_COLOR[color].line;
    });
    return toolColor;
  }

  public static initByOpacity(borderOpacity: number, fillOpacity: number) {
    return {
      toolColor: this.getToolColors(borderOpacity, fillOpacity),
      attributeColor: this.getAttributeColors(borderOpacity, fillOpacity),
    };
  }
}
