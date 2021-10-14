import { ELineTypes, EToolName } from '@/constant/tool';
import { createSmoothCurvePointsFromPointList } from './polygonTool';
import PolygonUtils from './PolygonUtils';
import MathUtils from '../MathUtils';

export enum EStatus {
  /** 正在创建 */
  Create = 0,
  /** 正在激活 */
  Active = 1,
  /** 正在编辑, 撤销与激活状态合并 */
  Edit = 1,
  /** 没有操作 */
  None = 2,
}

export enum EColor {
  ActiveArea = '#B3B8FF',
}

export interface IProps {
  canvas: HTMLCanvasElement;
  size: ISize;
  historyChanged?: (undoEnabled: boolean, redoEnabled: boolean) => void;
}

/** 曲线分割点数 */
export const SEGMENT_NUMBER = 16;

export const LINE_ORDER_OFFSET = {
  x: 0,
  y: 20,
};

export interface IBasicLine {
  pointA: IPoint;
  pointB: IPoint;
}

/** 点半径 */
export const POINT_RADIUS = 3;
export const POINT_ACTIVE_RADIUS = 5;
/** 普通点内侧圆的半径 */
export const INNER_POINT_RADIUS = 2;

class LineToolUtils {
  /** 为参考显示的线条设置样式  */
  public static setSpecialEdgeStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'butt';
    ctx.setLineDash([10, 10]);
  };

  /** 设置特殊边样式 */
  public static setReferenceCtx = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'butt';
    ctx.setLineDash([6]);
  };

  /**
   * 计算一条线跟多条线的交点，并找到最近距离最近的点
   * @param pointList 点列表
   * @param matchLine 需要计算交点的线条
   * @param matchPoint 计算交点线条的起始点
   * @param pointRadius 点的半径
   */
  public static calcOptimalIntersection = (
    pointList: IPoint[] | ILinePoint[],
    matchLine: IBasicLine,
    matchPoint: ICoordinate,
    pointRadius: number,
    zoom: number,
  ) => {
    let optimalIntersection: IPoint | undefined;
    let minDistance: number = Infinity;
    let scopeIntersection: { point: IPoint; minDistance: number } | undefined;
    const matchLineOnExistLine = pointList.find((p, index) => {
      if (index === 0) {
        return;
      }
      const pointAOnLine = LineToolUtils.isInLine(matchLine.pointA, p, pointList[index - 1]);
      const pointBOnLine = LineToolUtils.isInLine(matchLine.pointB, p, pointList[index - 1]);
      return pointAOnLine && pointBOnLine;
    });

    if (matchLineOnExistLine) {
      return { point: matchPoint };
    }

    pointList.forEach((point, index) => {
      if (index === 0) {
        return;
      }
      const line2 = {
        pointA: pointList[index - 1],
        pointB: point,
      };
      const intersection = LineToolUtils.lineIntersection(matchLine, line2);

      if (intersection && matchLine) {
        const { onLine2, onLine1, x, y } = intersection;
        const distance = LineToolUtils.calcDistance(matchPoint, intersection);
        const matchPointInLine = LineToolUtils.isOnLine(
          matchLine.pointB.x,
          matchLine.pointB.y,
          point.x,
          point.y,
          pointList[index - 1].x,
          pointList[index - 1].y,
        );
        /** 点在线上 */
        if (matchPointInLine) {
          const intersectionDistance = LineToolUtils.calcDistance(matchPoint, intersection);
          /** 交点和直线的起始点为一致 */
          if (intersectionDistance < pointRadius / zoom) {
            const cPoint = matchLine.pointB;
            const { footPoint, length } = MathUtils.getFootOfPerpendicular(cPoint, line2.pointA, line2.pointB, true);
            if (length !== undefined) {
              const distPointA = LineToolUtils.calcDistance(line2.pointA, footPoint);
              const distPointB = LineToolUtils.calcDistance(line2.pointB, footPoint);

              scopeIntersection = {
                point: footPoint,
                minDistance: length,
              };

              if (length === Infinity) {
                scopeIntersection.point = distPointA > distPointB ? line2.pointB : line2.pointA;
              }
            }
          }
          return;
        }

        if (distance < minDistance && onLine2 && onLine1) {
          minDistance = distance;
          optimalIntersection = {
            x,
            y,
          };
        }
      }
    });

    if (optimalIntersection) {
      return { point: optimalIntersection, minDistance };
    }

    if (scopeIntersection) {
      return scopeIntersection;
    }
    return undefined;
  };

  public static lineIntersection = (lineA: IBasicLine, lineB: IBasicLine) => {
    let onLine1: boolean = false;
    let onLine2: boolean = false;
    const lineADiff = LineToolUtils.getAxisDiff(lineA);
    const lineBDiff = LineToolUtils.getAxisDiff(lineB);

    const denominator = lineBDiff.y * lineADiff.x - lineBDiff.x * lineADiff.y;

    if (denominator === 0) {
      return false;
    }

    let a = lineA.pointA.y - lineB.pointA.y;
    let b = lineA.pointA.x - lineB.pointA.x;
    const numerator1 = (lineB.pointB.x - lineB.pointA.x) * a - (lineB.pointB.y - lineB.pointA.y) * b;
    const numerator2 = (lineA.pointB.x - lineA.pointA.x) * a - (lineA.pointB.y - lineA.pointA.y) * b;

    a = numerator1 / denominator;
    b = numerator2 / denominator;

    if (a > 0 && a < 1) {
      onLine1 = true;
    }
    if (b > 0 && b < 1) {
      onLine2 = true;
    }

    // 计算交点坐标
    const x = lineA.pointA.x + a * (lineA.pointB.x - lineA.pointA.x);
    const y = lineA.pointA.y + a * (lineA.pointB.y - lineA.pointA.y);
    return { x, y, onLine1, onLine2 };
  };

  public static getAxisDiff = (line: IBasicLine) => {
    return {
      x: line.pointB.x - line.pointA.x,
      y: line.pointB.y - line.pointA.y,
    };
  };

  public static calcDistance = (point1: IPoint, point2: IPoint) => {
    return Math.sqrt(Math.pow(Math.abs(point1.x - point2.x), 2) + Math.pow(Math.abs(point1.y - point2.y), 2));
  };

  public static drawCurveLine = (
    ctx: any,
    points: ILinePoint[],
    config: any,
    applyLineWidth: boolean = true,
    isReference: boolean = false,
    hoverEdgeIndex: number,
  ) => {
    const pointList = createSmoothCurvePointsFromPointList(points, SEGMENT_NUMBER);
    ctx.save();

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = config.color;

    if (applyLineWidth) {
      ctx.lineWidth = config.lineWidth;
    }

    if (isReference) {
      LineToolUtils.setReferenceCtx(ctx);
    }

    points.forEach((point: ILinePoint, index: number) => {
      const specialEdge = (point as ILinePoint)?.specialEdge;
      const curveLinePoints = pointList.splice(0, SEGMENT_NUMBER + 1);
      ctx.save();
      ctx.beginPath();

      if (hoverEdgeIndex === index) {
        ctx.lineWidth = 4;
      }

      curveLinePoints.forEach(({ x, y }: ILinePoint, pointIndex) => {
        const fn = pointIndex > 0 ? 'lineTo' : 'moveTo';
        if (specialEdge) {
          LineToolUtils.setSpecialEdgeStyle(ctx);
        }

        ctx[fn](x, y);
      });
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  };

  public static calcTwoPointDistance = (pointA: IPoint, pointB: IPoint) =>
    Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));

  /**
   * 计算在依赖物体目标内与当前线段的交点。
   * 支持的依赖工具: 多边形，矩形。
   * @param axis 当前鼠标的点
   * @param preAxis 上一个标注点
   * @param {EDependPattern} dependPattern 依赖模式
   * @param dependData 依赖工具的数据
   * @param dependConfig 依赖工具的配置
   * @param imageSize 图片尺寸
   * @param pointRadius 点的半径
   * @param zoom 缩放比例
   * @param getRenderAxis 转化为渲染坐标
   * @param getAbsAxis 转化为绝对坐标
   */
  public static pointOverTarget = (
    axis: ICoordinate,
    preAxis: ICoordinate,
    dependToolName: EToolName | undefined,
    dependData: any,
    dependConfig: any,
    imageSize: ISize,
    pointRadius: number,
    zoom: number,
    getRenderAxis: (coord: ICoordinate) => ICoordinate | ILinePoint,
    getAbsAxis: (coord: ICoordinate) => ICoordinate | ILinePoint,
  ) => {
    const absAxis = axis;

    if (!preAxis) {
      return axis;
    }

    if (dependToolName === EToolName.Polygon) {
      const polygonPointList = LineToolUtils.getPolygonPointList(dependData, dependConfig);
      if (polygonPointList.length === 0) {
        return absAxis;
      }

      const inPolygon = PolygonUtils.isInPolygon(axis, polygonPointList);
      if (inPolygon) {
        return absAxis;
      }
      const pointList = polygonPointList.concat(polygonPointList[0]).map((i: any) => getRenderAxis(i));
      const pointA = getRenderAxis(preAxis);
      const pointB = getRenderAxis(axis);
      const line1 = {
        pointA,
        pointB,
      };

      const intersection = LineToolUtils.calcOptimalIntersection(pointList, line1, pointA, pointRadius, zoom);
      /** 判断交点，如果存在直接返回，否则返回上一个标注点 */
      if (intersection) {
        const intersectionAbsAxis = getAbsAxis(intersection?.point);
        absAxis.x = intersectionAbsAxis.x;
        absAxis.y = intersectionAbsAxis.y;
      } else {
        return preAxis;
      }
      return absAxis;
    }

    if (dependToolName === EToolName.Rect) {
      const { x, y, width, height } = dependData;
      absAxis.x = MathUtils.withinRange(absAxis.x, [x, x + width]);
      absAxis.y = MathUtils.withinRange(absAxis.y, [y, y + height]);
      return absAxis;
    }

    absAxis.x = MathUtils.withinRange(absAxis.x, [0, imageSize.width]);
    absAxis.y = MathUtils.withinRange(absAxis.y, [0, imageSize.height]);
    return absAxis;
  };

  /**
   * 获取多边形的线段
   * @param dependData 多边形数据
   * @param dependConfig 多边形配置
   */
  public static getPolygonPointList = (dependData: any, dependConfig: any) => {
    const { pointList } = dependData;
    const { lineType } = dependConfig;
    return lineType === ELineTypes.Line
      ? pointList
      : PolygonUtils.createSmoothCurvePoints(
          pointList.reduce((acc: any[], cur: any) => {
            return [...acc, cur.x, cur.y];
          }, []),
          0.5,
          true,
          20,
        );
  };

  public static isInLine(checkPoint: ICoordinate, point1: IPoint, point2: IPoint, scope: number = 3) {
    const { length } = MathUtils.getFootOfPerpendicular(checkPoint, point1, point2);
    if (length < scope) {
      return true;
    }

    return false;
  }

  public static isOnLine = (x: number, y: number, endX: number, endY: number, px: number, py: number) => {
    const f = (someX: number) => {
      return ((endY - y) / (endX - x)) * (someX - x) + y;
    };
    return Math.abs(f(px) - py) < 1e-6 && px >= x && px <= endX;
  };

  public static inArea = ({ top, left, right, bottom }: IRectArea, { x, y }: IPoint) =>
    y >= top && y <= bottom && x >= left && x <= right;

  /**
   * 获取水平、垂直线的坐标点
   * @param isStraight
   * @param lastPoint
   * @param nextPoint
   * @param absNextPoint
   * @param renderLastPoint
   */
  public static getVHPoint = (
    lastPoint: ICoordinate,
    nextPoint: ICoordinate,
    absNextPoint: ICoordinate,
    renderLastPoint: ICoordinate,
  ) => {
    const angle = LineToolUtils.getAngle(lastPoint, absNextPoint);
    if (Math.abs(angle) < 45) {
      return { ...nextPoint, y: renderLastPoint.y };
    }
    return { ...nextPoint, x: renderLastPoint.x };
  };

  public static getAngle = (startPoint: ICoordinate, endPoint: ICoordinate) => {
    const diffX = endPoint.x - startPoint.x;
    const diffY = endPoint.y - startPoint.y;
    return (360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
  };
}

export default LineToolUtils;
