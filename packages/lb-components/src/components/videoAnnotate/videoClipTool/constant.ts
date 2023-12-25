export enum EPageChanges {
  /** 往前翻页 */
  AHEAD = 1,
  /** 往后翻页 */
  BACK = -1,
}

export enum EDirection {
  Left = 'left',
  Right = 'right',
}

export enum EClipStatus {
  Clipping = 0,
  Stop = 1,
}

export enum ETimeSliceType {
  /** 片段 */
  Period = 0,
  /** 时间点 */
  Time = 1,
}

export const TIME_SLICE_TYPE: { [key: number]: string } = {
  [ETimeSliceType.Period]: '片段',
  [ETimeSliceType.Time]: '时间点',
};

/** 最小允许片段时间 */
export const SLICE_MIN_TIME = 0.05;

export const PER_SLICE_CHANGE = 0.05;
