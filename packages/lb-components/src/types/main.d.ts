/**
 * 后续下方的定义由 @labelbee/lb-annotation 提供
 */
export interface ISize {
  width: number;
  height: number;
}

export interface IInputList {
  key: string;
  value: string;
  isMulti?: boolean;
  subSelected?: IInfoList[];
}

export interface IInfoList {
  key: string;
  value: string;
}
