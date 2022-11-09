declare interface ILinePoint extends IPoint {
  id: string;
  specialEdge?: boolean;
  actual?: IPoint; // For internal use only
}

declare interface ILine {
  id: string;
  valid: boolean;
  pointList?: ILinePoint[];
  order: number;
  label?: string;
  sourceID?: string;
  attribute?: string;
  textAttribute?: string;
  isReference?: boolean;
}

declare interface ILineConfig extends IToolConfig {
  edgeAdsorption: boolean;
  outOfTarget: boolean;
  copyBackwardResult: boolean;
  isShowOrder: boolean;
  lineType: ELineTypes;
  lineColor: ELineColor;
  attributeConfigurable: boolean;
  attributeList: IInputList[];
  textConfigurable: boolean;
  textCheckType: ETextType;
  customFormat: string;
  lowerLimitPointNum: string;
  upperLimitPointNum?: string;

  showLineLength: boolean;
}
