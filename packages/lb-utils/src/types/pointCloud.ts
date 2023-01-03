/*
 * PointCloud Type
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-16 17:08:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-16 19:32:15
 */

import { IInputList } from "./base";

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
}

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

export interface ICalib {
  P: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Camera Intrinsic matrix
  R: [TMatrix13Tuple, TMatrix13Tuple, TMatrix13Tuple]; // 3x3 rotation matrix
  T: [TMatrix14Tuple, TMatrix14Tuple, TMatrix14Tuple]; // 3x4 Lidar to camera matrix
}
