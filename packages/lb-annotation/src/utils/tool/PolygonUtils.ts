import CommonToolUtils from './CommonToolUtils';
import { IPolygonData, IPolygonPoint } from '../../types/tool/polygon';
import { ELineTypes, SEGMENT_NUMBER } from '../../constant/tool';
import AxisUtils from './AxisUtils';
import { getFootOfPerpendicular } from './math';

export default class PolygonUtils {
  static getHoverPolygonID(
    checkPoint: IPolygonPoint,
    polygonPoints: IPolygonData[],
    scope = 3,
    lineType: ELineTypes = ELineTypes.Line,
  ): string {
    let hoverPolygonID = '';
    let minSize = Infinity;

    // 支持范围hoverPolygonID
    const axisList = AxisUtils.axisArea(checkPoint, scope);
    polygonPoints.forEach((polygon) => {
      if (polygon.pointList) {
        axisList.forEach((v) => {
          const size = this.calcPolygonSize(polygon.pointList);
          if (this.isInPolygon(v, polygon.pointList, lineType) && size < minSize) {
            hoverPolygonID = polygon.id;
            minSize = size;
          }
        });
      }
    });

    return hoverPolygonID;
  }

  /**
   * 计算多边形面积（Shoelace Theorem，鞋带定理）
   * @param pointList
   * @returns
   */
  static calcPolygonSize(pointList: IPolygonPoint[] = []): number {
    if (pointList?.length <= 2) {
      return 0;
    }

    const len = pointList.length;
    const size = pointList.reduce((acc: number, cur: IPolygonPoint, index: number, src: IPolygonPoint[]) => {
      const nextVal = src[(index + 1) % len];
      return acc + cur.x * nextVal.y - nextVal.x * cur.y;
    }, 0);

    return Math.abs(size) / 2;
  }

  static isInPolygon(
    checkPoint: IPolygonPoint,
    polygonPoints: IPolygonPoint[],
    lineType: ELineTypes = ELineTypes.Line,
  ): boolean {
    let counter = 0;
    let i;
    let xinters;
    let p1;
    let p2;
    polygonPoints = [...polygonPoints];
    if (lineType === ELineTypes.Curve) {
      polygonPoints = this.createSmoothCurvePoints(
        polygonPoints.reduce<any[]>((acc, cur) => {
          return [...acc, cur.x, cur.y];
        }, []),
        0.5,
        true,
        20,
      );
    }

    [p1] = polygonPoints;
    const pointCount = polygonPoints.length;

    for (i = 1; i <= pointCount; i++) {
      p2 = polygonPoints[i % pointCount];
      if (checkPoint.x > Math.min(p1.x, p2.x) && checkPoint.x <= Math.max(p1.x, p2.x)) {
        if (checkPoint.y <= Math.max(p1.y, p2.y)) {
          if (p1.x !== p2.x) {
            xinters = ((checkPoint.x - p1.x) * (p2.y - p1.y)) / (p2.x - p1.x) + p1.y;
            if (p1.y === p2.y || checkPoint.y <= xinters) {
              counter++;
            }
          }
        }
      }
      p1 = p2;
    }
    if (counter % 2 === 0) {
      return false;
    }
    return true;
  }

  /**
   * 通过数据转换为平滑曲线的点提交 [{x: number, y: number}...] => [x, ...smoothCurvePoints ,y]
   * @param pointList
   * @returns {Array<number>}
   */
  static createSmoothCurvePointsFromPointList(
    pointList: Array<{ x: number; y: number }>,
    numberOfSegments: number = SEGMENT_NUMBER,
  ) {
    return this.createSmoothCurvePoints(
      pointList.reduce((acc: number[], cur: { x: number; y: number }) => {
        return [...acc, cur.x, cur.y];
      }, []),
      0.5,
      false,
      numberOfSegments,
    );
  }

  static createSmoothCurvePoints(
    points: any[],
    tension: number = 0.5,
    closed: boolean = false,
    numberOfSegments: number = SEGMENT_NUMBER,
  ) {
    if (points.length < 4) {
      return points;
    }

    const result = []; // result points
    const ps = points.slice(0); // clone array so we don't change the original
    let x;
    let y; // our x,y coords
    let t1x;
    let t2x;
    let t1y;
    let t2y; // tension vectors
    let c1;
    let c2;
    let c3;
    let c4; // cardinal points
    let st;
    let t;
    let i; // steps based on number of segments

    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to befinning, end points to end
    if (closed) {
      ps.unshift(points[points.length - 1]);
      ps.unshift(points[points.length - 2]);
      ps.unshift(points[points.length - 1]);
      ps.unshift(points[points.length - 2]);
      ps.push(points[0]);
      ps.push(points[1]);
    } else {
      ps.unshift(points[1]); // copy 1st point and insert at beginning
      ps.unshift(points[0]);
      ps.push(points[points.length - 2]); // copy last point and append
      ps.push(points[points.length - 1]);
    }

    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 points + 1e point before and after
    for (i = 2; i < ps.length - 4; i += 2) {
      // calculate tension vectors
      t1x = (ps[i + 2] - ps[i - 2]) * tension;
      t2x = (ps[i + 4] - ps[i - 0]) * tension;
      t1y = (ps[i + 3] - ps[i - 1]) * tension;
      t2y = (ps[i + 5] - ps[i + 1]) * tension;

      for (t = 0; t <= numberOfSegments; t++) {
        // calculate step
        st = t / numberOfSegments;

        // calculate cardinals
        c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
        c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
        c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
        c4 = Math.pow(st, 3) - Math.pow(st, 2);

        // calculate x and y cords with common control vectors
        x = c1 * ps[i] + c2 * ps[i + 2] + c3 * t1x + c4 * t2x;
        y = c1 * ps[i + 1] + c2 * ps[i + 3] + c3 * t1y + c4 * t2y;

        // store points in array
        result.push(x);
        result.push(y);
      }
    }

    const formatResult = [];

    for (let j = 0; j < result.length - 1; j += 2) {
      formatResult.push({
        x: result[j],
        y: result[j + 1],
      });
    }

    if (closed) {
      // 需要将前面的 21 个点补充到最后
      for (let m = 0; m < numberOfSegments + 1; m++) {
        const d: any = formatResult.shift();
        formatResult.push(d);
      }
    }

    // 所以一个线段有 21 个点
    return formatResult;
  }

  /**
   * 获取当前 id 的多边形
   * @param polygonList
   * @param id
   * @returns
   */
  public static getPolygonByID(polygonList: IPolygonData[], id?: string) {
    return polygonList.find((polygon) => polygon.id === id);
  }

  public static getHoverEdgeIndex(
    checkPoint: ICoordinate,
    pointList: IPolygonPoint[],
    lineType: ELineTypes = ELineTypes.Line,
    scope: number = 3,
  ) {
    let points = [...pointList];

    if (lineType === ELineTypes.Curve) {
      points = this.createSmoothCurvePoints(
        pointList.reduce<any[]>((acc, cur) => {
          return [...acc, cur.x, cur.y];
        }, []),
        0.5,
        true,
        SEGMENT_NUMBER,
      );
    } else if (lineType === ELineTypes.Line) {
      // 添加初始点
      points.push(points[0]);
    }
    let edgeIndex = -1;
    let minLength = scope;

    for (let i = 0; i < points.length - 1; i++) {
      const { length } = getFootOfPerpendicular(checkPoint, points[i], points[i + 1]);
      if (length < minLength) {
        edgeIndex = i;
        minLength = length;
      }
    }

    if (edgeIndex === -1) {
      return -1;
    }

    if (lineType === ELineTypes.Curve) {
      return Math.floor(edgeIndex / SEGMENT_NUMBER);
    }

    return edgeIndex;
  }

  /**
   * 用于边缘吸附，获取最接近的边
   * @param coord
   * @param polygonList
   * @param lineType
   * @param range
   * @returns
   */
  public static getClosestPoint(
    coordinate: ICoordinate,
    polygonList: IPolygonData[],
    lineType: ELineTypes = ELineTypes.Line,
    range: number = 3,
  ) {
    // 第一步： 寻找所有图形中最新的边

    let closestPolygonID = '';
    let closestEdgeIndex = -1;
    let min = Infinity;
    let dropFoot: ICoordinate = coordinate; // 垂足坐标

    const numberOfSegments = 20; // 生成曲线后的点数

    polygonList.forEach((v) => {
      if (!v.pointList) {
        return;
      }

      switch (lineType) {
        case ELineTypes.Line:
          {
            const allLine = CommonToolUtils.findAllLine(v.pointList);
            allLine.forEach((line, lineIndex) => {
              const { length, footPoint } = getFootOfPerpendicular(coordinate, line.point1, line.point2);
              if (length < min && length < range) {
                // 说明是存在最小路径
                closestPolygonID = v.id;
                closestEdgeIndex = lineIndex;
                min = length;
                dropFoot = footPoint;
              }
            });
          }
          break;

        case ELineTypes.Curve:
          {
            const points = this.createSmoothCurvePoints(
              v.pointList.reduce<any[]>((acc, cur) => {
                return [...acc, cur.x, cur.y];
              }, []),
              0.5,
              true,
              numberOfSegments,
            );

            for (let i = 0; i < points.length - 1; i++) {
              const { length, footPoint } = getFootOfPerpendicular(coordinate, points[i], points[i + 1]);
              if (length < min && length < range) {
                closestPolygonID = v.id;
                closestEdgeIndex = Math.floor(i / (numberOfSegments + 1));
                min = length;
                dropFoot = footPoint;
              }
            }
          }

          break;

        default: {
          break;
        }
      }
    });

    return { dropFoot, closestEdgeIndex, closestPolygonID };
  }
}
