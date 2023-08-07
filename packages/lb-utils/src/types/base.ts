// Size range
interface ISizeRange {
  heightMax?: string;
  heightMin?: string;
  lengthMax?: string;
  lengthMin?: string;
  widthMax?: string;
  widthMin?: string;
}

// Default size
interface IDefaultSize {
  heightDefault?: string;
  lengthDefault?: string;
  widthDefault?: string;
}

// logical condition
interface ILogicalCondition {
  condition?: string;
  dimensionLeft?: string;
  dimensionRight?: string;
  logical?: string;
}

// position limit
interface IPositionLimit {
  XMin?: string;
  XMax?: string;
  YMin?: string;
  YMax?: string;
  ZMin?: string;
  ZMax?: string;
}
export interface ILimit {
  sizeLimit: {
    sizeRange: ISizeRange;
    defaultSize: IDefaultSize;
    logicalCondition: ILogicalCondition[];
  };
  positionLimit: IPositionLimit;
}
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
  limit?: ILimit; // Currently the web point cloud tool is in use
  isDefault?: boolean;
}
