export default class StyleUtils {
  public static getStrokeAndFill(
    toolStyle: IToolColorStyle,
    valid = true,
    options: Partial<{
      isSelected: boolean;
      isHover: boolean;
    }> = {},
  ) {
    const { isSelected = false, isHover = false } = options;

    if (isSelected) {
      return {
        stroke: valid ? toolStyle.validSelected.stroke : toolStyle.invalidSelected.stroke,
        fill: valid ? toolStyle.validSelected.fill : toolStyle.invalidSelected.fill,
      };
    }

    if (isHover) {
      return {
        stroke: valid ? toolStyle.validHover.stroke : toolStyle.invalidHover.stroke,
        fill: valid ? toolStyle.validHover.fill : toolStyle.invalidHover.fill,
      };
    }

    return {
      stroke: valid ? toolStyle.valid.stroke : toolStyle.invalid.stroke,
      fill: valid ? toolStyle.valid.fill : toolStyle.invalid.fill,
    };
  }

  /**
   * Transformer Style to String
   * @param style
   * @returns
   */
  public static getStyle2String(style?: StyleSheetList) {
    if (!style) {
      return;
    }

    return Object.entries(style).reduce((acc, cur) => `${acc} ${cur[0]}: ${cur[1]};`, '');
  }

  /**
   * Apply a map of styles to an element
   *
   * @param {HTMLElement} el The element that the styles will be applied to
   * @param {Object} styles The map of propName: attribute, both are used as-is
   *
   * @return {HTMLElement} el
   */
  public static setDOMStyle(el: HTMLElement, styles: any) {
    Object.keys(styles).forEach((prop) => {
      if (el.style[prop as any] !== styles[prop]) {
        el.style[prop as any] = styles[prop];
      }
    });
    return el;
  }
}
