import { IPolygonPoint } from '../../types/tool/polygon';

export default class AxisUtils {
  public static changeCoordinateByRotate(coordinate: ICoordinate, rotate: number, imgSize: ISize) {
    const { width, height } = imgSize;
    const { x, y } = coordinate;

    switch (rotate % 360) {
      case 90:
        return {
          x: height - y,
          y: x,
        };
      case 180:
        return {
          x: width - x,
          y: height - y,
        };

      case 270:
        return {
          x: y,
          y: width - x,
        };

      default:
        return coordinate;
    }
  }

  /**
   * 计算点在 zoom 和 currentPos 的转换
   * @param rect
   * @param zoom
   * @param currentPos
   * @returns
   */
  public static changeRectByZoom(rect: IRect, zoom: number, currentPos: ICoordinate = { x: 0, y: 0 }) {
    return {
      ...rect,
      x: rect.x * zoom + currentPos.x,
      y: rect.y * zoom + currentPos.y,
      width: rect.width * zoom,
      height: rect.height * zoom,
    };
  }

  /**
   * 计算点在 zoom 和 currentPos 的转换
   * @param point
   * @param zoom
   * @param currentPos
   * @returns
   */
  public static changePointByZoom(
    point: IPoint | IPolygonPoint,
    zoom: number,
    currentPos: ICoordinate = { x: 0, y: 0 },
  ) {
    return {
      ...point,
      x: point.x * zoom + currentPos.x,
      y: point.y * zoom + currentPos.y,
    };
  }

  /**
   * 计算点集在 zoom 和 currentPos 的转换
   * @param pointList
   * @param zoom
   * @param currentPos
   * @returns
   */
  public static changePointListByZoom(
    pointList: IPoint[] | IPolygonPoint[],
    zoom: number,
    currentPos: ICoordinate = { x: 0, y: 0 },
  ) {
    return pointList.map((point: IPolygonPoint | IPoint) => {
      return this.changePointByZoom(point, zoom, currentPos);
    });
  }

  /**
   * 扩大点的热区范围
   * @param axis
   * @param radius
   * @returns
   */
  public static axisArea(axis: ICoordinate, radius: number = 3) {
    const { x, y } = axis;
    const axisArray = [];
    for (let cX = x - radius; cX < x + radius; cX += radius / 3) {
      for (let cY = y - radius; cY < y + radius; cY += radius / 3) {
        axisArray.push({ x: cX, y: cY });
      }
    }
    return axisArray;
  }

  /**
   * 计算当前坐标相对于原图的坐标
   * @param coord 在 canvas 内的相对坐标
   */
  public static getOriginCoordinateWithOffsetCoordinate(
    coord: ICoordinate,
    zoom = 1,
    currentPos = {
      x: 0,
      y: 0,
    },
  ) {
    return {
      x: (coord.x - currentPos.x) / zoom,
      y: (coord.y - currentPos.y) / zoom,
    };
  }

  /**
   * 获取当前坐标是否在当前点
   * 注意：checkPoint 为原图的坐标
   *
   * @export
   * @param {IPolygonPoint} checkPoint
   * @param {IPolygonPoint[]} polygonPoints
   * @param {number} [scope=3]
   * @returns {number}
   */
  public static returnClosePointIndex(
    checkPoint: IPolygonPoint,
    polygonPoints: IPolygonPoint[],
    scope: number = 3,
  ): number {
    let pointIndex = -1;

    for (let i = 0; i < polygonPoints.length; i++) {
      const data = polygonPoints[i];
      if (this.getIsInScope(checkPoint, data, scope)) {
        pointIndex = i;
      }
    }

    return pointIndex;
  }

  /**
   * 对比两个点是否在一范围内
   *
   * @export
   * @param {IPolygonPoint} currentCoord
   * @param {IPolygonPoint} targetCoord
   * @param {number} scope
   * @returns
   */
  public static getIsInScope(currentCoord: ICoordinate, targetCoord: ICoordinate, scope: number) {
    if (Math.abs(currentCoord.x - targetCoord.x) < scope && Math.abs(currentCoord.y - targetCoord.y) < scope) {
      return true;
    }
    return false;
  }
}
