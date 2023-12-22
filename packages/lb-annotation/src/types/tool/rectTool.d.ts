declare interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  sourceID: string;
  valid: boolean;
  order?: number;
  attribute: string;
  textAttribute: string;
  disableDelete?: boolean; // 是否允许被删除
  isHighlight?: boolean; // 是否为高亮框

  label?: string; // 列表标签
}

declare interface RectStyle {
  width?: number;
  color?: number;
  opacity?: number;
}

declare interface IRectConfig extends IToolConfig {
  attributeList: IInputList[];
  attributeConfigurable: boolean;
  drawOutsideTarget: boolean;
  textConfigurable: boolean;
  copyBackwardResult: boolean;
  minWidth: number;
  minHeight: number;
  isShowOrder: boolean;
  textCheckType: number;

  markerConfigurable?: boolean;
  markerList?: IInputList[];
}
