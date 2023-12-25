export enum ETimeSliceType {
  /** 片段 */
  Period = 0,
  /** 时间点 */
  Time = 1,
}

export interface ResizableDirection {
  Right: 'right';
  Left: 'left';
}

export interface IVideoTimeSlice {
  /** 开始的时间 */
  start: number;
  /** 结束的时间 */
  end: number | null;
  /** 时间段类型 */
  type: ETimeSliceType;
  /** ID */
  id: string;
  /** 属性 */
  attribute: string;
  /** 文本标注 */
  textAttribute: string;
  /** 视频长度 */
  duration: number;
}
