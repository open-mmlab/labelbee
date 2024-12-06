import { difference, polygon, union } from '@turf/turf';
import { ERotateDirection } from '@/constant/annotation';
import { TAnnotationViewData, TAnnotationViewLine } from '@labelbee/lb-utils';
import CommonToolUtils from './CommonToolUtils';
import { IPolygonData, IPolygonPoint } from '../../types/tool/polygon';
import { ELineTypes, SEGMENT_NUMBER } from '../../constant/tool';
import AxisUtils from './AxisUtils';
import MathUtils from '../MathUtils';
import LineToolUtils from './LineToolUtils';

export interface IConvexHullGroupType {
  [id: string]: {
    points: TAnnotationViewLine['annotation']['pointList'];
    convexHull: ICoordinate[];
  };
}

export default class PolygonUtils {
  static getHoverPolygonID(
    checkPoint: IPolygonPoint,
    polygonPoints: { pointList: IPolygonPoint[]; id: string }[],
    scope = 3,
    lineType: ELineTypes = ELineTypes.Line,
  ): string {
    let hoverPolygonID = '';
    let minSize = Infinity;

    // 支持范围hoverPolygonID
    const axisList = AxisUtils.axisArea(checkPoint, scope);
    polygonPoints.forEach((p) => {
      if (p.pointList) {
        axisList.forEach((v) => {
          if (this.isInPolygon(v, p.pointList, lineType)) {
            const size = this.calcPolygonSize(p.pointList);
            if (size < minSize) {
              hoverPolygonID = p.id;
              minSize = size;
            }
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
    polygonPoints: (IPolygonPoint | ICoordinate)[],
    lineType: ELineTypes = ELineTypes.Line,
  ): boolean {
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
    return this.isPointInOrOnPolygon(checkPoint, polygonPoints);
  }

  static isPointInOrOnPolygon(point: IPolygonPoint, polygonData: (IPolygonPoint | ICoordinate)[], errorMargin = 1e-9) {
    const { x: px, y: py } = point;
    let isInside = false;

    for (let i = 0, j = polygonData.length - 1; i < polygonData.length; j = i++) {
      const { x: xi, y: yi } = polygonData[i];
      const { x: xj, y: yj } = polygonData[j];

      // Determine whether the point is within the range of the edge
      const onSegment =
        px <= Math.max(xi, xj) && px >= Math.min(xi, xj) && py <= Math.max(yi, yj) && py >= Math.min(yi, yj);

      // Determine whether the point is on the edge (Cross Product)
      const crossProduct = (py - yi) * (xj - xi) - (px - xi) * (yj - yi);

      if (onSegment && Math.abs(crossProduct) < errorMargin) {
        return true;
      }
      /**
       * Determine the intersection of the ray and the edge
       * yi > py !== yj > py: Vertical cross
       * px < ((xj - xi) * (py - yi)) / (yj - yi) + xi: Crossing in horizontal direction
       */
      const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

      if (intersect) isInside = !isInside;
    }

    return isInside;
  }

  /**
   * 通过数据转换为平滑曲线的点提交 [{x: number, y: number}...] => [x, ...smoothCurvePoints ,y]
   * @param pointList
   * @returns {Array<number>}
   */
  static createSmoothCurvePointsFromPointList(
    pointList: Array<{ x: number; y: number; [a: string]: any }>,
    numberOfSegments: number = SEGMENT_NUMBER,
  ) {
    const newPoints = this.createSmoothCurvePoints(
      pointList.reduce((acc: number[], cur: { x: number; y: number }) => {
        return [...acc, cur.x, cur.y];
      }, []),
      0.5,
      false,
      numberOfSegments,
    );

    // TODO 该部分后续可以优化，将原有点的信息嵌入
    return newPoints.map((p, i) => {
      const pos = i / (SEGMENT_NUMBER + 1);
      const v = Math.floor(pos);
      const data = pointList[v] ?? {};

      if (v === pos) {
        return {
          ...data,
          ...p,
        };
      }

      return {
        specialEdge: data.specialEdge,
        ...p,
      };
    });
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
    return polygonList.find((p) => p.id === id);
  }

  public static getPolygonByIDs(polygonList: IPolygonData[], ids?: string[]) {
    if (ids && ids?.length > 0) {
      return polygonList.filter((p) => ids.includes(p.id));
    }
    return [];
  }

  public static getHoverEdgeIndex(
    checkPoint: ICoordinate,
    pointList: IPolygonPoint[],
    lineType: ELineTypes = ELineTypes.Line,
    scope: number = 5,
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
      const { length } = MathUtils.getFootOfPerpendicular(checkPoint, points[i], points[i + 1], true);
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
    option?: {
      isClose?: boolean; // 是否闭合
    },
  ) {
    let hasClosed = false; // 是否有进行边缘吸附？
    const isClose = option?.isClose ?? true;

    // 第一步： 寻找所有图形中最新的边

    let closestPolygonID = '';
    let closestEdgeIndex = -1;
    let min = Infinity;
    let dropFoot: ICoordinate = coordinate; // 垂足坐标

    const numberOfSegments = 20; // 生成曲线后的点数
    let isCloseNode = false; // 是否直接接近点？

    polygonList.forEach((v) => {
      if (isCloseNode) {
        return;
      }

      if (!v.pointList) {
        return;
      }

      switch (lineType) {
        case ELineTypes.Line:
          {
            const allLine = CommonToolUtils.findAllLine(v.pointList, isClose);
            allLine.forEach((line, lineIndex) => {
              if (isCloseNode) {
                return;
              }

              let { length, footPoint } = MathUtils.getFootOfPerpendicular(coordinate, line.point1, line.point2);

              // Added node judgement for polygons
              const twoPointDistance1 = MathUtils.getLineLength(line.point1, coordinate);
              const twoPointDistance2 = MathUtils.getLineLength(line.point2, coordinate);

              // node judgement is highest priority
              if (twoPointDistance1 < range * 2) {
                footPoint = line.point1;
                length = twoPointDistance1;
                isCloseNode = true;
              }
              if (twoPointDistance2 < range * 2) {
                footPoint = line.point2;
                length = twoPointDistance2;
                isCloseNode = true;
              }

              // foot point
              if (length < min && length < range) {
                // 说明是存在最小路径
                closestPolygonID = v.id;
                closestEdgeIndex = lineIndex;
                min = length;
                dropFoot = footPoint;
                hasClosed = true;
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
              isClose,
              numberOfSegments,
            );

            for (let i = 0; i < points.length - 1; i++) {
              const { length, footPoint } = MathUtils.getFootOfPerpendicular(coordinate, points[i], points[i + 1]);
              if (length < min && length < range) {
                closestPolygonID = v.id;
                closestEdgeIndex = Math.floor(i / (numberOfSegments + 1));
                min = length;
                dropFoot = footPoint;
                hasClosed = true;
              }
            }
          }

          break;

        default: {
          break;
        }
      }
    });

    return { dropFoot, closestEdgeIndex, closestPolygonID, hasClosed };
  }

  /**
   * 点集是否在多边形内
   * @param pointList
   * @param polygonPoints
   * @param lineType
   */
  public static isPointListInPolygon(
    pointList: IPolygonPoint[],
    polygonPoints: IPolygonPoint[],
    lineType: ELineTypes = ELineTypes.Line,
  ): boolean {
    return pointList.every((v) => this.isInPolygon(v, polygonPoints, lineType));
  }

  /**
   * 点集是否在多边形外
   */
  public static isPointListOutSidePolygon(
    pointList: IPolygonPoint[],
    polygonPoints: IPolygonPoint[],
    lineType: ELineTypes = ELineTypes.Line,
  ): boolean {
    return pointList.some((v) => !this.isInPolygon(v, polygonPoints, lineType));
  }

  /**
   * 获取多边形面积
   * @param pointList
   * @returns
   */
  public static getPolygonArea(pointList: IPolygonPoint[]) {
    let total = 0;

    for (let i = 0, l = pointList.length; i < l; i++) {
      const addX = pointList[i].x;
      const addY = pointList[i === pointList.length - 1 ? 0 : i + 1].y;
      const subX = pointList[i === pointList.length - 1 ? 0 : i + 1].x;
      const subY = pointList[i].y;

      total += addX * addY * 0.5;
      total -= subX * subY * 0.5;
    }

    return Math.abs(total);
  }

  public static updatePolygonByRotate(direction: ERotateDirection, angle = 1, pointList: IPolygonPoint[]) {
    let rotate = 1;
    if (direction === ERotateDirection.Anticlockwise) {
      rotate = -1;
    }
    rotate *= angle;

    return MathUtils.rotateRectPointList(rotate, pointList as [ICoordinate, ICoordinate, ICoordinate, ICoordinate]);
  }

  public static deletePolygonLastPoint(acc: any, cur: any[], index: number, array: string | any[]) {
    if (index === array.length - 1) {
      // 最后一个不用
      return acc;
    }

    return [
      ...acc,
      {
        x: cur[0],
        y: cur[1],
      },
    ];
  }

  public static concatBeginAndEnd(array: any[]) {
    if (array.length < 1) {
      return array;
    }

    return [...array, array[0]];
  }

  public static segmentPolygonByPolygon(
    pointList: IPolygonPoint[],
    polygonList: IPolygonData[],
  ): IPolygonPoint[][] | void {
    try {
      let selectedPolygon = polygon([[...PolygonUtils.concatBeginAndEnd(pointList.map((v) => [v.x, v.y]))]]);
      // todo 包裹情况下还需改进
      // let unionList = polygonList.reduce((acc, cur, index, array) => {
      //   let backgroundPoint = [[...concatBeginAndEnd(cur.pointList.map(cur => [cur.x, cur.y]))]];

      //   let backgroundPolygon = polygon(backgroundPoint);
      //   let backgroundLine = lineString(backgroundPoint);

      //   // if (!booleanCrosses(selectedPolygon, backgroundLine)) {
      //   //   return acc;
      //   // }

      //   if (acc) {
      //     return union(acc, backgroundPolygon);
      //   } else {
      //     return backgroundPolygon;
      //   }
      // }, undefined);
      // selectedPolygon = difference(selectedPolygon, unionList);

      // 批量对多边形进行减操作 （需要对包裹内部的多边形进行判断）
      polygonList.forEach((v) => {
        const backgroundPolygon = polygon([[...PolygonUtils.concatBeginAndEnd(v.pointList.map((p) => [p.x, p.y]))]]);
        const diff = difference(selectedPolygon, backgroundPolygon);

        if (diff) {
          //@ts-ignore
          selectedPolygon = diff;
        }
      });
      const resultList =
        selectedPolygon?.geometry?.coordinates.map((p) => {
          // 多边形需要另外判断
          //@ts-ignore
          if (selectedPolygon?.geometry?.type === 'MultiPolygon') {
            //@ts-ignore
            return p[0].reduce(PolygonUtils.deletePolygonLastPoint, []);
          }
          return p.reduce(PolygonUtils.deletePolygonLastPoint, []);
        }) ?? [];
      return resultList.reduce((acc, pointLists) => {
        const len = pointLists.length;
        const newPointList = pointLists.filter((point: IPolygonPoint, i: number) => {
          const nextIndex = (i + 1) % len;
          if (AxisUtils.getIsInScope(point, pointLists[nextIndex], 1)) {
            // 前后 1 像素之差的点清除
            return false;
          }
          return true;
        });

        if (newPointList.length < 3) {
          return acc;
        }

        return [...acc, newPointList];
      }, []);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * 获取当前多边形的点集
   *
   * @export
   * @param {string} selectedPolygonID
   * @param {IPolygonData[]} polygonList
   * @returns
   */
  public static getPolygonPointList(selectedPolygonID: string, polygonList: IPolygonData[]) {
    const p = polygonList.find((v) => v.id === selectedPolygonID);
    if (p && p.pointList && p.pointList.length > 0) {
      return p.pointList;
    }
    return [];
  }

  /**
   * 获取包裹当前 polygon 的 index
   * @param pointList
   * @param polygonList
   * @returns
   */
  public static getWrapPolygonIndex(pointList: IPolygonPoint[], polygonList: IPolygonData[]) {
    return polygonList.findIndex((p) => PolygonUtils.isPointListInPolygon(pointList, p.pointList));
  }

  /**
   * 获取内部切割后的多边形合体点集
   * @param pointList
   * @param wrapPointList
   * @returns
   */
  public static clipPolygonFromWrapPolygon(pointList: IPolygonPoint[], wrapPointList: IPolygonPoint[]) {
    // 存在上下包裹的情况
    const wrapDirection = PolygonUtils.isPolygonClosewise(wrapPointList);
    const selectedDirection = PolygonUtils.isPolygonClosewise(pointList);
    const linkIndex = PolygonUtils.getClosePointDistanceFromPolygon(pointList[0], wrapPointList);
    const linkPoint = wrapPointList[linkIndex];

    let newPointList = [
      ...wrapPointList.slice(0, linkIndex),
      linkPoint,
      ...pointList,
      pointList[0],
      ...wrapPointList.slice(linkIndex, wrapPointList.length),
    ];

    if (wrapDirection === selectedDirection) {
      newPointList = [
        ...wrapPointList.slice(0, linkIndex),
        linkPoint,
        pointList[0],
        ...pointList.reverse(),
        ...wrapPointList.slice(linkIndex, wrapPointList.length),
      ];
    }

    return newPointList;
  }

  /**
   * 难点：判断凹多边形的方向
   *
   * https://www.huaweicloud.com/articles/12463693.html
   * @param p
   * @returns
   */
  public static isPolygonClosewise(p: IPolygonPoint[]) {
    const n = p.length;
    let i;
    let j;
    let k;
    let count = 0;
    let z;

    if (n < 3) {
      return 0;
    }

    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      k = (i + 2) % n;
      z = (p[j].x - p[i].x) * (p[k].y - p[j].y);
      z -= (p[j].y - p[i].y) * (p[k].x - p[j].x);
      if (z < 0) {
        count--;
      } else if (z > 0) {
        count++;
      }
    }

    if (count > 0) {
      return 1;
    }
    if (count < 0) {
      return -1;
    }
    return 0;
  }

  /**
   * 获取当前点与多边形点集最近的点，并返回 Index
   */
  public static getClosePointDistanceFromPolygon(point: ICoordinate, pointList: IPolygonPoint[]) {
    let minLen = Number.MAX_SAFE_INTEGER;
    let index = -1;

    pointList.forEach((p, i) => {
      const distance = LineToolUtils.calcDistance(point, p);
      if (distance < minLen) {
        minLen = distance;
        index = i;
      }
    });

    return index;
  }

  /**
   * 多边形合成多边形
   * @param selectedPolygon
   * @param combinedPolygon
   */
  public static combinePolygonWithPolygon(
    selectedPolygon: IPolygonData,
    combinedPolygon: IPolygonData,
  ):
    | {
        newPolygon: IPolygonData;
        unionList: string[];
      }
    | undefined {
    try {
      const turfSelectedPolygon = polygon([
        [...PolygonUtils.concatBeginAndEnd(selectedPolygon.pointList.map((v) => [v.x, v.y]))],
      ]);
      const turfCombinedPolygon = polygon([
        [...PolygonUtils.concatBeginAndEnd(combinedPolygon.pointList.map((v) => [v.x, v.y]))],
      ]);
      const unionPolygon = union(turfSelectedPolygon, turfCombinedPolygon);
      const unionList: string[] = [];
      const newPolygon = selectedPolygon;
      if (unionPolygon?.geometry?.coordinates?.length === 1) {
        unionList.push(combinedPolygon.id);
        const pointList = unionPolygon?.geometry.coordinates.map((p) => {
          // 多边形需要另外判断
          if (unionPolygon?.geometry?.type === 'MultiPolygon') {
            //@ts-ignore
            return p[0].reduce(PolygonUtils.deletePolygonLastPoint, []);
          }
          //@ts-ignore
          return p.reduce(PolygonUtils.deletePolygonLastPoint, []);
        })[0];
        newPolygon.pointList = pointList;
      }

      return {
        newPolygon,
        unionList,
      };
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 合成两个点集在一起
   * @param pointList1 被插入点集
   * @param pointList2 插入点集
   */
  public static composePointList(pointList1: IPolygonPoint[], pointList2: IPolygonPoint[]) {
    let indexA = 0;
    let indexB = 0;

    let min = Number.MAX_VALUE;

    pointList1.forEach((v, i) => {
      pointList2.forEach((d, j) => {
        const minDis = LineToolUtils.calcDistance(v, d);

        if (minDis < min) {
          indexA = i + 1;
          indexB = j + 1;
          min = minDis;
        }
      });
    });

    return [
      ...pointList1.slice(0, indexA),
      ...pointList2.slice(indexB, pointList2.length),
      ...pointList2.slice(0, indexB),
      ...pointList1.slice(indexA, pointList1.length),
    ];
  }

  /**
   * 将分割辅助算法得到的结果拼接起来
   * 1. 将被包裹的结果与包裹的多边形合成
   * @param polygonList
   */
  public static composeSegmentPolygonList(polygonList: any[]) {
    const deleteList: any[] = [];
    for (let i = 0; i < polygonList.length; i++) {
      for (let j = 0; j < polygonList.length; j++) {
        const p1 = polygonList[i]?.pointList;
        const p2 = polygonList[j]?.pointList;

        if (i !== j && p1 && p2 && PolygonUtils.isPointListInPolygon(p2, p1)) {
          // 将 j 合入 i 多边形中
          polygonList[i].pointList = PolygonUtils.composePointList(p1, p2);
          deleteList.unshift(j);
        }
      }
    }

    deleteList.forEach((v) => {
      polygonList.splice(v, 1);
    });

    return polygonList;
  }

  /**
   * Convex hull algorithm - Graham scan
   */
  public static computeConvexHull(points: IPolygonPoint[]) {
    points.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.y - b.y));
    const cross = (o: IPolygonPoint, a: IPolygonPoint, b: IPolygonPoint) =>
      (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

    const lower = [];
    for (const point of points) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    const upper = [];
    for (let i = points.length - 1; i >= 0; i--) {
      const point = points[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }

  public static createConvexHullGroup(annotations: TAnnotationViewData[]) {
    const result: IConvexHullGroupType = {};
    annotations.forEach((item) => {
      if (item.type !== 'line') return;
      if (!result[item.annotation.id]) {
        result[item.annotation.id] = { points: [], convexHull: [] };
      }
      result[item.annotation.id].points.push(...item.annotation.pointList);
    });
    Object.keys(result).forEach((key) => {
      result[key].convexHull = this.computeConvexHull(result[key].points);
    });
    return result;
  }
}
