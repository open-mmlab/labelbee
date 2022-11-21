export interface IInfoList {
  key: string;
  value: string;
  isDefault?: boolean; // 是否为默认值
}


export interface IInputList {
  key: string;
  value: string;
  isMulti?: boolean;
  subSelected?: IInfoList[];
  color?: string; // Custom Color for scribbleTool
}