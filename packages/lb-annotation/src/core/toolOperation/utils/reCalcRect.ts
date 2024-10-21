// x and y are the coordinates of the top-left corner of the rectangle
interface RectInfo {
  width: number;
  height: number;
  x: number;
  y: number;
  noChange?: boolean;
}

// Information about vertices
interface PointInfo {
  x: number;
  y: number;
  position?: number;
}

// Find the nearest points to the target rectangle
const findNearestPoints = (curRectPoints: PointInfo[], targetRect: RectInfo): PointInfo[] => {
  // Center point of the target rectangle
  const targetRectCenter = {
    x: (targetRect.x + targetRect.width) / 2,
    y: (targetRect.y + targetRect.height) / 2,
  };

  // Calc the closest vertices
  let minDistance = Infinity;
  let nearestPoints: PointInfo[] = [];

  for (const cur of curRectPoints) {
    const curDistance = Math.sqrt(Math.pow(targetRectCenter.x - cur.x, 2) + Math.pow(targetRectCenter.y - cur.y, 2));
    if (curDistance < minDistance) {
      // Found a shorter distance, clear previous values and add current point
      minDistance = curDistance;
      nearestPoints = [cur];
    } else if (curDistance === minDistance) {
      // Handle symmetric cases where distances are equal
      nearestPoints.push(cur);
    }
  }

  return nearestPoints;
};

// Find vertices inside the target rectangle
const findInTargetRectPoints = (curRect: RectInfo, targetRect: RectInfo): PointInfo[] => {
  // Vertices: top-left (0), top-right (1), bottom-right (2), bottom-left (3)
  const curRectPoints = [
    {
      x: curRect.x,
      y: curRect.y,
      position: 0,
    },
    {
      x: curRect.x + curRect.width,
      y: curRect.y,
      position: 1,
    },
    {
      x: curRect.x,
      y: curRect.y + curRect.height,
      position: 2,
    },
    {
      x: curRect.x + curRect.width,
      y: curRect.y + curRect.height,
      position: 3,
    },
  ];

  // Filter vertices that are inside the target rectangle
  const inTargetRectPoints: PointInfo[] = curRectPoints.filter(
    (item) =>
      item.x >= targetRect.x &&
      item.x <= targetRect.width + targetRect.x &&
      item.y >= targetRect.y &&
      item.y <= targetRect.height + targetRect.y,
  );

  return inTargetRectPoints;
};

// Find all edges inside the target rectangle
const findInTargetRectEdges = (curRect: RectInfo, targetRect: RectInfo) => {
  const curRectRight = curRect.x + curRect.width;
  const curRectBottom = curRect.y + curRect.height;

  const targetRectRight = targetRect.x + targetRect.width;
  const targetRectBottom = targetRect.y + targetRect.height;

  // Check if any edge of current rectangle intersects with target rectangle
  const edgesIntersect =
    curRect.x <= targetRectRight &&
    curRectRight >= targetRect.x &&
    curRect.y <= targetRectBottom &&
    curRectBottom >= targetRect.y;

  // Check if current rectangle contains the target rectangle
  const containsTarget =
    curRect.x <= targetRect.x &&
    curRectRight >= targetRectRight &&
    curRect.y <= targetRect.y &&
    curRectBottom >= targetRectBottom;

  return edgesIntersect || containsTarget;
};

// Find the required points and reCalc
const reCalcRect = (curRect: RectInfo, targetRect: RectInfo, scaleWidth: number, scaleHeight: number): RectInfo => {
  const inTargetRectPoints = findInTargetRectPoints(curRect, targetRect);
  // If there are points inside the target rectangle
  if (inTargetRectPoints.length > 0) {
    // If three or more vertices are inside the target rectangle, use the top-left vertex; theoretically, three vertices should not exist
    const nearestPoints =
      inTargetRectPoints.length >= 3 ? inTargetRectPoints : findNearestPoints(inTargetRectPoints, targetRect);

    // Calc the new position of rectangle curRect
    const position = nearestPoints[0].position || 0;
    const positions: {
      [key: number]: (point: PointInfo, scaleWidth: number, scaleHeight: number) => { x: number; y: number };
    } = {
      0: (point) => ({ x: point.x, y: point.y }),
      1: (point) => ({ x: point.x - scaleWidth, y: point.y }),
      2: (point) => ({ x: point.x, y: point.y - scaleHeight }),
      3: (point) => ({ x: point.x - scaleWidth, y: point.y - scaleHeight }),
    };
    const { x, y } = positions[position](nearestPoints[0], scaleWidth, scaleHeight);

    return {
      width: scaleWidth,
      height: scaleHeight,
      x,
      y,
    };
  }

  // If there are no points inside the target rectangle, check if there is an edge intersection with the target rectangle
  const isIntersection = findInTargetRectEdges(curRect, targetRect);
  if (isIntersection) {
    return {
      width: scaleWidth,
      height: scaleHeight,
      x: (targetRect.x + targetRect.width - scaleWidth) / 2,
      y: (targetRect.y + targetRect.height - scaleHeight) / 2,
    };
  }

  // If there is an intersection, scale around the center of the target rectangle
  return { ...curRect, noChange: true };
};

export default reCalcRect;
