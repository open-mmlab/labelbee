/**
 * 向量运算
 * @author laoluo
 */

export default class Vector {
  public static add(vector1: ICoordinate, vector2: ICoordinate) {
    return {
      x: vector1.x + vector2.x,
      y: vector1.y + vector2.y,
    };
  }

  public static getVector(point1: ICoordinate, point2: ICoordinate) {
    return {
      x: point2.x - point1.x,
      y: point2.y - point1.y,
    };
  }

  public static len(vector: ICoordinate) {
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
  }

  public static dotProduct(vector1: ICoordinate, vector2: ICoordinate) {
    return vector1.x * vector2.x + vector1.y + vector2.y;
  }
}
