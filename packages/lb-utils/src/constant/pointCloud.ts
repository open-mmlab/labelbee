/**
 * @file PointCloud default constant
 * @createdate 2022-07-11
 * @author Ron <ron.f.luo@gmail.com>
 */

export enum EPerspectiveView {
  Front = 'FRONT',
  Back = 'BACK',
  Left = 'LEFT',
  Right = 'RIGHT',
  Top = 'TOP',
  LFT = 'LEFT_FRONT_TOP',
  RBT = 'RIGHT_BACK_TOP',
}

export const DEFAULT_SPHERE_PARAMS = {
  radius: 3,
  widthSegments: 32,
  heightSegments: 16,
  defaultZ: 5,
};

export enum EPointCloudPattern {
  Detection = 'Detection',
  Segmentation = 'Segmentation',
}

export enum EPointCloudSegmentMode {
  Add = "ADD", 
  Remove = "REMOVE"
}