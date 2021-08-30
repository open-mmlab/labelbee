import { isInRange } from '../math';

/**
 * 对比两个点是否在一范围内
 *
 * @export
 * @param {IPolygonPoint} currentCoord
 * @param {IPolygonPoint} targetCoord
 * @param {number} scope
 * @returns
 */
export function getIsInScope(currentCoord: ICoordinate, targetCoord: ICoordinate, scope: number) {
  if (Math.abs(currentCoord.x - targetCoord.x) < scope && Math.abs(currentCoord.y - targetCoord.y) < scope) {
    return true;
  }
  return false;
}

export function getLineLength(point1: ICoordinate, point2: ICoordinate) {
  return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
}

/**
 * 获取当前点的在点集中的临界点
 * @param coord
 * @param pointList
 * @param scope
 */
export function returnClosePointIndex(coord: ICoordinate, pointList: ICoordinate[], scope = 3): number {
  let pointIndex = -1;

  for (let i = 0; i < pointList.length; i++) {
    const data = pointList[i];
    if (getIsInScope(coord, data, scope)) {
      pointIndex = i;
    }
  }

  return pointIndex;
}

/**
 *  获取当前左边举例线段的最短路径，建议配合 isHoverLine 使用
 *
 * @export
 * @param {ICoordinate} pt
 * @param {ICoordinate} begin
 * @param {ICoordinate} end
 * @param {boolean} ignoreRatio
 * @returns
 */
export const getFootOfPerpendicular = (
  pt: ICoordinate, // 直线外一点
  begin: ICoordinate, // 直线开始点
  end: ICoordinate,
  /* 使用坐标范围 */
  useAxisRange = false,
) => {
  // 直线结束点
  let retVal: any = { x: 0, y: 0 };

  const dx = begin.x - end.x;
  const dy = begin.y - end.y;
  if (Math.abs(dx) < 0.00000001 && Math.abs(dy) < 0.00000001) {
    retVal = begin;
    return retVal;
  }

  let u = (pt.x - begin.x) * (begin.x - end.x) + (pt.y - begin.y) * (begin.y - end.y);
  u /= dx * dx + dy * dy;

  retVal.x = begin.x + u * dx;
  retVal.y = begin.y + u * dy;

  const length = getLineLength(pt, retVal);
  const ratio = 2;

  const fromX = Math.min(begin.x, end.x);
  const toX = Math.max(begin.x, end.x);
  const fromY = Math.min(begin.y, end.y);
  const toY = Math.max(begin.y, end.y);

  /** x和y坐标都超出范围内 */
  const allAxisOverRange = !(isInRange(pt.x, [fromX, toX]) || isInRange(pt.y, [fromY, toY]));

  /** x或y坐标超出范围 */
  const someAxisOverRange = pt.x > toX + ratio || pt.x < fromX - ratio || pt.y > toY + ratio || pt.y < fromY - ratio;

  const isOverRange = useAxisRange ? allAxisOverRange : someAxisOverRange;

  if (isOverRange) {
    return {
      footPoint: retVal,
      length: Infinity,
    };
  }

  return {
    footPoint: retVal,
    length,
  };
};
