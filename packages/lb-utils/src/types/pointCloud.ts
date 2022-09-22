/*
 * PointCloud Type
 * @Author: Laoluo luozefeng@sensetime.com
 * @Date: 2022-06-16 17:08:33
 * @LastEditors: Laoluo luozefeng@sensetime.com
 * @LastEditTime: 2022-06-16 19:32:15
 */

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
