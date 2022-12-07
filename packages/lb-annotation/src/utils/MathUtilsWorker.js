class CommonToolUtils {
  static findAllLine(pointList, isClose = true) {
    const arr = [];
    const newPoint = [...pointList];
    if (newPoint.length >= 3 && isClose === true) {
      // 连接头尾
      newPoint.push({ ...newPoint[0] });
    }
    for (let i = 0; i < newPoint.length; i++) {
      if (newPoint[i + 1]) {
        arr.push({
          point1: newPoint[i],
          point2: newPoint[i + 1],
          pointIndex: i,
        });
      }
    }
    return arr;
  }
}

class MathUtils {
  static isInRange(value, range) {
    const min = Math.min(...range);
    const max = Math.max(...range);
    const inRange = (v) => v <= max && v >= min;
    const values = Array.isArray(value) ? value : [value];
    return values.every((v) => inRange(v));
  }

  static getLineLength(point1, point2) {
    return Math.sqrt(Math.pow(point2.y - point1.y, 2) + Math.pow(point2.x - point1.x, 2));
  }

  static isOutOfRange(coordinate, point1, point2, range) {
    const x1 = point1.x - coordinate.x;
    const x2 = point2.x - coordinate.x;
    const y1 = point1.y - coordinate.y;
    const y2 = point2.y - coordinate.y;

    const sameSideX = (x1 >= 0 && x2 >= 0) || (x1 <= 0 && x2 <= 0);
    const sameSideY = (y1 >= 0 && y2 >= 0) || (y1 <= 0 && y2 <= 0);

    return (x1 > range && x2 > range && sameSideX) || (y1 > range && y2 > range && sameSideY);
  }

  static cross(vector1, vector2) {
    return vector1.x * vector2.y - vector2.x * vector1.y;
  }

  static getFootOfPerpendicular(
    pt, // 直线外一点
    begin, // 直线开始点
    end,
    /* 使用坐标范围 */
    useAxisRange = false,
  ) {
    // 直线结束点
    let retVal = { x: 0, y: 0 };

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

    const length = this.getLineLength(pt, retVal);

    const ratio = 2;

    if (length > 2) {
      return {
        footPoint: retVal,
        length: Infinity,
      };
    }

    const fromX = Math.min(begin.x, end.x);
    const toX = Math.max(begin.x, end.x);
    const fromY = Math.min(begin.y, end.y);
    const toY = Math.max(begin.y, end.y);

    /** x和y坐标都超出范围内 */
    const allAxisOverRange = !(this.isInRange(pt.x, [fromX, toX]) || this.isInRange(pt.y, [fromY, toY]));

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

    /**
     * New Way
     */

    // const vector1 = {
    //   x: end.x - begin.x,
    //   y: end.y - begin.y
    // }

    // const vector2 = {
    //   x: pt.x - begin.x,
    //   y: pt.y - begin.y,
    // }

    // const area = this.cross(vector1, vector2);

    // const originEdgeLen = Math.sqrt(Math.pow(vector1.x, 2) + Math.pow(vector2.y, 2));

    // const len = area / originEdgeLen;

    // if (len > 2) {
    //   return;
    // }

    // const footPoint =

    // return {
    //   footPoint: retVal,
    //   length,
    // };
  }
}

function getClosestPoint(coordinate, polygonList, lineType = 0, range = 3, option) {
  let hasClosed = false; // 是否有进行边缘吸附？
  const isClose = option ? option.isClose || true : false;

  // 第一步： 寻找所有图形中最新的边

  let closestPolygonID = '';
  let closestEdgeIndex = -1;
  let min = Infinity;
  let dropFoot = coordinate; // 垂足坐标

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
      case 0:
        {
          const allLine = CommonToolUtils.findAllLine(v.pointList, isClose);
          allLine.forEach((line, lineIndex) => {
            if (isCloseNode) {
              return;
            }

            // 1. Filter out of range
            const twoPointDistance1 = MathUtils.getLineLength(line.point1, coordinate);
            const twoPointDistance2 = MathUtils.getLineLength(line.point2, coordinate);

            if (MathUtils.isOutOfRange(coordinate, line.point1, line.point2, range)) {
              return;
            }

            let { length, footPoint } = MathUtils.getFootOfPerpendicular(coordinate, line.point1, line.point2);

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

      case 1:
        {
          const points = this.createSmoothCurvePoints(
            v.pointList.reduce((acc, cur) => {
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

onmessage = function onmessage(e) {
  const { points, backgroundList } = e.data;
  const connectionPoints = [];
  const cacheSet = new Set();

  try {
    const judgeIsConnectPoint = (point, polygonList) => {
      const { dropFoot } = getClosestPoint(point, polygonList, 0, 1, { isClose: false });

      if (dropFoot !== point) {
        const s = `${dropFoot.x} + ${dropFoot.y}`;
        // Filter the same point.
        if (!cacheSet.has(s)) {
          connectionPoints.push(point);
        }

        cacheSet.add(s);
      }
    };

    // Point & BackgroundList;
    points.forEach(function pointsCalc(point) {
      judgeIsConnectPoint(point, backgroundList);
    });

    backgroundList.forEach(function backgroundsCalc(v) {
      let traverseID = '';
      traverseID = v.id;

      backgroundList.forEach(function background2Calc(annotation, i) {
        if (annotation.id === traverseID) {
          return;
        }

        const newPolygonList = [...backgroundList];
        newPolygonList.splice(i, 1);

        annotation.pointList.forEach(function backgroundPointsCalc(point) {
          judgeIsConnectPoint(point, newPolygonList);
        });
      });
    });

    postMessage({ connectionPoints });
  } catch (E) {
    console.error(E);
    postMessage({ connectionPoints: [] });
  }
};
