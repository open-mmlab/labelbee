/**
 * Config2Color
 */

import ToolStyleUtils from "./ToolStyleUtils";

/**
 * 默认基础 5 配置
 */
const DEFAULT_COLORS = [
  "rgba(102, 111, 255, 1)",
  "rgba(102, 230, 255, 1)",
  "rgba(191, 255, 102, 1)",
  "rgba(255, 230, 102, 1)",
  "rgba(230, 102, 255, 1)",
];

/**
 * 属性标注主颜色
 */
export const ATTRIBUTE_COLORS = [
  "rgba(128, 12, 249, 1)",
  "rgba(0, 255, 48, 1)",
  "rgba(255, 136, 247, 1)",
  "rgba(255, 226, 50, 1)",
  "rgba(153, 66, 23, 1)",
  "rgba(2, 130, 250, 1)",
  "rgba(255, 35, 35, 1)",
  "rgba(0, 255, 234, 1)",
];

export const INVALID_COLOR = "rgba(255, 51, 51, 1)";
export const NULL_COLOR = "rgba(204, 204, 204, 1)";

interface IToolStyle {
  stroke: string;
  fill: string;
}

interface IToolConfig {
  [key: string]: any;
}

interface IResult {
  [key: string]: any;
}

class ToolStyleConverter {
  private _defaultColors: string[]; // 默认颜色列表
  private _attributeColors: string[]; // 默认属性列表
  constructor() {
    this._defaultColors = DEFAULT_COLORS;
    this._attributeColors = ATTRIBUTE_COLORS;
  }

  get defaultColors() {
    return this._defaultColors;
  }

  get attributeColors() {
    return this._attributeColors;
  }

  /**
   * 获取指定配置下的颜色
   * @param result
   * @param config
   * @param styleConfig
   * @param options
   * @returns
   */
  public getColorFromConfig(
    result: IResult,
    config: IToolConfig,
    styleConfig: {
      borderOpacity: number; // 范围：[0, 1]
      fillOpacity: number; // 范围：[0, 1]
      colorIndex: number; // 范围：0 1 2 3 4
    },
    options?: Partial<{
      hover: boolean;
      selected: boolean;
      multiColorIndex: number; // 循环使用
    }>
  ): IToolStyle {
    if (Object.prototype.toString.call(config) !== "[object Object]") {
      throw "Config must be Object";
    }

    if (Object.prototype.toString.call(result) !== "[object Object]") {
      throw "Result must be Object";
    }

    const {
      borderOpacity = 1,
      fillOpacity = 0.6,
      colorIndex = 0,
    } = styleConfig;

    if (!options) {
      options = {};
    }

    const valid = result?.valid ?? true;

    const { multiColorIndex = -1, selected, hover } = options;

    const defaultStatus = {
      selected,
      hover,
      borderOpacity,
      fillOpacity,
    };

    let colorList = this.defaultColors;
    if (config?.attributeConfigurable === true || multiColorIndex > -1) {
      colorList = this.attributeColors;
    }

    if (valid === false) {
      // 无效设置
      return ToolStyleUtils.getToolStrokeAndFill(INVALID_COLOR, defaultStatus);
    }

    // 属性标注
    if (config?.attributeConfigurable === true) {
      const attributeIndex = ToolStyleUtils.getAttributeIndex(
        result?.attribute,
        config?.attributeList
      );

      let color = colorList[attributeIndex % colorList.length];

      // 找不到则开启为无属性
      if (attributeIndex === -1) {
        color = NULL_COLOR;
      }

      return ToolStyleUtils.getToolStrokeAndFill(color, defaultStatus);
    }

    // 多色
    if (multiColorIndex > -1) {
      return ToolStyleUtils.getToolStrokeAndFill(
        colorList[multiColorIndex % colorList.length],
        defaultStatus
      );
    }

    // 默认属性
    return ToolStyleUtils.getToolStrokeAndFill(
      colorList[colorIndex % colorList.length],
      defaultStatus
    );
  }
}

export default new ToolStyleConverter();

export { ToolStyleConverter };
