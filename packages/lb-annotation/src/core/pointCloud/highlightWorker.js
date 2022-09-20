class PointCloudUtils {
  static genColorByCoord(x, y, z) {
    if (z <= 0) {
      return [128, 128, 128];
    }

    if (z < 5) {
      return [255, 0, 0];
    }

    if (z < 10) {
      return [0, 255, 0];
    }

    return [0, 0, 255];
  }

  static getStandardColorByCoord(x, y, z) {
    const pdColor = this.genColorByCoord(x, y, z);
    return pdColor.map((hex) => hex / 255);
  }
}

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
  let num = 0;

  //  Loop to determine if it is in range
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    const inPolygon = isInPolygon({ x, y }, polygonPointList);

    if (inPolygon && z >= zMin && z <= zMax) {
      num++;
      color[i] = 0;
      color[i + 1] = 1;
      color[i + 2] = 1;
    } else {
      // DEFAULT COLOR RENDERc
      const [r, g, b] = PointCloudUtils.getStandardColorByCoord(x, y, z);
      color[i] = r;
      color[i + 1] = g;
      color[i + 2] = b;
    }
  }

  postMessage({ points, color, num });
};
