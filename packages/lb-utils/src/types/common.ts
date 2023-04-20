export interface ISize {
  width: number;
  height: number;
}

export interface ICoordinate {
  x: number;
  y: number;
}

/** 线条类型 */
export enum ELineTypes {
  Line,
  Curve,
}

export interface IToolConfig {
  showConfirm?: boolean;
}