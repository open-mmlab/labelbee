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
}

interface IInfoList {
  key: string;
  value: string;
  isDefault?: boolean; // 是否为默认值
}
