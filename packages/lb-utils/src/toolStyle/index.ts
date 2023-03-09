/**
 * Config2Color
 */

import ToolStyleUtils from './ToolStyleUtils';

/**
 * 默认基础 5 配置
 */
const DEFAULT_COLORS = [
  'rgba(102, 111, 255, 1)',
  'rgba(102, 230, 255, 1)',
  'rgba(191, 255, 102, 1)',
  'rgba(255, 230, 102, 1)',
  'rgba(230, 102, 255, 1)',
];

/**
 * 属性标注主颜色
 */
export const ATTRIBUTE_COLORS = [
  'rgba(128, 12, 249, 1)',
  'rgba(0, 255, 48, 1)',
  'rgba(255, 136, 247, 1)',
  'rgba(255, 226, 50, 1)',
  'rgba(153, 66, 23, 1)',
  'rgba(2, 130, 250, 1)',
  'rgba(255, 35, 35, 1)',
  'rgba(0, 255, 234, 1)',
];

export const COLORS_ARRAY_MULTI = [
  {
    rgba: 'rgba(128, 12, 249, 1)',
    hex: 0x800cf9,
  },
  {
    rgba: 'rgba(0, 255, 48, 1)',
    hex: 0x00ff30,
  },
  {
    rgba: 'rgba(255, 136, 247, 1)',
    hex: 0xff88f7,
  },
  {
    rgba: 'rgba(255, 226, 50, 1)',
    hex: 0xffe232,
  },
  {
    rgba: 'rgba(153, 66, 23, 1)',
    hex: 0x994217,
  },
  {
    rgba: 'rgba(2, 130, 250, 1)',
    hex: 0x0282fa,
  },
  {
    rgba: 'rgba(255, 35, 35, 1)',
    hex: 0xff2323,
  },
  {
    rgba: 'rgba(0, 255, 234, 1)',
    hex: 0x00ffea,
  },
];

export const INVALID_COLOR = 'rgba(255, 153, 102, 1)';
export const NULL_COLOR = 'rgba(204, 204, 204, 1)';

interface IToolStyle {
  stroke: string;
  fill: string;
  hex?: number;
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
    styleConfig: Partial<{
      borderOpacity: number; // 范围：[0, 1]
      fillOpacity: number; // 范围：[0, 1]
      colorIndex: number; // 范围：0 1 2 3 4
    }>,
    options?: Partial<{
      hover: boolean;
      selected: boolean;
      multiColorIndex: number; // 循环使用
    }>,
  ): IToolStyle {
    if (Object.prototype.toString.call(config) !== '[object Object]') {
      throw 'Config must be Object';
    }

    if (Object.prototype.toString.call(result) !== '[object Object]') {
      throw 'Result must be Object';
    }

    const { borderOpacity = 1, fillOpacity = 0.6, colorIndex = 0 } = styleConfig;

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
        config?.attributeList,
      );

      let color = colorList[attributeIndex % colorList.length];

      // 找不到则开启为无属性
      if (attributeIndex === -1) {
        color = NULL_COLOR;
      }

      return {
        ...ToolStyleUtils.getToolStrokeAndFill(color, defaultStatus),
        hex: COLORS_ARRAY_MULTI[attributeIndex % colorList.length]?.hex ?? '',
      };
    }

    // 多色
    if (multiColorIndex > -1) {
      return ToolStyleUtils.getToolStrokeAndFill(
        colorList[multiColorIndex % colorList.length],
        defaultStatus,
      );
    }

    // 默认属性
    return ToolStyleUtils.getToolStrokeAndFill(
      colorList[colorIndex % colorList.length],
      defaultStatus,
    );
  }
}

/**
 * Create ColorMap - JET
 * 
 * Different ranges of colors can be obtained with different indexes.
 * 
 * https://docs.opencv.org/3.4/d3/d50/group__imgproc__colormap.html
 * @returns 
 */
function createColorMapJet() {
  let s;
  const p = new Array(256).fill('').map((v) => new Array(3).fill(''));
  for (let i = 0; i < 20; i++) {
    for (s = 0; s < 32; s++) {
      p[s][0] = 128 + 4 * s;
      p[s][1] = 0;
      p[s][2] = 0;
    }
    p[32][0] = 255;
    p[32][1] = 0;
    p[32][2] = 0;
    for (s = 0; s < 63; s++) {
      p[33 + s][0] = 255;
      p[33 + s][1] = 4 + 4 * s;
      p[33 + s][2] = 0;
    }
    p[96][0] = 254;
    p[96][1] = 255;
    p[96][2] = 2;
    for (s = 0; s < 62; s++) {
      p[97 + s][0] = 250 - 4 * s;
      p[97 + s][1] = 255;
      p[97 + s][2] = 6 + 4 * s;
    }
    p[159][0] = 1;
    p[159][1] = 255;
    p[159][2] = 254;
    for (s = 0; s < 64; s++) {
      p[160 + s][0] = 0;
      p[160 + s][1] = 252 - s * 4;
      p[160 + s][2] = 255;
    }
    for (s = 0; s < 32; s++) {
      p[224 + s][0] = 0;
      p[224 + s][1] = 0;
      p[224 + s][2] = 252 - 4 * s;
    }
  }
  return p;
}

const COLOR_MAP_JET = createColorMapJet();

export default new ToolStyleConverter();

export { ToolStyleConverter, COLOR_MAP_JET };
