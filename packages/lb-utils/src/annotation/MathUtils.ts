/**
 * TODO: Need to migrate from lb-annotation to current location.
 */

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
  
}