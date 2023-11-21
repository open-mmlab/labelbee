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
  radius: 0.3,
  widthSegments: 32,
  heightSegments: 16,
  defaultZ: 1,
};

export enum EPointCloudPattern {
  Detection = 'Detection',
  Segmentation = 'Segmentation',
}

export enum EPointCloudSegmentMode {
  Add = 'ADD',
  Remove = 'REMOVE',
}

export enum EPointCloudSegmentCoverMode {
  Cover = 'Cover',
  Uncover = 'Uncover',
}

export enum EPointCloudSegmentFocusMode {
  Focus = 'Focus',
  Unfocus = 'Unfocus',
}

export enum EPointCloudSegmentStatus {
  Ready = 'READY',
  Check = 'CHECK',
  Edit = 'EDIT',
  Hover = 'HOVER',
}

export enum ECameraType {
  // Normal camera
  Normal,
  // Omnidirectional Camera
  OmniCamera,
  // KannalaBrandt Camera
  KannalaBrandt,
}
