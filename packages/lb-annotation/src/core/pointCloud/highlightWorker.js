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

function getNewColorByBox({ zMin, zMax, polygonPointList, attribute, x, y, z, colorList, valid }) {
  const inPolygon = isInPolygon({ x, y }, polygonPointList);
  if (inPolygon && z >= zMin && z <= zMax) {
    if (valid === false) {
      /** INVALID-COlOR rgba(255, 51, 51, 1) - It is same with lb-utils( /src/constant/style.ts ) */
      return [1, 103 / 255, 102 / 255];
    }

    if (colorList[attribute]) {
      return colorList[attribute].rgba.slice(0, 3).map((v) => v / 255);
    }

    return [1, 0, 0];
  }
}

onmessage = function onmessage(e) {
  const { position: points, color, cuboidList, colorList } = e.data;
  let num = 0;

  /**
   * Temporary closure of range judgment
   */
  // let maxZ = -Number.MAX_SAFE_INTEGER;
  // let minZ = Number.MAX_SAFE_INTEGER;
  // for (let i = 0; i < points.length; i += 3) {
  //   const z = points[i + 2];
  //   if (z) {
  //     if (z < minZ) {
  //       minZ = z;
  //     }
  //     if (z > maxZ) {
  //       maxZ = z;
  //     }
  //   }
  // }

  //  Loop to determine if it is in range
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    const newColorInfo = cuboidList
      .map((v) => {
        return getNewColorByBox({
          polygonPointList: v.polygonPointList,
          zMin: v.zMin,
          zMax: v.zMax,
          x,
          y,
          z,
          attribute: v.attribute,
          colorList,
          valid: v.valid,
        });
      })
      .filter((v) => v)
      .pop();

    // Notice. Scope: [0, 1];
    if (newColorInfo) {
      num++;
      const [r, g, b] = newColorInfo;
      color[i] = r;
      color[i + 1] = g;
      color[i + 2] = b;
    } else {
      // // DEFAULT COLOR RENDER
      // Recover the originPoint
      const index = getIndex(z);
      const newColor = COLOR_MAP_JET[index];
      const [r, g, b] = newColor;
      color[i] = r / 255;
      color[i + 1] = g / 255;
      color[i + 2] = b / 255;
    }
  }

  postMessage({ points, color, num });
};
