/*
 * PointCloud Type
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-16 17:08:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-16 19:32:15
 */

import { IInputList } from './base';
import { IPolygonData } from './polygon';
import { ICoordinate } from './common';
import { IBasicRect } from './annotationView';

export type TMatrix4Tuple = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type TMatrix13Tuple = [number, number, number];

export type TMatrix14Tuple = [number, number, number, number];

export type TMatrix43Tuple = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export type TMatrix3Tuple = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface IVolume {
  /** 目标朝向垂直方向的长度 */
  width: number;
  /** 目标朝向方向的长度 */
  height: number;
  /** Z轴方向的长度 */
  depth: number;
}

export interface I3DSpaceCoord {
  x: number;
  y: number;
  z: number;
}

export interface IPointCloudBoxRect extends IBasicRect {
  imageName: string;
}

export interface IPointCloudBox extends IVolume {
  attribute: string;
  center: I3DSpaceCoord;
  id: string;
  rotation: number;
  valid: boolean;
  trackID?: number; // It can be deleted.
  subAttribute?: {
    [k: string]: string;
  };
  count?: number;
  newPointList?: ICoordinate[];
  rects?: IPointCloudBoxRect[];
}

export interface IPointCloudSphere {
  attribute: string;
  center: I3DSpaceCoord;
  id: string;
  valid: boolean;
  trackID?: number;
  subAttribute?: {
    [k: string]: string;
  };
}

export type IPointCloudSphereList = IPointCloudSphere[];

/** IPointCloudBox */
export type PartialIPointCloudBoxList = Partial<IPointCloudBox> & Pick<IPointCloudBox, 'id'>[];

export type IPointCloudBoxList = IPointCloudBox[];

export interface IPointCloudConfig {
  // 多边形持有
  attributeList: IInputList[];
  radius: number;
  secondaryAttributeConfigurable: boolean;
  inputList: IInputList[];

  lowerLimitPointsNumInBox: number;
  trackConfigurable: boolean;
}

interface ICalib {
  P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Camera Intrinsic matrix
  R: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple]; // 3x3 rotation matrix
  T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Lidar to camera matrix
  groundHeight?: number; // Ground height. 地面高度。
  calName?: string; // Camera Name
}

interface ICalib {
  P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Camera Intrinsic matrix
  T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Lidar to camera matrix
  fisheyeDistortion: number[]; // Omnidirectional camera: fisheye distortion. 全方向摄像机 - 鱼眼畸变参数。
  groundHeight?: number; // Ground height. 地面高度。
  calName?: string; // Camera Name
  cameraType: number;
}

export type UpdatePolygonByDragList = Array<{
  newPolygon: IPolygonData;
  originPolygon: IPolygonData;
}>;

/**
 * The definition of points in IPointCloudSegmentation is Float32Array dual to size of memory usage
 */
export type TSegmentPoints = Float32Array;

export interface IPointCloudSegmentation {
  id: string;
  points: TSegmentPoints;
  attribute: string;
  subAttribute?: {
    [key in string]: string;
  };
  coverPoints?: number[];
  indexes: number[];
}

export { ICalib };
