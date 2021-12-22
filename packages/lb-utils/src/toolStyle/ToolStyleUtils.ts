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

class ToolStyleUtils {
  /**
   * 替换 RGBA 透明度值
   * @param rgba
   * @param opacity
   * @returns
   */
  public static replaceAFromRGBA = (rgba: string, opacity: number) => {
    return rgba
      .split(" ")
      .join("")
      .replace(/,[0-9]+([.]{1}[0-9]+){0,1}\)/, `,${opacity.toFixed(2)})`);
  };

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
    }>
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
      };
    }

    return {
      stroke: this.replaceAFromRGBA(color, borderOpacity * commonOpacity),
      fill: this.replaceAFromRGBA(color, fillOpacity * commonOpacity),
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
    attributeList: IInputList[]
  ) => {
    try {
      const attributeIndex = attributeList.findIndex(
        (i: any) => i.value === attribute
      );
      return attributeIndex;
    } catch (error) {
      return -1;
    }
  };
}

export default ToolStyleUtils;
