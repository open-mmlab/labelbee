import { ELineTypes, SEGMENT_NUMBER } from '../../constant/tool';
import { IPolygonPoint } from '../../types/tool/polygon';
// 计算曲线的值
export function createSmoothCurvePoints(
  points: any[],
  tension: number = 0.5,
  closed: boolean = false,
  numberOfSegments: number = 16,
) {
  if (points.length < 4) return points;

  const result = [];
  const ps = closed
    ? [
        points[points.length - 2],
        points[points.length - 1],
        points[points.length - 2],
        points[points.length - 1],
        ...points,
        points[0],
        points[1],
      ]
    : [points[0], points[1], ...points, points[points.length - 2], points[points.length - 1]];

  for (let i = 2; i < ps.length - 4; i += 2) {
    const t1x = (ps[i + 2] - ps[i - 2]) * tension;
    const t2x = (ps[i + 4] - ps[i]) * tension;
    const t1y = (ps[i + 3] - ps[i - 1]) * tension;
    const t2y = (ps[i + 5] - ps[i + 1]) * tension;

    for (let t = 0; t <= numberOfSegments; t++) {
      const st = t / numberOfSegments;
      const c1 = 2 * st ** 3 - 3 * st ** 2 + 1;
      const c2 = -2 * st ** 3 + 3 * st ** 2;
      const c3 = st ** 3 - 2 * st ** 2 + st;
      const c4 = st ** 3 - st ** 2;

      result.push({
        x: c1 * ps[i] + c2 * ps[i + 2] + c3 * t1x + c4 * t2x,
        y: c1 * ps[i + 1] + c2 * ps[i + 3] + c3 * t1y + c4 * t2y,
      });
    }
  }

  if (closed) {
    return result.slice(numberOfSegments).concat(result.slice(0, numberOfSegments));
  }
  return result;
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
  let p1;
  let p2;

  // 复制和预处理多边形点
  if (lineType === ELineTypes.Curve) {
    polygonPoints = createSmoothCurvePoints(
      polygonPoints.flatMap((point) => [point.x, point.y]),
      0.5,
      true,
      SEGMENT_NUMBER,
    );
  }

  // 快速边界检查
  const [minX, maxX, minY, maxY]: [number, number, number, number] = polygonPoints.reduce(
    ([accMinX, accMaxX, accMinY, accMaxY], { x, y }) => [
      Math.min(accMinX, x),
      Math.max(accMaxX, x),
      Math.min(accMinY, y),
      Math.max(accMaxY, y),
    ],
    [Infinity, -Infinity, Infinity, -Infinity],
  );

  if (checkPoint.x < minX || checkPoint.x > maxX || checkPoint.y < minY || checkPoint.y > maxY) {
    return false;
  }

  // 核心射线法判断
  p1 = polygonPoints[polygonPoints.length - 1];
  for (let i = 0; i < polygonPoints.length; i++) {
    p2 = polygonPoints[i];

    // 判断是否跨越Y轴
    if (checkPoint.y > Math.min(p1.y, p2.y) && checkPoint.y <= Math.max(p1.y, p2.y)) {
      if (checkPoint.x <= Math.max(p1.x, p2.x)) {
        // 计算交点
        const xinters = p1.y !== p2.y ? ((checkPoint.y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y) + p1.x : p1.x;

        if (checkPoint.x <= xinters) {
          counter++;
        }
      }
    }
    p1 = p2;

    // 提前退出
    if (counter % 2 !== 0 && i > polygonPoints.length / 2) {
      break;
    }
  }

  // 奇偶性判断
  return counter % 2 !== 0;
}

/**
 * 获取当 zoom 更改后的 pointList
 * @param pointList
 * @param zoom
 */
export function getPolygonPointUnderZoom(pointList: IPolygonPoint[], zoom = 1) {
  return pointList.map((v) => ({ ...v, x: v.x * zoom, y: v.y * zoom }));
}
