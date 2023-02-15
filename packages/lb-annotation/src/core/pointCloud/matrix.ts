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

export function pointCloudLidar2image(
  boxParams: IPointCloudBox,
  cameraMatrix: {
    P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple];
    R: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple];
    T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple];
  },
) {
  const allViewData = PointCloudUtils.getAllViewData(boxParams);
  const { P, R, T } = cameraMatrix;
  const { composeMatrix4 } = transferKitti2Matrix(P, R, T);

  const transferViewData = allViewData
    .map((viewData) => ({
      type: viewData.type,
      pointList: viewData.pointList
        .map((point) => rotatePoint(point, boxParams.center, boxParams.rotation))
        .map((point) => lidar2image(point, composeMatrix4))
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

  return transferViewData;
}
