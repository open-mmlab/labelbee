/**
 * The set of Matrix multiplication
 */

import * as THREE from 'three';
import {
  TMatrix4Tuple,
  MatrixUtils,
  IPointCloudBox,
  I3DSpaceCoord,
  PointCloudUtils,
  TMatrix14Tuple,
  TMatrix13Tuple,
  IPolygonPoint,
  ICalib,
  IBasicBox3d,
  ICoordinate,
  ECameraType,
} from '@labelbee/lb-utils';
import uuid from '@/utils/uuid';

export function createThreeMatrix4(matrix4: TMatrix4Tuple) {
  return new THREE.Matrix4().set(...matrix4);
}

/**
 * Transfer the Kitti format (defined by array) to Three Matrix (flatten array)
 * @param P
 * @param R
 * @param T
 * @returns
 */
export function transferKitti2Matrix(
  P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple],
  R: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple],
  T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple],
) {
  try {
    const PMA = MatrixUtils.transferMatrix34FromKitti2Three(P);
    const RMA = MatrixUtils.transferMatrix33FromKitti2Three(R);
    const TMA = MatrixUtils.transferMatrix34FromKitti2Three(T);

    const PM = createThreeMatrix4(PMA);
    const RM = createThreeMatrix4(RMA);
    const TM = createThreeMatrix4(TMA);
    return {
      composeMatrix4: TM.clone().premultiply(RM).premultiply(PM),
      PM,
      RM,
      TM,
    };
  } catch (error) {
    console.error(error);
  }
}

export function rotatePoint(
  points: { x: number; y: number; z?: number },
  centerPoint: I3DSpaceCoord,
  rotationZ: number,
) {
  const pointVector = new THREE.Vector3(points.x, points.y, points?.z ?? 1);
  const Rz = new THREE.Matrix4().makeRotationZ(rotationZ);
  const TFrom = new THREE.Matrix4().makeTranslation(centerPoint.x, centerPoint.y, centerPoint.z);
  const TBack = new THREE.Matrix4().makeTranslation(-centerPoint.x, -centerPoint.y, -centerPoint.z);

  return pointVector.clone().applyMatrix4(TBack).applyMatrix4(Rz).applyMatrix4(TFrom);
}

/**
 * Check if the matrix is valid
 * @param matrix
 * @param numRows
 * @param numColumns
 * @returns
 */
export function isMatrixValid(matrix: number[][], numRows: number, numColumns: number): boolean {
  // Check if the number of rows and columns match the expected values
  if (matrix.length !== numRows || matrix.some((row) => row.length !== numColumns)) {
    return false;
  }

  return true; // Compliant with the rule
}

export const isMatrixValidByArr = (matrix: number[][], rowArr: Array<number[]>) =>
  rowArr.some((row) => isMatrixValid(matrix, row[0], row[1]));

/**
 * Check if the calib is in fisheyeCalib.
 * @param calib
 * @returns
 */
export const isFisheyeCalibValid = (calib: ICalib) => {
  if (
    calib.fisheyeDistortion?.length > 0 &&
    isMatrixValidByArr(calib.P, [
      [3, 4],
      [4, 4],
    ]) &&
    isMatrixValidByArr(calib.T, [
      [3, 4],
      [4, 4],
    ])
  ) {
    return true;
  }

  return false;
};

/**
 * Calculate lidar to fisheyeImage.
 *
 * In comparison to "lidar2Image",
 * the main difference lies in the computation of distortion parameters during the 2's step.
 * @param point
 * @param calib
 * @returns
 */
export const oCamFisheyeTransfer = (point: I3DSpaceCoord, calib: ICalib): THREE.Vector4 | undefined => {
  if (isFisheyeCalibValid(calib) === false) {
    console.error('Error Calib, it need fisheye calib');
    return;
  }

  const { P, fisheyeDistortion, T } = calib;

  const vector4 = new THREE.Vector4(point.x, point.y, point.z);

  const lidar2CamThree = createThreeMatrix4(MatrixUtils.transferMatrix34FromKitti2Three(T));
  const cam2ImgThree = createThreeMatrix4(MatrixUtils.transferMatrix34FromKitti2Three(P));

  // 1. Extrinsic Matrix (Lidar 2 Camera)
  const coord = vector4.applyMatrix4(lidar2CamThree);

  // 2. Distort Params 畸变参数。
  const norm = (coord.x ** 2 + coord.y ** 2) ** 0.5;
  const theta = Math.atan(coord.z / norm);
  const rho = fisheyeDistortion.reduce((acc, cur, i) => {
    return acc + cur * theta ** i;
  }, 0);
  coord.x = (coord.x / norm) * rho;
  coord.y = (coord.y / norm) * rho;
  coord.z = 1;

  // 3. Intrinsic Matrix
  const lastCoord = coord.applyMatrix4(cam2ImgThree);

  return lastCoord;
};

/**
 * For kbCamFisheyeTransfer
 * @param fisheyeDistortion
 * @param theta
 * @returns
 */
const batchPolyval = (fisheyeDistortion: number[], theta: number) => {
  const n = fisheyeDistortion.length;
  let res = 0;
  const rec = [];
  for (let itr = 0; itr < fisheyeDistortion.length; itr++) {
    rec.push(fisheyeDistortion[n - itr - 1] + res * theta);
    res = fisheyeDistortion[n - itr - 1] + res * theta;
  }

  return res;
};

/**
 * Calculate lidar to fisheyeImage.
 *
 * In comparison to "lidar2Image",
 * the main difference lies in the computation of distortion parameters during the 2's step.
 * @param point
 * @param calib
 * @returns
 */
const kbCamFisheyeTransfer = (point: I3DSpaceCoord, calib: ICalib): ICoordinate | undefined => {
  const { P, fisheyeDistortion } = calib;

  const { x, y, z } = point;

  const aff_ = [
    [P[0][0], P[0][1]],
    [P[1][0], P[1][1]],
  ];

  const xc_ = P[0][2];
  const yc_ = P[1][2];

  // Calculate the norm of the 2D points and inverse of the norm
  const invNorm = 1 / Math.hypot(x, y);

  // Initialize arrays for xn
  const xn = [];

  // Calculate theta and rho based on the camera type
  const theta = Math.atan2(Math.hypot(x, y), z);
  const rho = batchPolyval(fisheyeDistortion, theta);
  xn[0] = x * invNorm * rho;
  xn[1] = y * invNorm * rho;

  return {
    x: aff_[0][0] * xn[0] + aff_[0][1] * xn[1] + xc_,
    y: aff_[1][0] * xn[0] + aff_[1][1] * xn[1] + yc_,
  };
};

/**
 * Calculate lidar to fisheyeImage.
 *
 * In comparison to "lidar2Image",
 * the main difference lies in the computation of distortion parameters during the 2's step.
 * @param point
 * @param calib
 * @returns
 */
export const lidar2FisheyeImage = (point: I3DSpaceCoord, calib: ICalib) => {
  if (isFisheyeCalibValid(calib) === false) {
    console.error('Error Calib, it need fisheye calib');
    return;
  }

  if (calib?.cameraType === ECameraType.OmniCamera) {
    return oCamFisheyeTransfer(point, calib);
  }

  if (calib?.cameraType === ECameraType.KannalaBrandt) {
    return kbCamFisheyeTransfer(point, calib);
  }
};

export function lidar2image(point: { x: number; y: number; z: number }, composeMatrix4: THREE.Matrix4) {
  const vector = new THREE.Vector4(point.x, point.y, point.z);
  const newV = vector.applyMatrix4(composeMatrix4);

  // Just keep the front object.
  if (newV.z < 0) {
    return undefined;
  }

  /*
   * Depth normalization of the imaging plane
   * 成像平面深度归一化
   */
  const z = 1 / newV.z;
  const fixMatrix4 = new THREE.Matrix4().set(z, 0, 0, 0, 0, z, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
  return newV.applyMatrix4(fixMatrix4);
}

export function getCuboidFromPointCloudBox(boxParams: IPointCloudBox) {
  const { center, width, height, depth, rotation } = boxParams;
  const polygonPointList = [
    {
      x: center.x + width / 2,
      y: center.y - height / 2,
    },
    {
      x: center.x + width / 2,
      y: center.y + height / 2,
    },
    {
      x: center.x - width / 2,
      y: center.y + height / 2,
    },
    {
      x: center.x - width / 2,
      y: center.y - height / 2,
    },
  ].map((v) => {
    const vector = rotatePoint(v, center, rotation);
    return {
      x: vector.x,
      y: vector.y,
    };
  });

  const zMax = center.z + depth / 2;
  const zMin = center.z - depth / 2;

  return {
    ...boxParams,
    polygonPointList,
    zMax,
    zMin,
  };
}

function sortPoints(points: IPolygonPoint[]) {
  const sortedPoints = points.slice();
  sortedPoints.sort((a, b) => {
    if (a.x === b.x) {
      return b.y - a.y; // 修改此处，按照 y 值降序排列
    }
    return a.x - b.x;
  });
  return sortedPoints;
}

function crossProduct(p1: IPolygonPoint, p2: IPolygonPoint, p3: IPolygonPoint) {
  const x1 = p2.x - p1.x;
  const y1 = p2.y - p1.y;
  const x2 = p3.x - p1.x;
  const y2 = p3.y - p1.y;
  return x1 * y2 - x2 * y1;
}

/**
 * convexHull Algorithm using Graham scanning method.
 * @param points
 * @returns
 */
function buildConvexHull(points: IPolygonPoint[]): IPolygonPoint[] {
  const sortedPoints = sortPoints(points);
  const lowerHull = [];
  for (let i = 0; i < sortedPoints.length; i++) {
    while (
      lowerHull.length >= 2 &&
      crossProduct(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], sortedPoints[i]) <= 0
    ) {
      lowerHull.pop();
    }
    lowerHull.push(sortedPoints[i]);
  }

  const upperHull = [];
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    while (
      upperHull.length >= 2 &&
      crossProduct(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], sortedPoints[i]) <= 0
    ) {
      upperHull.pop();
    }
    upperHull.push(sortedPoints[i]);
  }

  lowerHull.pop();
  upperHull.pop();
  const convexHull = lowerHull.concat(upperHull);
  return convexHull;
}

export const point3DLidar2Image = (point: { x: number; y: number; z: number }, calib: ICalib) => {
  if (isFisheyeCalibValid(calib)) {
    return lidar2FisheyeImage(point, calib);
  }

  const { P, R, T } = calib;
  const { composeMatrix4 } = transferKitti2Matrix(P, R, T) ?? {};
  if (!composeMatrix4) {
    return;
  }
  return lidar2image(point, composeMatrix4);
};

export const isInImage = ({
  point,
  calib,
  width,
  height,
}: {
  point: I3DSpaceCoord;
  calib?: ICalib;
  width: number;
  height: number;
}) => {
  /**
   * 1. Calculate the size of image
   */

  if (!calib) {
    return false;
  }
  // return true;
  const image2D = point3DLidar2Image(point, calib);
  if (!image2D) {
    return false;
  }
  // 2. Restrict the size of image
  if (image2D.x >= 0 && image2D.x <= width && image2D.y >= 0 && image2D.y <= height) {
    return true;
  }
  return false;
};

export const getHighlightIndexByPoints = ({
  points,
  calib,
  width,
  height,
}: {
  points: ArrayLike<number>;
  calib?: ICalib;
  width: number;
  height: number;
}) => {
  const highlightIndex: number[] = [];
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i];
    const y = points[i + 1];
    const z = points[i + 2];

    const isIn = isInImage({ point: { x, y, z }, calib, width, height });
    if (isIn) {
      highlightIndex.push(1);
    } else {
      highlightIndex.push(0);
    }
  }
  return highlightIndex;
};

/**
 * Merge numberList between 1 and 0.
 * @param indexList
 * @returns
 */
export const mergeHighlightList = (indexList: number[][]) => {
  if (indexList.length === 0) {
    return [];
  }

  const list = [];
  for (let i = 0; i < indexList[0].length; i++) {
    for (let j = 0; j < indexList.length; j++) {
      if (indexList[j][i] === 1) {
        list.push(1);
        break;
      }
    }
    if (list.length === i) {
      list.push(0);
    }
  }
  return list;
};

export function pointCloudLidar2image(
  boxParams: IPointCloudBox | IBasicBox3d,
  calib?: ICalib,
  options: {
    createRange: boolean; // Calculate the range of cuboid.
  } = { createRange: false },
) {
  if (!calib) {
    return { transferViewData: [], viewRangePointList: [] };
  }

  const { createRange } = options;
  const allViewData = PointCloudUtils.getAllViewData(boxParams);

  const isFisheyeCalib = isFisheyeCalibValid(calib);
  const { P, R, T } = calib;
  let composeMatrix4: THREE.Matrix4 | undefined;

  /**
   * 1. Default pattern initialize composeMatrix4
   *
   * Avoid double counting
   */
  if (isFisheyeCalib === false) {
    const { composeMatrix4: newComposeMatrix4 } = transferKitti2Matrix(P, R, T) ?? {};
    if (!newComposeMatrix4) {
      return;
    }
    composeMatrix4 = newComposeMatrix4;
  }
  const transferViewData = allViewData
    .map((viewData) => ({
      type: viewData.type,
      pointList: viewData.pointList
        .map((point) => rotatePoint(point, boxParams.center, boxParams.rotation))
        .map((point) => {
          // FisheyeCalib Pattern
          if (isFisheyeCalib) {
            return lidar2FisheyeImage(point, calib);
          }

          return composeMatrix4 && lidar2image(point, composeMatrix4);
        })
        .map((point) => {
          if (!point) {
            return undefined;
          }
          return { id: uuid(), x: point?.x, y: point?.y };
        })
        .filter((v) => v !== undefined) as Array<{ id: string; x: number; y: number }>,
    }))
    // Clear Empty PointList
    .filter((v) => v.pointList.length !== 0);

  // The front polygon need to highlight.
  if (transferViewData[0] && transferViewData[0].pointList && isFisheyeCalib) {
    transferViewData[0].pointList = transferViewData[0].pointList.map((v) => ({ ...v, specialEdge: true }));
  }

  let viewRangePointList: IPolygonPoint[] = [];

  // All Line is showing.
  if (transferViewData.length === 6 && createRange === true) {
    const frontPointList = transferViewData[0].pointList;
    const backPointList = transferViewData[1].pointList;
    viewRangePointList = buildConvexHull([...frontPointList, ...backPointList]);
  }

  return { transferViewData, viewRangePointList };
}

/**
 * Calculate the pcdMapping from point3d to point2d.
 * @param points
 * @param cameraMatrix
 * @param filterSize
 * @returns
 */
export function pointMappingLidar2image(
  points: Float32Array,
  calib: ICalib,
  filterSize: {
    width: number;
    height: number;
  },
) {
  const isFisheyeCalib = isFisheyeCalibValid(calib);

  const { P, R, T } = calib;
  let composeMatrix4: THREE.Matrix4 | undefined;

  /**
   * 1. Default pattern initialize composeMatrix4
   *
   * Avoid double counting
   */
  if (isFisheyeCalib === false) {
    const { composeMatrix4: matrix4 } = transferKitti2Matrix(P, R, T) ?? {};
    if (!matrix4) {
      return;
    }

    composeMatrix4 = matrix4;
  }
  const len = points.length / 3;

  const pcdMapping: { [key: number]: { x: number; y: number } } = {};
  for (let i = 0; i < len; i++) {
    const point3d = {
      x: points[i * 3],
      y: points[i * 3 + 1],
      z: points[i * 3 + 2],
    };
    let point2d;
    if (isFisheyeCalib) {
      point2d = lidar2FisheyeImage(point3d, calib);
    } else {
      point2d =
        composeMatrix4 &&
        lidar2image(
          {
            x: points[i * 3],
            y: points[i * 3 + 1],
            z: points[i * 3 + 2],
          },
          composeMatrix4,
        );
    }

    if (point2d) {
      const x = Math.floor(point2d.x);
      const y = Math.floor(point2d.y);

      // 1. Filter the points outside imgSize.
      if (x > filterSize.width || y > filterSize.height || x < 0 || y < 0) {
        continue;
      }

      // 2. the Mapping is int.
      pcdMapping[i] = { x, y };
    }
  }
  return { pcdMapping };
}

export function pointListLidar2Img(
  pointList3D: I3DSpaceCoord[],
  calib?: ICalib,
  filterSize?: {
    width: number;
    height: number;
  },
) {
  if (!calib || !filterSize) {
    return;
  }

  const isFisheyeCalib = isFisheyeCalibValid(calib);

  const { P, R, T } = calib;
  let composeMatrix4: THREE.Matrix4 | undefined;

  /**
   * 1. Default pattern initialize composeMatrix4
   *
   * Avoid double counting
   */
  if (isFisheyeCalib === false) {
    const { composeMatrix4: matrix4 } = transferKitti2Matrix(P, R, T) ?? {};
    if (!matrix4) {
      return;
    }

    composeMatrix4 = matrix4;
  }
  const pointList2D: Array<ICoordinate> = [];

  // 2. Transform pointList3D
  pointList3D.forEach((point3D) => {
    let point2d;
    if (isFisheyeCalib) {
      point2d = lidar2FisheyeImage(point3D, calib);
    } else {
      point2d = composeMatrix4 && lidar2image(point3D, composeMatrix4);
    }

    if (point2d) {
      const { x, y } = point2d;

      pointList2D.push({ x, y });
    }
  });
  // 有一个点在图像内就返回整个多边形
  const hasInImagePoint = pointList2D.some((point) => {
    return point.x > 0 && point.x < filterSize.width && point.y > 0 && point.y < filterSize.height;
  });

  if (hasInImagePoint) {
    return pointList2D;
  }
}
