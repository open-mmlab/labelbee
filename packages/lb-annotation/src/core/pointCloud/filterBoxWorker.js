/**
 * Generate index with a fixed range.
 *
 * @param {*} z
 * @returns
 */
function getIndex(z) {
  const minZ = -7;
  const maxZ = 3;
  const len = maxZ - minZ;

  if (z < minZ) {
    z = minZ;
  }

  if (z > maxZ) {
    z = maxZ;
  }

  return Math.floor(((z - minZ) / len) * 255);
}
// COLOR_MAP_JET
function createColorMapJet() {
  let s;
  const p = new Array(256).fill('').map(() => new Array(3).fill(''));
  for (let i = 0; i < 20; i++) {
    for (s = 0; s < 32; s++) {
      p[s][0] = 128 + 4 * s;
      p[s][1] = 0;
      p[s][2] = 0;
    }
    p[32][0] = 255;
    p[32][1] = 0;
    p[32][2] = 0;
    for (s = 0; s < 63; s++) {
      p[33 + s][0] = 255;
      p[33 + s][1] = 4 + 4 * s;
      p[33 + s][2] = 0;
    }
    p[96][0] = 254;
    p[96][1] = 255;
    p[96][2] = 2;
    for (s = 0; s < 62; s++) {
      p[97 + s][0] = 250 - 4 * s;
      p[97 + s][1] = 255;
      p[97 + s][2] = 6 + 4 * s;
    }
    p[159][0] = 1;
    p[159][1] = 255;
    p[159][2] = 254;
    for (s = 0; s < 64; s++) {
      p[160 + s][0] = 0;
      p[160 + s][1] = 252 - s * 4;
      p[160 + s][2] = 255;
    }
    for (s = 0; s < 32; s++) {
      p[224 + s][0] = 0;
      p[224 + s][1] = 0;
      p[224 + s][2] = 252 - 4 * s;
    }
  }
  return p;
}
const COLOR_MAP_JET = createColorMapJet();

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

      if (color.length === 0) {
        // // DEFAULT COLOR RENDER
        // Recover the originPoint
        const index = getIndex(z);
        const newColorRGB = COLOR_MAP_JET[index];
        const [r, g, b] = newColorRGB;
        newColor.push(r / 255);
        newColor.push(g / 255);
        newColor.push(b / 255);
      } else {
        newColor.push(color[i]);
        newColor.push(color[i + 1]);
        newColor.push(color[i + 2]);
      }
      num++;
    }
  }

  this.postMessage({ position: newPosition, color: newColor, num });
};
