export default class MathUtils {
  /**
   * 是否在指定范围内
   * @param value 需要判断的值
   * @param range 范围
   * @returns {boolean} 是否在范围内
   */
  public static isInRange = (value: number | number[], range: number[]) => {
    const min = Math.min(...range);
    const max = Math.max(...range);
    const inRange = (v: number) => v <= max && v >= min;
    const values = Array.isArray(value) ? value : [value];
    return values.every((v: number) => inRange(v));
  };

  /**
   * Generate the size to walk
   *
   * if size = 1:
   * return [[0, 0], [0, 1], [1, 0], [1, 1]]
   * @param size
   * @returns
   */
  public static generateCoordinates = (size: number): number[][] => {
    const coordinates: number[][] = [];

    for (let x = 0; x <= size; x++) {
      for (let y = 0; y <= size; y++) {
        coordinates.push([x, y]);
      }
    }

    return coordinates;
  };

  public static calculateThousandsPlace = (number: number): number => {
    if (number < 1000) {
      return 0;
    }

    const thousandsPlace = Math.floor(number / 1000);
    return thousandsPlace;
  };
}
