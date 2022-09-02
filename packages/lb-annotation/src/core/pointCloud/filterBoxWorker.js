export function isInPolygon(checkPoint, polygonPoints, lineType = 0) {
  let counter = 0;
  let i;
  let xinters;
  let p1;
  let p2;

  polygonPoints = [...polygonPoints];
  if (lineType === 1) {
    polygonPoints = createSmoothCurvePoints(
      polygonPoints.reduce((acc, cur) => {
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

onmessage = function onmessage(e) {
  const { zMin, zMax, polygonPointList, position: points, color } = e.data;

  //  Loop to determine if it is in range
  const newPosition = [];
  const newColor = [];
  let num = 0;

  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    const inPolygon = isInPolygon({ x, y }, polygonPointList);

    if (inPolygon && z >= zMin && z <= zMax) {
      newPosition.push(x);
      newPosition.push(y);
      newPosition.push(z);
      newColor.push(color[i]);
      newColor.push(color[i + 1]);
      newColor.push(color[i + 2]);
      num++;
    }
  }

  this.postMessage({ position: newPosition, color: newColor, num });
};
