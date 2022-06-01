import { ELineTypes, SEGMENT_NUMBER } from '../../constant/tool';
import { IPolygonData, IPolygonPoint } from '../../types/tool/polygon';
import LineToolUtils from './LineToolUtils';
import PolygonUtils from './PolygonUtils';
import { difference, polygon } from '@turf/turf';

declare interface IAxis {
  x: number;
  y: number;
}

// 计算曲线的值
export function createSmoothCurvePoints(
  points: any[],
  tension: number = 0.5,
  closed: boolean = false,
  numberOfSegments: number = 16,
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
    for (let j = 0; j < numberOfSegments + 1; j++) {
      const d: any = formatResult.shift();
      formatResult.push(d);
    }
  }

  // 所以一个线段有 21 个点
  return formatResult;
}

/**
 * 通过数据转换为平滑曲线的点提交 [{x: number, y: number}...] => [x, ...smoothCurvePoints ,y]
 * @param pointList
 * @returns {Array<number>}
 */
export const createSmoothCurvePointsFromPointList = (
  pointList: Array<{ x: number; y: number }>,
  numberOfSegments: number = 16,
) =>
  createSmoothCurvePoints(
    pointList.reduce((acc: number[], cur: { x: number; y: number }) => {
      return [...acc, cur.x, cur.y];
    }, []),
    0.5,
    false,
    numberOfSegments,
  );

/**
 * 获取当前的坐标是否在多边形内
 *
 * @export
 * @param {IPolygonPoint} checkPoint
 * @param {IPolygonPoint[]} polygonPoints
 * @returns {boolean}
 */
export function isInPolygon(
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
    polygonPoints = createSmoothCurvePoints(
      polygonPoints.reduce<any[]>((acc, cur) => {
        return [...acc, cur.x, cur.y];
      }, []),
      0.5,
      true,
      SEGMENT_NUMBER,
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
 * 获取当 zoom 更改后的 pointList
 * @param pointList
 * @param zoom
 */
export function getPolygonPointUnderZoom(pointList: IPolygonPoint[], zoom = 1) {
  return pointList.map((v) => ({ ...v, x: v.x * zoom, y: v.y * zoom }));
}

export function deletePolygonLastPoint(acc: any, cur: any[], index: number, array: string | any[]) {
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

/**
 * 对比两个点是否在一范围内
 *
 * @export
 * @param {IPolygonPoint} currentCoord
 * @param {IPolygonPoint} targetCoord
 * @param {number} scope
 * @returns
 */
export function getIsInScope(currentCoord: IPolygonPoint, targetCoord: IPolygonPoint, scope: number) {
  if (Math.abs(currentCoord.x - targetCoord.x) < scope && Math.abs(currentCoord.y - targetCoord.y) < scope) {
    return true;
  }
  return false;
}

export function concatBeginAndEnd(array: any[]) {
  if (array.length < 1) {
    return array;
  }

  return [...array, array[0]];
}

export function segmentPolygonByPolygon(
  pointList: IPolygonPoint[],
  polygonList: IPolygonData[],
): IPolygonPoint[][] | void {
  try {
    let selectedPolygon = polygon([[...concatBeginAndEnd(pointList.map((v) => [v.x, v.y]))]]);
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
      const backgroundPolygon = polygon([[...concatBeginAndEnd(v.pointList.map((v) => [v.x, v.y]))]]);
      const diff = difference(selectedPolygon, backgroundPolygon);

      if (diff) {
        //@ts-ignore
        selectedPolygon = diff;
      }
    });
    const resultList =
      selectedPolygon?.geometry?.coordinates.map((polygon) => {
        // 多边形需要另外判断
        //@ts-ignore
        if (selectedPolygon?.geometry?.type === 'MultiPolygon') {
          //@ts-ignore
          return polygon[0].reduce(deletePolygonLastPoint, []);
        }
        return polygon.reduce(deletePolygonLastPoint, []);
      }) ?? [];
    return resultList.reduce((acc, pointList) => {
      const len = pointList.length;
      const newPointList = pointList.filter((point: IPolygonPoint, i: number) => {
        const nextIndex = (i + 1) % len;
        if (getIsInScope(point, pointList[nextIndex], 1)) {
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
    console.log(error);
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
export function getPolygonPointList(selectedPolygonID: string, polygonList: IPolygonData[]) {
  const polygon = polygonList.filter((v) => v.id === selectedPolygonID);
  if (polygon[0] && polygon[0].pointList && polygon[0].pointList.length > 0) {
    return polygon[0].pointList;
  }
  return [];
}
/**
 * 获取包裹当前 polygon 的 index
 * @param pointList
 * @param polygonList
 * @returns
 */
export function getWrapPolygonIndex(pointList: IPolygonPoint[], polygonList: IPolygonData[]) {
  return polygonList.findIndex((polygon) => PolygonUtils.isPointListInPolygon(pointList, polygon.pointList));
}

/**
 * 获取结果中最大的order
 *
 * @export
 * @param {any[]} result
 * @returns {number}
 */
export function getMaxOrder(result: any[]): number {
  let order = 0;
  result.forEach((v) => {
    if (v.order && v.order > order) {
      order = v.order;
    }
  });
  return order;
}

/**
 * 获取内部切割后的多边形合体点集
 * @param pointList
 * @param wrapPointList
 * @returns
 */
export function clipPolygonFromWrapPolygon(pointList: IPolygonPoint[], wrapPointList: IPolygonPoint[]) {
  // 存在上下包裹的情况
  const wrapDirection = isPolygonClosewise(wrapPointList);
  const selectedDirection = isPolygonClosewise(pointList);
  const linkIndex = getClosePointDistanceFromPolygon(pointList[0], wrapPointList);
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
export function isPolygonClosewise(p: IPolygonPoint[]) {
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
  } else if (count < 0) {
    return -1;
  } else {
    return 0;
  }
}

/**
 * 获取当前点与多边形点集最近的点，并返回 Index
 */
export function getClosePointDistanceFromPolygon(point: IAxis, pointList: IPolygonPoint[]) {
  let minLen = Number.MAX_SAFE_INTEGER;
  let index = -1;

  pointList.forEach((p, i) => {
    let distance = LineToolUtils.calcDistance(point, p);
    if (distance < minLen) {
      minLen = distance;
      index = i;
    }
  });

  return index;
}
