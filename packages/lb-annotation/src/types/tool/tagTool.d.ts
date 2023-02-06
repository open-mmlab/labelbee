declare interface ITagConfig extends IToolConfig {
  pageSize: number;
  inputList: IInputList[];
}

declare interface ITagResult {
  id: string;
  sourceID: string;
  result: {
    [a: string]: string;
  };
}

declare interface IInputList {
  key: string;
  value: string;
  isMulti?: boolean;
  subSelected?: IInfoList[];
  color?: string; // Custom Color for scribbleTool
}

/** v3.2.0 仅标点工具 列表标注 */
declare interface IMarkerList extends IInputList {
  target?: string[];
}

interface IInfoList {
  key: string;
  value: string;
  isDefault?: boolean; // 是否为默认值
}
