import { EToolName, ELineTypes } from '@/constant/tool';
import { IPolygonPoint, IPolygonData, IPolygonConfig } from '../../types/tool/polygon';
import MathUtils from '../MathUtils';
import PolygonUtils from './PolygonUtils';
import LineToolUtils, { POINT_RADIUS } from './LineToolUtils';

export default class AxisUtils {
  /**
   * 获取原图坐标下，相对当前图片的偏移值
   * @param coordinate
   * @param currentPos
   * @param zoom
   */
  public static getOffsetCoordinate(coordinate: ICoordinate, currentPos: ICoordinate, zoom: number) {
    return {
      x: coordinate.x * zoom + currentPos.x,
      y: coordinate.y * zoom + currentPos.y,
    };
  }

  // 通过当前的坐标、currentPos、drawOutsideTarget 来判断当前最新的坐标
  public static changeDrawOutsideTarget(
    coord: ICoordinate,
    currentPos: ICoordinate,
    imgInfo: ISize,
    drawOutsideTarget?: boolean,
    basicResult?: IRect,
    zoom?: number,
  ) {
    if (typeof drawOutsideTarget === 'boolean' && !drawOutsideTarget) {
      if (basicResult && zoom) {
        // 存在 basicRect ，则需要在其范围内进行操作
        if (coord.x - currentPos.x > (basicResult.x + basicResult.width) * zoom) {
          coord.x = (basicResult.x + basicResult.width) * zoom + currentPos.x;
        }
        if (coord.x - currentPos.x < basicResult.x * zoom) {
          coord.x = basicResult.x * zoom + currentPos.x;
        }

        if (coord.y - currentPos.y > (basicResult.y + basicResult.height) * zoom) {
          coord.y = (basicResult.y + basicResult.height) * zoom + currentPos.y;
        }
        if (coord.y - currentPos.y < basicResult.y * zoom) {
          coord.y = basicResult.y * zoom + currentPos.y;
        }
      } else {
        // 不可在图片外进行标注， 进行限制。
        if (coord.x - currentPos.x > imgInfo.width) {
          coord.x = imgInfo.width + currentPos.x;
        }
        if (coord.x - currentPos.x < 0) {
          coord.x = currentPos.x;
        }

        if (coord.y - currentPos.y > imgInfo.height) {
          coord.y = imgInfo.height + currentPos.y;
        }
        if (coord.y - currentPos.y < 0) {
          coord.y = currentPos.y;
        }
      }
    }
    return coord;
  }

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

export class CoordinateUtils {
  private currentPos: ICoordinate;

  private zoom: number;

  private basicImgInfo: any;

  private basicResult?: IRect | IPolygonData;

  private dependToolConfig?: IRectConfig | IPolygonConfig;

  private dependToolName: EToolName | '';

  constructor(props: any) {
    this.currentPos = props.currentPos;
    this.zoom = props.zoom;
    this.basicImgInfo = props.basicImgInfo;
    this.dependToolName = '';
  }

  get isDependPolygon() {
    return this.dependToolName === EToolName.Polygon;
  }

  get isDependRect() {
    return this.dependToolName === EToolName.Rect;
  }

  get isDependOriginalImage() {
    return this.dependToolName === '';
  }

  /**
   * 渲染坐标 => 绝对坐标
   * @param renderCoordinate
   */
  public getAbsCoord(renderCoord: ICoordinate) {
    return {
      x: (renderCoord.x - this.currentPos.x) / this.zoom,
      y: (renderCoord.y - this.currentPos.y) / this.zoom,
    };
  }

  /**
   * 绝对坐标 => 渲染坐标
   * @param absoluteCoordinate
   */
  public getRenderCoord(absCoord: ICoordinate) {
    return {
      x: absCoord.x * this.zoom + this.currentPos.x,
      y: absCoord.y * this.zoom + this.currentPos.y,
    };
  }

  /**
   * 在矩形内的点
   * @param absCoord
   * @param rect
   */
  public coordInsideRect(absCoord: ICoordinate, rect: { x: number; y: number; height: number; width: number }) {
    const { x, y, width, height } = rect;
    return {
      x: MathUtils.withinRange(absCoord.x, [x, x + width]),
      y: MathUtils.withinRange(absCoord.y, [y, y + height]),
    };
  }

  public getPolygonPointList(lineType: ELineTypes, pointList: IPoint[]) {
    return lineType === ELineTypes.Curve ? PolygonUtils.createSmoothCurvePointsFromPointList(pointList) : pointList;
  }

  /**
   * 计算线段与线段的交点
   * @param curCoord
   * @param preCoord
   * @param polygonPointListToLineList
   */
  public getIntersection(curCoord: ICoordinate, preCoord: ICoordinate, polygonPointListToLineList: IPoint[]) {
    const pointA = this.getRenderCoord(preCoord);
    const pointB = this.getRenderCoord(curCoord);

    const drawingLine = {
      pointA,
      pointB,
    };

    const intersection = LineToolUtils.calcOptimalIntersection(
      polygonPointListToLineList,
      drawingLine,
      pointA,
      POINT_RADIUS,
      this.zoom,
    );

    return intersection;
  }

  /**
   * 在多边形内的点
   * @param absCoord
   * @param rect
   */
  public coordInsidePolygon(
    curCoord: ICoordinate,
    preCoord: ICoordinate,
    polygon: IPolygonData,
    polygonToolConfig: IPolygonConfig,
  ) {
    const { pointList } = polygon;
    const lineType = polygonToolConfig?.lineType;

    if (pointList.length === 0) {
      return curCoord;
    }

    const polygonPointList = this.getPolygonPointList(lineType, pointList);
    const isInPolygon = PolygonUtils.isInPolygon(curCoord, polygonPointList);

    if (isInPolygon) {
      return curCoord;
    }

    const polygonPointListToLineList = polygonPointList
      .concat(polygonPointList[0])
      .map((i: any) => this.getRenderCoord(i));

    const intersection = this.getIntersection(curCoord, preCoord, polygonPointListToLineList);

    /** 判断交点，如果存在直接返回 */
    if (intersection) {
      return this.getAbsCoord(intersection?.point);
    }

    return curCoord;
  }

  public coordInsideImage(coord: ICoordinate) {
    return this.coordInsideRect(coord, { ...this.basicImgInfo, x: 0, y: 0 });
  }

  /**
   * 根据依赖工具计算下一个点的绝对坐标
   * @param curAbsCoord
   * @param preAbsCoord
   */
  public getNextCoordByDependTool(curAbsCoord: ICoordinate, preAbsCoord: ICoordinate) {
    if (this.isDependRect) {
      return this.coordInsideRect(curAbsCoord, this.basicResult as IRect);
    }

    if (this.isDependPolygon) {
      return this.coordInsidePolygon(
        curAbsCoord,
        preAbsCoord,
        this.basicResult as IPolygonData,
        this.dependToolConfig as IPolygonConfig,
      );
    }

    if (this.isDependOriginalImage) {
      return this.coordInsideImage(curAbsCoord);
    }
  }

  public setDependInfo(dependToolName: EToolName | '', dependToolConfig?: IRectConfig | IPolygonConfig) {
    this.dependToolName = dependToolName ?? '';
    this.dependToolConfig = dependToolName ? dependToolConfig : undefined;
  }

  public setBasicImgInfo(basicImgInfo: any) {
    this.basicImgInfo = basicImgInfo;
  }

  public setBasicResult(basicResult: any) {
    this.basicResult = basicResult;
  }

  public setZoomAndCurrentPos(zoom: number, currentPos: ICoordinate) {
    this.zoom = zoom;
    this.currentPos = currentPos;
  }

  public isCoordInsideTarget(coord: ICoordinate) {
    if (this.isDependPolygon) {
      return this.isInBasicPolygon(coord);
    }

    if (this.isDependRect) {
      const { x, y, width, height } = this.basicResult as IRect;
      const rectHorizontalRange = [x, x + width];
      const rectVerticalRange = [y, y + height];
      return MathUtils.isInRange(coord.x, rectHorizontalRange) && MathUtils.isInRange(coord.y, rectVerticalRange);
    }

    return (
      MathUtils.isInRange(coord.x, [0, this.basicImgInfo.width]) &&
      MathUtils.isInRange(coord.y, [0, this.basicImgInfo.height])
    );
  }

  public isInBasicPolygon(coord: ICoordinate) {
    return PolygonUtils.isInPolygon(
      coord,
      (this.basicResult as IPolygonData)?.pointList || [],
      (this.dependToolConfig as IPolygonConfig)?.lineType,
    );
  }
}
