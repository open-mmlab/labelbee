declare interface IScribbleData {
  id: string;
  sourceID: string;
  url: string;
}

declare interface IScribbleConfig extends IToolConfig {
  attributeList: IInputList[];
}
