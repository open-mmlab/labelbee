import { INVALID_COLOR } from './index';
interface IInfoList {
  key: string;
  value: string;
  isDefault?: boolean;
}

interface IInputList {
  key: string;
  value: string;
  isMulti?: boolean;
  subSelected?: IInfoList[];
}
const BORDER_OPACITY_LEVEL: { [a: number]: number } = {
  0: 0,
  1: 0.2,
  3: 0.4,
  5: 0.6,
  7: 0.8,
  9: 1.0,
  10: 1.0,
};

const FILL_OPACITY_LEVEL: { [a: number]: number } = {
  0: 0,
  1: 0,
  3: 0.2,
  5: 0.4,
  7: 0.6,
  9: 0.8,
  10: 1,
};
class ToolStyleUtils {
  /**
   * Replace RGBA transparency value
   * @param rgba
   * @param opacity
   * @returns
   */
  public static replaceAFromRGBA = (rgba: string, opacity: number) => {
    return rgba
      .split(' ')
      .join('')
      .replace(/,[0-9]+([.]{1}[0-9]+){0,1}\)/, `,${opacity.toFixed(2)})`);
  };

  public static toRGBAArr = (rgbStr: string, opacity = 1) => {
    const match = rgbStr.match(/\d+/g);

    if (match) {
      const [r, g, b, a] = match;
      return [r, g, b, a];
    }
  };

  /**
   * Transformer rgba to hex
   * @param rgba
   * @returns
   */
  public static rgbaStringToHex(rgbaString: string) {
    const rgbaArr = rgbaString
      .substring(5, rgbaString.length - 1)
      .replace(/ /g, '')
      .split(',');
    const r = parseInt(rgbaArr[0]);
    const g = parseInt(rgbaArr[1]);
    const b = parseInt(rgbaArr[2]);
    const a = parseFloat(rgbaArr[3]);
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    const hexA = Math.round(a * 255)
      .toString(16)
      .padStart(2, '0');
    return '#' + hexR + hexG + hexB + hexA;
  }

  /**
   * 获取当前状态下的 stroke & fill
   * @param color
   * @param hover
   * @param selected
   * @param options
   * @returns
   */
  public static getToolStrokeAndFill = (
    color: string,
    options: Partial<{
      hover: boolean;
      selected: boolean;
      borderOpacity: number;
      fillOpacity: number;
      commonOpacity: number; // 无状态的
    }>,
  ) => {
    const {
      hover = false,
      selected = false,
      borderOpacity = 1,
      fillOpacity = 1,
      commonOpacity = 0.8,
    } = options;

    if (selected || hover) {
      return {
        stroke: this.replaceAFromRGBA(color, borderOpacity),
        fill: this.replaceAFromRGBA(color, fillOpacity),
        rgba: this.toRGBAArr(color),
      };
    }

    return {
      stroke: this.replaceAFromRGBA(color, borderOpacity * commonOpacity),
      fill: this.replaceAFromRGBA(color, fillOpacity * commonOpacity),
      rgba: this.toRGBAArr(color),
    };
  };

  public static getStrokeAndFill = (color: string, opacity = 1, fillOpacity = 1) => {
    return {
      stroke: this.replaceAFromRGBA(color, opacity),
      fill: this.replaceAFromRGBA(color, fillOpacity),
    };
  };

  /**
   * Dynamic color table generation
   * @param color
   * @returns
   */
  public static getToolColorList = (
    color: string,
    borderOpacityParam = 9,
    fillOpacityParam = 9,
  ) => {
    const borderOpacity = BORDER_OPACITY_LEVEL[borderOpacityParam];
    const fillOpacity = FILL_OPACITY_LEVEL[fillOpacityParam];

    return {
      valid: this.getStrokeAndFill(color, 1 * borderOpacity, 0.4 * fillOpacity),
      invalid: this.getStrokeAndFill(INVALID_COLOR, 1 * borderOpacity, 0.8 * fillOpacity),
      validSelected: this.getStrokeAndFill(color, 1 * borderOpacity, 0.8 * fillOpacity),
      invalidSelected: this.getStrokeAndFill(INVALID_COLOR, 1 * borderOpacity, 0.24 * fillOpacity),
      validHover: this.getStrokeAndFill(color, 1 * borderOpacity, 0.64 * fillOpacity),
      invalidHover: this.getStrokeAndFill(INVALID_COLOR, 1 * borderOpacity, 0.4 * fillOpacity),
    };
  };

  /**
   * 获取属性标注的索引
   * @param attribute
   * @param attributeList
   * @returns {number} 属性索引
   */
  public static getAttributeIndex = (
    attribute: string | undefined,
    attributeList: IInputList[],
  ) => {
    try {
      const attributeIndex = attributeList.findIndex((i: any) => i.value === attribute);
      return attributeIndex;
    } catch (error) {
      return -1;
    }
  };
}

export default ToolStyleUtils;
