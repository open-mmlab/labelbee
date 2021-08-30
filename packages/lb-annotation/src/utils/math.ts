/**
 * 限制点在范围，返回
 * @param value
 * @param range
 * @returns {ICoordinate} 在范围内的点
 */
export const withinRange = (value: number, range: number[]) => {
  const min = Math.min(...range);
  const max = Math.max(...range);
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};

/**
 * 是否在指定范围内
 * @param value 需要判断的值
 * @param range 范围
 * @returns {boolean} 是否在范围内
 */
export const isInRange = (value: number | number[], range: number[]) => {
  const min = Math.min(...range);
  const max = Math.max(...range);
  const inRange = (v: number) => v <= max && v >= min;
  const values = Array.isArray(value) ? value : [value];
  return values.every((v: number) => inRange(v));
};
