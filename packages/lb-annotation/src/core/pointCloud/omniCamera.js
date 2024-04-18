/* eslint-disable */

/*
 * @file This file contains functions for converting 3D points to 2D image points in a fisheye camera.
 * @author lihuaqi <lihuaqi@sensetime.com>
 * @createdate 2024-4-17
 */

const math = require('mathjs');

/**
 * Converts a 1x3 or 3x1 matrix into a 1x4 or 4x1 matrix by adding a 1 as the last element.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {Array<Array<number>>} The converted matrix.
 */
function convertMatrix(matrix) {
  if (matrix.length !== 1 || matrix[0].length !== 3) {
    throw new Error('Input matrix must be a 1x3 or 3x1 matrix');
  }

  const result = [[matrix[0][0]], [matrix[0][1]], [matrix[0][2]], [1]];
  return result;
}

/**
 * Calculates the L2 norm for each row of a matrix.
 * @param {Array<Array<number>>} matrix - The input matrix.
 * @returns {Array<number>} An array containing the L2 norm of each row.
 */
function normOfRows(matrix) {
  const norms = [];
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const squaredSum = row[0] * row[0] + row[1] * row[1];
    const norm = Math.sqrt(squaredSum);
    norms.push(norm);
  }
  return norms;
}

/**
 * Evaluates a polynomial given its coefficients and x values.
 * @param {Array<number>} param - The polynomial coefficients.
 * @param {Array<number>} x - The x values to evaluate the polynomial at.
 * @returns {Array<number>} An array containing the evaluated polynomial values.
 */
function polyVal(param, x) {
  const n = param.length;
  const res = [];
  for (let i = 0; i < x.length; i++) {
    let result = 0.0;
    for (let itr = 0; itr < param.length; itr++) {
      result = param[n - itr - 1] + result * x[i];
    }
    res.push(result);
  }
  return res;
}

/**
 * Converts a set of 3D points to 2D image points in a fisheye camera.
 * @param {Array<Array<number>>} p3ds - The 3D points.
 * @param {Array<Array<number>>} cameraIntrinsic - The camera intrinsic matrix.
 * @param {Array<number>} cameraDist - The camera distortion parameters.
 * @returns {Array<Array<number>>} The corresponding 2D image points.
 */
function fisheyeCameraToImage(p3ds, cameraIntrinsic, cameraDist) {
  // Extract the intrinsic parameters (affine matrix)
  const aff = math.matrix([
    [cameraIntrinsic[0][0], cameraIntrinsic[0][1]],
    [cameraIntrinsic[1][0], cameraIntrinsic[1][1]],
  ]);

  // Extract the principal point coordinates
  const xc = cameraIntrinsic[0][2];
  const yc = cameraIntrinsic[1][2];

  // Extract the inverse polynomial distortion parameters
  const invPolyParam = cameraDist;

  // Compute the Euclidean norms of each row of the input points
  const norm = normOfRows(p3ds.toArray().map((row) => row.slice(0, 2)));

  // Compute the element-wise inverse of the norms
  const invNorm = math.dotDivide(math.ones(math.matrix(norm).size()), norm);

  // Compute the angles (theta) corresponding to the z-coordinates of the input points
  const theta = math.atan2(
    math.multiply(-1, p3ds.subset(math.index(math.range(0, math.matrix(p3ds).size()[0]), 2))),
    norm,
  );

  // Compute the radial distances (rho) using the inverse polynomial distortion parameters
  const rho = polyVal(invPolyParam, theta);

  // Initialize the output points
  let xn = math.ones(2, p3ds.size()[0]);

  // Compute the transformed x-coordinates of the input points
  const xn0 = math.multiply(p3ds.subset(math.index(math.range(0, p3ds.size()[0]), 0)), invNorm * rho);

  // Compute the transformed y-coordinates of the input points
  const xn1 = math.multiply(p3ds.subset(math.index(math.range(0, p3ds.size()[0]), 1)), invNorm * rho);

  // Create the transformation matrix for the x-coordinates
  const transformationMatrix = math.matrix([
    [xn0, 0],
    [xn1, 0],
  ]);

  // Extract the x-coordinates from the transformation matrix
  xn = math.subset(transformationMatrix, math.index(math.range(0, transformationMatrix.size()[0]), 0));

  // Define the translation vector
  const translationVector = math.matrix([xc, yc]);

  // Compute the affine transformation of the points
  const transformedPoints = math.multiply(aff, xn);

  // Reshape the translation vector into a column vector
  const translationVectorColumn = translationVector.reshape([2, 1]);

  // Add the translation vector to the transformed points and transpose the result
  const p2ds = math.transpose(math.add(transformedPoints, translationVectorColumn));

  // Convert the result to a JavaScript array and return
  return p2ds.toArray();
}

/**
 * Transforms a point cloud to 2D image points in a fisheye camera.
 * @param {Array<Array<number>>} pcloud - The point cloud.
 * @param {Array<Array<number>>} lidar2cam - The transformation matrix from LIDAR to camera.
 * @param {Array<Array<number>>} cameraIntrinsic - The camera intrinsic matrix.
 * @param {Array<number>} cameraIntrinsicDist - The camera distortion parameters.
 * @returns {Array<Array<number>>} The corresponding 2D image points.
 */
function transformPointCloudToImage(pcloud = [], lidar2cam, cameraIntrinsic, cameraIntrinsicDist) {
  const _pcloud = math.matrix(convertMatrix(pcloud));

  const _lidar2cam = math.matrix(lidar2cam);

  const result = math.multiply(_lidar2cam, _pcloud);

  const imagePoint = fisheyeCameraToImage(math.transpose(result), cameraIntrinsic, cameraIntrinsicDist);

  return imagePoint;
}

export { transformPointCloudToImage };
